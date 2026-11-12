using Valoir.Domain.Common;
using Valoir.Domain.Exceptions;

namespace Valoir.Domain.Entities;

public class UserNotification : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = null!;
    public string Title { get; private set; } = null!;
    public string Message { get; private set; } = null!;
    public string? LinkUrl { get; private set; }
    public bool IsRead { get; private set; }

    private UserNotification() { }

    public static UserNotification Create(Guid userId, string type, string title, string message, string? linkUrl = null)
    {
        if (userId == Guid.Empty) throw new DomainException("User required.");
        if (string.IsNullOrWhiteSpace(title)) throw new DomainException("Title required.");
        return new UserNotification
        {
            UserId = userId,
            Type = type.Trim(),
            Title = title.Trim(),
            Message = message.Trim(),
            LinkUrl = linkUrl,
            IsRead = false
        };
    }

    public void MarkRead() { IsRead = true; Touch(); }
}
