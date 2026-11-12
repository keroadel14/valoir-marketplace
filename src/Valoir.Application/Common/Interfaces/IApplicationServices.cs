namespace Valoir.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
    string? IpAddress { get; }
    string? CorrelationId { get; }
}

public interface IAdminAuditService
{
    Task LogAsync(
        string action,
        string? targetType = null,
        Guid? targetId = null,
        object? previousValue = null,
        object? newValue = null,
        string? reason = null,
        string? outcome = "Success",
        CancellationToken ct = default);
}

public interface IInventoryReservationService
{
    Task<Guid> ReserveAsync(Guid variantId, Guid orderId, int quantity, TimeSpan ttl, CancellationToken ct = default);
    Task ConfirmAsync(Guid reservationId, CancellationToken ct = default);
    Task ReleaseAsync(Guid reservationId, CancellationToken ct = default);
    Task ReleaseByOrderAsync(Guid orderId, CancellationToken ct = default);
}

public interface IStripeConnectService
{
    Task<string> CreateConnectedAccountOnboardingLinkAsync(Guid boutiqueId, string refreshUrl, string returnUrl, CancellationToken ct = default);
    Task<(bool DetailsSubmitted, bool ChargesEnabled, bool PayoutsEnabled, string? AccountId)> GetAccountStatusAsync(string stripeAccountId, CancellationToken ct = default);
    Task<string> CreateTransferAsync(string destinationAccountId, long amountCents, string currency, string? transferGroup, string? idempotencyKey, CancellationToken ct = default);
    Task<string> CreateRefundAsync(string paymentIntentId, long? amountCents, string? reason, string? idempotencyKey, CancellationToken ct = default);
    Task<string> CreateTransferReversalAsync(string transferId, long? amountCents, string? idempotencyKey, CancellationToken ct = default);
    /// <summary>Creates a PaymentIntent. Returns client-safe id. Amount in smallest currency unit (cents).</summary>
    Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(
        long amountCents, string currency, string? idempotencyKey, IReadOnlyDictionary<string, string>? metadata = null, CancellationToken ct = default);
}

public interface ITokenService
{
    (string AccessToken, DateTime ExpiresAt) CreateAccessToken(Guid userId, string email, IEnumerable<string> roles, Guid? boutiqueId = null);
    string GenerateRefreshToken();
    string HashToken(string token);
}
