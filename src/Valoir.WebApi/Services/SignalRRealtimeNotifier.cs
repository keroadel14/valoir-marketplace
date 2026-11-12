using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Valoir.Infrastructure.Services;
using Valoir.WebApi.Hubs;

namespace Valoir.WebApi.Services;

public class SignalRRealtimeNotifier : IRealtimeNotifier
{
    private readonly IHubContext<MarketplaceHub> _hub;

    public SignalRRealtimeNotifier(IHubContext<MarketplaceHub> hub) => _hub = hub;

    public Task PublishAsync(string eventName, string group, string payloadJson, CancellationToken ct = default)
    {
        object payload;
        try
        {
            payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);
        }
        catch
        {
            payload = payloadJson;
        }
        return _hub.Clients.Group(group).SendAsync(eventName, payload, ct);
    }
}
