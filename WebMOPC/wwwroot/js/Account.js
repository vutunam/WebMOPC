﻿var _attachFiles = [];

jQuery(document).ready(function () {
    debugger
    const togglePasswordFields = [
        { toggleId: 'toggle-old-password', inputId: 'old_password' },
        { toggleId: 'toggle-new-password', inputId: 'new_password' },
        { toggleId: 'toggle-confirm-password', inputId: 'confirm_password' }
    ];

    togglePasswordFields.forEach(item => {
        const toggle = document.getElementById(item.toggleId);
        const input = document.getElementById(item.inputId);
        const icon = toggle.querySelector('i');

        toggle.addEventListener('click', () => {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            icon.classList.toggle('bx-hide', !isHidden);
            icon.classList.toggle('bx-show', isHidden);
        });
    });
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
            var education = dt.s.Education != null ? dt.s.Education : "";
            var description = dt.s.Description != null ? dt.s.Description : "";
            // Lấy thông tin bệnh nhân 
            var cccd = dt.s.Cccd != null ? dt.s.Cccd : "";
            var healthInsurance = dt.s.HealthInsurance != null ? dt.s.HealthInsurance : "";

            $('#acc_Login').val(loginName);
            $('#acc_pass').val(pass);
            $('#acc_fullname').val(fullName);
            $('#acc_birth').val(birthDate);
            $('#acc_email').val(email);
            $('#acc_gender').val(parseInt(gender)).trigger('change');
            $('#acc_phoneNumber').val(phoneNumber);
            $('#acc_address').val(address);
            $('#acc_education').val(education);
            $('#acc_description').val(description);

            if (cccd != "") $('#acc_CCCD').val(cccd);
            if (healthInsurance != "") $('#acc_healthInsurance').val(healthInsurance);

        },
        error: function (err) {
            messageError("Không tải được thông tin người dùng!");
        }
    });
}

function ChangeInfor() {
    var ans = confirm("Bạn có chắc muốn thay đổi thông tin của mình không?");
    var loginName = $('#acc_Login').val();
    var fullName = $('#acc_fullname').val();
    var birthDay = moment($('#acc_birth').val()).format("YYYY-MM-DD");
    var email = $('#acc_email').val();
    var gender = $('#acc_gender').val();
    var isMale = Boolean(Number(gender));
    var phoneNum = $('#acc_phoneNumber').val(); // check lon hon 10 so
    var address = $('#acc_address').val();
    var edu = $('#acc_education').val() ?? "";;
    var decrip = $('#acc_description').val() ?? "";

    var cccd = $('#acc_CCCD').val();
    var healthIns = $('#acc_healthInsurance').val() ?? 0;

    if (loginName == "" || loginName == null) {
        messageError("Vui lòng nhập tên đăng nhập!");
    }

    if (fullName == "" || fullName == null) {
        messageError("Vui lòng nhập tên cảu bạn!");
    }

    if (birthDay == "" || birthDay == null) {
        messageError("Vui lòng chọn ngày sinh!");
    }

    if (email == "" || email == null) {
        messageError("Vui lòng nhập email!");
    }

    if (phoneNum == "" || phoneNum == null) {
        messageError("Vui lòng chọn số điện thoại!");
    }

    if (address == "" || address == null) {
        messageError("Vui lòng nhập địa chỉ!");
    }

    if (cccd == "" || cccd == null) {
        messageError("Vui lòng nhập căn cước!");
    }

    if (phoneNum.length < 9 || phoneNum.startsWith(0)) {
        messageError("Vui lòng nhập số điện thoại hợp lệ!");
        return;
    }
    var info = {
        LoginName: loginName,
        FullName: fullName,
        DateOfBirth: birthDay,
        Gender: isMale,
        Phone: phoneNum,
        Address: address,
        Email: email,
        Cccd: cccd,
        HealthInsurance: parseInt(healthIns),
        Description: decrip,
        Education: edu,
    };

    $.ajax({
        url: '/Account/ChangeInfor',
        type: 'POST',
        data: JSON.stringify(info),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (result) {
            if (parseInt(result.status) === 1) {
                messageSuccess(result.message);
                GetAll();
            } else {
                messageError(result.message);
            }
        },
        error: function (err) {
            messageError(err);
        }
    });
    
}


function ChangePass() {
    debugger

    var oldPass = $('#old_password').val();
    var newPass = $('#new_password').val();
    var cfPass =  $('#confirm_password').val();

    if (oldPass == "") {
        messageWarning("Vui lòng nhập mật khẩu cũ của bạn!"); return;
    }
    if (newPass == "") {
        messageWarning("Vui lòng nhập mật khẩu mới của bạn!"); return;
    }
    if (cfPass == "") {
        messageWarning("Vui lòng xác nhận mật khẩu của bạn!"); return;
    }

    if (newPass.length < 6) {
        messageWarning("Mật khẩu mới phải có ít nhất 6 ký tự!"); return;
    }
    if (cfPass.length < 6) {
        messageWarning("Mật khẩu xác nhận lại không giống mật khẩu mới!"); return;
    }

    if (oldPass === newPass) {
        messageWarning("Mật khẩu mới không được trùng với mật khẩu cũ!"); return;
    }

    var pass = {
        oldPass: oldPass,
        newPass: newPass,
        cfPass: cfPass,
    };

    $.ajax({
        url: '/Account/ChangePass',
        type: 'POST',
        data: JSON.stringify(pass),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (result) {
            if (parseInt(result.status) === 1) {
                messageSuccess(result.message);
                $('#old_password').val("");
                $('#new_password').val("");
                $('#confirm_password').val("");
                GetAll();
            } else {
                messageError(result.message);
            }
        },
        error: function (err) {
            messageError(err);
        }
    });
}

function UploadFile() {
    debugger
    var fileInput = $('#upload').val();
    
    $.ajax({
        url: '/Account/UploadFile',
        type: 'GET',
        data: { img: fileInput},
        contentType: 'application/json;charset=utf-8',
        dataType: 'json',
        success: function (result) {
            if (parseInt(result.status) === 1) {
                debugger
                $('#uploadedAvatar').attr('src', result.linkImg);
                $('#avatar_layout').attr('src', result.linkImg);
                $('#avatar_drop').attr('src', result.linkImg);
                messageSuccess(result.message);
                
            } else {
                messageError(result.message);
            }
        },
        error: function (err) {
            messageError(err);
        }
    });
}