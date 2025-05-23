﻿using Microsoft.AspNetCore.Mvc;
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
    public class FullInvoiceController : Controller
    {
        InvoicesRepository inRepo = new InvoicesRepository();
        BanksRepository baRepo = new BanksRepository();
        InvoiceDetailsRepository indRepo = new InvoiceDetailsRepository();
        PrescriptionsRepository presRepo = new PrescriptionsRepository();
        MedicalAppointmentsRepository meRepo = new MedicalAppointmentsRepository();
        [HttpGet("fullinvoice")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetAllInvoice()
        {
            try
            {
                int isRole = TextUtils.ToInt(HttpContext.Session.GetInt32("isRole"));
                int id = TextUtils.ToInt(HttpContext.Session.GetInt32("ID"));

                List<Invoice> invs = inRepo.GetAll().Where(x => x.IsDeleted == false).ToList();

                if(isRole == 2)
                {
                    MedicalAppointment medi = meRepo.GetAll().Where(x => x.IsDeleted == false && x.PatientId == id).FirstOrDefault();
                    if(medi != null)
                    {
                        invs = invs.Where(x => x.MedicalAppointmentId == medi.Id).ToList();
                    }
                    else
                    {
                        invs = [];
                    }
                }
                var doc = SQLHelper<object>.ProcedureToDynamicLists("spGetInvois", new string[] { }, new object[] { });
                var doc0 = doc[0];
                return Json(new { status = 1, invs, doc0 }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult deleteInv(int id)
        {
            try
            {
                Invoice i = inRepo.GetByID(id);
                if (i != null)
                {
                    i.IsDeleted = true;
                    inRepo.Update(i);
                }

                return Json(new { status = 1, message = "Đã xóa hóa đơn!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult updateParStatus(int id)
        {
            try
            {
                Invoice i = inRepo.GetByID(id);
                if (i != null)
                {
                    i.Status = 3;
                    inRepo.Update(i);
                }

                return Json(new { status = 1}, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet]
        public JsonResult printInv(int id)
        {
            try
            {
                Invoice i = inRepo.GetByID(id);
                int check = 0;
                var pes = SQLHelper<object>.ProcedureToDynamicLists("spGetThuocDetai", new string[] { "@InvoiceID" }, new object[] { id });
                var ind = SQLHelper<object>.ProcedureToDynamicLists("spGetIndetail", new string[] { "@InvoiceID" }, new object[] { id });
                //List<InvoiceDetail> ind = indRepo.GetAll().Where(x => x.InvoiceId == id).ToList();
                if (ind[0].Count() > 0)
                {
                    check = 1;
                }

                if (pes[0].Count() > 0)
                {
                    check = 2;
                }


                List<Prescription> pesl = presRepo.GetAll().Where(x => x.InvoiceId == id).ToList();
                List<InvoiceDetail> indl = indRepo.GetAll().Where(x => x.InvoiceId == id).ToList();

                decimal price = 0;
                if (pesl.Count() > 0)
                {
                    foreach (var item in pesl)
                    {
                        if (item.Price > 0)
                        {
                            price += TextUtils.ToDecimal(item.Price);
                        }
                    }
                }
                else
                {
                    foreach (var item in indl)
                    {
                        if (item.Price > 0)
                        {
                            price += TextUtils.ToDecimal(item.Price);
                        }
                    }
                }

                var pes0 = pes[0];
                var ind0 = ind[0];

                return Json(new { status = 1,i, pes0, ind0, check, price}, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult CreatQR(int id)
        {
            try
            {
                List<Prescription> pes = presRepo.GetAll().Where(x => x.InvoiceId == id).ToList();
                List<InvoiceDetail> ind = indRepo.GetAll().Where(x => x.InvoiceId == id).ToList();

                decimal price = 0;
                if(pes.Count() > 0)
                {
                    foreach(var item in pes)
                    {
                        if(item.Price > 0)
                        {
                            price += TextUtils.ToDecimal(item.Price);
                        }
                    }
                }else
                {
                    foreach (var item in ind)
                    {
                        if (item.Price > 0)
                        {
                            price += TextUtils.ToDecimal(item.Price);
                        }
                    }
                }






                Bank ba = baRepo.GetAll().Where(x => x.IsUsed == true).FirstOrDefault();
                if (ba == null)
                {
                    return Json(new { status = 0, message = "Ngân hàng thanh toán đang lỗi vui lòng báo với bệnh viện để đặt lịch!" }, new System.Text.Json.JsonSerializerOptions());
                }

                if (ba.Id > 0)
                {
                    string bin = ba.Bin;
                    string stk = ba.Stk;
                    return Json(new { status = 1, bin, stk, price }, new System.Text.Json.JsonSerializerOptions());
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
