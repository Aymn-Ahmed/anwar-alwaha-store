namespace AnwarAlwaha.API.DTOs.Products;

public class BarcodeImageStatsDto
{
    public int TotalProducts { get; set; }
    public int WithImageCount { get; set; }
    public int WithImages => WithImageCount;
    public int EligibleForFetchCount { get; set; }
    public int EligibleForFetch => EligibleForFetchCount;
    public int NotFoundCount { get; set; }
    public int NotFound => NotFoundCount;

    // Background job live state
    public bool IsRunning { get; set; }
    public int SessionProcessed { get; set; }
    public int SessionUploaded { get; set; }
    public int SessionNotFound { get; set; }
    public bool QuotaExceeded { get; set; }
    public string? LastMessage { get; set; }
}

public class StartImageFetchRequestDto
{
    public string? ApiKey { get; set; }
    public int BatchSize { get; set; } = 25;
}

public class FetchBatchRequestDto
{
    public int BatchSize { get; set; } = 25;
    public string? ApiKey { get; set; }
}

public class BarcodeImageBatchResultDto
{
    public int Processed { get; set; }
    public int FoundAndUploaded { get; set; }
    public int NotFound { get; set; }
    public int RemainingEligible { get; set; }
    public bool QuotaExceeded { get; set; }
    public string? Message { get; set; }
}
