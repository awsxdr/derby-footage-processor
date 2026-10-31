using System.Net;
using Func;

namespace DerbyFootageProcessor.Common;

public class FootageProcessor
{
    private readonly IOperatingSystemInteractions _osInteractions;
    private Project _currentProject = Project.Default;
    private readonly VideoProcessor _videoProcessor = new();
    private readonly ProjectSerializer _projectSerializer = new();
    private readonly Dictionary<string, Task<byte[]>> _videoThumbnails = new();

    public FootageProcessor(IOperatingSystemInteractions osInteractions)
    {
        //FFMpegCore.Extensions.Downloader.FFMpegDownloader.DownloadBinaries(options: new FFOptions { BinaryFolder = @".\" }).Wait();

        _osInteractions = osInteractions;

        osInteractions.RegisterApiMethod("startNewProject", this, x => x.StartNewProject());
        osInteractions.RegisterApiMethod("openProject", this, x => x.OpenProject());
        osInteractions.RegisterApiMethod("saveProject", this, x => x.SaveProject(Placeholder.For<bool>()));
        osInteractions.RegisterApiMethod("render", this, x => x.Render());
        osInteractions.RegisterApiMethod("exit", this, x => x.Exit());
        osInteractions.RegisterApiMethod("getCurrentProject", () => Task.FromResult(_currentProject));
        osInteractions.RegisterApiMethod("getFootageFiles", this, x => x.GetFootageFiles());
        osInteractions.RegisterApiMethod("openFootageFiles", this, x => x.OpenFootageFiles());
        osInteractions.RegisterApiMethod("removeFootageFile", this, x => x.RemoveFootageFile(Placeholder.For<string>()));
        osInteractions.RegisterApiMethod("getOverlayFiles", this, x => x.GetOverlayFiles());
        osInteractions.RegisterApiMethod("openOverlayFiles", this, x => x.OpenOverlayFiles());
        osInteractions.RegisterApiMethod("removeOverlayFile", this, x => x.RemoveOverlayFile(Placeholder.For<string>()));
        osInteractions.RegisterApiMethod("setOverlaySettings", this, x => x.SetOverlaySettings(Placeholder.For<ChromaKey>()));
        osInteractions.RegisterApiEndpoint("thumbnail/*", GetVideoThumbnail);
        osInteractions.RegisterApiEndpoint("draftFrame/*", GetVideoDraftFrame);
    }

    private Task StartNewProject()
    {
        _currentProject = Project.Default;
        return Task.CompletedTask;
    }

    private async Task<bool> OpenProject()
    {
        var dialogResult = _osInteractions.ShowOpenProjectDialog();

        if (!dialogResult.OkClicked)
            return false;

        _currentProject = await _projectSerializer.LoadFile(dialogResult.FilePaths.Single());

        return true;
    }

    private async Task<bool> SaveProject(bool forceDialog)
    {
        if (forceDialog || _currentProject.FilePath == null)
        {
            var dialogResult = _osInteractions.ShowSaveProjectDialog();

            if (!dialogResult.OkClicked)
                return false;

            _currentProject = _currentProject with { FilePath = dialogResult.FilePath };
        }

        await _projectSerializer.SaveFile(_currentProject, _currentProject.FilePath);

        return true;
    }

    private Task Render()
    {
        throw new NotImplementedException();
    }

    private Task Exit()
    {
        _osInteractions.CloseWindow();

        return Task.CompletedTask;
    }

    private Task<VideoFile[]> GetFootageFiles() =>
        Task.FromResult(_currentProject.FootageFiles);

    private Task<VideoFile[]> OpenFootageFiles()
    {
        var dialogResult = _osInteractions.ShowOpenVideoFilesDialog();

        if (!dialogResult.OkClicked)
            return Task.FromResult(Array.Empty<VideoFile>());

        var newFootageFiles =
            dialogResult.FilePaths.Select(f => new VideoFile(
                StringId.Generate(),
                f,
                Path.GetFileNameWithoutExtension(f),
                _videoProcessor.GetVideoDuration(f)
            ))
            .ToArray();

        _currentProject = _currentProject with
        {
            IsDirty = true,
            FootageFiles =
                _currentProject.FootageFiles.Concat(newFootageFiles).ToArray()
        };

        foreach (var video in newFootageFiles)
        {
            _videoThumbnails[video.Id] = _videoProcessor.GetThumbnailForVideoFile(video.Path);
        }

        return Task.FromResult(_currentProject.FootageFiles);
    }

    private Task<VideoFile[]> RemoveFootageFile(string fileId)
    {
        _currentProject = _currentProject with
        {
            IsDirty = true,
            FootageFiles = _currentProject.FootageFiles.Where(f => f.Id != fileId).ToArray(),
        };

        return Task.FromResult(_currentProject.FootageFiles);
    }

    private Task<VideoFile[]> GetOverlayFiles() =>
        Task.FromResult(_currentProject.OverlayFiles);

    private Task<VideoFile[]> OpenOverlayFiles()
    {
        var dialogResult = _osInteractions.ShowOpenVideoFilesDialog();

        var newOverlayFiles =
            dialogResult.FilePaths.Select(f => new VideoFile(
                    StringId.Generate(),
                    f,
                    Path.GetFileNameWithoutExtension(f),
                    _videoProcessor.GetVideoDuration(f)
                ))
                .ToArray();

        _currentProject = _currentProject with
        {
            IsDirty = true,
            OverlayFiles = _currentProject.OverlayFiles.Concat(newOverlayFiles).ToArray()
        };

        foreach (var video in newOverlayFiles)
        {
            _videoThumbnails[video.Id] = _videoProcessor.GetThumbnailForVideoFile(video.Path);
        }

        return Task.FromResult(_currentProject.OverlayFiles);
    }

    private Task<VideoFile[]> RemoveOverlayFile(string fileId)
    {
        _currentProject = _currentProject with
        {
            IsDirty = true,
            OverlayFiles = _currentProject.OverlayFiles.Where(f => f.Id != fileId).ToArray(),
        };

        return Task.FromResult(_currentProject.OverlayFiles);
    }

    private Task SetOverlaySettings(ChromaKey chromaKey)
    {
        _currentProject = _currentProject with
        {
            IsDirty = true,
            ChromaKey = chromaKey,
        };

        return Task.CompletedTask;
    }

    private async Task<HttpResponseMessage> GetVideoThumbnail(HttpRequestMessage request)
    {
        var videoId = request.RequestUri?.LocalPath.Replace("/api/thumbnail/", "");

        if (videoId == null)
            return new(HttpStatusCode.NotFound);

        if (!_videoThumbnails.TryGetValue(videoId, out var thumbnail))
            return new(HttpStatusCode.NotFound);

        var image = await thumbnail;

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new ByteArrayContent(image),
        };

        response.Content.Headers.ContentType = new("image/png");

        return response;
    }

    private async Task<HttpResponseMessage> GetVideoDraftFrame(HttpRequestMessage request)
    {
        var (frameNumber, quality) = (request.RequestUri?.LocalPath.Replace("/api/draftFrame/", "") ?? "0/360").Split('/').Map(s => (int.Parse(s[0]), s[1]));

        var (width, height) = quality switch
        {
            "1080" => (1920, 1080),
            "720" => (1280, 720),
            "480" => (854, 480),
            _ => (640, 360)
        };

        var image = await _videoProcessor.GetDraftFrame(_currentProject, frameNumber, width, height);

        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new ByteArrayContent(image),
        };

        response.Content.Headers.ContentType = new("image/png");

        return response;
    }
}

public record OpenDialogResult(bool OkClicked, string[] FilePaths);

public record SaveDialogResult(bool OkClicked, string FilePath);