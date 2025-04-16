jQuery(document).ready(function () {
    debugger
    GetAll();
})

function GetAll() {
    debugger
    $.ajax({
        url: '/Account/GetAll',
        type: 'GET',
        dataType: 'json',
        data: {},
        contentType: 'application/json;charset=utf-8',
        success: function (dt) {
            console.log(dt);
            debugger
            // Lấy thông tin chung người dùng 
            var loginName = dt.loginName != null ? dt.loginName : "";
            var pass = dt.passWord != null ? dt.passWord : "";
            var fullName = dt.s.FullName != null ? dt.s.FullName : "";
            var birthDate = moment(dt.s.DateOfBirth).isValid() ? moment(dt.s.DateOfBirth).format("YYYY-MM-DD") : '';
            var email = dt.s.Email != null ? dt.s.Email : "";
            var gender = dt.s.Gender == false ? 0 : 1;
            var phoneNumber = dt.s.Phone != null ? dt.s.Phone : "";
            var address = dt.s.Address != null ? dt.s.Address : "";
            // Lấy thông tin bệnh nhân 
            var cccd = dt.s.CCCD != null ? dt.s.CCCD : "";
            var healthInsurance = dt.s.HealthInsurance != null ? dt.s.HealthInsurance : "";

            $('#acc_Login').val(loginName);
            $('#acc_pass').val(pass);
            $('#acc_fullname').val(fullName);
            $('#acc_birth').val(birthDate);
            $('#acc_email').val(email);
            $('#acc_gender').val(parseInt(gender)).trigger('change');
            $('#acc_phoneNumber').val(phoneNumber);
            $('#acc_address').val(address);

            if (cccd != "") $('#acc_CCCD').val(cccd);
            if (healthInsurance != "") $('#acc_healthInsurance').val(healthInsurance);

        },
        error: function (err) {
            messageError("Không tải được thông tin người dùng!");
        }
    });
}