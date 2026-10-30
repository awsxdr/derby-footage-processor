using System.Text.Json;
using Func;

namespace DerbyFootageProcessor.Common;

public class ProjectSerializer
{
    private readonly VideoProcessor _videoProcessor = new();

    public async Task<Project> LoadFile(string filePath)
    {
        var test = await File.ReadAllTextAsync(filePath);
        var persistedProject = JsonSerializer.Deserialize<PersistedProject>(await File.ReadAllTextAsync(filePath));

        if (persistedProject == null)
            throw new ProjectFormatInvalidException();

        return new(
            false,
            filePath,
            persistedProject.FootageFiles.Select(PersistedVideoFileToVideoFile(Path.GetDirectoryName(filePath)!)).ToArray(),
            persistedProject.OverlayFiles.Select(PersistedVideoFileToVideoFile(Path.GetDirectoryName(filePath)!)).ToArray(),
            persistedProject.ChromaKey);
    }

    public async Task SaveFile(Project project, string filePath)
    {
        var persistedProject = new PersistedProject(
            project.FootageFiles.Select(VideoFileToPersistedVideoFile(Path.GetDirectoryName(filePath)!)).ToArray(),
            project.OverlayFiles.Select(VideoFileToPersistedVideoFile(Path.GetDirectoryName(filePath)!)).ToArray(),
            project.ChromaKey);

        var json = JsonSerializer.Serialize(persistedProject);

        await File.WriteAllTextAsync(filePath, json);
    }

    private Func<PersistedVideoFile, VideoFile> PersistedVideoFileToVideoFile(string basePath) => persistedVideoFile =>
        new VideoFile(
                StringId.Generate(),
                ResolveVideoFilePath(basePath, persistedVideoFile),
                Path.GetFileNameWithoutExtension(persistedVideoFile.AbsolutePath),
                new(0, 0.0)
            )
            .Map(v => v with { Duration = _videoProcessor.GetVideoDuration(v.Path) });

    private static Func<VideoFile, PersistedVideoFile> VideoFileToPersistedVideoFile(string basePath) => videoFile =>
        new PersistedVideoFile(
            videoFile.Path,
            Path.GetRelativePath(basePath, videoFile.Path)
        );

    private static string ResolveVideoFilePath(string basePath, PersistedVideoFile videoFile)
    {
        if (File.Exists(Path.Combine(basePath, videoFile.RelativePath)))
        {
            return Path.Combine(basePath, videoFile.RelativePath);
        }

        if (File.Exists(videoFile.AbsolutePath))
        {
            return videoFile.AbsolutePath;
        }

        throw new FileNotFoundException();
    }

    public sealed class ProjectFormatInvalidException() : Exception("Format of project file is invalid.");
}

public record PersistedProject(
    PersistedVideoFile[] FootageFiles,
    PersistedVideoFile[] OverlayFiles,
    ChromaKey ChromaKey
);

public record PersistedVideoFile(string AbsolutePath, string RelativePath);