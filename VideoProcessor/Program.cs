#define CACHE

using FFMpegCore;
using FFMpegCore.Arguments;
using FFMpegCore.Enums;
using FFMpegCore.Pipes;
using MathNet.Numerics.IntegralTransforms;
using NAudio.Dsp;
using NAudio.Wave;
using System.Drawing;
using System.Globalization;
using System.Text.Json;
using Complex = System.Numerics.Complex;

#pragma warning disable CA1416

var audioFileName = @"C:\dev\test\VideoProcessor\Files\audio2.mp3";

//await ExtractAudio(audioFileName);

#if CACHE
var audioInfo = JsonSerializer.Deserialize<AudioInformation>(File.ReadAllText(@"C:\dev\test\VideoProcessor\Files\audioInfo.json"))!;
#else
var audioInfo = await ProcessAudio(audioFileName);
File.WriteAllText(@"C:\dev\test\VideoProcessor\Files\audioInfo.json", JsonSerializer.Serialize(audioInfo));
#endif

#if CACHE
var expectedProbabilities = JsonSerializer.Deserialize<double[]>(File.ReadAllText(@"C:\dev\test\VideoProcessor\Files\expectedProbabilities.json"))!;
#else
var expectedProbabilities = await ProcessVideo(audioInfo.SamplesPerSecond);
File.WriteAllText(@"C:\dev\test\VideoProcessor\Files\expectedProbabilities.json", JsonSerializer.Serialize(expectedProbabilities));
#endif

var (offset, score) = CalculateSignalOffset(audioInfo.WhistleProbabilities, expectedProbabilities);
var offsetSeconds = offset / audioInfo.SamplesPerSecond;

//offset = -offset;
//offset = 942;

Console.WriteLine();
Console.WriteLine($"Calculated offset: {offsetSeconds}s");
var footageFiles = Directory.GetFiles(@"C:\dev\test\VideoProcessor\Files\", "*.mts");
var footageDuration = footageFiles.Aggregate(TimeSpan.Zero, (total, f) => total + FFProbe.Analyse(f).Duration);
var keyed = "chromakey=0x00FF00:0.15:0.1"; // remove if the overlay already has alpha / isn't green-screen

var overlayChain = offsetSeconds >= 0
    ? $"[1:v]{keyed},setpts=PTS+{offsetSeconds:F3}/TB[ov]"
    : $"[1:v]trim=start={-offsetSeconds:F3},setpts=PTS-STARTPTS,{keyed}[ov]";

var filter = $"{overlayChain};[0:v][ov]overlay=eof_action=pass[v]";
var progressHandler = new ProgressHandler("Creating output");
await FFMpegArguments
    .FromConcatInput(footageFiles)
    .AddFileInput(@"C:\dev\test\VideoProcessor\Files\overlay.mp4")
    .OutputToFile(@"C:\dev\test\VideoProcessor\Files\result.mp4", true, o => o
        .WithCustomArgument($"-filter_complex \"{filter}\"")
        .WithCustomArgument("-map [v] -map 0:a")
        .WithVideoCodec(VideoCodec.LibX264)
        .WithConstantRateFactor(18)
        .WithAudioCodec(AudioCodec.Aac)
        .WithDuration(TimeSpan.FromMinutes(25))
        .Resize(192, 108)
    )
    .NotifyOnProgress(progressHandler.SetProgress, TimeSpan.FromMinutes(25))
    .ProcessAsynchronously();

var width = (int)(Math.Max(audioInfo.WhistleProbabilities.Length, expectedProbabilities.Length) + Math.Abs(offset)) / 10;
var bitmap = new Bitmap(width, 100);

var whistleOffset = offset < 0 ? -(int)(offset / 10) : 0;
var expectedOffset = offset > 0 ? (int)(offset / 10) : 0;

for (var x = 0; x < width; ++x)
{
    var maxAudioValue =
        x - whistleOffset >= 0 && x - whistleOffset < audioInfo.WhistleProbabilities.Length / 10 - 1
            ? audioInfo.WhistleProbabilities[((x - whistleOffset) * 10)..((x - whistleOffset + 1) * 10)].Max()
            : 1.0;

    var maxExpectedValue =
        x - expectedOffset >= 0 && x - expectedOffset < expectedProbabilities.Length / 10 - 1
            ? expectedProbabilities[((x - expectedOffset) * 10)..((x - expectedOffset + 1) * 10)].Max()
            : 1.0;

    for (var y = 0; y < 50; ++y)
    {
        bitmap.SetPixel(x, y, Color.FromArgb((int)(maxAudioValue * 255), (int)(maxAudioValue * 255), (int)(maxAudioValue * 255)));
        bitmap.SetPixel(x, y + 50, Color.FromArgb((int)(maxExpectedValue * 255), (int)(maxExpectedValue * 255), (int)(maxExpectedValue * 255)));
    }
}

bitmap.Save(@"C:\dev\test\VideoProcessor\Files\output.bmp");

return;

(int Lag, double Score) CalculateSignalOffset(double[] a, double[] b)
{
    var n = 1;
    while (n < a.Length + b.Length) n <<= 1;

    var meanA = a.Average();
    var meanB = b.Average();

    var fa = new Complex[n];
    var fb = new Complex[n];
    for (var i = 0; i < a.Length; ++i) fa[i] = a[i] - meanA;
    for (var i = 0; i < b.Length; ++i) fb[i] = b[i] - meanB;

    Fourier.Forward(fa, FourierOptions.AsymmetricScaling);
    Fourier.Forward(fb, FourierOptions.AsymmetricScaling);
    for (var i = 0; i < n; ++i) fa[i] *= Complex.Conjugate(fb[i]);
    Fourier.Inverse(fa, FourierOptions.AsymmetricScaling);

    var bestLag = 0;
    var bestValue = double.MinValue;
    for (var lag = -(b.Length - 1); lag <= a.Length - 1; ++lag)
    {
        var v = fa[lag >= 0 ? lag : n + lag].Real;
        if (v > bestValue) { bestValue = v; bestLag = lag; }
    }

    var norm = Math.Sqrt(a.Sum(x => (x - meanA) * (x - meanA)) * b.Sum(x => (x - meanB) * (x - meanB)));
    return (bestLag, bestValue / norm);
}

async Task<double[]> ProcessVideo(double samplesPerSecond)
{
    //var test = JsonSerializer.Deserialize<double[]>(File.ReadAllText(@"C:\dev\test\VideoProcessor\Files\expectedWhistleProbabilities.json"))!;

    //return test;

    //await FFMpegCore.Extensions.Downloader.FFMpegDownloader.DownloadBinaries(options: new FFOptions { BinaryFolder = @".\" });

    var overlayPath = @"C:\dev\test\VideoProcessor\Files\overlay.mp4";

    var analysis = FFProbe.Analyse(overlayPath);
    var videoStream = analysis.PrimaryVideoStream;

    if (videoStream == null)
        throw new Exception();

    var cropSize = new Size(videoStream.Width / 8, videoStream.Width / 8);

    var outputSize = new Size(100, 100);

    var boxHeights = new List<int>();

    Console.WriteLine();
    var analyzeProgressHandler = new ProgressHandler("Analyzing overlay");

    await FFMpegArguments
        .FromFileInput(overlayPath, true)
        .OutputToPipe(new StreamPipeSink(ProcessFrames), o => o
            .WithVideoFilters(vo => vo
                .Crop(new Rectangle(new Point(videoStream.Width - cropSize.Width, 0), cropSize))
                .Framerate(4.0)
                .Scale(outputSize)
            )
            .ForcePixelFormat("bgra")
            .ForceFormat("rawvideo")
        )
        .NotifyOnProgress(analyzeProgressHandler.SetProgress, analysis.Duration)
        .ProcessAsynchronously();

    var jamStarts = new List<int>();
    var jamEnds = new List<int>();

    bool? inJam = null;

    for (var i = 1; i < boxHeights.Count - 1; ++i)
    {
        var gradient = boxHeights[i - 1] - boxHeights[i + 1];

        if (gradient < -5 && inJam != false)
        {
            jamEnds.Add(i);
            inJam = false;
        }
        else if (gradient > 5 && inJam != true)
        {
            jamStarts.Add(i);
            inJam = true;
        }
    }

    var jamEvents = jamStarts.Concat(jamEnds).ToArray();

    var expectedWhistleProbabilities = new double[(int)(boxHeights.Count / 4.0 * samplesPerSecond)];

    for (var i = 0; i < expectedWhistleProbabilities.Length; ++i)
    {
        var nearestFrame = (int)Math.Min(boxHeights.Count, Math.Round(i / samplesPerSecond * 4.0));

        var nearestEventFrame = jamEvents.OrderBy(e => Math.Abs(e - nearestFrame)).First();
        var distanceToNearestEvent = Math.Abs(i - nearestEventFrame / 4.0 * samplesPerSecond);

        var value = distanceToNearestEvent <= samplesPerSecond ? (1.0 - distanceToNearestEvent / samplesPerSecond) : 0.0;
        expectedWhistleProbabilities[i] = value;
    }

    return expectedWhistleProbabilities;

    async Task ProcessFrames(Stream frame, CancellationToken cancellationToken)
    {
        var buffer = new byte[outputSize.Width * outputSize.Height * 4];
        var stride = outputSize.Width * 4;

        while (true)
        {
            try
            {
                await frame.ReadExactlyAsync(buffer, cancellationToken);
            }
            catch (EndOfStreamException)
            {
                break;
            }

            var columnPixelCounts = new List<int>();

            for (var x = 0; x < outputSize.Width; x += outputSize.Width / 10)
            {
                var columnPixelCount = 0;

                for (var y = 0; y < outputSize.Height; ++y)
                {
                    var pixel = BitConverter.ToInt32(buffer, y * stride + x * 4);
                    var color = Color.FromArgb(pixel);

                    if (color.G < 224 || color.R > 32 || color.B > 32)
                        columnPixelCount++;
                }

                if (columnPixelCount > 0)
                    columnPixelCounts.Add(columnPixelCount);
            }

            boxHeights.Add(columnPixelCounts.Any() ? (int)columnPixelCounts.Average() : 0);
        }
    }
}

async Task ExtractAudio(string audioFileName)
{
    var footageFiles = Directory.GetFiles(@"C:\dev\test\VideoProcessor\Files\", "*.mts");
    var footageDuration = footageFiles.Aggregate(TimeSpan.Zero, (total, f) => total + FFProbe.Analyse(f).Duration);

    var extractProgressHandler = new ProgressHandler("Extracting audio");
    await FFMpegArguments
        .FromConcatInput(footageFiles)
        .OutputToFile(audioFileName, true)
        .NotifyOnProgress(extractProgressHandler.SetProgress, footageDuration)
        .ProcessAsynchronously();
}

async Task<AudioInformation> ProcessAudio(string audioFileName)
{
    var footageFiles = Directory.GetFiles(@"C:\dev\test\VideoProcessor\Files\", "*.mts");
    var footageDuration = footageFiles.Aggregate(TimeSpan.Zero, (total, f) => total + FFProbe.Analyse(f).Duration);

    var fftProcessor = new FftProcessor(4096, FftWindowType.None);

    await using var fileReader = new AudioFileReader(audioFileName);

    var buffer = new float[fftProcessor.FftSize];
    var spectrum = new NAudio.Dsp.Complex[fftProcessor.SpectrumLength];

    var spectrumAverages = new List<double>();

    var sampleProvider = fileReader.ToMono();

    var sampleRate = fileReader.WaveFormat.SampleRate;
    var completedTime = TimeSpan.Zero;

    Console.WriteLine();
    var spectrumProgressHandler = new ProgressHandler("Calculating audio spectrum");

    while (sampleProvider.Read(buffer) == buffer.Length)
    {
        fftProcessor.RealForward(buffer, spectrum);

        var decibelSpectrum = spectrum
            .Select(c => Math.Log10(Math.Sqrt(c.Real * c.Real + c.Imaginary * c.Imaginary)) * 20).ToArray();
        var max = decibelSpectrum.Max();
        var min = decibelSpectrum.Min();

        var normalSpectrum =
            double.IsNegativeInfinity(max) || double.IsNegativeInfinity(min)
                ? Enumerable.Repeat(0.0, decibelSpectrum.Length).ToArray()
                : decibelSpectrum.Select(d => Math.Abs(max - min) < 1e-10 ? 0.0 : (d - min) / (max - min)).ToArray();

        var filteredSpectrum = normalSpectrum.Skip(270).Take(100).ToArray();

        var average = filteredSpectrum.Average();
        spectrumAverages.Add(average);

        completedTime += TimeSpan.FromSeconds(fftProcessor.FftSize / (double)sampleRate);
        spectrumProgressHandler.SetProgress(completedTime.TotalSeconds / footageDuration.TotalSeconds * 100);
    }

    const int windowSize = 20;

    var windowValues = new List<double>();

    Console.WriteLine();
    var analyzeProgressHandler = new ProgressHandler("Analyzing audio");

    foreach (var (i, _) in spectrumAverages.Index())
    {
        var window = spectrumAverages.Skip(Math.Max(0, i - windowSize / 2)).Take(windowSize).Average();

        windowValues.Add(window);

        analyzeProgressHandler.SetProgress(i / (double)spectrumAverages.Count * 100);
    }

    File.WriteAllText(@"C:\dev\test\VideoProcessor\Files\windowValues.json", JsonSerializer.Serialize(windowValues));

    //var windowValues = JsonSerializer.Deserialize<double[]>(File.ReadAllText(@"C:\dev\test\VideoProcessor\Files\windowValues.json"))!;

    var windowMax = windowValues.Max();

    var normalizedWindowValues = windowValues.Select(v => v / windowMax).Select(v => Math.Pow(v, 16)).ToArray();

    normalizedWindowValues = normalizedWindowValues.Select(x => 1 - 1 / (10 * x + 1)).ToArray();

    return new(normalizedWindowValues, sampleRate / (double)fftProcessor.FftSize);
}

record AudioInformation(
    double[] WhistleProbabilities,
    double SamplesPerSecond
    );

class ProgressHandler(string message)
{
    public void SetProgress(double percentageProgress)
    {
        Console.CursorVisible = false;
        Console.SetCursorPosition(0, Console.CursorTop);
        Console.Write($"{message} - {Math.Round(percentageProgress)}%");
        Console.CursorVisible = true;
    }
}

static class FfmpegExtensionMethods
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