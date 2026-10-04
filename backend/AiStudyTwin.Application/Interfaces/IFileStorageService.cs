namespace AiStudyTwin.Application.Interfaces;

public interface IFileStorageService
{
    Task<(string relativeUrl, string absolutePath)> SaveImageAsync(
        Stream stream,
        string originalFileName,
        string subDirectory = "vision",
        CancellationToken cancellationToken = default);

    Task DeleteFileAsync(string relativeUrl, CancellationToken cancellationToken = default);
}
