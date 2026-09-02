namespace AiStudyTwin.Application.Common.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} ({key}) topilmadi.", 404)
    {
    }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Avtorizatsiyadan o'tilmagan.")
        : base(message, 401)
    {
    }
}

public class ValidationException : AppException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("Validatsiya xatosi yuz berdi.", 422)
    {
        Errors = errors;
    }

    public ValidationException(string field, string error)
        : base("Validatsiya xatosi yuz berdi.", 422)
    {
        Errors = new Dictionary<string, string[]>
        {
            { field, new[] { error } }
        };
    }
}
