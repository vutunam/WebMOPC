using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebMOPC.Models.DTO
{
	public class SessionDTO
	{
		public int ID { get; set; }
		public int DoctorID { get; set; }
		public int StaffID { get; set; }
		public int PatientID { get; set; }
		public string LoginName { get; set; }
		public string FullName { get; set; }
		public List<UserPermission> lsRole { get; set; }
	}
}
