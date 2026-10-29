using System.Globalization;
using FFMpegCore;
using FFMpegCore.Enums;
using FFMpegCore.Pipes;
using Func;

namespace DerbyFootageProcessor.Common;

public class VideoProcessor
{
    public async Task<byte[]> GetThumbnailForVideoFile(string filePath)
    {
        using var outputStream = new MemoryStream();

        await FFMpegArguments
            .FromFileInput(filePath)
            .OutputToPipe(new StreamPipeSink((s, c) => s.CopyToAsync(outputStream, c)), o => o
                .Resize(160, 90)
                .WithFrameOutputCount(1)
                .WithVideoCodec(VideoCodec.Image.Png)
                .ForceFormat("image2pipe")
                .WithSpeedPreset(Speed.UltraFast)
            )
            .ProcessAsynchronously();

        return outputStream.ToArray();
    }

    public VideoDuration GetVideoDuration(string filePath)
    {
        var time = FFProbe.Analyse(filePath).Duration;
        return new((int)(time.TotalSeconds * 25.0), time.TotalSeconds);
    }

    public async Task<byte[]> GetDraftFrame(Project project, int frameNumber, int width, int height)
    {
        using var outputStream = new MemoryStream();

        var exactFootageSeek = TimeSpan.FromSeconds(frameNumber / 25.0);

        var (targetFootageFileIndex, targetFootageFileStart) = project.FootageFiles
            .Aggregate(
                new[] { 0.0 },
                (times, video) => [..times, times.Last() + video.Duration.Seconds]
            )
            .TakeWhile(t => t <= exactFootageSeek.TotalSeconds)
            .ToArray()
            .Map(t => (t.Length - 1, TimeSpan.FromSeconds(t.Last())));

        var targetFootageFrameNumber = (int)Math.Floor((exactFootageSeek - targetFootageFileStart).TotalSeconds * 25.0);

        var (footageCoarseSeek, footageFineSeek) = CalculateTimeOffsets(targetFootageFrameNumber);

        var arguments = FFMpegArguments
            .FromFileInput(project.FootageFiles[targetFootageFileIndex].Path, addArguments: o => o
                .Seek(footageCoarseSeek)
            );

        var filter = "";

        if (project.OverlayFiles.Length > 0)
        {
            var (overlayCoarseSeek, overlayFineSeek) = CalculateTimeOffsets(frameNumber);

            arguments = arguments
                .AddConcatInput(project.OverlayFiles.Select(f => f.Path), o => o
                    .Seek(overlayCoarseSeek)
                );

            var hexColor = $"0x{project.ChromaKey.Red:X2}{project.ChromaKey.Green:X2}{project.ChromaKey.Blue:X2}";

            var keyFilter =
                $"chromakey=color={hexColor}" +
                $":similarity={(project.ChromaKey.VariancePercent / 100.0).ToString("0.####", CultureInfo.InvariantCulture)}" +
                ":blend=0.1" +
                project.ChromaKey switch
                {
                    { Red: < 30, Green: > 240, Blue: < 30 } => ",despill=type=green",
                    { Red: < 30, Green: < 30, Blue: > 240 } => ",despill=type=blue",
                    _ => ""
                };

            filter =
                $"[0:v]trim=start={footageFineSeek.TotalSeconds},setpts=PTS-STARTPTS,scale={width}:{height}[base];" +
                $"[1:v]trim=start={overlayFineSeek.TotalSeconds},setpts=PTS-STARTPTS,scale={width}:{height},format=yuva444p,{keyFilter}[ck];" +
                $"[base][ck]overlay=format=auto[out]";
        }
        else
        {
            filter = $"[0:v]trim=start={footageFineSeek.TotalSeconds},setpts=PTS-STARTPTS,scale={width}:{height}[out]";
        }

        var stringArgs = "";

        await arguments
            .OutputToPipe(new StreamPipeSink((s, c) => s.CopyToAsync(outputStream, c)), o => o
                .WithCustomArgument($"-filter_complex \"{filter}\"")
                .WithCustomArgument("-map \"[out]\"")
                .WithFrameOutputCount(1)
                .WithVideoCodec(VideoCodec.Image.Png)
                .ForceFormat("image2pipe")
                .WithCustomArgument("-g 1")
            )
            .Tee(a => stringArgs = a.Arguments)
            .ProcessAsynchronously();

        return outputStream.ToArray();

        static (TimeSpan Coarse, TimeSpan Fine) CalculateTimeOffsets(int targetFrame)
        {
            var coarseSeconds = Math.Max(0.0, (targetFrame - 37) / 25.0);
            var fineSeconds = targetFrame / 25.0 - coarseSeconds;

            return (TimeSpan.FromSeconds(coarseSeconds), TimeSpan.FromSeconds(fineSeconds));
        }
    }
}