using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;
using WebMOPC.Common;
using WebMOPC.Models;
using WebMOPC.Models.DTO;
using WebMOPC.Repository;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Net.Http.Headers;

namespace WebMOPC.Controllers
{
    public class BankController : Controller
    {
        private readonly string apiUrl = "https://api.vietqr.io/v2/banks";
        BanksRepository bankRepo = new BanksRepository();
        [HttpGet("nganhang")]
        public IActionResult Index()
        {
            return View();
        }


        [HttpGet]
        public JsonResult GetAllBanks(string keywword)
        {
            try
            {
                List<Bank> bank = SQLHelper<Bank>.ProcedureToList("spGetBank",
                  new string[] { "@FilterText" }
                  , new object[] { keywword });

                return Json(new { status = 1, bank }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult onEditSTK(int id, string stk)
        {
            try
            {
                if (id > 0)
                {
                    Bank ba = bankRepo.GetByID(id);
                    ba.Stk = stk;
                    ba.IsUsed = true;

                    if(stk == "0" || stk == "")
                    {
                        ba.IsUsed = false;
                    }

                    bankRepo.Update(ba);
                    return Json(new { status = 1, message = "Lưu STK thành công" }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    return Json(new { status = 0, message = "Lỗi lưu dữ liệu" }, new System.Text.Json.JsonSerializerOptions());
                }
                
                
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public JsonResult isUsed(int id, int use)
        {
            try
            {
                if (id > 0)
                {
                    Bank ba = bankRepo.GetByID(id);
                    ba.IsUsed = use == 1 ? true : false;
                    bankRepo.Update(ba);
                    string message = use == 1 ? "Kích hoạt thành công" : "Vô hiệu hóa thanh toán";
                    return Json(new { status = 1, message }, new System.Text.Json.JsonSerializerOptions());
                }
                else
                {
                    return Json(new { status = 0, message = "Lỗi lưu dữ liệu" }, new System.Text.Json.JsonSerializerOptions());
                }


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<JsonResult> UpdateBank()
        {
            try
            {
                var banks = await GetBankListFromAPI();
                if(banks.Count() > 0)
                {
                    foreach(var bank in banks)
                    {
                        Bank bk = bankRepo.GetAll().Where(x => x.Bin == bank.bin).FirstOrDefault() ?? new Bank();
                        bk.Bin = bank.bin;
                        bk.Code = bank.code;
                        bk.Name = bank.name;
                        bk.ShortName = bank.shortName;
                        bk.Logo = bank.logo;
                        if(bk.Id > 0) bankRepo.Update(bk);
                        else
                        {
                            bk.IsUsed = false;
                            bk.Stk = "";
                            bankRepo.Create(bk);
                        }
                    }
                }


                return Json(new { status = 1, message = "Update thành công!" }, new System.Text.Json.JsonSerializerOptions());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private async Task<List<BankAPI>> GetBankListFromAPI()
        {
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(apiUrl);
                if (response.IsSuccessStatusCode)
                {
                    string jsonData = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<VietQRResponse>(jsonData);
                    return result?.data ?? new List<BankAPI>();
                }
            }
            return new List<BankAPI>();
        }

        public class VietQRResponse
        {
            public int code { get; set; }
            public string desc { get; set; }
            public List<BankAPI> data { get; set; }
        }

        //public async Task<IActionResult> GetTransactions()
        //{
        //    var client = new HttpClient();
        //    client.DefaultRequestHeaders.Authorization =
        //        new AuthenticationHeaderValue("Bearer", "O1RMZQSUFNTBGSI0RHOIBTVAFMYVKU8E1AXNLL3WOSLQWEP3DEMLVEWUJ7OPZ7PQ");

        //    var response = await client.GetAsync("https://my.sepay.vn/userapi/transactions/list");

        //    var content = await response.Content.ReadAsStringAsync();
        //    return Content(content, "application/json");
        //}

        public class BankAPI
        {
            public string? bin { get; set; }
            public string name { get; set; }
            public string code { get; set; }
            public string shortName { get; set; }
            public string logo { get; set; }
            public string transferSupported { get; set; }
            public string lookupSupported { get; set; }
            public string shortCode { get; set; }
            public string support { get; set; }
            public string isTransfer { get; set; }
            public string swiftCode { get; set; }
        }
    }
}
