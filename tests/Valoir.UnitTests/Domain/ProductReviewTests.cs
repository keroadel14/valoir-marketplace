using FluentAssertions;
using Valoir.Domain.Entities;
using Valoir.Domain.Exceptions;
using Xunit;

namespace Valoir.UnitTests.Domain;

public class ProductReviewTests
{
    [Fact]
    public void Create_ValidReview_Succeeds()
    {
        var r = ProductReview.Create(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 5, "Excellent craftsmanship and packaging.");
        r.Rating.Should().Be(5);
        r.IsVisible.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void Create_InvalidRating_Throws(int rating)
    {
        var act = () => ProductReview.Create(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), rating, "Nice product here");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Create_ShortBody_Throws()
    {
        var act = () => ProductReview.Create(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 4, "ok");
        act.Should().Throw<DomainException>();
    }
}
