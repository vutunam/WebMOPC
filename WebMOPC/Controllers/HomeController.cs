using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;
using WebMOPC.Common;
using WebMOPC.Models;
using WebMOPC.Models.DTO;
using WebMOPC.Repository;

namespace WebMOPC.Controllers
{
	public class HomeController : Controller
	{
		private readonly ILogger<HomeController> _logger;
		public UsersRepository _userRepo = new UsersRepository();
		public StaffsRepository _staffRepo = new StaffsRepository();
		public PatientsRepository _patienRepo = new PatientsRepository();
		public DoctorsRepository _doctorRepo = new DoctorsRepository();
		public HomeController(ILogger<HomeController> logger)
		{
			_logger = logger;
		}	

		[HttpGet]
		public IActionResult Index()
		{
			if (HttpContext.Session.GetInt32("userid") != null)
			{
				return RedirectToAction("Dashboard");
			}
			return View();
		}



		[HttpGet("Home")]
		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Dashboard()
		{
			if (HttpContext.Session.GetInt32("userid") == null)
			{
				return RedirectToAction("Login");
			}
			return View();
		}

		public IActionResult Privacy()
		{
			return View();
		}

		[HttpGet]
		public IActionResult Login(string returnURL = "")
		{
			if (HttpContext.Session.GetInt32("userid") != null)
			{
				return RedirectToAction("Dashboard");
			}
			return View();
		}

		[HttpPost]
		public IActionResult Login(string username, string password, string returnURL = "")
		{
			HttpContext.Session.Clear();

			DataTable user = LoadDataFromSP.GetDataTableSP("spLogin", new string[] { "@LoginName", "@Password" }, new object[] { username.ToUpper(), password });

			SessionDTO sessionDTO = SQLHelper<SessionDTO>
							.ProcedureToModel("spLogin", new string[] { "@LoginName", "@Password" }, new object[] { username, password });
			if (string.IsNullOrWhiteSpace(sessionDTO.Avatar) && sessionDTO.ID > 0)
			{
				User u = _userRepo.GetByID(sessionDTO.ID);
				sessionDTO.Avatar = u.Avatar = "~/img/user.png";
				_userRepo.Update(u);
            }

			if (user.Rows.Count > 0)
			{

				HttpContext.Session.SetObject<SessionDTO>("UserLogin", sessionDTO);

				//// Gán thông tin người dùng
				HttpContext.Session.SetInt32("userid", TextUtils.ToInt(user.Rows[0]["ID"]));
                HttpContext.Session.SetString("loginName", TextUtils.ToString(user.Rows[0]["LoginName"]));
                HttpContext.Session.SetString("passWord", TextUtils.ToString(user.Rows[0]["Password"]));
                HttpContext.Session.SetString("img", TextUtils.ToString(sessionDTO.Avatar));
                HttpContext.Session.SetString("position", TextUtils.ToString(user.Rows[0]["Position"]));

                // Check phân quyền 

                if (TextUtils.ToBoolean(user.Rows[0]["IsStaff"])) // Nhân viên
                {
                    HttpContext.Session.SetInt32("isRole", 1);
                    HttpContext.Session.SetInt32("ID", TextUtils.ToInt(user.Rows[0]["StaffID"]));
                }

                if (TextUtils.ToBoolean(user.Rows[0]["isPatient"])) // Bệnh nhân
                {
                    HttpContext.Session.SetInt32("isRole", 2);
                    HttpContext.Session.SetInt32("ID", TextUtils.ToInt(user.Rows[0]["PatientID"]));
                }

                if (TextUtils.ToBoolean(user.Rows[0]["isDoctor"])) // Bác sĩ
                {
                    HttpContext.Session.SetInt32("isRole", 3);
                    HttpContext.Session.SetInt32("ID", TextUtils.ToInt(user.Rows[0]["DoctorID"]));
                }

                if (TextUtils.ToBoolean(user.Rows[0]["isAdmin"])) // Admin
                {
                    HttpContext.Session.SetInt32("isRole", 4);
                    HttpContext.Session.SetInt32("ID", TextUtils.ToInt(user.Rows[0]["StaffID"]));
                }

                return RedirectToAction("Dashboard", "Home");
			}
			ViewBag.Error = "Sai tên hoặc mật khẩu đăng nhập. Vui lòng kiểm tra lại!";
			return View();
		}

		[HttpGet]
		public IActionResult Logout()
		{
			HttpContext.Session.Clear();
			ViewBag.Message = "Bạn đã đăng xuất";
			return RedirectToAction("Login");
		}

		[HttpGet]
		public IActionResult ForgotPass()
		{
			return View();
		}


		[HttpPost]
		public IActionResult ForgotPass(string email)
		{
			User u = _userRepo.GetAll().Where(x => x.Email == email).FirstOrDefault();
			if (u == null)
			{
				ViewBag.Error = "Email không tồn tại!";
				return View();
			}

            string userName = "";

			Staff s = _staffRepo.GetAll().Where(x => x.UserId == u.Id).FirstOrDefault();
			Doctor d = _doctorRepo.GetAll().Where(x => x.UserId == u.Id).FirstOrDefault();
			Patient p = _patienRepo.GetAll().Where(x => x.UserId == u.Id).FirstOrDefault();

			if (s != null) userName = s.FullName;
			if (d != null) userName = d.FullName;
			if (p != null) userName = p.FullName;
			
			string newPassword = GenerateRandomPassword(8);
			List<string> emailCC = new List<string>();
			string loginUrl = Url.Action("Login", "Home", null, Request.Scheme);

			string body = $@"
				<div style=""font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;"">
					<!-- Header -->
					<div style=""text-align: center; font-size: 18px; font-weight: bold; color: red;"">
						[NO REPLY] - VUI LÒNG KHÔNG TRẢ LỜI EMAIL NÀY
					</div>
					<!-- Nội dung chính -->
					<div style=""margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px;"">
						<p>Xin chào <b>{userName}</b>,</p>
						<p>Mật khẩu của bạn đã được đặt lại thành công. Dưới đây là thông tin mới:</p>

						<div style=""background-color: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; font-size: 16px; font-weight: bold;"">
							<p>Tên đăng nhập: <span style=""color: #007bff;"">{u.LoginName}</span></p>
							<p>Mật khẩu mới: <span style=""color: red;"">{newPassword}</span></p>
						</div>

						<div style=""background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 15px; display: flex; align-items: center;"">
						<img src=""https://cdn-icons-png.flaticon.com/512/159/159469.png"" alt=""Warning"" width=""24"" height=""24"" style=""margin-right: 10px;"">
						<span><b>Lưu ý:</b> Đây là thông tin đăng nhập mới của bạn. Vui lòng đăng nhập và thay đổi mật khẩu ngay lập tức để đảm bảo an toàn cho tài khoản của bạn.</span>
						</div>

						<div style=""text-align: center; margin-top: 20px;"">
							<a href=""{loginUrl}"" style=""display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;"">
								Đăng nhập ngay
							</a>
						</div>
					</div>

					<!-- Footer -->
					<div style=""margin-top: 30px; text-align: center; font-size: 14px; color: gray;"">
						<p>Trân trọng,</p>
						<p>Đội ngũ hỗ trợ</p>
					</div>
				</div>";


			SendEmailInfo e = new SendEmailInfo();
			e.EmailCC = emailCC;
			e.EmployeeApproveID = 1;
			e.Subject = "Phòng khám Thăng Long cài lại mật khẩu!";
			e.Body = body; ;
			e.EmailTo = email;
			EmailHelper.SendEmail(e);

			u.Password = newPassword;
			_userRepo.Update(u);

			ViewBag.Email = email;
			ViewBag.Success = "Kiểm tra email trong thư hoặc thư rác để lấy mật khẩu mới!";
			return View();
		}

		public static string GenerateRandomPassword(int length)
		{
			const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
			Random random = new Random();
			return new string(Enumerable.Repeat(chars, length)
										.Select(s => s[random.Next(s.Length)]).ToArray());
		}

		[HttpGet]
		public IActionResult RegisterAcc()
		{
			if (HttpContext.Session.GetInt32("userid") != null)
			{
				return RedirectToAction("Dashboard");
			}

			return View();
		}

		[HttpPost]
		public IActionResult RegisterAcc(string fullName, DateTime birthday, int gender, string username, string password, string email)
		{
			User uMail = _userRepo.GetAll().Where(x => x.Email == email).FirstOrDefault();
			User uLogin = _userRepo.GetAll().Where(x => x.LoginName.ToUpper() == username.ToUpper()).FirstOrDefault();

			if (uLogin != null)
			{
				ViewBag.Error = "Tên đăng nhập đã tồn tại. Vui lòng kiểm tra lại!";
				ViewBag.Email = email;
				ViewBag.Username = username;
				return View();
			}

			if (uMail != null)
			{
				ViewBag.Error = "Email đã tồn tại. Vui lòng kiểm tra lại!";
				ViewBag.Email = email;
				ViewBag.Username = username;
				return View();
			}

			User user = new User();
			user.Email = email;
			user.LoginName = username;
			user.Password = password;
			user.IsDeleted = false;
			_userRepo.Create(user);

            Patient pa = new Patient();
			pa.FullName = fullName;
			pa.Gender = TextUtils.ToBoolean(gender);
			pa.DateOfBirth = birthday;
			pa.UserId = user.Id;
            _patienRepo.Create(pa);

			ViewBag.fullname = fullName;
            ViewBag.Email = email;
			ViewBag.Username = username;
			ViewBag.Success = "Đăng ký tài khoản thành công!";
			return View();
		}
	}
}
