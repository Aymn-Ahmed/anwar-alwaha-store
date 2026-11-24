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

        // Keyless Safe Mode defaults to prevent crashes when environment variables are omitted
        if (string.IsNullOrWhiteSpace(settings.PublishableKey))
            settings.PublishableKey = "pk_test_sample_key_for_anwar_alwaha_library";

        if (string.IsNullOrWhiteSpace(settings.SecretKey))
            settings.SecretKey = "sk_test_sample_secret_key_for_anwar_alwaha";

        if (string.IsNullOrWhiteSpace(settings.WebhookSecret))
            settings.WebhookSecret = "whsec_sample_webhook_secret_signature_key";

        if (string.IsNullOrWhiteSpace(settings.CallbackUrl))
            settings.CallbackUrl = "https://anwar-alwaha-store.pages.dev/payment/callback";

        return settings;
    }
}
