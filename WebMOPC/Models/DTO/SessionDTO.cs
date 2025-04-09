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
		public string Name { get; set; }
		public string Position { get; set; }
		public string Avatar { get; set; }
		public bool IsAdmin { get; set; }
		public bool IsStaff { get; set; }
		public bool IsPatient { get; set; }
		public bool IsDoctor { get; set; }
	}
}
