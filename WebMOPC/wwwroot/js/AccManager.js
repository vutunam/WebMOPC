jQuery(document).ready(function () {
    GetAllAcc();
});
var dataAcc;
function GetAllAcc() {
    $.ajax({
        url: '/AccManager/GetAllAcc',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            debugger
            dataAcc = data.acc;
            let colunms = [
                {
                    title: "Trạng thái",
                    field: "IsDeleted",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();

                        return value == true ? `<span style="color: orange;">Vô hiệu hóa</span>` : `<span style="color: green;">Hoạt động</span>`;
                    }, hozAlign: "center",
                },
                {
                    title: "Tên đăng nhập",
                    field: "LoginName",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }
                },
                {
                    title: "Mật khẩu",
                    field: "Password",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                {
                    title: "Email",
                    field: "Email",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                
            ];

                colunms.unshift(
                    {
                        title: "Thao tác",
                        field: "Id",
                        width: 150,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            const rowData = cell.getRow().getData();
                            const isDeleted = rowData.IsDeleted;
                            const id = rowData.ID;
                            const login = rowData.LoginName;
                            const email = rowData.Email;
                            let htmlAction = `<button onclick="return changeStatus(${id},${!isDeleted});" class="btn btn-danger btn-sm")>
                                <i class="fas fa-ban"></i>
                            </button>
                            <button  onclick="return showChangeLoginInfoPrompt(${id},'${login}','${email}');" type="button" class="btn btn-info btn-sm ms-1")>
                               <i class="fas fa-circle-info"></i>
                            </button>
                            <button onclick="return showPasswordPrompt(${id},'${login}');" type="button" class="btn btn-warning btn-sm ms-1")>
                                <i class="fas fa-key"></i>
                            </button>`;
                            if (isDeleted == true) {
                                htmlAction = `<button onclick="return changeStatus(${id},${!isDeleted});" class="btn btn-success btn-sm")>
                                        <i class="fa fa-square-check"></i>
                                    </button>
                                    <button  onclick="return showChangeLoginInfoPrompt(${id},'${login}','${email}');" type="button" class="btn btn-info btn-sm ms-1")>
                                       <i class="fas fa-circle-info"></i>
                                    </button>
                                    <button onclick="return showPasswordPrompt(${id},'${login}');" type="button" class="btn btn-warning btn-sm ms-1")>
                                        <i class="fas fa-key"></i>
                                    </button>`;
                                    }

                            if (cell.getValue() <= 0) htmlAction = '';
                            return htmlAction;
                        },
                        download: false

                    },
                );
            

            var table = new Tabulator("#department_tb", {
                data: dataAcc,
                maxHeight: "100%",
                columnDefaults: {
                    vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                },
                layout: "fitDataStretch",
                pagination: "local",
                paginationSize: 20,
                langs: {
                    "vi": {
                        "pagination": {
                            "first": "<<",
                            "last": ">>",
                            "prev": "<",
                            "next": ">",
                        }
                    }
                },
                locale: "vi",
                columns: colunms,
            });
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function changeStatus(id, status) {
    debugger
    if (!confirm(status == true ?`Bạn có chắc chắn muốn vô hiệu hóa tài khoản không?`: `Bạn có chắc chắn muốn kích hoạt tài khoản không?`)) {
        return;
    }
    $.ajax({
        url: '/AccManager/changeStatus',
        type: 'GET',
        data: {
            id: id,
            status: status
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllAcc();
            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function showPasswordPrompt(id, login) {
    debugger
    Swal.fire({
        title: `Đổi mật khẩu tài khoản ${login}`,
        html: `
      <div style="position: relative;">
        <input type="password" id="newPassword" class="swal2-input" placeholder="Mật khẩu mới">
        <i class="toggle-password fa fa-eye" toggle="#newPassword"></i>
      </div>
      <div style="position: relative;">
        <input type="password" id="confirmPassword" class="swal2-input" placeholder="Xác nhận mật khẩu">
        <i class="toggle-password fa fa-eye" toggle="#confirmPassword"></i>
      </div>`,
        focusConfirm: false,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        showCancelButton: true,
        customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-confirm-btn',
            cancelButton: 'custom-cancel-btn'
        },
        didOpen: () => {
            document.querySelectorAll('.toggle-password').forEach(icon => {
                icon.addEventListener('click', function () {
                    const input = document.querySelector(this.getAttribute('toggle'));
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    this.classList.toggle('fa-eye');
                    this.classList.toggle('fa-eye-slash');
                });
            });
        },
        preConfirm: () => {
            const newPass = document.getElementById('newPassword').value.trim();
            const confirmPass = document.getElementById('confirmPassword').value.trim();

            if (!newPass || !confirmPass) {
                Swal.showValidationMessage('Vui lòng nhập đầy đủ cả hai trường');
                return false;
            }
            if (newPass.length < 6) {
                Swal.showValidationMessage('Mật khẩu phải có ít nhất 6 ký tự');
                return false;
            }
            if (newPass !== confirmPass) {
                Swal.showValidationMessage('Mật khẩu xác nhận không khớp');
                return false;
            }

            return newPass;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newPassword = result.value;
            $.ajax({
                url: '/AccManager/showPasswordPrompt',
                type: 'GET',
                data: {
                    id: id,
                    newPassword: newPassword
                },
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    if (parseInt(data.status) === 1) {
                        messageSuccess(data.message);
                        GetAllAcc();
                    } else {
                        messageError(data.message);
                    }
                },
                error: function (err) {
                    messageError(err.responseText);
                }
            });
        }
    });
}

function showChangeLoginInfoPrompt(id, login, email) {
    debugger
    Swal.fire({
        title: `Cập nhật thông tin đăng nhập tài khoản ${login}`,
        html: `
      <input type="text" id="loginName" class="swal2-input" placeholder="Tên đăng nhập" value ="${login}">
      <input type="email" id="email" class="swal2-input" placeholder="Email" value="${email}">`,
        focusConfirm: false,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        showCancelButton: true,
        customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-confirm-btn',
            cancelButton: 'custom-cancel-btn'
        },
        preConfirm: () => {
            const loginName = document.getElementById('loginName').value.trim();
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!loginName || !email) {
                Swal.showValidationMessage('Vui lòng nhập đầy đủ Tên đăng nhập và Email');
                return false;
            }
            if (!emailRegex.test(email)) {
                Swal.showValidationMessage('Email không đúng định dạng');
                return false;
            }

            return { loginName, email };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { loginName, email } = result.value;
            $.ajax({
                url: '/AccManager/showChangeLoginInfoPrompt',
                type: 'GET',
                data: {
                    id: id,
                    loginName: loginName,
                    email: email
                },
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    if (parseInt(data.status) === 1) {
                        messageSuccess(data.message);
                        GetAllAcc();
                    } else {
                        messageError(data.message);
                    }
                },
                error: function (err) {
                    messageError(err.responseText);
                }
            });
        }
    });
}

