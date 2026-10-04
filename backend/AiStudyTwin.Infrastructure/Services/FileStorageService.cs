using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace AiStudyTwin.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private readonly ILogger<FileStorageService> _logger;
    private readonly string _baseUploadsPath;

    public FileStorageService(ILogger<FileStorageService> logger)
    {
        _logger = logger;
        _baseUploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        if (!Directory.Exists(_baseUploadsPath))
        {
            Directory.CreateDirectory(_baseUploadsPath);
        }
    }

    public async Task<(string relativeUrl, string absolutePath)> SaveImageAsync(
        Stream stream,
        string originalFileName,
        string subDirectory = "vision",
        CancellationToken cancellationToken = default)
    {
        if (stream == null || stream.Length == 0)
        {
            throw new ValidationException("Image", "Rasm fayli bo'sh bo'lishi mumkin emas.");
        }

        if (stream.Length > MaxFileSize)
        {
            throw new ValidationException("Image", "Rasm hajmi juda katta. Maksimal ruxsat etilgan hajm: 10MB.");
        }

        var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
        {
            throw new ValidationException("Image", "Noto'g'ri rasm formati. Faqat JPG, PNG va WEBP formatlar qabul qilinadi.");
        }

        // Validate image signatures (magic numbers) to prevent malicious executable files disguised as images
        var header = new byte[12];
        var originalPos = stream.Position;
        if (stream.CanSeek)
        {
            stream.Position = 0;
            _ = await stream.ReadAsync(header.AsMemory(0, header.Length), cancellationToken);
            stream.Position = originalPos;

            if (!IsValidImageHeader(header, ext))
            {
                throw new ValidationException("Image", "Yuklangan fayl haqiqiy rasm formati emas yoki buzilgan.");
            }
        }

        var now = DateTime.UtcNow;
        var folder = Path.Combine(_baseUploadsPath, subDirectory, now.ToString("yyyy"), now.ToString("MM"));
        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        var uniqueFileName = $"{Guid.NewGuid():N}{ext}";
        var absolutePath = Path.Combine(folder, uniqueFileName);

        using (var destStream = new FileStream(absolutePath, FileMode.Create, FileAccess.Write))
        {
            if (stream.CanSeek) stream.Position = 0;
            await stream.CopyToAsync(destStream, cancellationToken);
        }

        var relativeUrl = $"/uploads/{subDirectory}/{now:yyyy}/{now:MM}/{uniqueFileName}";
        _logger.LogInformation("Saved image successfully to {AbsolutePath}. Url: {RelativeUrl}", absolutePath, relativeUrl);

        return (relativeUrl, absolutePath);
    }

    public Task DeleteFileAsync(string relativeUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(relativeUrl) || !relativeUrl.StartsWith("/uploads/"))
            {
                return Task.CompletedTask;
            }

            var cleanRelative = relativeUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), cleanRelative);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Deleted image file {FullPath}", fullPath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete image at {Url}", relativeUrl);
        }

        return Task.CompletedTask;
    }

    private static bool IsValidImageHeader(byte[] header, string ext)
    {
        if (header.Length < 4) return false;

        // JPEG: FF D8 FF
        if (ext is ".jpg" or ".jpeg")
        {
            return header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
        }

        // PNG: 89 50 4E 47
        if (ext is ".png")
        {
            return header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
        }

        // WEBP: 52 49 46 46 (RIFF) .... 57 45 42 50 (WEBP)
        if (ext is ".webp")
        {
            return header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                   header.Length >= 12 &&
                   header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;
        }

        return false;
    }
}
