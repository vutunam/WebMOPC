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
    public class AccManagerController : Controller
    {
        UsersRepository uRepo = new UsersRepository();
        [HttpGet("quanlytaikhoan")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetAllAcc()
        {
            try
            {
                var acc0 = SQLHelper<object>.ProcedureToDynamicLists("spGetAllAcc", new string[] { }, new object[] { });
                var acc = acc0[0];

                return Json(new { status = 1, acc }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult changeStatus(int id, bool status)
        {
            try
            {
                User u = uRepo.GetByID(id);
                u.IsDeleted = status;
                uRepo.Update(u);

                return Json(new { status = 1, message = status == true ? "Đã vô hiệu hóa!": "Đã kích hoạt!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult showPasswordPrompt(int id, string newPassword)
        {
            try
            {
                User u = uRepo.GetByID(id);
                u.Password = newPassword;
                uRepo.Update(u);

                return Json(new { status = 1, message = "Đổi mật khẩu thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult showChangeLoginInfoPrompt(int id, string loginName, string email)
        {
            try
            {
                User u = uRepo.GetAll().Where(x=> x.Id != id && (x.LoginName == loginName || x.Email == email)).FirstOrDefault();
                if(u!= null)
                {
                    return Json(new { status = 0, message = u.Email == email ? "Email đã tồn tại vui lòng kiểm tra lại!" :"Tên đăng nhập đã tồn tại vui lòng kiểm tra lại!" }, new System.Text.Json.JsonSerializerOptions());
                }

                User us = uRepo.GetByID(id);
                us.LoginName = loginName;
                u.Email = email;
                u.IsAdmin = false;
                uRepo.Update(us);

                return Json(new { status = 1, message = "Đổi thông tin thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
