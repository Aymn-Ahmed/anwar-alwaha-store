using AnwarAlwaha.API.DTOs.Auth;

namespace AnwarAlwaha.API.Services.Interfaces;

public interface IAuthService
{
    Task<(AuthResponseDto response, string refreshToken)?> LoginAsync(LoginRequestDto request);
    Task<(AuthResponseDto response, string newRefreshToken)?> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
}
