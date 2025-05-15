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

namespace WebMOPC.Controllers
{
    public class PatientController : Controller
    {
        DoctorsRepository docRepo = new DoctorsRepository();
        DepartmentsRepository deRepo = new DepartmentsRepository();
        UsersRepository uRepo = new UsersRepository();
        PatientsRepository paRepo = new PatientsRepository();
        MedicalAppointmentsRepository meRepo = new MedicalAppointmentsRepository();
        [HttpGet("benhnhan")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetAllDoctor()
        {
            try
            {
                var doc0 = SQLHelper<object>.ProcedureToDynamicLists("spGetAllPatient", new string[] { }, new object[] { });
                var doc = doc0[0];
                return Json(new { status = 1, doc }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult onDeletedDoctor(int id)
        {
            try
            {
                Patient doc = paRepo.GetByID(id);
                doc.IsDeleted = true;
                paRepo.Update(doc);

                if(doc.UserId > 0)
                {
                    User u = uRepo.GetByID(id);
                    u.IsDeleted = true;
                    uRepo.Update(u);
                }
                return Json(new { status = 1, message = "Thông tin bệnh nhân đã được xóa!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult getDoctor(int id)
        {
            try
            {
                Patient doc = paRepo.GetByID(id);
                return Json(new { status = 1, doc }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [HttpGet]
        public JsonResult openAppointmentForm(int id, DateTime startTime, DateTime endTime, int status, string note)
        {
            try
            {
                Patient doc = paRepo.GetByID(id);
                string login = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
                MedicalAppointment me = new MedicalAppointment();
                me.MedicalDateStart = startTime;
                me.MedicalDateEnd = endTime;
                me.MedicalType = status ==0 ? false : true;
                me.Note = note;
                me.PatientId = id;
                me.IsDeleted = false;
                me.CreatedDate = DateTime.Now;
                me.CreatedBy = login;
                meRepo.Create(me);
                return Json(new { status = 1, message = "Tạo lịch khám thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        [HttpGet]
        public JsonResult SaveAccount(int id, string username, string email, string password)
        {
            try
            {
                User u = uRepo.GetAll().Where(x => x.LoginName == username || x.Email == email).FirstOrDefault();
                if (u != null)
                {
                    return Json(new { status = 0, message = u.LoginName == username ? "Tên đăng nhập đã tồn tại!" : "Email đã tồn tại!" }, new System.Text.Json.JsonSerializerOptions());
                }

                User us = new User();
                us.LoginName = username;
                us.Email = email;
                us.Password = password;
                us.IsDeleted = us.IsAdmin = false;
                us.Avatar = "~/img/user.png";
                uRepo.Create(us);

                Patient d = paRepo.GetByID(id);
                d.UserId = us.Id;
                paRepo.Update(d);

                return Json(new { status = 1, message = "Thêm tài khoản thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        [HttpPost]
        public JsonResult Save([FromBody] Patient d)
        {
            try
            {
                Patient doc;

                if (d.Id > 0)
                {
                    // Cập nhật
                    doc = paRepo.GetByID(d.Id);
                    if (doc == null)
                        return Json(new { status = 0, message = "Không tìm thấy bệnh nhân cần cập nhật." });

                    doc.Code = d.Code;
                    doc.FullName = d.FullName;
                    doc.DateOfBirth = d.DateOfBirth;
                    doc.Gender = d.Gender;
                    doc.Phone = d.Phone;
                    doc.Email = d.Email;
                    doc.Cccd = d.Cccd;
                    doc.Address = d.Address;
                    doc.HealthInsurance = d.HealthInsurance;
                    doc.CreatedDate = DateTime.Now;

                    paRepo.Update(doc);
                }
                else
                {
                    var checkdoc = paRepo.GetAll().Where(x => x.Code == d.Code);
                    if (checkdoc.Count() > 0)
                    {
                        return Json(new { status = 0, message = "Mã bệnh nhân đã tồn tại vui lòng kiểm tra lại!" });
                    }
                    doc = new Patient
                    {
                        Code = d.Code,
                        FullName = d.FullName,
                        DateOfBirth = d.DateOfBirth,
                        Gender = d.Gender,
                        Phone = d.Phone,
                        Email = d.Email,
                        Cccd = d.Cccd,
                        Address = d.Address,
                        HealthInsurance = d.HealthInsurance,
                        CreatedDate = DateTime.Now,
                        IsDeleted = false,
                        UserId = 0
                    };

                    paRepo.Create(doc);
                }

                return Json(new { status = 1, message = d.Id > 0 ? "Cập nhật thành công!" : "Lưu bệnh nhân thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { status = 0, message = ex.Message });
            }
        }
    }
}
