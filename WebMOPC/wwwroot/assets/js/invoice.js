jQuery(document).ready(function () {
    GetAllInvoice();
});
var isRole = parseInt($("#isRole").val());
var dataDepartment
function GetAllInvoice() {
    $.ajax({
        url: '/FullInvoice/GetAllInvoice',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            dataDepartment = data.invs;
            let colunms = [
                {
                    title: "Mã hóa đơn",
                    field: "Code",
                    width: 200,
                    formatter: "textarea", hozAlign: "center", headerFilter: "input"
                },
                {
                    title: "Tên hóa đơn",
                    field: "Name",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }, headerFilter: "input"
                },
                {
                    title: "Trạng thái",
                    field: "Status",
                    width: 200,
                    formatter: function (cell, formatterParams, onRendered) {
                        const value = cell.getValue();
                        return value === 1 ? `<span style="color: orange;">Đã cọc</span>` : value === 2 ? `<span style="color: red;">Chưa thanh toán</span>` : `<span style="color: green;">Đã thanh toán</span>`;
                    },
                    hozAlign: "left",
                },
                {
                    title: "Ngày tạo",
                    width: 150,
                    field: "CreatedDate",
                    formatter: function (cell, formatterParams, onRendered) {
                        let value = cell.getValue() || '';
                        value = moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : '';
                        return value;
                    },
                    accessorDownload: function (value, data, type, component) {
                        value = value || '';
                        value = moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : '';
                        return value;
                    }, headerFilter: "input"
                },
                {
                    title: "Ghi chú",
                    field: "Note",
                    width: 200,
                    formatter: "textarea", hozAlign: "left", headerFilter: "input"
                },
            ];

            if (isRole == 4) {
                colunms.unshift(
                    {
                        title: "Thao tác",
                        field: "Id",
                        width: 150,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            const rowData = cell.getRow().getData();
                            const code = rowData.Status;
                            const id = rowData.Id;
                            let htmlAction = `
                                <button onclick="return deleteInv(${id})"  type="button" class="btn btn-danger btn-sm ms-1")>
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button onclick="return CreatQR(${id});"  type="button" class="btn btn-warning btn-sm ms-1")>
                                    <i class="fa-solid fa-qrcode"></i>
                                </button>
                                <button onclick="return printInv(${id});" data-bs-toggle="modal" data-bs-target="#modal_department" type="button" class="btn btn-info btn-sm ms-1")>
                                    <i class="fa-solid fa-print"></i>
                                </button>`;
                            if (cell.getValue() <= 0 || code == 1 || code == 3) htmlAction = `
                                <span style="color:red"><i class="fas fa-lock"></i></span>`;

                            if (code == 3) {
                                htmlAction = `
                                <button onclick="return printInv(${id});" data-bs-toggle="modal" data-bs-target="#modal_department" type="button" class="btn btn-info btn-sm ms-1")>
                                    <i class="fa-solid fa-print"></i>
                                </button>`;
                            }
                            return htmlAction;
                        },
                        download: false

                    },
                );
            }

            var table = new Tabulator("#department_tb", {
                data: dataDepartment,
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


function deleteInv(id){
    debugger
    $.ajax({
        url: '/FullInvoice/deleteInv',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllInvoice();
            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function printInv(id) {
    $.ajax({
        url: '/FullInvoice/printInv',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            var check = data.check;
            var code = data.i.Code;
            var name = data.i.Name;
            var note = data.i.Note;
            var price = data.price;
            var deCreated = moment(data.i.CreatedDate).isValid() ? moment(data.i.CreatedDate).format("YYYY-MM-DD") : '';
            var tbService;
            var tbthuoc;
            let colunms = [];
            document.getElementById("tenHoaDon").innerText = name;
            document.getElementById("codeIn").innerText = code;
            document.getElementById("noteIn").innerText = note;
            document.getElementById("priceIn").innerText = price;
            document.getElementById("dateInv").innerText = deCreated;
            debugger
            if (check == 0) {
                document.getElementById("tb1").style.display = "none";
                document.getElementById("tb2").style.display = "none";
            } else if (check == 1) {
                document.getElementById("tb1").style.display = "block";
                document.getElementById("tb2").style.display = "none";

                colunms = [
                    {
                        title: "Dịch vụ",
                        field: "Name",
                        width: 200,
                        formatter: "textarea", hozAlign: "center",
                        bottomCalc: "count",
                        bottomCalcFormatterParams: { precision: false, },
                    },
                    {
                        title: "Bác sĩ",
                        field: "FullName",
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
                tbService = new Tabulator("#tbHoadon", {
                    data: data.ind0,
                    maxHeight: "100%",
                    columnDefaults: {
                        vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                    },
                    layout: "fitDataStretch",
                    locale: "vi",
                    columns: colunms,
                    printAsHtml: true,
                    printHeader: function () {
                        return `
                            <div class="text-center">
                                <span class="m-2">CHI TIẾT HÓA ĐƠN VIỆN PHÍ PHÒNG KHÁM THĂNG LONG</span>
                            </div>
                            <h4 class="text-center">HÓA ĐƠN THANH TOÁN</h4>
                            <div><strong>Tên hóa đơn:</strong> ${name}</div>
                            <div><strong>Mã hóa đơn:</strong> ${code}</div>
                            <div><strong>Ghi chú:</strong> ${note}</div>
                            <div><strong>Tổng tiền thanh toán:</strong> ${price} VNĐ</div>
                            <div><strong>Ngày tạo:</strong> ${deCreated}</div>
                        `;
                    },
                    printFooter: function () {
                        return `
                            <div class="text-end mt-4">
                                <em>Xác nhận thanh toán</em><br>
                                <strong>Phòng khám Thăng Long</strong>
                            </div>
                        `;
                    },

                });

                document.getElementById("btn_update_department").addEventListener("click", function () {
                    tbService.print(true, true);
                });

            } else {
                var gg = data.pes0;
                document.getElementById("tb1").style.display = "none";
                document.getElementById("tb2").style.display = "block";
                colunms = [
                    {
                        title: "Tên thuốc",
                        field: "Name",
                        width: 200,
                        formatter: "textarea", hozAlign: "center",
                        bottomCalc: "count",
                        bottomCalcFormatterParams: { precision: false, },
                    },
                    {
                        title: "Đơn vị",
                        field: "Unit",
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

                tbthuoc = new Tabulator("#tbthuoc", {
                    data: data.pes0,
                    maxHeight: "100%",
                    columnDefaults: {
                        vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                    },
                    layout: "fitDataStretch",
                    locale: "vi",
                    columns: colunms,
                    printAsHtml: true,
                    printHeader: function () {
                        return `
                            <div class="text-center">
                                <span class="m-2">CHI TIẾT HÓA ĐƠN VIỆN PHÍ PHÒNG KHÁM THĂNG LONG</span>
                            </div>
                            <h4 class="text-center">HÓA ĐƠN THANH TOÁN</h4>
                            <div><strong>Tên hóa đơn:</strong> ${name}</div>
                            <div><strong>Mã hóa đơn:</strong> ${code}</div>
                            <div><strong>Ghi chú:</strong> ${note}</div>
                            <div><strong>Tổng tiền thanh toán:</strong> ${price} VNĐ</div>
                            <div><strong>Ngày tạo:</strong> ${deCreated}</div>
                        `;
                                    },
                                    printFooter: function () {
                                        return `
                            <div class="text-end mt-4">
                                <em>Xác nhận thanh toán</em><br>
                                <strong>Phòng khám Thăng Long</strong>
                            </div>
                        `;
                    },
                });
                document.getElementById("btn_update_department").addEventListener("click", function () {
                    tbthuoc.print(true, true);
                });
            }
            
            window.addEventListener("afterprint", function () {
                console.log("Đã đóng cửa sổ in");
                tbService = null;
                tbthuoc = null;
                document.getElementById("btn_update_department").onclick = null;
            });
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}



function generateRandomCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function CreatQR(id) {
    $.ajax({
        url: '/FullInvoice/CreatQR',
        type: 'GET',
        data: {
            id:id
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {

                const randomCode = generateRandomCode();
                const addInfo = `Thanh toán tiền khám bệnh - ${randomCode}`;
                const encodedAddInfo = encodeURIComponent(addInfo);

                const qrLink = `https://img.vietqr.io/image/${data.bin}-${data.stk}-print.png?amount=${data.price}&addInfo=${encodedAddInfo}`;

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
                                //const isPay = await checkPaid(randomCode, data.stk);
                                const isPay = true;
                                if (isPay) {
                                    clearInterval(interval);
                                    clearInterval(paymentChecker);
                                    Swal.close();
                                    Swal.fire('🎉 Thanh toán thành công!', 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.', 'success');
                                    pay = true;
                                    $.ajax({
                                        url: '/FullInvoice/updateParStatus',
                                        type: 'GET',
                                        data: {
                                            id: id,
                                        },
                                        dataType: 'json',
                                        contentType: 'application/json;charset=utf-8',
                                        success: function (data) {
                                            if (parseInt(data.status) === 1) {
                                                GetAllInvoice();
                                            } else {
                                                messageError(data.message);
                                            }

                                        },
                                        error: function (err) {
                                            messageError(err.responseText);
                                        }
                                    });
                                }
                            }, 5000);

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
