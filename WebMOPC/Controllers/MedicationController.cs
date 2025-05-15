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
    public class MedicationController : Controller
    {
        MedicationsRepository meRepo = new MedicationsRepository();
        [HttpGet("thuoc")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetAllMedication(string keywword , int status)
        {
            try
            {
                List<Medication> medication = SQLHelper<Medication>.ProcedureToList("spGetMedication",
                  new string[] { "@FilterText", "@Status" }
                  , new object[] { keywword, status });

                return Json(new { status = 1, medication }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult onDeletedMedication(int id)
        {
            try
            {
                if (id > 0)
                {
                    Medication me = meRepo.GetByID(id);
                    me.IsDeleted = true;
                    meRepo.Update(me);
                    return Json(new { status = 1, message = "Đã xóa thông tin thuốc!" }, new System.Text.Json.JsonSerializerOptions());
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

        public JsonResult onEditMedication(int id)
        {
            try
            {
                if (id > 0)
                {
                    Medication me = meRepo.GetByID(id);
                    return Json(new { status = 1, me }, new System.Text.Json.JsonSerializerOptions());
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

        public JsonResult SaveInfor(int id, int meStatus, decimal meQuantity, string meCode, string meName, 
            string meSupplier, decimal mePrice, string meUnit, string meSupplierContact, string meNote)
        {
            try
            {
                if (id > 0)
                {
                    Medication me = meRepo.GetByID(id);
                    me.Status = meStatus;
                    me.Quantity = meQuantity;
                    me.Code = meCode;
                    me.Name = meName;
                    me.Supplier = meSupplier;
                    me.Price = mePrice;
                    me.Unit = meUnit;
                    me.SupplierContact = meSupplierContact;
                    me.Note = meNote;
                    meRepo.Update(me);
                    return Json(new { status = 1, message = $"Thay đổi thông tin thành công!" }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    Medication me = new Medication();
                    me.Status = meStatus;
                    me.Quantity = meQuantity;
                    me.Code = meCode;
                    me.Name = meName;
                    me.Supplier = meSupplier;
                    me.Price = mePrice;
                    me.Unit = meUnit;
                    me.SupplierContact = meSupplierContact;
                    me.Note = meNote;
                    me.IsDeleted = false;
                    
                    meRepo.Create(me);
                    return Json(new { status = 1, message = $"Thuốc đã được thêm  mới!" }, new System.Text.Json.JsonSerializerOptions());
                }

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

    }
}
