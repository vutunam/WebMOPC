using EASendMail;
using WebMOPC.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebMOPC.Common
{
    public class EmailHelper
    {
        public static void SendEmail(SendEmailInfo info)
        {
            try
            {
                SmtpMail oMail = new SmtpMail("TryIt");
                oMail.From = "phongkhamthanglongdk@gmail.com";
                oMail.To = info.EmailTo;
                oMail.Subject = info.Subject.ToUpper();
                oMail.HtmlBody = info.Body;
                if (info.EmailCC.Count > 0 || info.EmailCC != null)
                {
                    foreach (var item in info.EmailCC)
                    {
                        oMail.Cc.Add(item);
                    }
                }
                SmtpServer oServer = new SmtpServer("smtp.gmail.com");
                oServer.User = "phongkhamthanglongdk@gmail.com";
                oServer.Password = "qgil tweg zdtq ifpt";

                // Set 587 port, if you want to use 25 port, please change 587 to 25
                oServer.Port = 587;
                oServer.ConnectType = SmtpConnectType.ConnectSSLAuto;
                SmtpClient oSmtp = new SmtpClient();
                oSmtp.SendMail(oServer, oMail);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
