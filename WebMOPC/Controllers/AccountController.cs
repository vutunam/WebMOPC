using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;
using WebMOPC.Common;
using WebMOPC.Models;
using WebMOPC.Models.DTO;
using WebMOPC.Repository;
using Microsoft.AspNetCore.Mvc;
using System.IO;

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

        public JsonResult UploadFile(string img)
        {
            string fileName = Path.GetFileName(img);
            int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
            int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
            int usId = TextUtils.ToInt(HttpContext.Session.GetInt32("userid"));
            string loginName = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
            string passWord = TextUtils.ToString(HttpContext.Session.GetString("passWord"));

            User u = _userRepo.GetByID(usId);
            u.Avatar = $"~/img/{fileName}";
            _userRepo.Update(u);

            string linkImg = $"/img/{fileName}";
            HttpContext.Session.SetString("img", TextUtils.ToString(u.Avatar));

            return Json(new { status = 1, message = "Tải ảnh thành công!", linkImg }, new System.Text.Json.JsonSerializerOptions());
        }

        [HttpPost]
        


        //public JsonResult UploadFile(string filePath)
        //{
        //    try
        //    {
        //        int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
        //        int usID = TextUtils.ToInt(HttpContext.Session.GetInt32("userid"));
        //        string loginName = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
        //        string passWord = TextUtils.ToString(HttpContext.Session.GetString("passWord"));
        //        string fileName = System.IO.Path.GetFileName(filePath);

        //        User u = _userRepo.GetByID(usID);
        //        if(u != null)
        //        {
        //            u.Avatar = $"~/img/{fileName}";
        //            _userRepo.Update(u);
        //        }

        //        HttpContext.Session.SetString("img", TextUtils.ToString($"~/img/{fileName}"));

        //        return Json(new { status = 1, message = "Đổi mật khẩu thành công!" }, new System.Text.Json.JsonSerializerOptions());
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { status = 0, message = ex.Message });
        //    }
        //}

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

        public JsonResult ChangeInfor([FromBody] InforUserDTO info)
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int ID = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));
                int usID = TextUtils.ToInt(HttpContext.Session.GetInt32("userid"));
                string loginName = TextUtils.ToString(HttpContext.Session.GetString("loginName"));
                string passWord = TextUtils.ToString(HttpContext.Session.GetString("passWord"));

                if(isRole == 1 || isRole == 4 || isRole == 3) // nhân viên / admin
                {
                    if(info.Education == "")
                    {
                        return Json(new { status = 0, message = "Vui lòng nhập thông tin học vấn!" }, new System.Text.Json.JsonSerializerOptions());
                    }
                    if (info.Description == "")
                    {
                        return Json(new { status = 0, message = "Vui lòng nhập mô tả!" }, new System.Text.Json.JsonSerializerOptions());
                    }
                }

                if (isRole == 2) // bệnh nhân
                {
                    if (info.HealthInsurance == 0)
                    {
                        return Json(new { status = 0, message = "Vui lòng nhập thông tin học vấn!" }, new System.Text.Json.JsonSerializerOptions());
                    }
                }

                if (isRole == 1 || isRole == 4) // nhân viên / admin
                {
                    User u = _userRepo.GetByID(usID);
                    u.LoginName = info.LoginName;
                    _userRepo.Update(u);

                    Staff p = staffRepo.GetByID(ID);
                    p.FullName = info.FullName;
                    p.Email = info.Email;
                    p.Address = info.Address;
                    p.Phone = info.Phone;
                    p.DateOfBirth = info.DateOfBirth;
                    p.Gender = info.Gender;
                    p.Education = info.Education;
                    p.Cccd = info.Cccd;
                    p.Description = info.Description;
                    staffRepo.Update(p);
                }

                if (isRole == 3) // bác sĩ
                {
                    User u = _userRepo.GetByID(usID);
                    u.LoginName = info.LoginName;
                    _userRepo.Update(u);

                    Doctor p = doctorRepo.GetByID(ID);
                    p.FullName = info.FullName;
                    p.Email = info.Email;
                    p.Address = info.Address;
                    p.Phone = info.Phone;
                    p.DateOfBirth = info.DateOfBirth;
                    p.Gender = info.Gender;
                    p.Education = info.Education;
                    p.Cccd = info.Cccd;
                    p.Description = info.Description;
                    doctorRepo.Update(p);
                }

                if (isRole == 3) // bệnh nhân
                {
                    User u = _userRepo.GetByID(usID);
                    u.LoginName = info.LoginName;
                    _userRepo.Update(u);

                    Patient p = patientRepo.GetByID(ID);
                    p.FullName = info.FullName;
                    p.Email = info.Email;
                    p.Address = info.Address;
                    p.Phone = info.Phone;
                    p.DateOfBirth = info.DateOfBirth;
                    p.Gender = info.Gender;
                    p.Cccd = info.Cccd;
                    p.HealthInsurance = info.HealthInsurance;
                    patientRepo.Update(p);
                }
                return Json(new { status = 1, message = "Đổi thông tin thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                return Json(new { status = 0, message = ex.Message });
            }
        }
    }
}
