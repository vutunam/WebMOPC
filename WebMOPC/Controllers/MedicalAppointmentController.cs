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
    public class MedicalAppointmentController : Controller
    {
        [HttpGet("datlichkham")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
