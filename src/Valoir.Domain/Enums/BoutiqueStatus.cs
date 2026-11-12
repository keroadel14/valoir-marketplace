namespace Valoir.Domain.Enums;

public enum BoutiqueStatus
{
    Pending = 0,
    Approved = 1,
    Suspended = 2,
    Rejected = 3
}

public enum OrderStatus
{
    PendingPayment = 0,
    Paid = 1,
    Processing = 2,
    Dispatched = 3,
    InTransit = 4,
    Delivered = 5,
    Cancelled = 6,
    Refunded = 7,
    PartiallyRefunded = 8
}

public enum VendorOrderStatus
{
    Pending = 0,
    Paid = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Refunded = 6
}

public enum LedgerTransactionType
{
    Sale = 0,
    Commission = 1,
    Shipping = 2,
    Refund = 3,
    Payout = 4,
    PayoutReversal = 5,
    StripeFee = 6,
    ManualAdjustment = 7
}

public enum DisputeStatus
{
    Open = 0,
    VendorReview = 1,
    EscalatedToAdmin = 2,
    ResolvedApproved = 3,
    ResolvedRejected = 4,
    Closed = 5
}

public enum UserAccountStatus
{
    Active = 0,
    Suspended = 1,
    Locked = 2
}
