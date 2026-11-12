using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Valoir.Application.Auth.DTOs;
using Xunit;

namespace Valoir.IntegrationTests;

public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;
    private HttpClient _client = null!;

    public AuthIntegrationTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync()
    {
        await _factory.InitializeAsync();
        _client = _factory.CreateClient();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task RegisterBuyer_Succeeds_And_ReturnsTokens()
    {
        var email = $"buyer_{Guid.NewGuid():N}@test.local";
        var res = await _client.PostAsJsonAsync("/api/v1/auth/register-buyer", new RegisterBuyerRequest(
            email, "Str0ng!Passw0rd", "Test Buyer", true, true));
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();
        body.Should().NotBeNull();
        body!.AccessToken.Should().NotBeNullOrEmpty();
        body.RefreshToken.Should().NotBeNullOrEmpty();
        body.Roles.Should().Contain("Buyer");
        body.Roles.Should().NotContain("Admin");
        body.Roles.Should().NotContain("SuperAdmin");
    }

    [Fact]
    public async Task RegisterBuyer_WithoutTerms_Fails()
    {
        var res = await _client.PostAsJsonAsync("/api/v1/auth/register-buyer", new RegisterBuyerRequest(
            $"x_{Guid.NewGuid():N}@test.local", "Str0ng!Passw0rd", "X", false, true));
        res.IsSuccessStatusCode.Should().BeFalse();
    }

    [Fact]
    public async Task RegisterVendor_CreatesPendingBoutique()
    {
        var email = $"vendor_{Guid.NewGuid():N}@test.local";
        var slug = $"store-{Guid.NewGuid():N}"[..20];
        var res = await _client.PostAsJsonAsync("/api/v1/auth/register-vendor", new RegisterVendorRequest(
            email, "Str0ng!Passw0rd", "Vendor Name", "My Boutique", slug, "VAT-123",
            true, true, true));
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();
        body!.Roles.Should().Contain("Vendor");
        body.BoutiqueId.Should().NotBeNull();
        body.BoutiqueStatus.Should().Be("Pending");
    }

    [Fact]
    public async Task Login_And_Refresh_Rotates_Token()
    {
        var email = $"login_{Guid.NewGuid():N}@test.local";
        var password = "Str0ng!Passw0rd";
        await _client.PostAsJsonAsync("/api/v1/auth/register-buyer", new RegisterBuyerRequest(
            email, password, "Login User", true, true));

        var login = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, password));
        login.StatusCode.Should().Be(HttpStatusCode.OK);
        var tokens = await login.Content.ReadFromJsonAsync<AuthResponse>();
        var oldRefresh = tokens!.RefreshToken;

        var refresh = await _client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshRequest(oldRefresh));
        refresh.StatusCode.Should().Be(HttpStatusCode.OK);
        var rotated = await refresh.Content.ReadFromJsonAsync<AuthResponse>();
        rotated!.RefreshToken.Should().NotBe(oldRefresh);

        // Reuse of old refresh must fail and revoke sessions
        var reuse = await _client.PostAsJsonAsync("/api/v1/auth/refresh", new RefreshRequest(oldRefresh));
        reuse.IsSuccessStatusCode.Should().BeFalse();
    }

    [Fact]
    public async Task AdminEndpoints_RequireAuth()
    {
        var res = await _client.GetAsync("/api/v1/admin/metrics");
        res.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
    }
}
