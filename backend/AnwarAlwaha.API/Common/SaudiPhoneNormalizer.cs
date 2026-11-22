namespace AnwarAlwaha.API.Common;

public static class SaudiPhoneNormalizer
{
    public static string NormalizeTo05(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return string.Empty;

        var digits = new string(raw.Where(char.IsDigit).ToArray());
        if (string.IsNullOrEmpty(digits))
            return string.Empty;

        if (digits.StartsWith("009665") && digits.Length == 14)
            return "0" + digits.Substring(5);

        if (digits.StartsWith("9665") && digits.Length == 12)
            return "0" + digits.Substring(3);

        if (digits.StartsWith("96605") && digits.Length == 13)
            return digits.Substring(3);

        if (digits.StartsWith("5") && digits.Length == 9)
            return "0" + digits;

        if (digits.StartsWith("05") && digits.Length == 10)
            return digits;

        return digits;
    }

    public static string ExtractCore9Digits(string? raw)
    {
        var normalized = NormalizeTo05(raw);
        if (normalized.StartsWith("05") && normalized.Length == 10)
            return normalized.Substring(1); // "5XXXXXXXX" (9 digits)

        if (normalized.Length >= 9)
            return normalized.Substring(normalized.Length - 9);

        return normalized;
    }

    public static bool ArePhonesEquivalent(string? phoneA, string? phoneB)
    {
        var normA = NormalizeTo05(phoneA);
        var normB = NormalizeTo05(phoneB);
        if (string.IsNullOrEmpty(normA) || string.IsNullOrEmpty(normB))
            return false;

        return string.Equals(normA, normB, StringComparison.Ordinal);
    }
}
