using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;
using WebMOPC.Common;
using WebMOPC.Models;
using WebMOPC.Models.DTO;
using WebMOPC.Repository;
using Microsoft.AspNetCore.Mvc;

namespace WebMOPC.Controllers
{
    public class AccountController : Controller
    {
        private StaffsRepository staffRepo = new StaffsRepository();
        private DoctorsRepository doctorRepo = new DoctorsRepository();
        private PatientsRepository patientRepo = new PatientsRepository();

        [HttpGet("AccountInfor")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetAll()
        {
            int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
            int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
            string loginName = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
            string passWord = TextUtils.ToString(HttpContext.Session.GetString("passWord"));
            try
            {
                if(isRole == 1 || isRole == 4)
                {
                    Staff s = staffRepo.GetByID(id);
                    return Json(new { status = 1, s, loginName, passWord }, new System.Text.Json.JsonSerializerOptions());
                }
                else if (isRole == 2)
                {
                    Patient s = patientRepo.GetByID(id);
                    return Json(new { status = 1, s, loginName, passWord }, new System.Text.Json.JsonSerializerOptions());
                }
                else if (isRole == 3)
                {
                    Doctor s = doctorRepo.GetByID(id);
                    return Json(new { status = 1, s, loginName, passWord }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    return Json(new { status = 2, message = "Lỗi tải dữ liệu!" }, new System.Text.Json.JsonSerializerOptions());
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
