namespace DerbyFootageProcessor
{
    partial class MainWindow
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            _webView = new Microsoft.Web.WebView2.WinForms.WebView2();
            _openVideoFilesDialog = new OpenFileDialog();
            ((System.ComponentModel.ISupportInitialize)_webView).BeginInit();
            SuspendLayout();
            // 
            // _webView
            // 
            _webView.AllowExternalDrop = true;
            _webView.CreationProperties = null;
            _webView.DefaultBackgroundColor = Color.White;
            _webView.Dock = DockStyle.Fill;
            _webView.Location = new Point(0, 0);
            _webView.Name = "_webView";
            _webView.Size = new Size(1223, 851);
            _webView.Source = new Uri("http://derbyfootageprocessor.localhost/", UriKind.Absolute);
            _webView.TabIndex = 0;
            _webView.ZoomFactor = 1D;
            _webView.CoreWebView2InitializationCompleted += WebView_CoreWebView2InitializationCompleted;
            // 
            // _openVideoFilesDialog
            // 
            _openVideoFilesDialog.Filter = "Video files|*.mpe; *.mpeg; *.ogm; *.mkv; *.mpg; *.wmv; *.webm; *.ogv; *.mov; *.m4v; *.asx; *.mp4; *.avi; *.mts|All files|*.*";
            _openVideoFilesDialog.Multiselect = true;
            _openVideoFilesDialog.OkRequiresInteraction = true;
            _openVideoFilesDialog.RestoreDirectory = true;
            // 
            // MainWindow
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1223, 851);
            Controls.Add(_webView);
            Name = "MainWindow";
            Text = "Derby Footage Processor";
            Load += MainWindow_Load;
            ((System.ComponentModel.ISupportInitialize)_webView).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Microsoft.Web.WebView2.WinForms.WebView2 _webView;
        private OpenFileDialog _openVideoFilesDialog;
    }
}
