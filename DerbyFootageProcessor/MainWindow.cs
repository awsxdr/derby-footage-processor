#define DEBUG_UI
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using DerbyFootageProcessor.Common;
using Func;
using Microsoft.Web.WebView2.Core;

namespace DerbyFootageProcessor
{
    public partial class MainWindow : Form, IOperatingSystemInteractions
    {
        public JsonSerializerOptions SerializerOptions { get; } = new(JsonSerializerDefaults.Web);

#if DEBUG_UI
        private static readonly HttpClient HttpClient = new();
#endif
        private static readonly Uri BaseUri = new("http://derbyfootageprocessor.localhost/");

        private FootageProcessor? _footageProcessor = null;
        private readonly Dictionary<string, ApiMethod> _apiMethods = new();
        private readonly Dictionary<string, ApiEndpointMatcher> _apiEndpoints = new();

        private const string BaseDocumentScript =
            """
            class DerbyFootageProcessorHost {
                static resultResolvers = {};
                static getRandomString(length = 12) {
                    const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    return Array.from(new Array(length)).map(() => validCharacters[Math.floor(Math.random() * validCharacters.length)]).join("");
                };
                static invokeApiMethod(method, parameters) {
                    return new Promise(resolve => {
                        const returnKey = `${method}-result-${DerbyFootageProcessorHost.getRandomString()}`;
                        DerbyFootageProcessorHost.resultResolvers[returnKey] = resolve;
                        window.chrome.webview.postMessage({ method, parameters, returnKey });
                    });
                };
                static init() {
                    window.chrome.webview.addEventListener('message', arg => {
                        const request = arg.data;
                        console.log(request);
                        
                        if(request.type === 'RESPONSE') {
                            const resolve = DerbyFootageProcessorHost.resultResolvers[request.returnKey];
                            
                            console.log(resolve ? "Resolve found" : "Resolve not found");
                            
                            resolve(request.result);
                        }
                    });
                
                    window.api = {
                        %%API_METHODS%%
                    };    
                }
            };
            DerbyFootageProcessorHost.init();
            """;


        public MainWindow()
        {
            InitializeComponent();
        }

        public void CloseWindow()
        {
            Close();
        }

        private void MainWindow_Load(object sender, EventArgs e)
        {
        }

        private void WebView_WebResourceRequested(object? sender, CoreWebView2WebResourceRequestedEventArgs e)
        {
            var deferral = e.GetDeferral();

            var request = new HttpRequestMessage
            {
                RequestUri = new(e.Request.Uri),
                Method = new(e.Request.Method),
                Content = e.Request.Content?.Map(c => new StreamContent(c)),
            };

            foreach (var (header, value) in e.Request.Headers)
            {
                request.Headers.Add(header, value);
            }

            Task.Run(async () =>
            {
                try
                {
                    if (request.RequestUri.AbsolutePath.StartsWith("/api/"))
                    {
                        var apiResponse = await HandleApiRequest(request);
                        await InvokeAsync(() => e.Response = apiResponse);
                        return;
                    }

#if DEBUG_UI
                    request.RequestUri = new(new Uri("http://localhost:5173/"), request.RequestUri.PathAndQuery);

                    var response = await HttpClient.SendAsync(request);
                    var responseContent = await response.Content.ReadAsStreamAsync();

                    await InvokeAsync(() =>
                    {
                        e.Response = _webView.CoreWebView2.Environment.CreateWebResourceResponse(
                            responseContent,
                            (int)response.StatusCode,
                            response.ReasonPhrase!,
                            string.Join("\r\n", response.Headers.Concat(response.Content.Headers).Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))
                        );
                    });
#else
                // Load from file
#endif
                }
                finally
                {
                    deferral.Complete();
                }
            });
        }

        private async Task<CoreWebView2WebResourceResponse> HandleApiRequest(HttpRequestMessage request)
        {
            foreach (var endpoint in _apiEndpoints.Values)
            {
                if (!endpoint.IsMatch(request.RequestUri!.AbsoluteUri))
                    continue;

                var result = await endpoint.Invoke(request);

                var resultStream = await result.Content.ReadAsStreamAsync();
                var response = await InvokeAsync(() => _webView.CoreWebView2.Environment.CreateWebResourceResponse(
                    resultStream,
                    (int)result.StatusCode,
                    result.ReasonPhrase!,
                    string.Join("\r\n", result.Headers.Concat(result.Content.Headers).Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))
                ));

                return response;
            }

            return _webView.CoreWebView2.Environment.CreateWebResourceResponse(
                Stream.Null,
                404,
                "Not found",
                ""
            );
        }

        private async void WebView_CoreWebView2InitializationCompleted(object sender, CoreWebView2InitializationCompletedEventArgs e)
        {
            _webView.CoreWebView2.AddWebResourceRequestedFilter($"{BaseUri}*", CoreWebView2WebResourceContext.All);
            _webView.CoreWebView2.WebResourceRequested += WebView_WebResourceRequested;

            _footageProcessor = new FootageProcessor(this);

            await _webView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(
                BaseDocumentScript.Replace("%%API_METHODS%%", _apiMethods.Values.Select(GetMethodInvokeScript).Map(string.Join, "\r\n            "))
            );

            _webView.CoreWebView2.WebMessageReceived += WebView_WebMessageReceived;

            _webView.CoreWebView2.Navigate(BaseUri.AbsoluteUri);

            return;

            static string GetMethodInvokeScript(ApiMethod method) =>
                $"{method.Name}: args => DerbyFootageProcessorHost.invokeApiMethod('{method.Name}', args),";
        }

        private void WebView_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            var request = JsonSerializer.Deserialize<RpcRequest>(e.WebMessageAsJson, SerializerOptions);

            if (request == null)
                return;

            if (!_apiMethods.TryGetValue(request.Method, out var method))
                return;

            Task.Run(() =>
            {
                method.Invoke(request.Parameters)
                    .ContinueWith(result =>
                    {
                        if (result.IsFaulted)
                        {
                            Console.WriteLine($"### Exception invoking {method.Name}:");
                            Console.WriteLine(result.Exception);
                            return;
                        }

                        Invoke(() =>
                        {
                            _webView.CoreWebView2?.PostWebMessageAsJson(
                                JsonSerializer.Serialize(
                                    new RpcResponse(request.ReturnKey, result.Result),
                                    SerializerOptions));
                        });
                    });
            });
        }

        public void RegisterApiMethod(ApiMethod method)
        {
            _apiMethods[method.Name] = method;
        }

        public void RegisterApiEndpoint(ApiEndpoint endpoint)
        {
            _apiEndpoints[endpoint.Path] = new(endpoint);
        }

        public OpenDialogResult ShowOpenProjectDialog()
        {
            var result = Invoke(() => _openProjectFileDialog.ShowDialog(this));

            return new OpenDialogResult(result == DialogResult.OK, _openProjectFileDialog.FileNames);
        }

        public OpenDialogResult ShowOpenVideoFilesDialog()
        {
            var result = Invoke(() => _openVideoFilesDialog.ShowDialog(this));

            return new(result == DialogResult.OK, _openVideoFilesDialog.FileNames);
        }

        public SaveDialogResult ShowSaveProjectDialog()
        {
            var result = Invoke(() => _saveProjectFileDialog.ShowDialog(this));

            return new(result == DialogResult.OK, _saveProjectFileDialog.FileName);
        }

        private record RpcRequest(string Method, JsonObject Parameters, string ReturnKey);

        private record RpcResponse(string ReturnKey, object? Result)
        {
            public string Type => "RESPONSE";
        }

        private class ApiEndpointMatcher(ApiEndpoint endpoint)
        {
            private readonly Regex _matchRegex = new($"^{BaseUri}api/(?<f>{Regex.Escape(endpoint.Path).Replace("\\*", ".*")})$");

            public Task<HttpResponseMessage> Invoke(HttpRequestMessage request) => endpoint.Invoke(request);
            public bool IsMatch(string path) => _matchRegex.IsMatch(path);
            public string GetFragment(string path) => _matchRegex.Match(path).Groups["f"].Value;
        }
    }
}