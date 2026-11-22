namespace AnwarAlwaha.API.DTOs.Reviews;

public class CreateReviewDto
{
    public Guid ProductId { get; set; }
    public string? OrderCode { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public int Rating { get; set; } = 5;
    public string? Comment { get; set; }
    public string[] MediaUrls { get; set; } = Array.Empty<string>();
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string[] MediaUrls { get; set; } = Array.Empty<string>();
    public bool IsApproved { get; set; }
    public bool IsVerifiedPurchase { get; set; } = true;
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
