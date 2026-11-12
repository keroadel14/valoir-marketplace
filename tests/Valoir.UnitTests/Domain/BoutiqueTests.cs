using FluentAssertions;
using Valoir.Domain.Entities;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;
using Xunit;

namespace Valoir.UnitTests.Domain;

public class BoutiqueTests
{
    [Fact]
    public void Create_SetsDefaultCommission_12Percent()
    {
        var b = Boutique.Create(Guid.NewGuid(), "Atelier Noir", "atelier-noir");
        b.CommissionRate.Should().Be(0.12m);
        b.Status.Should().Be(BoutiqueStatus.Pending);
    }

    [Fact]
    public void OverrideCommission_WithinRange_Succeeds()
    {
        var b = Boutique.Create(Guid.NewGuid(), "Maison", "maison");
        b.OverrideCommission(0.08m);
        b.CommissionRate.Should().Be(0.08m);
    }

    [Theory]
    [InlineData(0.04)]
    [InlineData(0.31)]
    public void OverrideCommission_OutOfRange_Throws(decimal rate)
    {
        var b = Boutique.Create(Guid.NewGuid(), "Maison", "maison");
        var act = () => b.OverrideCommission(rate);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Suspend_RequiresReason_AndSetsHold()
    {
        var b = Boutique.Create(Guid.NewGuid(), "Maison", "maison");
        b.Approve(Guid.NewGuid());
        b.Suspend("Counterfeit risk", Guid.NewGuid());
        b.Status.Should().Be(BoutiqueStatus.Suspended);
        b.PayoutHoldEnabled.Should().BeTrue();
    }

    [Fact]
    public void Suspend_WithoutReason_Throws()
    {
        var b = Boutique.Create(Guid.NewGuid(), "Maison", "maison");
        b.Approve(Guid.NewGuid());
        var act = () => b.Suspend("  ", Guid.NewGuid());
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void VendorOrder_CalculatesCommissionAndNet()
    {
        var orderId = Guid.NewGuid();
        var boutiqueId = Guid.NewGuid();
        var vo = VendorOrder.Create(orderId, boutiqueId, 0.12m, shippingFee: 25m);
        var item = OrderItem.Create(vo.Id, Guid.NewGuid(), 2, 500m, "Silk Scarf", "SKU-1");
        // Note: VendorOrder.Id is generated; we need to set item after knowing Id – use reflection-free approach
        // Recreate with known flow:
        vo = VendorOrder.Create(orderId, boutiqueId, 0.12m, 25m);
        // Manually add via public API
        var oi = OrderItem.Create(Guid.Empty, Guid.NewGuid(), 2, 500m, "Silk Scarf");
        vo.AddItem(oi);
        vo.Subtotal.Should().Be(1000m);
        vo.CommissionAmount.Should().Be(120m);
        vo.VendorNetPayout.Should().Be(1000m - 120m + 25m);
    }

    [Fact]
    public void ProductVariant_Reserve_PreventsOversell()
    {
        var v = ProductVariant.Create(Guid.NewGuid(), "SKU-A", stock: 3);
        v.Reserve(2);
        v.AvailableQuantity.Should().Be(1);
        var act = () => v.Reserve(2);
        act.Should().Throw<DomainException>();
    }
}
