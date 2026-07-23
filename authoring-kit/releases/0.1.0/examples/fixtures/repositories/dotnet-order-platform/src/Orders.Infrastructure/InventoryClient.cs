namespace Orders.Infrastructure;

public sealed class InventoryClient(HttpClient httpClient)
{
    public Task<HttpResponseMessage> ReserveAsync(string sku, CancellationToken cancellationToken)
    {
        return httpClient.PostAsync($"inventory/{sku}/reservations", null, cancellationToken);
    }
}
