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
    public class ServiceTypeController : Controller
    {
        DepartmentsRepository departRepo = new DepartmentsRepository();
        ServiceTypeRepository serviceRepo = new ServiceTypeRepository();

        [HttpGet("dichvu")]
        public IActionResult Index()
        {
            ViewBag.Department = new SelectList(departRepo.GetAll().Where(x => x.IsDeleted == false), "Id", "Name");
            return View();
        }

        [HttpGet]
        public JsonResult GetAllservices(string keywword, int deId)
        {
            try
            {
                List<ServiceDTO> se = SQLHelper<ServiceDTO>.ProcedureToList("spGetService",
                  new string[] { "@FilterText", "@DepartmentId" }
                  , new object[] { keywword, deId });

                return Json(new { status = 1, se }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult onEditService(int id)
        {
            try
            {
                if (id > 0)
                {
                    ServiceType se = serviceRepo.GetByID(id);
                    return Json(new { status = 1, se }, new System.Text.Json.JsonSerializerOptions());
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

        public JsonResult onDeletedService(int id)
        {
            try
            {
                if (id > 0)
                {
                    ServiceType se = serviceRepo.GetByID(id);
                    se.IsDeleted = true;
                    serviceRepo.Update(se);
                    return Json(new { status = 1, message = "Đã xóa thông tin dịch vụ!" }, new System.Text.Json.JsonSerializerOptions());
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

        public JsonResult SaveInfor(int id, string seCode, string seName, decimal sePrice, string seDes, int seDepart)
        {
            {
                try
                {
                    if (id > 0)
                    {
                        ServiceType se = serviceRepo.GetByID(id);
                        se.Code = seCode;
                        se.Name = seName;
                        se.Price = sePrice;
                        se.Description = seDes;
                        se.DepartmentId = seDepart;
                        serviceRepo.Update(se);
                        return Json(new { status = 1, message = $"Dịch vụ {seCode} đã được sửa đổi!" }, new System.Text.Json.JsonSerializerOptions());
                    }
                    else
                    {
                        ServiceType se = new ServiceType();
                        se.Code = seCode;
                        se.Name = seName;
                        se.Price = sePrice;
                        se.Description = seDes;
                        se.DepartmentId = seDepart;
                        se.IsDeleted = false;
                        se.CreatedDate = DateTime.Now;
                        serviceRepo.Create(se);
                        return Json(new { status = 1, message = $"Dịch vụ {seCode} đã được thêm  mới!" }, new System.Text.Json.JsonSerializerOptions());
                    }

                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
            }
        }
    }
}

    
