using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

public class ShippingAddress : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Label { get; private set; } = "Home";
    public string FullName { get; private set; } = null!;
    public string Phone { get; private set; } = null!;
    public string Line1 { get; private set; } = null!;
    public string? Line2 { get; private set; }
    public string City { get; private set; } = null!;
    public string? StateOrRegion { get; private set; }
    public string PostalCode { get; private set; } = null!;
    public string CountryCode { get; private set; } = "AE";
    public bool IsDefault { get; private set; }

    private ShippingAddress() { }

    public static ShippingAddress Create(
        Guid userId, string fullName, string phone, string line1, string city,
        string postalCode, string countryCode, string? line2 = null, string? state = null,
        string label = "Home", bool isDefault = false)
    {
        if (userId == Guid.Empty) throw new DomainException("User required.");
        if (string.IsNullOrWhiteSpace(fullName)) throw new DomainException("Full name required.");
        if (string.IsNullOrWhiteSpace(phone)) throw new DomainException("Phone required.");
        if (string.IsNullOrWhiteSpace(line1)) throw new DomainException("Address line required.");
        if (string.IsNullOrWhiteSpace(city)) throw new DomainException("City required.");
        if (string.IsNullOrWhiteSpace(postalCode)) throw new DomainException("Postal code required.");
        if (string.IsNullOrWhiteSpace(countryCode) || countryCode.Length != 2)
            throw new DomainException("Country code must be ISO 2-letter.");

        return new ShippingAddress
        {
            UserId = userId,
            FullName = fullName.Trim(),
            Phone = phone.Trim(),
            Line1 = line1.Trim(),
            Line2 = line2?.Trim(),
            City = city.Trim(),
            StateOrRegion = state?.Trim(),
            PostalCode = postalCode.Trim(),
            CountryCode = countryCode.Trim().ToUpperInvariant(),
            Label = string.IsNullOrWhiteSpace(label) ? "Home" : label.Trim(),
            IsDefault = isDefault
        };
    }

    public void Update(string fullName, string phone, string line1, string city, string postalCode,
        string countryCode, string? line2, string? state, string label)
    {
        FullName = fullName.Trim();
        Phone = phone.Trim();
        Line1 = line1.Trim();
        Line2 = line2?.Trim();
        City = city.Trim();
        PostalCode = postalCode.Trim();
        CountryCode = countryCode.Trim().ToUpperInvariant();
        StateOrRegion = state?.Trim();
        Label = string.IsNullOrWhiteSpace(label) ? Label : label.Trim();
        Touch();
    }

    public void SetDefault(bool value)
    {
        IsDefault = value;
        Touch();
    }
}
