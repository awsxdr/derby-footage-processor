using System.Drawing;
using System.Globalization;
using FFMpegCore.Arguments;

namespace DerbyFootageProcessor.Common;

internal static class FfmpegExtensionMethods
{
    extension(VideoFilterOptions filterOptions)
    {
        public VideoFilterOptions Framerate(double framerate)
        {
            filterOptions.Arguments.Add(new FramerateArgument(framerate));
            return filterOptions;
        }

        public VideoFilterOptions Crop(Rectangle cropRegion)
        {
            filterOptions.Arguments.Add(new CropArgument(cropRegion));
            return filterOptions;
        }
    }

    private class FramerateArgument(double framerate) : IVideoFilterArgument
    {
        public string Key => "fps";
        public string Value => framerate.ToString(CultureInfo.InvariantCulture);
    }

    private class CropArgument(Rectangle cropRegion) : IVideoFilterArgument
    {
        public string Key => "crop";
        public string Value => $"{cropRegion.Width}:{cropRegion.Height}:{cropRegion.Left}:{cropRegion.Top}";
    }
}