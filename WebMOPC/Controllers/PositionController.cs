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
    public class PositionController : Controller
    {
        PositionsRepository posiRepo = new PositionsRepository();
        StaffsRepository staffRepo = new StaffsRepository();
        [HttpGet("chucvu")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetAllPositions(string keywword)
        {
            try
            {
                List<Position> po = SQLHelper<Position>.ProcedureToList("spGetPosition",
                  new string[] { "@FilterText" }
                  , new object[] { keywword });

                return Json(new { status = 0, po }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult onEditPosition(int id)
        {
            try
            {
                if (id > 0)
                {
                    Position po = posiRepo.GetByID(id);
                    return Json(new { status = 1, po }, new System.Text.Json.JsonSerializerOptions());
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

        public JsonResult onDeletedPosition(int id)
        {
            try
            {
                if (id > 0)
                {
                    var staffcCheck = staffRepo.GetAll().Where(x => x.PositionId == id).FirstOrDefault();
                    if (staffcCheck != null )
                    {
                        return Json(new { status = 0, message = $"Chức vụ bạn chọn đang được dử dụng. Vui lòng kiểm tra trước khi xóa!" }, new System.Text.Json.JsonSerializerOptions());
                    }

                    Position po = posiRepo.GetByID(id);
                    po.IsDeleted = true;
                    posiRepo.Update(po);
                    return Json(new { status = 1, message = "Đã xóa thông tin chức vụ!" }, new System.Text.Json.JsonSerializerOptions());
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

        public JsonResult SaveInfor(int id, string poCode, string poName, string poDescription)
        {
            try
            {
                if (id > 0)
                {


                    Position po = posiRepo.GetByID(id);
                    po.Code = poCode;
                    po.Name = poName;
                    po.Description = poDescription;
                    po.CreatedDate = DateTime.Now;
                    posiRepo.Update(po);
                    return Json(new { status = 1, message = $"Chức vụ {poCode} đã được sửa đổi!" }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    Position dpoCheck = posiRepo.GetAll().Where(x => x.Code == poCode).FirstOrDefault();
                    if (dpoCheck != null)
                    {
                        return Json(new { status = 0, message = $"Chức vụ mã {poCode} đã tồn tại. Vui lòng kiểm tra lại!" }, new System.Text.Json.JsonSerializerOptions());
                    }

                    Position po = new Position();
                    po.Code = poCode;
                    po.Name = poName;
                    po.Description = poDescription;
                    po.CreatedDate = DateTime.Now;
                    po.IsDeleted = false;
                    posiRepo.Create(po);
                    return Json(new { status = 1, message = $"Chức vụ {poCode} đã được thêm  mới!" }, new System.Text.Json.JsonSerializerOptions());
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
