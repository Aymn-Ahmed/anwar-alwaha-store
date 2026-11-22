namespace AnwarAlwaha.API.DTOs.Products;

public class ImportProductDto
{
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string CategoryId { get; set; } = string.Empty;

    /// <summary>"New" or "Update"</summary>
    public string Status { get; set; } = "New";
    public Guid? ExistingProductId { get; set; }
    public decimal? ExistingPrice { get; set; }
}

public class PosPreviewResultDto
{
    public int TotalRows { get; set; }
    public int SkippedRows { get; set; }
    public int NewCount { get; set; }
    public int UpdateCount { get; set; }
    public List<ImportProductDto> Items { get; set; } = new();
}

public class ImportSummaryDto
{
    public int Added { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
}
