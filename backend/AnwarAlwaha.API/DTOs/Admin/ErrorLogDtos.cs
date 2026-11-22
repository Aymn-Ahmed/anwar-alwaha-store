namespace AnwarAlwaha.API.DTOs.Admin;

public class ErrorLogDto
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string ExceptionType { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string Path { get; set; } = string.Empty;
    public string Method { get; set; } = "GET";
    public string? QueryString { get; set; }
    public int StatusCode { get; set; } = 500;
    public string? UserAgent { get; set; }
    public string? ClientIp { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ResolveErrorLogDto
{
    public string? ResolvedBy { get; set; }
}
