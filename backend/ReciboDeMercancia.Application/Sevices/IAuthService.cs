using ReciboDeMercancia.Application.DTOs;

namespace ReciboDeMercancia.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> UpdatePerfilAsync(string nombreActual, UpdatePerfilRequest request);
}
