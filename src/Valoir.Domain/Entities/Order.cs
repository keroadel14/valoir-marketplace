using Valoir.Domain.Common;
using Valoir.Domain.Enums;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

/// <summary>
/// Parent order created at checkout. Split into VendorOrders (one per boutique).
/// </summary>
public class Order : BaseEntity
{
    public string OrderNumber { get; private set; } = null!;
    public Guid BuyerId { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal ShippingAmount { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.PendingPayment;
    public string? StripePaymentIntentId { get; private set; }
    public DateTime? ExpiresAt { get; private set; } // 10-min inventory hold window
    public DateTime? PaidAt { get; private set; }

    private readonly List<VendorOrder> _vendorOrders = new();
    public IReadOnlyCollection<VendorOrder> VendorOrders => _vendorOrders.AsReadOnly();

    private Order() { }

    public static Order Create(Guid buyerId, decimal shippingAmount, TimeSpan holdDuration)
    {
        if (buyerId == Guid.Empty) throw new DomainException("Buyer is required.");
        var order = new Order
        {
            BuyerId = buyerId,
            OrderNumber = GenerateOrderNumber(),
            ShippingAmount = shippingAmount,
            Status = OrderStatus.PendingPayment,
            ExpiresAt = DateTime.UtcNow.Add(holdDuration)
        };
        return order;
    }

    private static string GenerateOrderNumber()
        => $"VL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

    public void AddVendorOrder(VendorOrder vo)
    {
        _vendorOrders.Add(vo);
        RecalculateTotal();
    }

    private void RecalculateTotal()
    {
        TotalAmount = _vendorOrders.Sum(v => v.Subtotal + v.ShippingFee) + ShippingAmount;
        // Note: platform shipping may be aggregated; vendor shipping is per VendorOrder
        Touch();
    }

    public void AttachPaymentIntent(string paymentIntentId)
    {
        if (string.IsNullOrWhiteSpace(paymentIntentId)) throw new DomainException("PaymentIntent id required.");
        StripePaymentIntentId = paymentIntentId;
        Touch();
    }

    public void MarkPaid()
    {
        if (Status != OrderStatus.PendingPayment)
            throw new DomainException($"Cannot mark order as paid from status {Status}.");
        Status = OrderStatus.Paid;
        PaidAt = DateTime.UtcNow;
        foreach (var vo in _vendorOrders)
            vo.MarkPaid();
        Touch();
    }

    public void MarkFailedOrCancelled()
    {
        if (Status == OrderStatus.Paid || Status == OrderStatus.Refunded)
            throw new DomainException("Cannot cancel a paid or already refunded order via this path.");
        Status = OrderStatus.Cancelled;
        foreach (var vo in _vendorOrders)
            vo.MarkCancelled();
        Touch();
    }

    public void MarkPartiallyRefunded()
    {
        Status = OrderStatus.PartiallyRefunded;
        Touch();
    }

    public void MarkRefunded()
    {
        Status = OrderStatus.Refunded;
        Touch();
    }

    /// <summary>Sets total when VendorOrders were persisted via DbSet rather than aggregate AddVendorOrder.</summary>
    public void SetComputedTotal(decimal merchandisePlusVendorShipping, decimal platformShipping)
    {
        if (merchandisePlusVendorShipping < 0 || platformShipping < 0)
            throw new DomainException("Amounts cannot be negative.");
        TotalAmount = merchandisePlusVendorShipping + platformShipping;
        Touch();
    }
}

/// <summary>
/// Per-boutique sub-order. Contains commission snapshot and payout amount.
/// </summary>
public class VendorOrder : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid BoutiqueId { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal CommissionRateSnapshot { get; private set; }
    public decimal CommissionAmount { get; private set; }
    public decimal VendorNetPayout { get; private set; }
    public decimal ShippingFee { get; private set; }
    public VendorOrderStatus Status { get; private set; } = VendorOrderStatus.Pending;
    public string? TrackingNumber { get; private set; }
    public string? Carrier { get; private set; }
    public string? StripeTransferId { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private VendorOrder() { }

    public static VendorOrder Create(
        Guid orderId,
        Guid boutiqueId,
        decimal commissionRate,
        decimal shippingFee)
    {
        if (commissionRate < 0 || commissionRate > 1)
            throw new DomainException("Invalid commission rate snapshot.");

        return new VendorOrder
        {
            OrderId = orderId,
            BoutiqueId = boutiqueId,
            CommissionRateSnapshot = commissionRate,
            ShippingFee = shippingFee,
            Status = VendorOrderStatus.Pending
        };
    }

    public void AddItem(OrderItem item)
    {
        _items.Add(item);
        Subtotal = _items.Sum(i => i.LineTotal);
        CommissionAmount = Math.Round(Subtotal * CommissionRateSnapshot, 2, MidpointRounding.AwayFromZero);
        VendorNetPayout = Subtotal - CommissionAmount + ShippingFee;
        Touch();
    }

    public void MarkPaid()
    {
        Status = VendorOrderStatus.Paid;
        Touch();
    }

    public void MarkCancelled()
    {
        Status = VendorOrderStatus.Cancelled;
        Touch();
    }

    public void MarkProcessing()
    {
        if (Status != VendorOrderStatus.Paid)
            throw new DomainException($"Cannot start processing from status {Status}.");
        Status = VendorOrderStatus.Processing;
        Touch();
    }

    public void MarkShipped(string trackingNumber, string carrier)
    {
        if (Status is not (VendorOrderStatus.Paid or VendorOrderStatus.Processing))
            throw new DomainException($"Cannot ship from status {Status}.");
        if (string.IsNullOrWhiteSpace(trackingNumber)) throw new DomainException("Tracking number required.");
        TrackingNumber = trackingNumber.Trim();
        Carrier = carrier?.Trim();
        Status = VendorOrderStatus.Shipped;
        Touch();
    }

    public void MarkDelivered()
    {
        if (Status != VendorOrderStatus.Shipped)
            throw new DomainException($"Cannot mark delivered from status {Status}.");
        Status = VendorOrderStatus.Delivered;
        Touch();
    }

    public void AttachTransfer(string transferId)
    {
        StripeTransferId = transferId;
        Touch();
    }

    public void MarkRefunded()
    {
        Status = VendorOrderStatus.Refunded;
        Touch();
    }
}

public class OrderItem : BaseEntity
{
    public Guid VendorOrderId { get; private set; }
    public Guid VariantId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPriceSnapshot { get; private set; }
    public string ProductTitleSnapshot { get; private set; } = null!;
    public string? SkuSnapshot { get; private set; }

    public decimal LineTotal => UnitPriceSnapshot * Quantity;

    private OrderItem() { }

    public static OrderItem Create(
        Guid vendorOrderId,
        Guid variantId,
        int quantity,
        decimal unitPrice,
        string productTitle,
        string? sku = null)
    {
        if (quantity <= 0) throw new DomainException("Quantity must be positive.");
        if (unitPrice < 0) throw new DomainException("Unit price cannot be negative.");

        return new OrderItem
        {
            VendorOrderId = vendorOrderId,
            VariantId = variantId,
            Quantity = quantity,
            UnitPriceSnapshot = unitPrice,
            ProductTitleSnapshot = productTitle,
            SkuSnapshot = sku
        };
    }
}
