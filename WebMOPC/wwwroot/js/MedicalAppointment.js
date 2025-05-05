

jQuery(document).ready(function () {
    SetCalendar();
});

function SetCalendar() {
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
        events: [
        ]
    })
    calendar.render()
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
                                if (isPay) {
                                    clearInterval(interval);
                                    clearInterval(paymentChecker);
                                    Swal.close();
                                    Swal.fire('🎉 Thanh toán thành công!', 'Cảm ơn bạn đã đặt lịch.', 'success');
                                    pay = true;
                                    makeCalendar(note);
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

                

            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}


function makeCalendar(note) {
    $.ajax({
        url: '/MedicalAppointment/makeCalendar',
        type: 'GET',
        data: {
            note: note,
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

