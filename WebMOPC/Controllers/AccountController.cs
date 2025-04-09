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
        [HttpGet("AccountInfor")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
