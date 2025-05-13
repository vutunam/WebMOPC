

jQuery(document).ready(function () {
    SetCalendar();
    GetAllMedicalappointment();
    $('#modal_department').modal({
        backdrop: 'static',
    });
});
var isRole = parseInt($("#isRole").val());
console.log(isRole);
function SetCalendar() {
    $.ajax({
        url: '/MedicalAppointment/GetAllCalendar',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                debugger
                var even = data.events;

                const calendarEl = document.getElementById('calendar')

                const calendar = new FullCalendar.Calendar(calendarEl, {
                    locale: 'vi',
                    themeSystem: 'bootstrap5',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'datlichkham dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                    },
                    buttonText: {
                        today: 'Hôm nay',
                        month: 'Tháng',
                        week: 'Tuần',
                        day: 'Ngày',
                        list: 'Danh sách'
                    },
                    datesSet: function (info) {
                        // Ghi đè nội dung tiêu đề mặc định
                        const titleEl = calendarEl.querySelector('.fc-toolbar-title')
                        if (titleEl) {
                            titleEl.innerText = '📅 LỊCH KHÁM - ' + (info.view.title)
                        }
                    },
                    customButtons: {
                        datlichkham: {
                            text: 'Đặt lịch khám',
                            click: function () {
                                $.ajax({
                                    url: '/MedicalAppointment/CheckInforPatient',
                                    type: 'GET',
                                    dataType: 'json',
                                    contentType: 'application/json;charset=utf-8',
                                    success: function (data) {
                                        if (parseInt(data.status) === 1) {
                                            Swal.fire({
                                                title: 'Đặt lịch khám',
                                                //backdrop: false,
                                                allowOutsideClick: true,
                                                html: `
                                            <textarea id="noteInput" style="width: 100%;" class="swal2-textarea m-0" placeholder="Nhập ghi chú triệu chứng"></textarea>
                                            <span class="row pt-2" style="color:red;">
                                                ⚠️ Lưu ý: Đặt lịch cần đặt cọc 2.000 VNĐ. Chúng tôi sẽ xác nhận trước 1 giờ và hoàn tiền nếu hủy lịch.
                                            </span>
                                            <div class="pt-2">
                                                📞 Chúng tôi sẽ liên hệ qua số <strong>${data.phone}</strong> của bạn. Nếu thông tin số điện thoại chưa đúng vui lòng cập nhật thông tin của bạn.
                                            </div>
                                        `,
                                                showCancelButton: true,
                                                customClass: {
                                                    cancelButton: 'btn btn-success',
                                                    confirmButton: 'btn btn-primary'
                                                },
                                                confirmButtonText: 'Xác nhận đặt lịch',
                                                cancelButtonText: 'Cập nhật thông tin',
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    const note = document.getElementById('noteInput').value;
                                                    CreatQR(note);
                                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                    window.location.href = '/AccountInfor';
                                                }
                                            });
                                        } else {
                                            messageError(data.message);
                                        }

                                    },
                                    error: function (err) {
                                        messageError(err.responseText);
                                    }
                                });
                            }
                        }
                    },
                    dayMaxEvents: true,
                    editable: true,
                    droppable: true,
                    events: even
                })
                calendar.render()

            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}


const APIKey = 'AK_CS.bd135bb0271e11f095d88b1a1023c43c.CsaHO54YRyZhiRin0RPVKPKrGIuAJ8942ASnrNw19fl8V5ue1aqawLqYQwgE6yEBWs8UM7S1'; 
const API_GET_PAID_BASE = "https://oauth.casso.vn/v2/transactions";

async function checkPaid(randomCode, stk) {
    debugger
    const url = `${API_GET_PAID_BASE}?page=1&pageSize=1&sort=DESC`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `apikey ${APIKey}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        var data = result.data.records[0];

        var des = data.description;


        if (des.includes(randomCode) && data.amount === 2000 && data.bankSubAccId === stk) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Lỗi khi lấy giao dịch:", error);
        return false;
    }
}

function load2() {
    GetAllMedicalappointment();
    GetAllMedicalappointment();
}

function generateRandomCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function CreatQR(note) {
    $.ajax({
        url: '/MedicalAppointment/CreatQR',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {

                const randomCode = generateRandomCode();
                const addInfo = `Dat coc lich kham - ${randomCode}`;
                const encodedAddInfo = encodeURIComponent(addInfo);

                const qrLink = `https://img.vietqr.io/image/${data.bin}-${data.stk}-print.png?amount=2000&addInfo=${encodedAddInfo}`;
                
                Swal.fire({
                    title: 'QR Thanh toán',
                    html: `
                            <div id="qrLoader" style="text-align:center;">
                                <i class="fa fa-spinner fa-spin fa-2x"></i>
                            </div>
                            <div id="qrCountdown" style="margin-top:10px; text-align:center; font-weight:bold;">⏳ Còn lại: 2:00</div>
                        `,
                    showConfirmButton: false,
                    width: 500,
                    didOpen: () => {
                        
                        const img = new Image();
                        img.src = qrLink;
                        img.style.maxWidth = "100%";
                        img.style.maxHeight = "500px";
                        img.onload = function () {
                            Swal.update({
                                html: `
                                <div style="text-align:center;">${img.outerHTML}</div>
                                <div id="qrCountdown" style="margin-top:10px; text-align:center; font-weight:bold;">⏳ Còn lại: 2:00</div>
                            `
                            });

                            let timeLeft = 120; 
                            const countdownEl = document.getElementById('qrCountdown');
                            const interval = setInterval(() => {
                                timeLeft--;
                                const minutes = Math.floor(timeLeft / 60);
                                const seconds = timeLeft % 60;
                                if (countdownEl) {
                                    countdownEl.innerText = `⏳ Còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                                }

                                if (timeLeft <= 0) {
                                    clearInterval(interval);
                                    Swal.close(); 
                                }
                            }, 1000);
                            let pay = false;
                            const paymentChecker = setInterval(async () => {
                                const isPay = await checkPaid(randomCode, data.stk);
                                //const isPay = true;
                                if (isPay) {
                                    clearInterval(interval);
                                    clearInterval(paymentChecker);
                                    Swal.close();
                                    Swal.fire('🎉 Thanh toán thành công!', 'Cảm ơn bạn đã đặt lịch.', 'success');
                                    pay = true;
                                    makeCalendar(note, data.bin);
                                    GetAllMedicalappointment();
                                }
                            }, 30000);

                            const timeout = setTimeout(() => {
                                clearInterval(paymentChecker);
                                if (!pay) {
                                    Swal.close();
                                    Swal.fire('Hết hạn thanh toán!', 'Vui lòng đặt lại lịch của bạn. Liên hệ <strong>012345678 (Miễn phí)</strong> nếu bạn gặp bất kỳ sự cố gì!', 'warning');
                                }
                            }, 120000);

                        };

                    },
                });

                GetAllMedicalappointment();

            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}


function makeCalendar(note, bin) {
    $.ajax({
        url: '/MedicalAppointment/makeCalendar',
        type: 'GET',
        data: {
            note: note,
            bin:bin,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

// Update chức năng load lịch khám 
function GetAllMedicalappointment() {
    debugger
    $.ajax({
        url: '/MedicalAppointment/GetAllMedicalappointment',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            var dt = data.me;
            let colunms = [
                {
                    title: "Giờ bắt đầu",
                    field: "MedicalDateStart",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue() || '';

                        if (moment(value, moment.ISO_8601, true).isValid()) {
                            let year = moment(value).year();
                            let currentYear = moment().year();

                            if (year < currentYear) {
                                return `<span style="color: red;">Chưa có thời gian bắt đầu</span>`;
                            } else { 
                                return moment(value).format("DD/MM/YYYY HH:MM");
                            }
                        }

                        return '<span style="color: red;">Chưa có thời gian bắt đầu</span>';
                    }, hozAlign: "center",
                    headerFilter: "input"
                },
                {
                    title: "Giờ kết thúc",
                    field: "MedicalDateEnd",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue() || '';

                        if (moment(value, moment.ISO_8601, true).isValid()) {
                            let year = moment(value).year();
                            let currentYear = moment().year();

                            if (year < currentYear) { 
                                return `<span style="color: red;">Chưa có thời gian kết thúc</span>`;
                            } else {
                                return moment(value).format("DD/MM/YYYY HH:MM");
                            }
                        }

                        return '<span style="color: red;">Chưa có thời gian kết thúc</span>';
                    }, hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Tên bệnh nhân",
                    field: "PatientName",
                    width: 200,
                    formatter: "textarea", hozAlign: "center",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }, headerFilter: "input"
                },
                {
                    title: "Ngày sinh",
                    field: "DateOfBirth",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue() || '';
                        value = moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : '';
                        return value;
                    }, hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Giới tính",
                    field: "Gender",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        const value = cell.getValue();
                        return value === true ? "Nữ" : "Nam";
                    },
                    hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Số điện thoại",
                    field: "Phone",
                    width: 200,
                    hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Loại khám",
                    field: "MedicalType",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        const value = cell.getValue();
                        return value === true ? "Tái khám" : "Khám";
                    },
                    hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Trạng thái thanh toán",
                    field: "PaymentType",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        const value = cell.getValue();
                        return value === 1 ? `<span style="color: orange;">Đã cọc</span>` : value === 2 ? `<span style="color: green;">Chưa thanh toán</span>` :`<span style="color: green;">Đã thanh toán</span>`;
                    },
                    hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Thời gian đặt lịch",
                    field: "CreatedDate",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue() || '';
                        value = moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : '';
                        return value;
                    }, hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Hoàn thành",
                    field: "IsDoned",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        const value = cell.getValue();
                        return value === true ? `<span style="color: green;">Đã khám</span>` : `<span style="color: red;">Chưa khám</span>`;
                    },
                    hozAlign: "center", headerFilter: "input"
                },
            ];

                colunms.unshift(
                    {
                        title: "Thao tác",
                        field: "ID",
                        width: 200,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            debugger
                            const rowData = cell.getRow().getData();
                            const code = rowData.Code;
                            const diID = rowData.DiagnoseID;
                            var done = rowData.IsDoned;
                            var id = parseInt(cell.getValue());
                            let value = rowData.MedicalDateEnd;
                            let result = false;


                            if (moment(value, moment.ISO_8601, true).isValid()) {
                                let year = moment(value).year();
                                let currentYear = moment().year();
                                result = (year >= currentYear); 
                            }


                            let htmlAction = `<button  onclick="return setCalendar(${id});" class="btn btn-primary btn-sm")>
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button data-bs-toggle="modal" data-bs-target="#modal_department" onclick="return getInvoice(${id},0);" type="button" class="btn btn-info btn-sm ms-1")>
                                    <i class="fas fa-file-invoice-dollar"></i></i>
                                </button>
                                <button data-bs-toggle="modal" data-bs-target="#modal_department" onclick="return getInvoice(${id},1);" type="button" class="btn btn-warning btn-sm ms-1")>
                                    <i class="fa-brands fa-medrt"></i>
                                </button>
                                <button onclick="return addDiagnosis(${diID},${id}, ${result});" type="button" class="btn btn-success btn-sm ms-1")>
                                    <i class="fa-brands fa-font-awesome"></i>
                                </button>
                                <button onclick="return deleteCalendar(${id});" type="button" class="btn btn-danger btn-sm ms-1")>
                                    <i class="fas fa-trash"></i>
                                </button>
                                `;
                            if (cell.getValue() <= 0) htmlAction = '';
                            console.log('role', isRole);

                            if (isRole === 2) {
                                htmlAction = `
                                <button onclick="return addDiagnosis(${diID},${id},${result});" type="button" class="btn btn-success btn-sm ms-1")>
                                    <i class="fa-brands fa-font-awesome"></i>
                                </button>`;
                            }

                            if (done == 1) {
                                htmlAction = `
                                 <button data-bs-toggle="modal" data-bs-target="#modal_department" onclick="return getInvoice(${id},0);" type="button" class="btn btn-info btn-sm ms-1")>
                                    <i class="fas fa-file-invoice-dollar"></i></i>
                                </button>
                                <button data-bs-toggle="modal" data-bs-target="#modal_department" onclick="return getInvoice(${id},1);" type="button" class="btn btn-warning btn-sm ms-1")>
                                    <i class="fa-brands fa-medrt"></i>
                                </button>
                                <button onclick="return addDiagnosis(${diID},${id}, ${result});" type="button" class="btn btn-success btn-sm ms-1")>
                                    <i class="fa-brands fa-font-awesome"></i>
                                </button>`;
                            }
                            return htmlAction;
                        },
                        download: false

                    },
                );
            

            var table = new Tabulator("#department_tb", {
                data: dt,
                maxHeight: "100%",
                columnDefaults: {
                    vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                },
                layout: "fitDataStretch",
                pagination: "local",
                paginationSize: 10,
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

function deleteCalendar(id) {
    Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa!',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/MedicalAppointment/deleteCalendar',
                type: 'GET',
                data: {
                    id: parseInt(id),
                },
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    if (parseInt(data.status) === 1) {
                        messageSuccess(data.message);
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

    function setCalendar(id) {
    //    const now = moment();

    //    const currentDateStr = now.format('YYYY-MM-DD');
    //    const currentHour = now.hour();

    //    const htmlContent = `
    //        <label class="swal2-input-label">Chọn ngày:</label>
    //        <input type="date" id="selectedDate" class="swal2-input" value="${currentDateStr}" min="${currentDateStr}">

    //        <label class="swal2-input-label">Giờ bắt đầu:</label>
    //        <input type="time" id="startTime" class="swal2-input" value="${pad(currentHour + 1)}:00">

    //        <label class="swal2-input-label">Giờ kết thúc:</label>
    //        <input type="time" id="endTime" class="swal2-input" value="${pad(currentHour + 2)}:00">
    //    `;

    //    Swal.fire({
    //        title: 'Đặt lịch hẹn',
    //        html: htmlContent,
    //        confirmButtonText: 'Xác nhận',
    //        cancelButtonText: 'Hủy',
    //        showCancelButton: true,
    //        focusConfirm: false,
    //        preConfirm: () => {
    //            const date = document.getElementById('selectedDate').value;
    //            const startTime = document.getElementById('startTime').value;
    //            const endTime = document.getElementById('endTime').value;

    //            const start = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
    //            const end = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm');

    //            if (!start.isValid() || !end.isValid()) {
    //                Swal.showValidationMessage('Thời gian không hợp lệ');
    //                return false;
    //            }

    //            if (start.isSameOrBefore(now)) {
    //                Swal.showValidationMessage('Giờ bắt đầu phải lớn hơn thời gian hiện tại');
    //                return false;
    //            }

    //            if (end.isSameOrBefore(start)) {
    //                Swal.showValidationMessage('Giờ kết thúc phải lớn hơn giờ bắt đầu');
    //                return false;
    //            }

    //            return {
    //                start: start.format('YYYY-MM-DD HH:mm:ss'),
    //                end: end.format('YYYY-MM-DD HH:mm:ss')
    //            };
    //        }
    //    }).then((result) => {
    //        if (result.isConfirmed && result.value) {
    //            const { start, end } = result.value;

    //            Swal.fire({
    //                title: 'Đang xử lý...',
    //                allowOutsideClick: false,
    //                didOpen: () => {
    //                    Swal.showLoading(); // Hiển thị spinner
    //                }
    //            });

    //            $.ajax({
    //                url: '/MedicalAppointment/setCalendar',
    //                type: 'GET',
    //                data: {
    //                    start: start,
    //                    end: end,
    //                    id:id
    //                },
    //                dataType: 'json',
    //                contentType: 'application/json;charset=utf-8',
    //                success: function (data) {
    //                    if (parseInt(data.status) === 1) {
    //                        messageSuccess(data.message);
    //                        GetAllMedicalappointment();
    //                    } else {
    //                        messageError(data.message);
    //                    }
    //                },
    //                error: function (err) {
    //                    messageError(err.responseText);
    //                }
    //            });
    //        }
    //    });

    //function pad(num) {
    //    return num < 10 ? '0' + num : num;
    //    }


        debugger
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
    `,
            focusConfirm: false,
            preConfirm: () => {
                const startTime = new Date(document.getElementById('startTime').value);
                const endTime = new Date(document.getElementById('endTime').value);

                // Kiểm tra điều kiện ngày giờ
                if (startTime <= new Date() || endTime <= startTime || endTime <= now) {
                    Swal.showValidationMessage('Giờ bắt đầu phải sớm hơn 30 phút và giờ kết thúc phải lớn hơn giờ bắt đầu');
                    return false;
                }

                // Gửi thông tin đi (tùy vào yêu cầu của bạn, có thể gọi API hoặc xử lý dữ liệu)
                return { startTime, endTime};
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { startTime, endTime} = result.value;

                Swal.fire({
                    title: 'Đang xử lý...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading(); // Hiển thị spinner
                    }
                });

                $.ajax({
                    url: '/MedicalAppointment/setCalendar',
                    type: 'GET',
                    data: {
                        start: moment(startTime).format('YYYY-MM-DD HH:mm'),
                        end: moment(endTime).format('YYYY-MM-DD HH:mm'),
                        id: id
                    },
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    success: function (data) {
                        if (parseInt(data.status) === 1) {
                            messageSuccess(data.message);
                            GetAllMedicalappointment();
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


function addDiagnosis(id, mid, result) {
    if (!result) {
        messageError("Chưa có ngày khám bệnh vui lòng kiểm tra lại!");
        return;
    }



    const showSaveButton = isRole != 2;
    const disableInputs = isRole == 2;
    var diData;
    
    if (id > 0) {
        $.ajax({
            url: '/MedicalAppointment/getDiagnosis',
            type: 'GET',
            data: {
                id: id,
            },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                if (parseInt(data.status) === 1) {
                    diData = data.di;
                    console.log(diData);
                    const htmlForm = `
        <style>
            .form-group {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }

            .form-group label {
                width: 120px;
                margin-right: 10px;
                font-weight: bold;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                flex: 1;
                padding: 6px 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 14px;
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            /* Làm cho các trường không thể chỉnh sửa */
            .form-group input[disabled],
            .form-group select[disabled],
            .form-group textarea[disabled] {
                background-color: #f1f1f1;  /* Màu nền để cho thấy các trường không thể chỉnh sửa */
                cursor: not-allowed;  /* Con trỏ chuột thay đổi thành kiểu không cho phép */
            }
        </style>

        <div class="form-group">
            <label for="Name">Tên chẩn đoán:</label>
            <input id="Name" type="text" placeholder="Tên chẩn đoán" value="${diData.Name}" ${disableInputs ? 'disabled' : ''} />
        </div>

        <div class="form-group">
            <label for="Status">Trạng thái:</label>
            <select id="Status" ${disableInputs ? 'disabled' : ''}>
                <option value="">-- Trạng thái --</option>
                <option value="0" ${diData.Status == 0 ? 'selected' : ''}>Chưa xử lý</option>
                <option value="1" ${diData.Status == 1 ? 'selected' : ''}>Đã xử lý</option>
                <option value="2" ${diData.Status == 2 ? 'selected' : ''}>Đang theo dõi</option>
            </select>
        </div>

        <div class="form-group">
            <label for="Description">Mô tả:</label>
            <textarea id="Description" placeholder="Mô tả chi tiết" ${disableInputs ? 'disabled' : ''} value="">${diData.Description}</textarea>
        </div>

        <div class="form-group">
            <label for="Conclusion">Kết luận:</label>
            <input id="Conclusion" type="text" placeholder="Kết luận" ${disableInputs ? 'disabled' : ''} value="${diData.Conclusion}"/>
        </div>

        <div class="form-group">
            <label for="Note">Ghi chú:</label>
            <input id="Note" type="text" placeholder="Ghi chú" ${disableInputs ? 'disabled' : ''} value="${diData.Note}"/>
        </div>
    `;


                    Swal.fire({
                        title: 'Chuẩn đoán khám bệnh',
                        html: htmlForm,
                        confirmButtonText: showSaveButton ? 'Lưu' : '',
                        showCancelButton: true,
                        showConfirmButton: showSaveButton,
                        focusConfirm: showSaveButton,
                        editable: showSaveButton,
                        preConfirm: () => {
                            debugger
                            const Name = document.getElementById('Name').value.trim();
                            const Status = document.getElementById('Status').value;
                            const Description = document.getElementById('Description').value.trim();
                            const Conclusion = document.getElementById('Conclusion').value.trim();
                            const Note = document.getElementById('Note').value.trim();

                            if (!Name || Status === "") {
                                Swal.showValidationMessage('Vui lòng nhập đầy đủ Tên và Trạng thái');
                                return false;
                            }



                            return {
                                Name,
                                Status: parseInt(Status),
                                Description,
                                Conclusion,
                                Note
                            };
                        }
                    }).then((result) => {
                        debugger
                        if (result.isConfirmed && result.value) {
                            $.ajax({
                                url: '/MedicalAppointment/addDiagnosis',
                                type: 'GET',
                                data: {
                                    mid: mid,
                                    id: id,
                                    name: result.value.Name,
                                    status: parseInt(result.value.Status),
                                    description: result.value.Description,
                                    conclusion: result.value.Conclusion,
                                    note: result.value.Note,
                                },
                                dataType: 'json',
                                contentType: 'application/json;charset=utf-8',
                                success: function (data) {
                                    if (parseInt(data.status) === 1) {
                                        messageSuccess(data.message);
                                        GetAllMedicalappointment();
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
                } else {
                    messageError(data.message);
                }
            },
            error: function (err) {
                messageError(err.responseText);
            }
        });
    } else {
        const htmlForm = `
        <style>
            .form-group {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }

            .form-group label {
                width: 120px;
                margin-right: 10px;
                font-weight: bold;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                flex: 1;
                padding: 6px 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 14px;
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            /* Làm cho các trường không thể chỉnh sửa */
            .form-group input[disabled],
            .form-group select[disabled],
            .form-group textarea[disabled] {
                background-color: #f1f1f1;  /* Màu nền để cho thấy các trường không thể chỉnh sửa */
                cursor: not-allowed;  /* Con trỏ chuột thay đổi thành kiểu không cho phép */
            }
        </style>

        <div class="form-group">
            <label for="Name">Tên chẩn đoán:</label>
            <input id="Name" type="text" placeholder="Tên chẩn đoán"  ${disableInputs ? 'disabled' : ''} />
        </div>

        <div class="form-group">
            <label for="Status">Trạng thái:</label>
            <select id="Status" ${disableInputs ? 'disabled' : ''} >
                <option value="">-- Trạng thái --</option>
                <option value="0">Chưa xử lý</option>
                <option value="1">Đã xử lý</option>
                <option value="2">Đang theo dõi</option>
            </select>
        </div>

        <div class="form-group">
            <label for="Description">Mô tả:</label>
            <textarea id="Description" placeholder="Mô tả chi tiết" ${disableInputs ? 'disabled' : ''} ></textarea>
        </div>

        <div class="form-group">
            <label for="Conclusion">Kết luận:</label>
            <input id="Conclusion" type="text" placeholder="Kết luận" ${disableInputs ? 'disabled' : ''} />
        </div>

        <div class="form-group">
            <label for="Note">Ghi chú:</label>
            <input id="Note" type="text" placeholder="Ghi chú" ${disableInputs ? 'disabled' : ''} />
        </div>
    `;


        Swal.fire({
            title: 'Chuẩn đoán khám bệnh',
            html: htmlForm,
            confirmButtonText: showSaveButton ? 'Lưu' : '',
            showCancelButton: true,
            showConfirmButton: showSaveButton,
            focusConfirm: showSaveButton,
            editable: showSaveButton,
            preConfirm: () => {
                debugger
                const Name = document.getElementById('Name').value.trim();
                const Status = document.getElementById('Status').value;
                const Description = document.getElementById('Description').value.trim();
                const Conclusion = document.getElementById('Conclusion').value.trim();
                const Note = document.getElementById('Note').value.trim();

                if (!Name || Status === "") {
                    Swal.showValidationMessage('Vui lòng nhập đầy đủ Tên và Trạng thái');
                    return false;
                }



                return {
                    Name,
                    Status: parseInt(Status),
                    Description,
                    Conclusion,
                    Note
                };
            }
        }).then((result) => {
            debugger
            if (result.isConfirmed && result.value) {
                $.ajax({
                    url: '/MedicalAppointment/addDiagnosis',
                    type: 'GET',
                    data: {
                        mid: mid,
                        id: id,
                        name: result.value.Name,
                        status: parseInt(result.value.Status),
                        description: result.value.Description,
                        conclusion: result.value.Conclusion,
                        note: result.value.Note,
                    },
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    success: function (data) {
                        if (parseInt(data.status) === 1) {
                            messageSuccess(data.message);
                            GetAllMedicalappointment();
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
    
}
var invID = parseInt($("#ivdID").val());
var ivID = parseInt($("#ivID").val());

let dataSv = [];
let dataThuoc = [];
var tbService;
var tbThuoc;
var indexTb;
var medicalID;
function getInvoice(meID, index) {
    medicalID = meID;
    $('#invoiceName').val('');
    $('#note').val('');
    indexTb = index;
    if (index == 0) {
        document.getElementById("tb").style.display = "block";
        document.getElementById("tb1").style.display = "none";
    } else {
        document.getElementById("tb1").style.display = "block";
        document.getElementById("tb").style.display = "none";
    }
    $.ajax({
        url: '/MedicalAppointment/getInvoice',
        type: 'GET',
        data: {
            invID: invID,
            ivID: ivID,
            meID: meID
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                var invd = data.lsiv;
                var th = data.lsth;

                let colunms = [
                    {
                        title: "Tên dịch vụ",
                        field: "ServiceName",
                        width: 200,
                        formatter: "textarea", hozAlign: "center",
                        bottomCalc: "count",
                        bottomCalcFormatterParams: { precision: false, }, 
                    },
                    {
                        title: "Bác sĩ",
                        field: "doctorText",
                        width: 200,
                        formatter: "textarea", hozAlign: "center",
                    },
                    {
                        title: "Số lượng",
                        field: "Quantity",
                        width: 200,
                        hozAlign: "center", 
                    },
                    {
                        title: "Giá",
                        field: "Price",
                        width: 200,
                        formatter: "money",
                        hozAlign: "center",
                        bottomCalc: "sum",
                    },
                ];

                tbService = new Tabulator("#tbSevice", {
                    data: invd,
                    maxHeight: "100%",
                    columnDefaults: {
                        vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                    },
                    layout: "fitDataStretch",
                    pagination: "local",
                    paginationSize: 5,
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


                let colunmsth = [
                    {
                        title: "Tên thuốc",
                        field: "ServiceName",
                        width: 200,
                        formatter: "textarea", hozAlign: "center",
                        bottomCalc: "count",
                        bottomCalcFormatterParams: { precision: false, },
                    },
                    {
                        title: "Số lượng",
                        field: "quantity",
                        width: 200,
                        hozAlign: "center",
                    },
                    {
                        title: "Giá",
                        field: "price",
                        width: 200,
                        formatter: "money",
                        hozAlign: "center",
                        bottomCalc: "sum",
                    },
                ];

                tbThuoc = new Tabulator("#tbThuoc", {
                    data: th,
                    maxHeight: "100%",
                    columnDefaults: {
                        vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                    },
                    layout: "fitDataStretch",
                    pagination: "local",
                    paginationSize: 5,
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
                    columns: colunmsth,
                });



            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function addService() {
    const serviceOptions = document.getElementById("serviceTemplate").innerHTML;
    const doctorOptions = document.getElementById("doctorTemplate").innerHTML;
    Swal.fire({
        title: 'Thêm dịch vụ khám',
        html: `
    <div class="container-fluid">
      <div class="row mb-2">
        <label class="col-sm-4 col-form-label">Dịch vụ</label>
        <div class="col-sm-8">
          <select id="serviceSw" class="form-select" onchange="return getPrice(this.value)">
              <option value="">--Chọn--</option>
              ${serviceOptions}
            </select>
        </div>
      </div>

      <div class="row mb-2">
        <label class="col-sm-4 col-form-label">Bác sĩ</label>
        <div class="col-sm-8">
          <select id="doctorSw" class="form-select">
            <option value="">--Chọn--</option>
            ${doctorOptions}
          </select>
        </div>
      </div>

      <div class="row mb-2">
        <label class="col-sm-4 col-form-label">Số lượng</label>
        <div class="col-sm-8">
          <input min="1" id="quantitySw" type="number" class="form-control" placeholder="Nhập số lượng" onchange="return setPrice(this.value);">
        </div>
      </div>

      <div class="row">
        <label class="col-sm-4 col-form-label">Giá</label>
        <div class="col-sm-8">
          <input id="priceSw" type="text" class="form-control" disable>
          <input id="priceSws" type="text" class="form-control" hidden>
        </div>
      </div>
    </div>
  `,
        didOpen: () => {
            $("#quantitySw").val(1);
        },
        showCancelButton: false,
        confirmButtonText: 'Thêm',
        focusConfirm: false,
        preConfirm: () => {
           
            const serviceId = $("#serviceSw").val();
            const doctorId = $("#doctorSw").val();
            const Quantity = $("#quantitySw").val();
            const Price = $("#priceSw").val();

            if (!serviceId || !doctorId || !Quantity || !Price) {
                Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
                return false;
            }

            const ServiceName = $("#serviceSw option:selected").text();
            const doctorText = $("#doctorSw option:selected").text();

            return {
                id: serviceId,
                ServiceName,
                doctorId: doctorId,
                doctorText,
                Quantity,
                Price,
            };

            return { service, doctor, quantity, price };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            debugger
            const newItem = result.value;

            // Kiểm tra xem dịch vụ đã tồn tại chưa
            const exists = dataSv.some(item => item.id === newItem.id);

            if (exists) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Dịch vụ đã tồn tại!',
                    text: 'Vui lòng chọn dịch vụ khác hoặc chỉnh sửa dịch vụ hiện có.',
                });
                return; // không thêm nữa
            }
            dataSv.push(result.value);
            tbService.setData(dataSv); 


        }
    });
}



function getPrice(id) {
    $.ajax({
        url: '/MedicalAppointment/getPrice',
        type: 'GET',
        data: {
            id: id
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                $("#priceSw").val(data.price);
                $("#priceSws").val(data.price);
                debugger
                const doctorOptions = document.getElementById("doctorTemplate").innerHTML;
                let html = '<option value="">--Chọn--</option>';
                data.doc.forEach(function (item) {
                    html += `<option value="${item.Value}">${item.Text}</option>`;
                });
                $('#doctorSw').html(html);
                console.log(doctorOptions);
            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function setPrice(number) {
    debugger
    if (number > 0) {
        var price = $("#priceSws").val();
        var priceSet = number * price;
        $("#priceSw").val(priceSet);
        
    }
}

function addThuoc() {
    const doctorOptions = document.getElementById("medicaTemplate").innerHTML;
    Swal.fire({
        title: 'Thêm thuốc kê đơn',
        html: `
    <div class="container-fluid">
      <div class="row mb-2">
        <label class="col-sm-4 col-form-label">Loại thuốc</label>
        <div class="col-sm-8">
          <select id="serviceth" class="form-select" onchange="return getPriceTh(this.value);">
            <option value="">--Chọn--</option>
            ${doctorOptions}
          </select>
        </div>
      </div>

      <div class="row mb-2">
        <label class="col-sm-4 col-form-label">Số lượng</label>
        <div class="col-sm-8">
          <input min="0" id="quantityth" type="number" class="form-control" placeholder="Nhập số lượng" onchange="return setPriceTh(this.value);">
        </div>
      </div>

      <div class="row">
        <label class="col-sm-4 col-form-label">Giá</label>
        <div class="col-sm-8">
          <input id="priceth" type="text" class="form-control" disable>
          <input id="pricethset" type="text" class="form-control" hidden>
        </div>
      </div>
    </div>
  `,
        didOpen: () => {
            if (quantityTh > 0) {
                $("#quantityth").val(1);
            } else {
                $("#quantityth").val(0);
            }
            
        },
        showCancelButton: false,
        confirmButtonText: 'Thêm',
        focusConfirm: false,
        preConfirm: () => {
            const thId = $("#serviceth").val();
            const quantity = $("#quantityth").val();
            const price = $("#priceth").val();

            if (!thId || !quantity || !price) {
                Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
                return false;
            }
            const ServiceName = $("#serviceth option:selected").text();
            return {
                id: thId,
                ServiceName,
                doctorId: 0,
                doctorText: "",
                quantity,
                price,
            };

            return { ServiceName, doctor, quantity, price };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (result.isConfirmed) {
                debugger
                const newItem = result.value;

                // Kiểm tra xem dịch vụ đã tồn tại chưa
                const exists = dataThuoc.some(item => item.id === newItem.id);

                if (exists) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Thuốc đã tồn tại!',
                        text: 'Vui lòng chọn thuốc khác hoặc chỉnh sửa thuốc hiện có.',
                    });
                    return; // không thêm nữa
                }
                dataThuoc.push(result.value);
                tbThuoc.setData(dataThuoc); 
            }
        }
    });
}
var quantityTh;

function setPriceTh(number) {
    debugger
    if (number > quantityTh) {
        Swal.showValidationMessage("⚠ Không còn đủ số lượng thuốc. Vui lòng liên hệ admin!");
        return false; // hoặc ngăn xử lý tiếp
    } else {
        Swal.showValidationMessage(`Số lượng thuốc còn ${quantityTh}`);
    }
    if (number > 1) {
        
        var p = $('#pricethset').val();
        $('#priceth').val(p * number)
    }

    
}
function getPriceTh(id) {
    $.ajax({
        url: '/MedicalAppointment/getPriceTh',
        type: 'GET',
        data: {
            id:id
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                quantityTh = data.quantity;
                if (data.quantity > 0) {
                    $('#priceth').val(data.price)
                    $('#pricethset').val(data.price)
                }
            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function saveInvoidTb1() {
    let invoiceName = $('#invoiceName').val().trim();
    let note = $('#note').val().trim();

    if (invoiceName === '') {
        Swal.fire('Thông báo', 'Vui lòng nhập tên hóa đơn', 'warning');
        $('#invoiceName').focus();
        return false;
    }

    if (note === '') {
        Swal.fire('Thông báo', 'Vui lòng nhập ghi chú', 'warning');
        $('#note').focus();
        return false;
    }

    if (indexTb == 0) {
        if (dataSv.length === 0) {
            Swal.fire('Thông báo', 'Vui lòng thêm ít nhất một dịch vụ', 'warning');
            return false;
        }

        $.ajax({
            url: '/MedicalAppointment/saveInvoidTb1',
            type: 'GET',
            data: {
                dataSv: JSON.stringify(dataSv),
                invoiceName: invoiceName,
                note: note,
                indexTb: indexTb,
                medicalID: medicalID,
            },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                if (parseInt(data.status) === 1) {
                    tbService.setData([]);
                    $('#modal_department').removeClass('show').css('display', 'none');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    messageSuccess(data.message);
                    GetAllMedicalappointment();
                } else {
                    messageError(data.message);
                }
            },
            error: function (err) {
                messageError(err.responseText);
            }
        });

    } else {
        if (dataThuoc.length === 0) {
            Swal.fire('Thông báo', 'Vui lòng thêm ít nhất một thuốc', 'warning');
            return false;
        }

        $.ajax({
            url: '/MedicalAppointment/saveInvoidTb1',
            type: 'GET',
            data: {
                dataSv: JSON.stringify(dataThuoc),
                invoiceName: invoiceName,
                note: note,
                indexTb: indexTb,
                medicalID: medicalID,
            },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                if (parseInt(data.status) === 1) {
                    tbService.setData([]);
                    $('#modal_department').removeClass('show').css('display', 'none');
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    messageSuccess(data.message);
                    GetAllMedicalappointment();
                } else {
                    messageError(data.message);
                }
            },
            error: function (err) {
                messageError(err.responseText);
            }
        });
    }
}


