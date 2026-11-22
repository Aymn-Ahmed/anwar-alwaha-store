using System.Text;
using System.Text.RegularExpressions;

namespace AnwarAlwaha.API.Common;

public static class ArabicNormalizer
{
    public static string Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var sb = new StringBuilder(input.Length);
        foreach (var ch in input.Trim().ToLowerInvariant())
        {
            // Skip Arabic diacritics (Tashkeel) and Tatweel
            if ((ch >= '\u064B' && ch <= '\u065F') || ch == '\u0670' || ch == '\u0640')
                continue;

            sb.Append(ch switch
            {
                'أ' or 'إ' or 'آ' or 'ٱ' => 'ا',
                'ة' => 'ه',
                'ى' or 'ئ' => 'ي',
                'ؤ' => 'و',
                ',' or '،' or ';' or '؛' or '/' or '\\' or '-' or '_' or '(' or ')' or '[' or ']' => ' ',
                _ => ch
            });
        }

        return Regex.Replace(sb.ToString(), @"\s+", " ").Trim();
    }

    public static List<string> Tokenize(string? input)
    {
        var norm = Normalize(input);
        if (string.IsNullOrEmpty(norm))
            return new List<string>();

        return norm
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(t => t.Length >= 1)
            .Distinct()
            .ToList();
    }
}
