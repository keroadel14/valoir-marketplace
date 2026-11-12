using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

public class SellerFollow : BaseEntity
{
    public Guid BuyerId { get; private set; }
    public Guid BoutiqueId { get; private set; }

    private SellerFollow() { }

    public static SellerFollow Create(Guid buyerId, Guid boutiqueId)
    {
        if (buyerId == Guid.Empty || boutiqueId == Guid.Empty)
            throw new DomainException("Buyer and boutique required.");
        return new SellerFollow { BuyerId = buyerId, BoutiqueId = boutiqueId };
    }
}
