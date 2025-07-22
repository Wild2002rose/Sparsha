using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Sparsha_backend.Models;

public class InvoiceDocument : IDocument
{
    private readonly Order _order;

    public InvoiceDocument(Order order)
    {
        _order = order;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Margin(30);
            page.Size(PageSizes.A4);
            page.DefaultTextStyle(x => x.FontSize(12));

            page.Header()
                .Text("Sparsha Invoice")
                .FontSize(20)
                .Bold()
                .FontColor(Colors.Blue.Medium);

            page.Content().Column(col =>
            {
                col.Spacing(10);
                col.Item().Text($"Order ID: {_order.OrderId}");
                col.Item().Text($"Date: {_order.OrderDate:dd-MM-yyyy}");
                col.Item().Text($"Buyer ID: {_order.UserId}");
                col.Item().Text($"Address: {_order.Address}");
                col.Item().Text($"Payment Method: {_order.PaymentMethod}");
                col.Item().LineHorizontal(1);

                col.Item().Text("Items:").Bold();
                foreach (var item in _order.OrderItems)
                {
                    col.Item().Text($"• {item.Item?.Name ?? "Item"} (Qty: {item.Quantity}) - ₹{item.Price}");
                }

                col.Item().LineHorizontal(1);
                col.Item().Text($"Total: ₹{_order.TotalPrice}").Bold();
            });

            page.Footer().AlignCenter().Text("Thanks for shopping with Sparsha! ❤️");
        });
    }
}
