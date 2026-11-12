using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Valoir.WebApi.Hubs;

/// <summary>
/// Real-time hub for vendor order alerts and admin notifications.
/// Group "admin" is restricted to Admin/SuperAdmin roles.
/// </summary>
[Authorize]
public class MarketplaceHub : Hub
{
    public const string AdminGroup = "admin";
    public const string VendorGroupPrefix = "vendor:";

    public override async Task OnConnectedAsync()
    {
        var user = Context.User;
        if (user?.IsInRole("SuperAdmin") == true || user?.IsInRole("Admin") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup);
        }

        // Vendors join their own boutique group via store_id claim
        var storeId = user?.FindFirst("store_id")?.Value;
        if (!string.IsNullOrEmpty(storeId) && user?.IsInRole("Vendor") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, VendorGroupPrefix + storeId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, AdminGroup);
        var storeId = Context.User?.FindFirst("store_id")?.Value;
        if (!string.IsNullOrEmpty(storeId))
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, VendorGroupPrefix + storeId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>Explicit join – still enforces role check server-side.</summary>
    public async Task JoinAdminGroup()
    {
        var user = Context.User;
        if (user?.IsInRole("SuperAdmin") != true && user?.IsInRole("Admin") != true)
            throw new HubException("Forbidden: admin role required.");
        await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup);
    }
}

public static class MarketplaceHubNotifications
{
    public static Task NotifyAdminsNewDispute(IHubContext<MarketplaceHub> hub, object payload)
        => hub.Clients.Group(MarketplaceHub.AdminGroup).SendAsync("ReceiveDisputeNotification", payload);

    public static Task NotifyAdminsBoutiqueStatus(IHubContext<MarketplaceHub> hub, object payload)
        => hub.Clients.Group(MarketplaceHub.AdminGroup).SendAsync("ReceiveBoutiqueStatusChanged", payload);

    public static Task NotifyAdminsRefund(IHubContext<MarketplaceHub> hub, object payload)
        => hub.Clients.Group(MarketplaceHub.AdminGroup).SendAsync("ReceiveRefundNotification", payload);

    public static Task NotifyVendorNewOrder(IHubContext<MarketplaceHub> hub, Guid boutiqueId, object payload)
        => hub.Clients.Group(MarketplaceHub.VendorGroupPrefix + boutiqueId).SendAsync("ReceiveNewOrderNotification", payload);
}
