jQuery(document).ready(function () {
    GetAllDoctor();
});
var dataDoc;
var isRole = parseInt($("#isRole").val());
var docID = 0;
function GetAllDoctor() {
    $.ajax({
        url: '/Patient/GetAllDoctor',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            debugger
            dataDoc = data.doc;
            let colunms = [
                {
                    title: "Mã bệnh nhân ",
                    field: "Code",
                    width: 200,
                    formatter: "textarea", hozAlign: "left", headerFilter: "input"
                },
                {
                    title: "Tên bệnh nhân",
                    field: "FullName",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();
                        return value ? value : "";
                    }, hozAlign: "left",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }, headerFilter: "input"
                },
                {
                    title: "Ngày sinh",
                    width: 150,
                    field: "DateOfBirth",
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue() || '';
                        value = moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : '';
                        return value;
                    },
                    accessorDownload: function (value, data, type, component) {
                        value = value || '';
                        value = moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : '';
                        return value;
                    }, headerFilter: "input", hozAlign: "center"
                },
                {
                    title: "Giới tính",
                    field: "Gender",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();
                        return value == true ? "Nữ" : "Nam";
                    }, hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Địa chỉ",
                    field: "Address",
                    width: 200, formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();
                        return value ? value : "";
                    }, hozAlign: "left", headerFilter: "input"
                },
                {
                    title: "Email",
                    field: "Email",
                    width: 200, formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();
                        return value ? value : "";
                    }, hozAlign: "left", headerFilter: "input"
                },
                {
                    title: "CCCD",
                    field: "CCCD",
                    width: 200, formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();
                        return value ? value : "";
                    }, hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Số thẻ bảo hiểm",
                    field: "HealthInsurance",
                    width: 200, formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue();
                        return value ? value : "";
                    }, hozAlign: "left", headerFilter: "input"
                },
            ];

            if (isRole == 4) {
                colunms.unshift(
                    {
                        title: "Thao tác",
                        field: "Id",
                        width: 180,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            debugger
                            const rowData = cell.getRow().getData();
                            const code = rowData.FullName;
                            const id = rowData.ID;
                            const usid = rowData.UserID;
                            let htmlAction = `<button data-bs-toggle="modal" data-bs-target="#modal_doctor" onclick="return onEditDoctor(${id});"class="btn btn-primary btn-sm")>
                    <i class="fas fa-pen"></i>
                </button>
                <button onclick="return onDeletedDoctor(${id}, '${code}');" type="button" class="btn btn-danger btn-sm ms-1")>
                    <i class="fas fa-trash"></i>
                </button>
                <button onclick="return openAppointmentForm(${id});" type="button" class="btn btn-warning btn-sm ms-1")>
                    <i class="fas fa-calendar-plus"></i>
                </button>`;
                            if (cell.getValue() <= 0) htmlAction = '';
                            if (usid <= 0) htmlAction = `<button data-bs-toggle="modal" data-bs-target="#modal_doctor" onclick="return onEditDoctor(${id});"class="btn btn-primary btn-sm")>
                    <i class="fas fa-pen"></i>
                </button>
                <button onclick="return onDeletedDoctor(${id}, '${code}');" type="button" class="btn btn-danger btn-sm ms-1")>
                    <i class="fas fa-trash"></i>
                </button>
                 <button onclick="return addAccount(${id});" type="button" class="btn btn-info btn-sm ms-1")>
                    <i class="fas fa-user-plus"></i>
                </button>
                <button onclick="return openAppointmentForm(${id});" type="button" class="btn btn-warning btn-sm ms-1")>
                    <i class="fas fa-calendar-plus"></i>
                </button>`;
                            return htmlAction;
                        },
                        download: false

                    },
                );
            }

            var table = new Tabulator("#doctor_tb", {
                data: dataDoc,
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

function onDeletedDoctor(id, name) {
    debugger
    if (!confirm(`Bạn có chắc chắn muốn xóa thông tin bệnh nhân ${name} không?`)) {
        return;
    }
    $.ajax({
        url: '/Patient/onDeletedDoctor',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllDoctor();
            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function onEditDoctor(id) {
    if (id == 0) {
        docID = 0;
        ResetDoctorForm();
        $('#btn_save_doctor').text('Thêm mới');
        $('#modal_doctor').modal('show');
    } else {
        docID = id;
        $('#btn_save_doctor').text('Cập nhật');

        $.ajax({
            url: '/Patient/getDoctor',
            type: 'GET',
            data: { id: id },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                if (parseInt(data.status) === 1) {
                    var dt = data.doc;

                    // Fill dữ liệu vào form
                    $('#doctorCode').val(dt.Code);
                    $('#doctorFullName').val(dt.FullName);
                    $('#doctorDob').val(moment(dt.DateOfBirth).format('YYYY-MM-DD'));
                    $('#doctorGender').val(dt.Gender ? 1 : 0);
                    $('#doctorPhone').val(dt.Phone);
                    $('#doctorEmail').val(dt.Email);
                    $('#doctorCCCD').val(dt.Cccd);
                    $('#doctorBhyt').val(dt.HealthInsurance);
                    $('#doctorAddress').val(dt.Address);
                    $('#doctorEducation').val(dt.Education);
                    $('#doctorDescription').val(dt.Description);

                    // Hiển thị modal
                    $('#modal_doctor').modal('show');


                } else {
                    Swal.fire("Lỗi", data.message, "error");
                }
            },
            error: function (err) {
                Swal.fire("Lỗi", err.responseText, "error");
            }
        });
    }
}

function SaveDoctor() {
    // Lấy dữ liệu từ các input
    var code = $('#doctorCode').val().trim();
    var fullName = $('#doctorFullName').val().trim();
    var dob = $('#doctorDob').val();
    var gender = $('#doctorGender').val();
    var phone = $('#doctorPhone').val().trim();
    var email = $('#doctorEmail').val().trim();
    var cccd = $('#doctorCCCD').val().trim();
    var doctorBhyt = $('#doctorBhyt').val();
    var address = $('#doctorAddress').val().trim();

    // Kiểm tra dữ liệu bắt buộc
    if (!code) {
        Swal.fire("Thông báo", "Vui lòng nhập mã bệnh nhân.", "warning");
        return false;
    }
    if (!fullName) {
        Swal.fire("Thông báo", "Vui lòng nhập họ tên bệnh nhân.", "warning");
        return false;
    }
    if (!dob) {
        Swal.fire("Thông báo", "Vui lòng chọn ngày sinh.", "warning");
        return false;
    }
    if (!moment(dob, 'YYYY-MM-DD', true).isValid()) {
        Swal.fire("Thông báo", "Ngày sinh không hợp lệ. Định dạng đúng: YYYY-MM-DD.", "warning");
        return false;
    }
    debugger
    var doctor = {
        Id: docID,
        Code: code,
        FullName: fullName,
        DateOfBirth: dob,
        Gender: gender === "true",
        Phone: phone,
        Email: email,
        CCCD: cccd,
        HealthInsurance: doctorBhyt,
        Address: address,
    };

    // Gửi dữ liệu (AJAX)
    $.ajax({
        url: '/Patient/Save',
        type: 'POST',
        data: JSON.stringify(doctor),
        contentType: 'application/json',
        success: function (res) {
            if (parseInt(res.status) === 1) {

                $('#modal_doctor').removeClass('show').css('display', 'none');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                messageSuccess(res.message);
                GetAllDoctor();
            } else {
                messageError(res.message);
            }
        },
        error: function () {
            Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu!", "error");
        }
    });

    return false;
}

function ResetDoctorForm() {
    $('#doctorId').val('');
    $('#doctorCode').val('');
    $('#doctorFullName').val('');
    $('#doctorDob').val('');
    $('#doctorGender').val('true');
    $('#doctorPhone').val('');
    $('#doctorBhyt').val('');
    $('#doctorEmail').val('');
    $('#doctorCCCD').val('');
    $('#doctorDepartmentId').val('');
    $('#doctorAddress').val('');
    $('#doctorEducation').val('');
    $('#doctorDescription').val('');
}


function addAccount(id) {
    Swal.fire({
        title: '<strong style="font-size: 20px;">Cấp tài khoản mới</strong>',
        html: `
            <style>
                .swal2-html-container {
                    padding: 0 !important;
                }
                .input-group {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                .input-group input {
                    width: 100%;
                    padding: 10px 12px;
                    padding-right: 35px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    font-size: 14px;
                    box-sizing: border-box;
                }
                .input-group span {
                    position: absolute;
                    right: 10px;
                    font-size: 18px;
                    cursor: pointer;
                    color: #888;
                    user-select: none;
                }
                #errorMessages {
                    color: red;
                    font-size: 13px;
                    margin-top: 5px;
                    text-align: left;
                }
            </style>
            <div class="m-4">
            <div class="input-group">
                <input type="text" id="username" placeholder="Tên đăng nhập" required>
            </div>
            <div class="input-group">
                <input type="email" id="email" placeholder="Email" required>
            </div>
            <div class="input-group">
                <input type="password" id="password" placeholder="Mật khẩu" required>
                <span onclick="togglePassword('password')">👁️</span>
            </div>
            <div class="input-group">
                <input type="password" id="confirmPassword" placeholder="Nhập lại mật khẩu" required>
                <span onclick="togglePassword('confirmPassword')">👁️</span>
            </div>
            <div id="errorMessages"></div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Thêm',
        cancelButtonText: 'Hủy',
        focusConfirm: false,
        preConfirm: () => {
            let username = document.getElementById('username').value.trim();
            let email = document.getElementById('email').value.trim();
            let password = document.getElementById('password').value;
            let confirmPassword = document.getElementById('confirmPassword').value;
            let errorMessages = [];

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!username) errorMessages.push("Tên đăng nhập không được để trống.");
            if (!emailPattern.test(email)) errorMessages.push("Email không đúng định dạng.");
            if (password.length < 6) errorMessages.push("Mật khẩu phải có ít nhất 6 ký tự.");
            if (password !== confirmPassword) errorMessages.push("Mật khẩu và nhập lại mật khẩu không khớp.");

            if (errorMessages.length > 0) {
                document.getElementById('errorMessages').innerHTML = errorMessages.join('<br>');
                return false;
            }

            return { username, email, password };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            let accountData = result.value;
            $.ajax({
                url: '/Patient/SaveAccount',
                type: 'GET',
                data: {
                    id: id,
                    username: accountData.username,
                    email: accountData.email,
                    password: accountData.password,
                },
                contentType: 'application/json',
                success: function (res) {
                    if (parseInt(res.status) === 1) {
                        messageSuccess(res.message);
                        GetAllDoctor();
                    } else {
                        messageError(res.message);
                    }
                },
                error: function () {
                    Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu!", "error");
                }
            });
        }
    });
}

function togglePassword(id) {
    const field = document.getElementById(id);
    field.type = field.type === "password" ? "text" : "password";
}


function openAppointmentForm(id) {
    // Thêm CSS vào trang động
    const style = document.createElement('style');
    style.innerHTML = `
    /* Thêm kiểu cho các input và select */
    .swal2-input {
      width: 100%;
      padding: 10px;
      margin: 5px 0;
      border-radius: 5px;
      border: 1px solid #ccc;
      box-sizing: border-box;
      font-size: 14px;
    }

    /* Thêm kiểu cho textarea */
    #note {
      height: 100px;
      resize: none;
    }

    /* Thêm màu nền cho các input và select khi focus */
    .swal2-input:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
    }

    /* Thêm kiểu cho các label */
    label {
      font-weight: bold;
      margin-bottom: 5px;
      display: inline-block;
    }

    /* Cải thiện khoảng cách giữa các phần tử */
    .swal2-html-container {
      padding: 20px;
    }

    /* Thêm kiểu cho nút xác nhận */
    .swal2-confirm {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }

    .swal2-confirm:hover {
      background-color: #45a049;
    }

    /* Cải thiện hiển thị thông báo */
    .swal2-validationmessage {
      color: red;
      font-weight: bold;
    }
  `;
    document.head.appendChild(style);

    // Lấy thời gian hiện tại
    let now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Tính thời gian hiện tại + 30 phút

    Swal.fire({
        title: 'Nhập thông tin khám',
        html: `
      <label for="startTime">Giờ bắt đầu:</label><br>
      <input type="datetime-local" id="startTime" class="swal2-input"><br>
      <label for="endTime">Giờ kết thúc:</label><br>
      <input type="datetime-local" id="endTime" class="swal2-input"><br>
      <label for="status">Trạng thái:</label><br>
      <select id="status" class="swal2-input">
        <option value="0">Khám</option>
        <option value="1">Tái khám</option>
      </select><br>
      <label for="note">Ghi chú:</label><br>
      <textarea id="note" class="swal2-input"></textarea><br>
    `,
        focusConfirm: false,
        preConfirm: () => {
            const startTime = new Date(document.getElementById('startTime').value);
            const endTime = new Date(document.getElementById('endTime').value);
            const status = document.getElementById('status').value;
            const note = document.getElementById('note').value;

            // Kiểm tra điều kiện ngày giờ
            if (startTime <= new Date() || endTime <= startTime || endTime <= now) {
                Swal.showValidationMessage('Giờ bắt đầu phải sớm hơn 30 phút và giờ kết thúc phải lớn hơn giờ bắt đầu');
                return false;
            }

            // Gửi thông tin đi (tùy vào yêu cầu của bạn, có thể gọi API hoặc xử lý dữ liệu)
            return { startTime, endTime, status, note };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { startTime, endTime, status, note } = result.value;

            $.ajax({
                url: '/Patient/openAppointmentForm',
                type: 'GET',
                data: {
                    id: id,
                    startTime: moment(startTime).format('YYYY-MM-DD HH:mm'),
                    endTime: moment(endTime).format('YYYY-MM-DD HH:mm'),
                    status: status,
                    note: note,
                },
                contentType: 'application/json',
                success: function (res) {
                    if (parseInt(res.status) === 1) {
                        messageSuccess(res.message);
                        GetAllDoctor();
                    } else {
                        messageError(res.message);
                    }
                },
                error: function () {
                    Swal.fire("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu!", "error");
                }
            });
            Swal.fire(`Thông tin đã lưu: ${status}, bắt đầu: ${startTime}, kết thúc: ${endTime}, ghi chú: ${note}`);
        }
    });
}