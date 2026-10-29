using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace DerbyFootageProcessor.Common;

public interface IOperatingSystemInteractions
{
    void RegisterApiMethod(ApiMethod method);
    void RegisterApiEndpoint(ApiEndpoint endpoint);

    OpenDialogResult ShowOpenVideoFilesDialog();

    JsonSerializerOptions SerializerOptions { get; }

    public void RegisterApiMethod(string methodName, Func<JsonObject?, Task<object?>> invoke) =>
        RegisterApiMethod(new(methodName, invoke));

    public void RegisterApiMethod<T>(string methodName, Func<Task<T>> invoke) =>
        RegisterApiMethod(new(methodName, async _ => await invoke()));

    public void RegisterApiMethod(string methodName, MethodInfo method, object? methodTarget)
    {
        if (!method.ReturnType.IsAssignableTo(typeof(Task)))
            throw new ArgumentException("Method must return Task or Task<>", nameof(method));

        var parameters = method.GetParameters();

        var invoke = async (JsonObject? p) =>
        {
            p ??= new JsonObject();

            var passedParameters = parameters.Select(x => p[x.Name ?? ""]?.Deserialize(x.ParameterType, SerializerOptions)).ToArray();
            var resultTask = (Task)method.Invoke(methodTarget, passedParameters)!;

            var resultProperty = resultTask.GetType().GetProperty("Result");
            object? result = resultProperty?.GetGetMethod()?.Invoke(resultTask, []);

            return result;
        };

        RegisterApiMethod(methodName, invoke);
    }

    public void RegisterApiMethod<TTarget>(string methodName, TTarget methodTarget, Expression<Func<TTarget, Task>> method)
    {
        var methodInfo = (method.Body as MethodCallExpression)?.Method ?? throw new ArgumentException("Parameter must be a method call expression", nameof(method));
        RegisterApiMethod(methodName, methodInfo, methodTarget);
    }

    public void RegisterApiMethod<TTarget, TResult>(string methodName, TTarget methodTarget, Expression<Func<TTarget, Task<TResult>>> method)
    {
        var methodInfo = (method.Body as MethodCallExpression)?.Method ?? throw new ArgumentException("Parameter must be a method call expression", nameof(method));
        RegisterApiMethod(methodName, methodInfo, methodTarget);
    }

    public void RegisterApiMethod<TArg>(string methodName, Action<TArg> method) =>
        RegisterApiMethod<TArg, object?>(methodName, p =>
        {
            method(p);
            return null;
        });

    public void RegisterApiMethod<TArg, TResult>(string methodName, Func<TArg, Task<TResult>> method) =>
        RegisterApiMethod(methodName, async p =>
        {
            var arg = p.Deserialize<TArg>() ?? throw new ArgumentException("Unexpected argument type");
            return await method(arg);
        });

    public void RegisterApiEndpoint(string path, Func<HttpRequestMessage, Task<HttpResponseMessage>> invoke) =>
        RegisterApiEndpoint(new(path, invoke));
}

public record ApiMethod(string Name, Func<JsonObject?, Task<object?>> Invoke);
public record ApiEndpoint(string Path, Func<HttpRequestMessage, Task<HttpResponseMessage>> Invoke);

public static class Placeholder
{
    public static T For<T>() => default!;
}

public static class JsonNodeExtensionMethods
{
    private static readonly Dictionary<Type, Func<JsonNode, object?>> _getters = new();

    public static object? GetValueAs(this JsonNode node, Type asType)
    {
        node.Deserialize(asType, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        if (!_getters.TryGetValue(asType, out var getter))
        {
            var getMethod = typeof(JsonNode).GetMethod(nameof(JsonNode.GetValue))!.MakeGenericMethod(asType);
            getter = n => getMethod.Invoke(n, []);
            _getters[asType] = getter;
        }

        return getter(node);
    }
}