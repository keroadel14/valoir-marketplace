using FluentValidation;
using MediatR;

namespace Valoir.Application.Admin.Commands;

public record ApproveBoutiqueCommand(Guid BoutiqueId, string? Notes) : IRequest;

public class ApproveBoutiqueCommandValidator : AbstractValidator<ApproveBoutiqueCommand>
{
    public ApproveBoutiqueCommandValidator()
    {
        RuleFor(x => x.BoutiqueId).NotEmpty();
    }
}

public record SuspendBoutiqueCommand(Guid BoutiqueId, string Reason) : IRequest;

public class SuspendBoutiqueCommandValidator : AbstractValidator<SuspendBoutiqueCommand>
{
    public SuspendBoutiqueCommandValidator()
    {
        RuleFor(x => x.BoutiqueId).NotEmpty();
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Suspension reason is required.")
            .MaximumLength(1000);
    }
}

public record RejectBoutiqueCommand(Guid BoutiqueId, string Reason) : IRequest;

public class RejectBoutiqueCommandValidator : AbstractValidator<RejectBoutiqueCommand>
{
    public RejectBoutiqueCommandValidator()
    {
        RuleFor(x => x.BoutiqueId).NotEmpty();
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is required.")
            .MaximumLength(1000);
    }
}

public record ReinstateBoutiqueCommand(Guid BoutiqueId) : IRequest;

public class ReinstateBoutiqueCommandValidator : AbstractValidator<ReinstateBoutiqueCommand>
{
    public ReinstateBoutiqueCommandValidator()
    {
        RuleFor(x => x.BoutiqueId).NotEmpty();
    }
}

public record OverrideCommissionCommand(Guid BoutiqueId, decimal NewRate) : IRequest;

public class OverrideCommissionCommandValidator : AbstractValidator<OverrideCommissionCommand>
{
    public OverrideCommissionCommandValidator()
    {
        RuleFor(x => x.BoutiqueId).NotEmpty();
        RuleFor(x => x.NewRate)
            .InclusiveBetween(0.05m, 0.30m)
            .WithMessage("Commission rate must be between 5% and 30% (SSOT business rule).");
    }
}

public record SetPayoutHoldCommand(Guid BoutiqueId, bool Hold) : IRequest;

public class SetPayoutHoldCommandValidator : AbstractValidator<SetPayoutHoldCommand>
{
    public SetPayoutHoldCommandValidator()
    {
        RuleFor(x => x.BoutiqueId).NotEmpty();
    }
}

public record AdminRefundCommand(
    Guid OrderId,
    Guid? VendorOrderId,
    IReadOnlyList<Guid>? OrderItemIds,
    string Reason,
    bool ReverseTransfer = true) : IRequest<AdminRefundResult>;

public class AdminRefundResult
{
    public string StripeRefundId { get; init; } = null!;
    public IReadOnlyList<string> ReversedTransferIds { get; init; } = Array.Empty<string>();
    public decimal RefundedAmount { get; init; }
}

public class AdminRefundCommandValidator : AbstractValidator<AdminRefundCommand>
{
    public AdminRefundCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Refund reason is required.")
            .MaximumLength(1000);
    }
}
