using BLWSDAI.Models;

namespace BLWSDAI.Services.Interfaces
{
    public interface INotificationService
    {
        Task NotifyAsync(Consumer consumer, string subject, string emailMessage, string smsMessage);
    }
}
