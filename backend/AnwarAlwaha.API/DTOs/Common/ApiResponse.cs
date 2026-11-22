namespace AnwarAlwaha.API.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string? Message { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T?> Ok(T? data = default, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string error, List<string>? errors = null) =>
        new() { Success = false, Message = error, Errors = errors };
}

public class ApiResponse : ApiResponse<object?>
{
    public static ApiResponse Ok(string? message = null) =>
        new() { Success = true, Message = message };

    public static new ApiResponse Fail(string error, List<string>? errors = null) =>
        new() { Success = false, Message = error, Errors = errors };
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
