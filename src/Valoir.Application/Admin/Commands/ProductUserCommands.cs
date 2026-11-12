using FluentValidation;
using MediatR;

namespace Valoir.Application.Admin.Commands;

public record ForceUnlistProductCommand(Guid ProductId, string Reason) : IRequest;
public class ForceUnlistProductCommandValidator : AbstractValidator<ForceUnlistProductCommand>
{
    public ForceUnlistProductCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
    }
}

public record FeatureProductCommand(Guid ProductId, bool Featured) : IRequest;
public class FeatureProductCommandValidator : AbstractValidator<FeatureProductCommand>
{
    public FeatureProductCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public record SuspendUserCommand(Guid UserId, string Reason) : IRequest;
public class SuspendUserCommandValidator : AbstractValidator<SuspendUserCommand>
{
    public SuspendUserCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
    }
}

public record ReactivateUserCommand(Guid UserId) : IRequest;
public class ReactivateUserCommandValidator : AbstractValidator<ReactivateUserCommand>
{
    public ReactivateUserCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}
