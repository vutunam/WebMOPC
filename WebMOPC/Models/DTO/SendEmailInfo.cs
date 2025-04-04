using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebMOPC.Models.DTO
{
	public class SendEmailInfo
	{
		public int EmployeeApproveID { get; set; }
		public string Subject { get; set; }
		public string Body { get; set; }
		public string EmailTo { get; set; }
		public List<string> EmailCC { get; set; }
		public string Table { get; set; }

	}
}