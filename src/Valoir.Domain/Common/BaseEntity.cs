namespace Valoir.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }
    public byte[]? RowVersion { get; protected set; }

    public void Touch() => UpdatedAt = DateTime.UtcNow;
}

public interface ISoftDelete
{
    bool IsDeleted { get; }
    DateTime? DeletedAt { get; }
}

public interface IAuditable
{
    Guid? CreatedBy { get; }
    Guid? UpdatedBy { get; }
}
