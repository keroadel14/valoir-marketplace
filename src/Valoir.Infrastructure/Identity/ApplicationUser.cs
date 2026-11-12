using Microsoft.AspNetCore.Identity;
using Valoir.Domain.Enums;

namespace Valoir.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string? FullName { get; set; }
    public UserAccountStatus AccountStatus { get; set; } = UserAccountStatus.Active;
    public bool HasAcceptedTerms { get; set; }
    public DateTime? AcceptedTermsAt { get; set; }
    public bool HasAcceptedPrivacyPolicy { get; set; }
    public DateTime? AcceptedPrivacyPolicyAt { get; set; }
    public string? TermsAcceptanceIp { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public string PreferredTheme { get; set; } = "system";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SuspendedAt { get; set; }
    public string? SuspensionReason { get; set; }
}
