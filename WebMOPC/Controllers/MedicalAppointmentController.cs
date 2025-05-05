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
    public class MedicalAppointmentController : Controller
    {
        MedicalAppointmentsRepository meRepo = new MedicalAppointmentsRepository();
        PatientsRepository paRepo = new PatientsRepository();
        BanksRepository baRepo = new BanksRepository();
        [HttpGet("datlichkham")]
        public IActionResult Index()
        {
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
                if(isRole == 2)
                {
                    Patient pa = paRepo.GetByID(id);
                    if(pa.Id > 0)
                    {
                        if(string.IsNullOrWhiteSpace(pa.FullName) || string.IsNullOrWhiteSpace(pa.Phone)
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

                return Json(new { status = 1}, new System.Text.Json.JsonSerializerOptions());
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
                if(ba == null)
                {
                    return Json(new { status = 0, message = "Ngân hàng thanh toán đang lỗi vui lòng báo với bệnh viện để đặt lịch!" }, new System.Text.Json.JsonSerializerOptions());
                }

                if(ba.Id > 0)
                {
                    string bin = ba.Bin;
                    string stk = ba.Stk;
                    return Json(new { status = 1, bin, stk }, new System.Text.Json.JsonSerializerOptions());
                }
                else {
                    return Json(new { status = 0, message = "Lỗi tạo QR" }, new System.Text.Json.JsonSerializerOptions());
                }

                    
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public JsonResult makeCalendar(string note)
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

    }
}
