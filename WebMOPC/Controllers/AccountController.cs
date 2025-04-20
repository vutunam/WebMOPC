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
        private UsersRepository _userRepo = new UsersRepository();
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
                if (isRole == 1 || isRole == 4)
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

        [HttpPost]
        public JsonResult ChangePass([FromBody] PassDTO p)
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int usID = TextUtils.ToInt(HttpContext.Session.GetInt32("userid"));
                string loginName = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
                string passWord = TextUtils.ToString(HttpContext.Session.GetString("passWord"));

                if (passWord != "" && p.oldPass != "")
                {
                    bool isSame = passWord.Equals(p.oldPass);
                    if (!isSame)
                    {
                        return Json(new { status = 0, message = "Mật khẩu cũ của bạn không chính xác. Vui lòng kiểm tra lại thông tin!" }, new System.Text.Json.JsonSerializerOptions());
                    }
                }

                if (p.newPass != "" && p.cfPass != "")
                {
                    bool isSame = p.newPass.Equals(p.cfPass);
                    if (!isSame)
                    {
                        return Json(new { status = 0, message = "Mật khẩu mới và mật khẩu xác nhận của bạn không giống nhau. Vui lòng kiểm tra lại!" }, new System.Text.Json.JsonSerializerOptions());
                    }
                }

                if (usID > 0)
                {
                    User u = _userRepo.GetByID(usID);
                    u.Password = p.newPass;
                    _userRepo.Update(u);
                }

                return Json(new { status = 1, message = "Đổi mật khẩu thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                return Json(new { status = 0, message = ex.Message });
            }

        }
    }
}
