namespace AnwarAlwaha.API.Common;

public class MoyasarSettings
{
    public const string SectionName = "MoyasarSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.moyasar.com/v1";
    public string CallbackUrl { get; set; } = "http://localhost:5173/payment/callback";

    public static MoyasarSettings FromConfiguration(IConfiguration configuration)
    {
        var settings = new MoyasarSettings();
        configuration.GetSection(SectionName).Bind(settings);

        var envSecret = Environment.GetEnvironmentVariable("MOYASAR_SECRET_KEY");
        if (!string.IsNullOrWhiteSpace(envSecret))
            settings.SecretKey = envSecret;

        var envPublishable = Environment.GetEnvironmentVariable("MOYASAR_PUBLISHABLE_KEY");
        if (!string.IsNullOrWhiteSpace(envPublishable))
            settings.PublishableKey = envPublishable;

        var envWebhookSecret = Environment.GetEnvironmentVariable("MOYASAR_WEBHOOK_SECRET");
        if (!string.IsNullOrWhiteSpace(envWebhookSecret))
            settings.WebhookSecret = envWebhookSecret;

        var envCallbackUrl = Environment.GetEnvironmentVariable("MOYASAR_CALLBACK_URL");
        if (!string.IsNullOrWhiteSpace(envCallbackUrl))
            settings.CallbackUrl = envCallbackUrl;

        return settings;
    }
}
