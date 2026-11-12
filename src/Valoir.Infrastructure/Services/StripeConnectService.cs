using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Valoir.Application.Common.Interfaces;

namespace Valoir.Infrastructure.Services;

/// <summary>
/// Stripe Connect wrapper. In development without a real key it returns deterministic fake IDs
/// so handlers and tests can run without network or real money movement.
/// </summary>
public class StripeConnectService : IStripeConnectService
{
    private readonly IConfiguration _config;
    private readonly ILogger<StripeConnectService> _logger;
    private readonly bool _isLiveConfigured;

    public StripeConnectService(IConfiguration config, ILogger<StripeConnectService> logger)
    {
        _config = config;
        _logger = logger;
        var key = config["Stripe:SecretKey"] ?? Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
        _isLiveConfigured = !string.IsNullOrWhiteSpace(key) && key.StartsWith("sk_");
        if (_isLiveConfigured)
        {
            Stripe.StripeConfiguration.ApiKey = key;
        }
    }

    public Task<string> CreateConnectedAccountOnboardingLinkAsync(Guid boutiqueId, string refreshUrl, string returnUrl, CancellationToken ct = default)
    {
        if (!_isLiveConfigured)
        {
            _logger.LogWarning("Stripe not configured – returning mock onboarding link for boutique {BoutiqueId}", boutiqueId);
            return Task.FromResult($"https://connect.stripe.com/mock/onboard/{boutiqueId}");
        }
        // Real implementation would use AccountCreateOptions + AccountLinkCreateOptions
        throw new NotImplementedException("Live Stripe account link creation requires full Connect setup.");
    }

    public Task<(bool DetailsSubmitted, bool ChargesEnabled, bool PayoutsEnabled, string? AccountId)> GetAccountStatusAsync(string stripeAccountId, CancellationToken ct = default)
    {
        if (!_isLiveConfigured)
            return Task.FromResult<(bool, bool, bool, string?)>((true, true, true, stripeAccountId));
        throw new NotImplementedException("Live Stripe account retrieve not wired in this phase.");
    }

    public Task<string> CreateTransferAsync(string destinationAccountId, long amountCents, string currency, string? transferGroup, string? idempotencyKey, CancellationToken ct = default)
    {
        if (!_isLiveConfigured)
        {
            var fakeId = $"tr_mock_{Guid.NewGuid():N}"[..24];
            _logger.LogInformation("Mock transfer {TransferId} of {Amount} {Currency} to {Dest}", fakeId, amountCents, currency, destinationAccountId);
            return Task.FromResult(fakeId);
        }
        throw new NotImplementedException("Live transfer creation not wired in this phase.");
    }

    public Task<string> CreateRefundAsync(string paymentIntentId, long? amountCents, string? reason, string? idempotencyKey, CancellationToken ct = default)
    {
        if (!_isLiveConfigured)
        {
            var fakeId = $"re_mock_{Guid.NewGuid():N}"[..24];
            _logger.LogInformation("Mock refund {RefundId} of {Amount} for PI {PI}", fakeId, amountCents, paymentIntentId);
            return Task.FromResult(fakeId);
        }
        throw new NotImplementedException("Live refund not wired in this phase.");
    }

    public Task<string> CreateTransferReversalAsync(string transferId, long? amountCents, string? idempotencyKey, CancellationToken ct = default)
    {
        if (!_isLiveConfigured)
        {
            var fakeId = $"trr_mock_{Guid.NewGuid():N}"[..24];
            _logger.LogInformation("Mock transfer reversal {ReversalId} of {Amount} for {TransferId}", fakeId, amountCents, transferId);
            return Task.FromResult(fakeId);
        }
        throw new NotImplementedException("Live transfer reversal not wired in this phase.");
    }

    public Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(
        long amountCents, string currency, string? idempotencyKey, IReadOnlyDictionary<string, string>? metadata = null, CancellationToken ct = default)
    {
        if (!_isLiveConfigured)
        {
            var id = $"pi_mock_{Guid.NewGuid():N}"[..27];
            var secret = $"{id}_secret_mock";
            _logger.LogInformation("Mock PaymentIntent {Id} amount={Amount} {Currency}", id, amountCents, currency);
            return Task.FromResult((id, secret));
        }
        throw new NotImplementedException("Live PaymentIntent creation requires Stripe secret configuration.");
    }

}
