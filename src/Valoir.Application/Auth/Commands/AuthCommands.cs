using FluentValidation;
using MediatR;
using Valoir.Application.Auth.DTOs;

namespace Valoir.Application.Auth.Commands;

public record RegisterBuyerCommand(RegisterBuyerRequest Request, string? IpAddress) : IRequest<AuthResponse>;
public record RegisterVendorCommand(RegisterVendorRequest Request, string? IpAddress) : IRequest<AuthResponse>;
public record LoginCommand(LoginRequest Request, string? IpAddress) : IRequest<AuthResponse>;
public record RefreshTokenCommand(string RefreshToken, string? IpAddress) : IRequest<AuthResponse>;
public record LogoutCommand(string RefreshToken, string? IpAddress) : IRequest;

public class RegisterBuyerCommandValidator : AbstractValidator<RegisterBuyerCommand>
{
    public RegisterBuyerCommandValidator()
    {
        RuleFor(x => x.Request.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.Password).MinimumLength(12);
        RuleFor(x => x.Request.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.AcceptTerms).Equal(true).WithMessage("Terms of Service must be accepted.");
        RuleFor(x => x.Request.AcceptPrivacyPolicy).Equal(true).WithMessage("Privacy Policy must be accepted.");
    }
}

public class RegisterVendorCommandValidator : AbstractValidator<RegisterVendorCommand>
{
    public RegisterVendorCommandValidator()
    {
        RuleFor(x => x.Request.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.Password).MinimumLength(12);
        RuleFor(x => x.Request.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.StoreName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.Slug).NotEmpty().MaximumLength(120)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase alphanumeric with hyphens.");
        RuleFor(x => x.Request.AcceptTerms).Equal(true);
        RuleFor(x => x.Request.AcceptPrivacyPolicy).Equal(true);
        RuleFor(x => x.Request.AcceptVendorAgreement).Equal(true)
            .WithMessage("Vendor Commercial Agreement must be accepted.");
    }
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Request.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.Password).NotEmpty();
    }
}

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
