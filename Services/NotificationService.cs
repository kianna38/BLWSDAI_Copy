using BLWSDAI.Models;
using BLWSDAI.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

public class NotificationService : INotificationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public NotificationService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task NotifyAsync(Consumer consumer, string subject, string emailMessage, string smsMessage)
    {
        Console.WriteLine($"Sending notification: {consumer.FirstName} {consumer.LastName} preference: {consumer.NotifPreference}");

        switch (consumer.NotifPreference)
        {
            case NotifPrefEnum.SMS:
                await SendSmsAsync(consumer.PhoneNumber, smsMessage);
                break;

            case NotifPrefEnum.Email:
                await SendEmailAsync(consumer.Email, subject, emailMessage);
                break;

            case NotifPrefEnum.SMS_and_Email:
                await Task.WhenAll(
                    SendSmsAsync(consumer.PhoneNumber, smsMessage),
                    SendEmailAsync(consumer.Email, subject, emailMessage)
                );
                break;

            case NotifPrefEnum.None:
            default:
                break;
        }
    }


    private async Task SendSmsAsync(string phoneNumber, string message)
    {
        var apiKey = _config["Semaphore:ApiKey"];
        var senderName = _config["Semaphore:SenderName"];

        var payload = new Dictionary<string, string>
    {
        { "apikey", apiKey },
        { "number", phoneNumber },
        { "message", message },
        { "sendername", senderName }
    };

        var client = _httpClientFactory.CreateClient();
        var content = new FormUrlEncodedContent(payload); //  Semaphore expects x-www-form-urlencoded

        try
        {
            var response = await client.PostAsync("https://api.semaphore.co/api/v4/messages", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($" SMS sent to {phoneNumber}. Semaphore response: {responseContent}");
            }
            else
            {
                Console.WriteLine($" SMS failed to {phoneNumber}. Status: {response.StatusCode}. Response: {responseContent}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($" Exception sending SMS to {phoneNumber}: {ex.Message}");
        }
    }




    private async Task SendEmailAsync(string recipientEmail, string subject, string message)
    {
        var orgEmail = _config["Email:Gmail"];
        var orgPassword = _config["Email:AppPassword"];

        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(orgEmail));
        email.To.Add(MailboxAddress.Parse(recipientEmail));
        email.Subject = subject;

        email.Body = new TextPart("plain")
        {
            Text = message
        };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync("smtp.gmail.com", 587, false);
        await smtp.AuthenticateAsync(orgEmail, orgPassword);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}
