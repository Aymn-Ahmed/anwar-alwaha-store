using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AnwarAlwaha.API.DTOs.Auth;
using AnwarAlwaha.API.Entities;
using AnwarAlwaha.API.Repositories.Interfaces;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AnwarAlwaha.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<(AuthResponseDto response, string refreshToken)?> LoginAsync(LoginRequestDto request)
    {
        var admin = await _unitOfWork.AdminUsers.Query()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

        if (admin == null || !admin.IsActive)
            return null;

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash);
        if (!isPasswordValid)
            return null;

        var token = GenerateAccessToken(admin);
        var refreshToken = GenerateRefreshTokenString();

        admin.RefreshToken = refreshToken;
        admin.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        _unitOfWork.AdminUsers.Update(admin);
        await _unitOfWork.CompleteAsync();

        var response = new AuthResponseDto
        {
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresInMinutes = GetTokenExpirationMinutes(),
            FullName = admin.FullName,
            Email = admin.Email,
            Role = admin.Role
        };

        return (response, refreshToken);
    }

    public async Task<(AuthResponseDto response, string newRefreshToken)?> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return null;

        var admin = await _unitOfWork.AdminUsers.Query()
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiryTime > DateTime.UtcNow && u.IsActive);

        if (admin == null)
            return null;

        var newAccessToken = GenerateAccessToken(admin);
        var newRefreshToken = GenerateRefreshTokenString();

        admin.RefreshToken = newRefreshToken;
        admin.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        _unitOfWork.AdminUsers.Update(admin);
        await _unitOfWork.CompleteAsync();

        var response = new AuthResponseDto
        {
            AccessToken = newAccessToken,
            TokenType = "Bearer",
            ExpiresInMinutes = GetTokenExpirationMinutes(),
            FullName = admin.FullName,
            Email = admin.Email,
            Role = admin.Role
        };

        return (response, newRefreshToken);
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return false;

        var admin = await _unitOfWork.AdminUsers.Query()
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (admin == null)
            return false;

        admin.RefreshToken = null;
        admin.RefreshTokenExpiryTime = null;
        _unitOfWork.AdminUsers.Update(admin);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    private string GenerateAccessToken(AdminUser admin)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"] ?? "Default_Fallback_Secret_Key_At_Least_64_Characters_Long_For_Security_2026";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new(ClaimTypes.Email, admin.Email),
            new(ClaimTypes.Name, admin.FullName),
            new(ClaimTypes.Role, admin.Role)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int GetTokenExpirationMinutes()
    {
        var minutesStr = _configuration["JwtSettings:ExpiryMinutes"] ?? _configuration["JwtSettings:ExpiresInMinutes"];
        if (int.TryParse(minutesStr, out int minutes) && minutes >= 1440)
            return minutes;
        return 1440; // Minimum 24 hours (1440 minutes)
    }

    private static string GenerateRefreshTokenString()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
