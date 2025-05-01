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
    public class DepartmentController : Controller
    {
        DepartmentsRepository departmentRepo = new DepartmentsRepository();
        DoctorsRepository doctorRepo = new DoctorsRepository();
        StaffsRepository staffRepo = new StaffsRepository();
        [HttpGet("phongkham")]
        public IActionResult Index()
        {
            ViewBag.Doctor = new SelectList(doctorRepo.GetAll().Where(x => x.IsDeleted == false), "Id", "FullName");
            return View();
        }

        [HttpGet]
        public JsonResult GetAllDepartments(string keywword)
        {
            try
            {
                List<DepartmentDTO> departments = SQLHelper<DepartmentDTO>.ProcedureToList("spGetDepartment",
                  new string[] { "@FilterText" }
                  , new object[] { keywword });

                return Json(new { status = 0, departments }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult onDeletedDepartment(int id)
        {
            try
            {
                if (id > 0)
                {
                    Department de = departmentRepo.GetByID(id);
                    de.IsDeleted = true;
                    departmentRepo.Update(de);
                    return Json(new { status = 1, message = "Đã xóa thông tin phòng khám!" }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    return Json(new { status = 0, message = "Lỗi xóa thông tin!" }, new System.Text.Json.JsonSerializerOptions());
                }
                    
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult onEditDepartment(int id)
        {
            try
            {
                if (id > 0)
                {
                    Department de = departmentRepo.GetByID(id);
                    return Json(new { status = 1, de }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    return Json(new { status = 0, message = "Lỗi lấy thông tin!" }, new System.Text.Json.JsonSerializerOptions());
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult SaveInfor(int id, string deCode, string deName, string deAddress, int deHeadId, DateTime deCreatedDate)
        {
            try
            {
                if (id > 0)
                {



                    Department de = departmentRepo.GetByID(id);
                    de.Code = deCode;
                    de.Name = deName;
                    de.HeadId = deHeadId;
                    de.Address = deAddress;
                    de.CreatedDate = deCreatedDate;
                    departmentRepo.Update(de);
                    return Json(new { status = 1, message = $"Phòng khám {deCode} đã được sửa đổi!" }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    Department deCheck = departmentRepo.GetAll().Where(x => x.Code == deCode).FirstOrDefault();
                    if (deCheck != null)
                    {
                        return Json(new { status = 0, message = $"Phòng khám mã {deCode} đã tồn tại. Vui lòng kiểm tra lại!" }, new System.Text.Json.JsonSerializerOptions());
                    }

                    Department de = new Department();
                    de.Code = deCode;
                    de.Name = deName;
                    de.HeadId = deHeadId;
                    de.Address = deAddress;
                    de.CreatedDate = deCreatedDate;
                    de.IsDeleted = false;
                    departmentRepo.Create(de);
                    return Json(new { status = 1, message = $"Phòng khám {deCode} đã được thêm  mới!" }, new System.Text.Json.JsonSerializerOptions());
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
