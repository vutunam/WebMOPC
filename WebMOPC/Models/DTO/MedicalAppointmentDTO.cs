namespace WebMOPC.Models.DTO
{
    public class MedicalAppointmentDTO
    {
        public int ID { get; set; }
        public DateTime MedicalDateStart { get; set; }
        public string Note { get; set; }
        public int PatientID { get; set; }
        public bool IsDeleted { get; set; }
        public int Status { get; set; }
        public int DiagnoseID { get; set; }
        public DateTime MedicalDateEnd { get; set; }
        public bool MedicalType { get; set; }
        public DateTime CreatedDate { get; set; }
        public string PatientName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public bool IsDoned { get; set; }
        public int PaymentType { get; set; }
        public string Phone { get; set; }
        public int InvoiceID { get; set; }
        public int InvoiceStatus { get; set; }
        public int BankID { get; set; }
    }
}
