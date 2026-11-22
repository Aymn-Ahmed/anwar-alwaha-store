using AnwarAlwaha.API.DTOs.Auth;
using AnwarAlwaha.API.DTOs.Common;
using AnwarAlwaha.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AnwarAlwaha.API.Controllers.Admin;

[ApiController]
[Route("api/admin/auth")]
public class AdminAuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AdminAuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("بيانات الدخول غير صحيحة أو الحساب معطل."));
        }

        SetRefreshTokenCookie(result.Value.refreshToken);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result.Value.response, "تم تسجيل الدخول بنجاح."));
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto? body)
    {
        // Try reading refresh token from HttpOnly cookie first, then fallback to body
        var refreshToken = Request.Cookies["refreshToken"] ?? body?.RefreshToken;

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(ApiResponse<object>.Fail("رمز التحديث غير متوفر."));
        }

        var result = await _authService.RefreshTokenAsync(refreshToken);
        if (result == null)
        {
            ClearRefreshTokenCookie();
            return Unauthorized(ApiResponse<object>.Fail("رمز التحديث غير صالح أو منتهي الصلاحية."));
        }

        SetRefreshTokenCookie(result.Value.newRefreshToken);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result.Value.response));
    }

    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto? body)
    {
        var refreshToken = Request.Cookies["refreshToken"] ?? body?.RefreshToken;
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
        }

        ClearRefreshTokenCookie();
        return Ok(ApiResponse.Ok("تم تسجيل الخروج بنجاح."));
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(30)
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private void ClearRefreshTokenCookie()
    {
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax
        });
    }
}
