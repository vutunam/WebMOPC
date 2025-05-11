using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;
using WebMOPC.Common;
using WebMOPC.Models;
using WebMOPC.Models.DTO;
using WebMOPC.Repository;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Microsoft.AspNetCore.Mvc.Rendering;
using NuGet.Protocol.Plugins;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using Newtonsoft.Json;

namespace WebMOPC.Controllers
{
    public class MedicalAppointmentController : Controller
    {
        MedicalAppointmentsRepository meRepo = new MedicalAppointmentsRepository();
        PatientsRepository paRepo = new PatientsRepository();
        BanksRepository baRepo = new BanksRepository();

        InvoicesRepository inRepo = new InvoicesRepository();
        InvoiceDetailsRepository indRepo = new InvoiceDetailsRepository();
        DiagnosesRepository diRepo = new DiagnosesRepository();

        UsersRepository uRepo = new UsersRepository();
        ServiceTypeRepository sRepo = new ServiceTypeRepository();
        DoctorsRepository docRepo = new DoctorsRepository();
        MedicationsRepository medicaRepo = new MedicationsRepository();

        PrescriptionsRepository pepRepo = new PrescriptionsRepository();

        [HttpGet("datlichkham")]
        public IActionResult Index()
        {
            ViewBag.service = new SelectList(sRepo.GetAll().Where(x => x.IsDeleted == false), "Id", "Name");
            var items = medicaRepo.GetAll()
                    .Where(x => x.IsDeleted == false)
                    .Select(x => new
                    {
                        Id = x.Id,
                        Display = x.Name + " - " + x.Unit
                    });

            ViewBag.Medica = new SelectList(items, "Id", "Display");
            ViewBag.doctor = new SelectList(docRepo.GetAll().Where(x => x.IsDeleted == false), "Id", "FullName");
            return View();
        }

        [HttpGet]
        public JsonResult CheckInforPatient()
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
                string loginName = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
                string passWord = TextUtils.ToString(HttpContext.Session.GetString("passWord"));
                string phone = "";
                if (isRole == 2)
                {
                    Patient pa = paRepo.GetByID(id);
                    if (pa.Id > 0)
                    {
                        if (string.IsNullOrWhiteSpace(pa.FullName) || string.IsNullOrWhiteSpace(pa.Phone)
                            || string.IsNullOrWhiteSpace(pa.Email) || string.IsNullOrWhiteSpace(pa.Address) || string.IsNullOrWhiteSpace(pa.Cccd)
                            )
                        {
                            return Json(new { status = 0, message = "Vui lòng cập nhật thông tin của bạn trước khi đặt lịch!" }, new System.Text.Json.JsonSerializerOptions());
                        }
                        phone = "0" + pa.Phone;
                    }
                }

                return Json(new { status = 1, phone }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult SaveAppoiment()
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
                if (isRole == 2)
                {
                    MedicalAppointment me = new MedicalAppointment();
                }

                return Json(new { status = 1 }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public JsonResult CreatQR()
        {
            try
            {
                Bank ba = baRepo.GetAll().Where(x => x.IsUsed == true).FirstOrDefault();
                if (ba == null)
                {
                    return Json(new { status = 0, message = "Ngân hàng thanh toán đang lỗi vui lòng báo với bệnh viện để đặt lịch!" }, new System.Text.Json.JsonSerializerOptions());
                }

                if (ba.Id > 0)
                {
                    string bin = ba.Bin;
                    string stk = ba.Stk;
                    return Json(new { status = 1, bin, stk }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    return Json(new { status = 0, message = "Lỗi tạo QR" }, new System.Text.Json.JsonSerializerOptions());
                }


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public JsonResult makeCalendar(string note, string bin)
        {
            try
            {
                Random random = new Random();
                int randomCode = random.Next(100000, 1000000);

                int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
                MedicalAppointment mea = new MedicalAppointment();
                mea.Note = note;
                mea.PatientId = id;
                mea.IsDeleted = false;
                mea.DiagnoseId = 0;
                mea.Status = 1;
                mea.IsDoned = false;
                mea.MedicalType = false;
                mea.CreatedDate = DateTime.Now;
                meRepo.Create(mea);

                Bank b = baRepo.GetAll().Where(x => x.Bin == bin).FirstOrDefault();

                Invoice inv = new Invoice();
                inv.Code = $"HD{random}";
                inv.Name = "Hóa đơn đặt cọc lịch khám";
                inv.Note = "Đã đặt cọc 50.000 VNĐ";
                inv.PaymentBankId = b.Id > 0 ? b.Id : 0;
                inv.PaymentType = 1; // chuyển khoản
                inv.IsDeleted = false;
                inv.Status = 1; // đã đặt cọc 
                inv.CreatedDate = DateTime.Now;
                inv.MedicalAppointmentId = mea.Id;
                inRepo.Create(inv);

                return Json(new { status = 1, message = "Đặt lịch thành công!" }, new System.Text.Json.JsonSerializerOptions());


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        // các hàm cho đặt lịch khám 
        [HttpGet]
        public JsonResult GetAllMedicalappointment()
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
                List<MedicalAppointmentDTO> me = SQLHelper<MedicalAppointmentDTO>.ProcedureToList("spGetMedicalAppoinment",
                  new string[] { }
                  , new object[] { });

                if (isRole == 2)
                {
                    me = me.Where(x => x.PatientID == id).ToList();
                }

                return Json(new { status = 1, me }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        [HttpGet]
        public JsonResult GetAllCalendar()
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
                List<MedicalAppointmentDTO> me = SQLHelper<MedicalAppointmentDTO>.ProcedureToList("spGetMedicalAppoinment",
                  new string[] { }
                  , new object[] { });

                if (isRole == 2)
                {
                    me = me.Where(x => x.PatientID == id && x.MedicalDateEnd.Year >= DateTime.Now.Year).ToList();
                }
                else {
                    me = me.Where(x => x.MedicalDateEnd.Year >= DateTime.Now.Year).ToList();
                }

                var events = me
                    .Select(x => new
                    {
                        end = x.MedicalDateEnd.ToString("yyyy-MM-ddTHH:mm:ss"),
                        start = x.MedicalDateStart.ToString("yyyy-MM-ddTHH:mm:ss"),
                        title = x.MedicalType == false ? "Khám: " + x.PatientName : "Tái khám: " + x.PatientName,

                    }).ToList();

                return Json(new { status = 1, events }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [HttpGet]
        public JsonResult addDiagnosis(int mid, int id, string name, int status, string description, string conclusion, string note)
        {
            try
            {
                Diagnosis di = id > 0 ? diRepo.GetByID(id) : new Diagnosis();
                di.Name = name;
                di.Status = status;
                di.Description = description;
                di.Conclusion = conclusion;
                di.Note = note;
                di.IsDeleted = false;
                var o = id > 0 ? diRepo.Update(di) : diRepo.Create(di);
                string message = id <= 0 ? "Thêm chuẩn đoán thành công!" : "Đã sửa chuẩn đoán";


                MedicalAppointment me = meRepo.GetByID(mid);
                me.DiagnoseId = di.Id;
                me.IsDoned = true;
                meRepo.Update(me);



                if (id <= 0)
                {
                    int usid = TextUtils.ToInt(HttpContext.Session.GetInt32("userid"));
                    User u = uRepo.GetByID(usid);
                    if (u != null)
                    {
                        string statusText = status switch
                        {
                            0 => "Chưa xử lý",
                            1 => "Đã xử lý",
                            2 => "Đang theo dõi",
                            _ => "Không xác định"
                        };

                        string body = $@"
                    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;"">
                        <!-- Header -->
                        <div style=""text-align: center; font-size: 18px; font-weight: bold; color: red;"">
                            [NO REPLY] - VUI LÒNG KHÔNG TRẢ LỜI EMAIL NÀY
                        </div>

                        <!-- Nội dung chính -->
                        <div style=""margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px;"">
                            <p> <b>{name}</b>,</p>
                            <p>Chúng tôi xin thông báo rằng bạn đã có kết quả chẩn đoán. Thông tin như sau:</p>

                            <table style=""width: 100%; border-collapse: collapse;"">
                                <tr>
                                    <td style=""padding: 8px; font-weight: bold;"">Trạng thái:</td>
                                    <td style=""padding: 8px;"">{statusText}</td>
                                </tr>
                                <tr>
                                    <td style=""padding: 8px; font-weight: bold;"">Mô tả:</td>
                                    <td style=""padding: 8px;"">{description}</td>
                                </tr>
                                <tr>
                                    <td style=""padding: 8px; font-weight: bold;"">Kết luận:</td>
                                    <td style=""padding: 8px;"">{conclusion}</td>
                                </tr>
                                <tr>
                                    <td style=""padding: 8px; font-weight: bold;"">Ghi chú:</td>
                                    <td style=""padding: 8px;"">{note}</td>
                                </tr>
                            </table>

                            <div style=""margin-top: 20px; text-align: center;"">
                                <p>Vui lòng đăng nhập hệ thống để kiểm tra và nhận giấy chuẩn đoán tại phòng khám.</p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style=""margin-top: 30px; text-align: center; font-size: 14px; color: gray;"">
                            <p>Trân trọng,</p>
                            <p>Phòng khám Thăng Long</p>
                        </div>
                    </div>";
                        SendEmailInfo e = new SendEmailInfo();
                        e.EmailCC = new List<string>();
                        e.EmployeeApproveID = 1;
                        e.Subject = "Thông báo chẩn đoán từ Phòng khám Thăng Long";
                        e.Body = body;
                        e.EmailTo = u.Email;
                        EmailHelper.SendEmail(e);
                    }

                }

                return Json(new { status = 1, message }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult getDiagnosis(int id)
        {
            try
            {
                Diagnosis di = diRepo.GetByID(id);

                return Json(new { status = 1, di }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult deleteCalendar(int id)
        {
            try
            {
                MedicalAppointment me = meRepo.GetByID(id);
                me.IsDeleted = true;
                meRepo.Update(me);

                return Json(new { status = 1, message = "Xóa lịch đặt thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [HttpGet]
        public JsonResult setCalendar(DateTime start, DateTime end, int id)
        {
            try
            {
                MedicalAppointment me = meRepo.GetByID(id);
                me.MedicalDateStart = start;
                me.MedicalDateEnd = end;
                meRepo.Update(me);

                Patient pa = paRepo.GetByID(TextUtils.ToInt(me.PatientId));
                User u = uRepo.GetByID(TextUtils.ToInt(pa.UserId));

                string body = $@"
                    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;"">
                        <!-- Header -->
                        <div style=""text-align: center; font-size: 18px; font-weight: bold; color: red;"">
                            [NO REPLY] - VUI LÒNG KHÔNG TRẢ LỜI EMAIL NÀY
                        </div>

                        <!-- Nội dung chính -->
                        <div style=""margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px;"">
                            <p><b>{pa.FullName}</b>,</p>
                            <p>Chúng tôi xin thông báo bạn có lịch khám bệnh với thông tin như sau:</p>

                            <table style=""width: 100%; border-collapse: collapse;"">
                                <tr>
                                    <td style=""padding: 8px; font-weight: bold;"">Thời gian khám bệnh từ:</td>
                                    <td style=""padding: 8px;"">{me.MedicalDateStart:dd/MM/yyyy HH:mm}</td>
                                </tr>
                                <tr>
                                    <td style=""padding: 8px; font-weight: bold;"">tới:</td>
                                    <td style=""padding: 8px;"">{me.MedicalDateEnd:dd/MM/yyyy HH:mm}</td>
                                </tr>
                            </table>

                            <div style=""margin-top: 20px; text-align: center;"">
                                <p>Vui lòng đến đúng giờ và mang theo các giấy tờ cần thiết.</p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style=""margin-top: 30px; text-align: center; font-size: 14px; color: gray;"">
                            <p>Trân trọng,</p>
                            <p>Phòng khám Thăng Long</p>
                        </div>
                    </div>";

                SendEmailInfo e = new SendEmailInfo();
                e.EmailCC = new List<string>();
                e.EmployeeApproveID = 1;
                e.Subject = "Thông lịch khám Phòng khám Thăng Long";
                e.Body = body;
                e.EmailTo = u.Email;
                EmailHelper.SendEmail(e);
                return Json(new { status = 1, message = "Đặt giờ thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult getInvoice(int invID, int ivID, int meID)
        {
            try
            {
                var invoi = SQLHelper<object>.ProcedureToDynamicLists("spGetinvs", new string[] { "@Invoice" }, new object[] { invID });
                var th = SQLHelper<object>.ProcedureToDynamicLists("spGetThuoc", new string[] { "@ivID" }, new object[] { ivID });


                List<dynamic> lsiv = [];
                List<dynamic> lsth = [];
                return Json(new { status = 1, lsiv, lsth }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [HttpGet]
        public JsonResult getPrice(int id)
        {
            try
            {
                ServiceType s = sRepo.GetByID(id);
                var doc = new SelectList(docRepo.GetAll().Where(x => x.IsDeleted == false && x.DepartmentId == s.DepartmentId), "Id", "FullName");
                decimal price = TextUtils.ToDecimal(s.Price);
                return Json(new { status = 1, price, doc }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult getPriceTh(int id)
        {
            try
            {
                Medication medi = medicaRepo.GetByID(id);
                decimal price = TextUtils.ToDecimal(medi.Price);
                int quantity = TextUtils.ToInt(medi.Quantity);
                return Json(new { status = 1, price, quantity }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult saveInvoidTb1(string dataSv, string invoiceName, string note, int indexTb, int medicalID)
        {
            try
            {
                if (indexTb == 0)
                {
                    List<ServiceViewModel> serviceList = JsonConvert.DeserializeObject<List<ServiceViewModel>>(dataSv);
                    Invoice i = new Invoice();
                    i.Code = Guid.NewGuid().ToString("N").Substring(0, 8);
                    i.Name = invoiceName;
                    i.CreatedDate = DateTime.Now;
                    i.IsDeleted = false;
                    i.Status = 2; //chưa thanh toán
                    i.Note = note;
                    i.MedicalAppointmentId = medicalID;
                    inRepo.Create(i);

                    foreach(var item in serviceList)
                    {
                        Doctor doc = docRepo.GetAll().Where(x => x.Id == TextUtils.ToInt(item.doctorId)).FirstOrDefault();

                        InvoiceDetail ide = new InvoiceDetail();
                        ide.InvoiceId = i.Id;
                        ide.ServiceTypeId = TextUtils.ToInt(item.id);
                        ide.Quantity = TextUtils.ToInt(item.Quantity);
                        ide.Price = TextUtils.ToDecimal(item.Price);
                        ide.DepartmentId = doc.DepartmentId;
                        ide.DoctorId = doc.Id;
                        indRepo.Create(ide);
                    }
                }
                else
                {
                    List<ServiceViewModel> serviceList = JsonConvert.DeserializeObject<List<ServiceViewModel>>(dataSv);
                    Invoice i = new Invoice();
                    i.Code = Guid.NewGuid().ToString("N").Substring(0, 8);
                    i.Name = invoiceName;
                    i.CreatedDate = DateTime.Now;
                    i.IsDeleted = false;
                    i.Status = 2; //chưa thanh toán
                    i.Note = note;
                    i.MedicalAppointmentId = medicalID;
                    inRepo.Create(i);

                    foreach (var item in serviceList)
                    {

                        Medication medic = medicaRepo.GetByID(TextUtils.ToInt(item.id));
                        int count = TextUtils.ToInt(medic.Quantity) - TextUtils.ToInt(item.Quantity);
                        if (count < 0)
                        {
                            Invoice inv = inRepo.GetByID(i.Id);
                            i.IsDeleted = true;
                            inRepo.Create(inv);
                            return Json(new { status = 0, message = $"Thuốc đã hết vui lòng kiểm tra lại!" }, new System.Text.Json.JsonSerializerOptions());
                        }
                        Prescription pep = new Prescription();
                        pep.InvoiceId = i.Id;
                        pep.MedicationId = TextUtils.ToInt(item.id);
                        pep.Quantity = TextUtils.ToInt(item.Quantity);
                        pep.CreatedDate = DateTime.Now;
                        pep.Price = TextUtils.ToDecimal(item.Price);
                        pepRepo.Create(pep);
                    }
                }
                return Json(new { status = 1, message = "Tạo hóa đơn thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}

public class ServiceViewModel
{
    public string id { get; set; }
    public string ServiceName { get; set; }
    public string doctorId { get; set; }
    public string doctorText { get; set; }
    public string Quantity { get; set; }
    public string Price { get; set; }
}