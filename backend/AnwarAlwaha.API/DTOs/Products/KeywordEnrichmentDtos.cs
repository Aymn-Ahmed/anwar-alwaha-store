namespace AnwarAlwaha.API.DTOs.Products;

public class KeywordEnrichmentStatusDto
{
    public int TotalProducts { get; set; }
    public int EnrichedCount { get; set; }
    public int RemainingCount { get; set; }
    public bool IsRunning { get; set; }
    public int SessionProcessed { get; set; }
    public string? LastMessage { get; set; }
}
