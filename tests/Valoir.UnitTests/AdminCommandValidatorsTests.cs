using FluentAssertions;
using FluentValidation.TestHelper;
using Valoir.Application.Admin.Commands;
using Xunit;

namespace Valoir.UnitTests;

public class AdminCommandValidatorsTests
{
    [Fact]
    public void SuspendBoutique_RequiresReason()
    {
        var validator = new SuspendBoutiqueCommandValidator();
        var result = validator.TestValidate(new SuspendBoutiqueCommand(Guid.NewGuid(), ""));
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }

    [Fact]
    public void SuspendBoutique_AcceptsValidReason()
    {
        var validator = new SuspendBoutiqueCommandValidator();
        var result = validator.TestValidate(new SuspendBoutiqueCommand(Guid.NewGuid(), "Policy violation"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void RejectBoutique_RequiresReason()
    {
        var validator = new RejectBoutiqueCommandValidator();
        var result = validator.TestValidate(new RejectBoutiqueCommand(Guid.NewGuid(), "   "));
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }

    [Fact]
    public void OverrideCommission_RejectsOutOfRange()
    {
        var validator = new OverrideCommissionCommandValidator();
        validator.TestValidate(new OverrideCommissionCommand(Guid.NewGuid(), 0.04m))
            .ShouldHaveValidationErrorFor(x => x.NewRate);
        validator.TestValidate(new OverrideCommissionCommand(Guid.NewGuid(), 0.35m))
            .ShouldHaveValidationErrorFor(x => x.NewRate);
    }

    [Fact]
    public void OverrideCommission_AcceptsValidRange()
    {
        var validator = new OverrideCommissionCommandValidator();
        validator.TestValidate(new OverrideCommissionCommand(Guid.NewGuid(), 0.12m))
            .ShouldNotHaveAnyValidationErrors();
        validator.TestValidate(new OverrideCommissionCommand(Guid.NewGuid(), 0.05m))
            .ShouldNotHaveAnyValidationErrors();
        validator.TestValidate(new OverrideCommissionCommand(Guid.NewGuid(), 0.30m))
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void AdminRefund_RequiresReason()
    {
        var validator = new AdminRefundCommandValidator();
        var result = validator.TestValidate(new AdminRefundCommand(Guid.NewGuid(), null, null, ""));
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }
}
