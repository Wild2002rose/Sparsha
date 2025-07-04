namespace Sparsha_backend.Models
{
    public class SendNotificationDto
    {
            public string OwnerId { get; set; }
            public string Title { get; set; }
            public string Body { get; set; }
            public string? Type { get; set; }
            public Dictionary<string, string>? Data { get; set; }
        

    }
}
