namespace DerbyFootageProcessor.Common;

public record Project(
    bool IsDirty,
    string? FilePath,
    VideoFile[] FootageFiles,
    VideoFile[] OverlayFiles,
    ChromaKey ChromaKey,
    int OverlayOffsetFrames,
    Period[] Periods
)
{
    public static Project Default => new(false, null, [], [], new(0, 255, 0, 10), 0, []);
}

public record VideoFile(string Id, string Path, string Name, VideoDuration Duration);

public record ChromaKey(byte Red, byte Green, byte Blue, byte VariancePercent);

public record VideoDuration(int Frames, double Seconds);

public record Period(int StartFrame, int EndFrame, int StartPaddingFrames, int EndPaddingFrames);
