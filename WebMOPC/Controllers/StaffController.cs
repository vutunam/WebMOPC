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
    public class StaffController : Controller
    {
        DoctorsRepository docRepo = new DoctorsRepository();
        DepartmentsRepository deRepo = new DepartmentsRepository();
        UsersRepository uRepo = new UsersRepository();
        StaffsRepository staffRepo = new StaffsRepository();
        PositionsRepository posiRepo = new PositionsRepository();

        [HttpGet("nhanvien")]
        public IActionResult Index()
        {
            ViewBag.department = new SelectList(deRepo.GetAll().Where(x => x.IsDeleted == false), "Id", "Name");
            ViewBag.Position = new SelectList(posiRepo.GetAll().Where(x => x.IsDeleted == false), "Id", "Name");
            return View();
        }

        [HttpGet]
        public JsonResult GetAllDoctor()
        {
            try
            {
                var doc0 = SQLHelper<object>.ProcedureToDynamicLists("spGetAllStaff", new string[] { }, new object[] { });
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
                Staff doc = staffRepo.GetByID(id);
                doc.IsDeleted = true;
                staffRepo.Update(doc);

                if (doc.UserId > 0)
                {
                    User u = uRepo.GetByID(id);
                    u.IsDeleted = true;
                    uRepo.Update(u);
                }
                return Json(new { status = 1, message = "Thông tin nhân viên đã được xóa!" }, new System.Text.Json.JsonSerializerOptions());
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
                Staff doc = staffRepo.GetByID(id);
                return Json(new { status = 1, doc }, new System.Text.Json.JsonSerializerOptions());
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

                Staff d = staffRepo.GetByID(id);
                d.UserId = us.Id;
                staffRepo.Update(d);

                return Json(new { status = 1, message = "Thêm tài khoản thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        [HttpPost]
        public JsonResult Save([FromBody] Staff d)
        {
            try
            {
                Staff doc;

                if (d.Id > 0)
                {
                    // Cập nhật
                    doc = staffRepo.GetByID(d.Id);
                    if (doc == null)
                        return Json(new { status = 0, message = "Không tìm thấy nhân viên cần cập nhật." });

                    doc.Code = d.Code;
                    doc.FullName = d.FullName;
                    doc.DateOfBirth = d.DateOfBirth;
                    doc.Gender = d.Gender;
                    doc.Phone = d.Phone;
                    doc.Email = d.Email;
                    doc.Cccd = d.Cccd;
                    doc.PositionId = d.PositionId;
                    doc.Address = d.Address;
                    doc.DepartmentId = d.DepartmentId;
                    doc.Education = d.Education;
                    doc.Description = d.Description;
                    doc.CreatedDate = DateTime.Now;

                    staffRepo.Update(doc);
                }
                else
                {
                    var checkdoc = staffRepo.GetAll().Where(x => x.Code == d.Code);
                    if (checkdoc.Count() > 0)
                    {
                        return Json(new { status = 0, message = "Mã nhân viên đã tồn tại vui lòng kiểm tra lại!" });
                    }
                    doc = new Staff
                    {
                        Code = d.Code,
                        FullName = d.FullName,
                        DateOfBirth = d.DateOfBirth,
                        Gender = d.Gender,
                        Phone = d.Phone,
                        Email = d.Email,
                        Cccd = d.Cccd,
                        PositionId = d.PositionId,
                        Address = d.Address,
                        DepartmentId = d.DepartmentId,
                        Education = d.Education,
                        Description = d.Description,
                        CreatedDate = DateTime.Now,
                        IsDeleted = false,
                        UserId = 0
                    };

                    staffRepo.Create(doc);
                }

                return Json(new { status = 1, message = d.Id > 0 ? "Cập nhật thành công!" : "Lưu nhân viên thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { status = 0, message = ex.Message });
            }
        }
    }
}
