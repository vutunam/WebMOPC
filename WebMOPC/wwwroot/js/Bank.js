jQuery(document).ready(function () {
    GetAllBanks();
});
var dataBank;
var bankId = 0;
var isRole = parseInt($("#isRole").val());

// Bắt sự kiện enter khi tìm kiếm
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }

        GetAllBanks();
    }
});

function GetAllBanks() {

    $.ajax({
        url: '/Bank/GetAllBanks',
        type: 'GET',
        data: {
            keywword: $('#keyword').val(),
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            dataBank = data.bank;
            let colunms = [
                {
                    title: "Logo",
                    field: "Logo",
                    width: 200,
                    hozAlign: "center",
                    formatter: function (cell, formatterParams, onRendered) {
                        var logoUrl = cell.getValue();
                        if (logoUrl) {
                            return `<img src="${logoUrl}" alt="Logo" style="height:40px; max-width:100%;" />`;
                        }
                        return "";
                    },
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }
                },
                {
                    title: "Mã bin",
                    field: "Bin",
                    width: 100,
                    formatter: "textarea", hozAlign: "center",

                },
                {
                    title: "Mã ngân hàng",
                    field: "Code",
                    width: 150,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Tên ngắn",
                    field: "ShortName",
                    width: 150,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Tên ngân hàng",
                    field: "Name",
                    width: 400,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Tài khoản thanh toán bệnh viện",
                    field: "Stk",
                    width: 280,
                    formatter: function (cell) {
                        var value = cell.getValue();
                        if (!value || value === "" || value === "0") {
                            return `<span style="color:red;">Chưa thiết lập</span>`;
                        } else {
                            return `<span style="color:green;">${value}</span>`;
                        }
                        return value;
                    }, hozAlign: "center",
                },
            ];

            if (isRole != -1) {
                colunms.unshift(
                    {
                        title: "Thao tác",
                        field: "Id",
                        width: 120,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            const rowData = cell.getRow().getData();
                            const code = rowData.Code;
                            const stk = rowData.Stk;
                            const logo = rowData.Logo;
                            const bin = rowData.Bin;
                            const status = rowData.IsUsed;
                            let htmlAction = `<button onclick="return onEditSTK(${cell.getValue()}, '${logo}', '${stk}');" class="btn btn-primary btn-sm")>
                                    <i class="fas fa-pen"></i>
                                </button>
                                `;
                            if (stk != "0" && stk != "" && status == true) {
                                htmlAction += `
                                <button onclick="return onOpenQR('${bin}','${stk}', 'print');" type="button" class="btn btn-warning btn-sm ms-1")>
                                    <i class="fa-solid fa-qrcode"></i>
                                </button>
                                <button type="button" onclick="return isUsed(${cell.getValue()}, 0);" class="btn btn-danger btn-sm ms-1")>
                                    <i class="fa-solid fa-circle-xmark"></i>
                                </button>`;
                            }

                            if (stk != "0" && stk != "" && status == false) {
                                htmlAction += `
                                <button onclick="return onOpenQR('${bin}','${stk}', 'print');" type="button" class="btn btn-warning btn-sm ms-1")>
                                    <i class="fa-solid fa-qrcode"></i>
                                </button>
                                <button type="button" onclick="return isUsed(${cell.getValue()}, 1);" class="btn btn-success btn-sm ms-1")>
                                    <i class="fa-solid fa-circle-check"></i>
                                </button>`;
                            }
                            if (cell.getValue() <= 0) htmlAction = '';
                            return htmlAction;
                        },
                        download: false

                    },
                );
            }

            var table = new Tabulator("#bank_tb", {
                data: dataBank,
                maxHeight: "100%",
                columnDefaults: {
                    vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                },
                layout: "fitColumns",
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
            debugger

            if (!window.exportBankAttached) {
                window.exportBankAttached = true;

                document.getElementById("exportBank").addEventListener("click", function () {
                    debugger
                    var columnLayout = table.getColumnLayout();
                    let wscols = [];
                    for (var i = 0; i < columnLayout.length; i++) {
                        let item = columnLayout[i];
                        let isDownload = item.download ?? true;
                        if (!isDownload) continue;
                        let size = { wch: item.width * 0.2 };
                        wscols.push(size);
                    }

                    table.download("xlsx", `DanhSachNganHang.xlsx`, {
                        sheetName: "DANH SÁCH NGÂN HÀNG",

                        documentProcessing: function (workbook) {

                            var ws_name = workbook.SheetNames[0];
                            var ws = workbook.Sheets[ws_name];

                            ws['!cols'] = wscols;
                            ws['!autofilter'] = { ref: "A1:E1" };

                            return workbook;
                        },
                    });
                });
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function UpdateBank() {
    debugger
    $.ajax({
        url: '/Bank/UpdateBank',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllBanks();
            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function isUsed(id, use) {
    $.ajax({
        url: '/Bank/isUsed',
        type: 'GET',
        data: {
            id: id,
            use: use,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllBanks();
            } else {
                messageError(data.message);
            }
        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function onEditSTK(id, logo, stk) {
    debugger
    Swal.fire({
        html: `<img src="${logo}" alt="logo" style="height:50px;margin-bottom:10px;"><br><strong>Nhập số tài khoản ngân hàng</strong>`,
        input: 'text',
        inputValue: (stk && stk !== "0") ? stk : '',
        inputPlaceholder: 'Ví dụ: 123456789',
        showCancelButton: true,
        confirmButtonText: 'Cập nhật',
        cancelButtonText: 'Hủy',
        backdrop: false,
        inputValidator: (value) => {
            if (!value) {
                return 'Bạn phải nhập số tài khoản!';
            }
            if (isNaN(value)) {
                return 'Vui lòng chỉ nhập số!';
            }
            if (value.length <= 4) {
                return 'Số tài khoản phải nhiều hơn 4 ký tự!';
            }
            if (value.length > 19) {
                return 'Số tài khoản không được vượt quá 19 ký tự!';
            }
            return null;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            sjs = result.value;
            $.ajax({
                url: '/Bank/onEditSTK',
                type: 'GET',
                data: {
                    id: id,
                    stk: sjs,
                },
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    if (parseInt(data.status) === 1) {
                        messageSuccess(data.message);
                        GetAllBanks();
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

function onOpenQR(bin, stk, print) {
    if (!stk || isNaN(stk) || stk.length < 4 || stk.length > 19 || stk === "0") {
        messageError("Ngân hàng chưa thiết lập STK");
        return;
    }

    const qrLink = `https://img.vietqr.io/image/${bin}-${stk}-${print}.png`;

    Swal.fire({
        title: 'QR Thanh toán',
        html: `<div id="qrLoader" style="text-align:center;"><i class="fa fa-spinner fa-spin fa-2x"></i></div>`,
        showConfirmButton: false,
        allowOutsideClick: true,
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        backdrop: false,
        width: 500,
        didOpen: () => {
            const img = new Image();
            img.src = qrLink;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "500px";
            img.onload = function () {
                Swal.update({
                    html: img.outerHTML
                });
            };
        }
    });


}

//$.ajax({
//    url: '/Bank/GetTransactions',
//    type: 'GET',
//    dataType: 'json',
//    contentType: 'application/json;charset=utf-8',
//    success: function (data) {
//    },
//    error: function (err) {
//        messageError(err.responseText);
//    }
//});
//-----------------------------------------------------------------------------------------
//const API_Token = 'O1RMZQSUFNTBGSI0RHOIBTVAFMYVKU8E1AXNLL3WOSLQWEP3DEMLVEWUJ7OPZ7PQ';

//const API_GET_PAID_BASE = "https://my.sepay.vn/userapi/transactions/list";

//async function checkPaid() {

//    try {
//        const response = await fetch(API_GET_PAID_BASE, {
//            headers: {
//                Authorization: `Bearer ${API_Token}`,
//                "Content-Type": "application/json"
//            }
//        });

//        const result = await response.json();
//        console.log(result);

//    } catch (error) {
//        console.error("Lỗi khi lấy giao dịch:", error);
//    }
//}

//setInterval(checkPaid, 30000);
//-----------------------------------------------------------------------------------------
//const APIKey = 'AK_CS.bd135bb0271e11f095d88b1a1023c43c.CsaHO54YRyZhiRin0RPVKPKrGIuAJ8942ASnrNw19fl8V5ue1aqawLqYQwgE6yEBWs8UM7S1';

//const API_GET_PAID_BASE = "https://oauth.casso.vn/v2/transactions";

//function getTodayDate() {
//    const today = new Date();
//    const yyyy = today.getFullYear();
//    const mm = String(today.getMonth() + 1).padStart(2, '0');
//    const dd = String(today.getDate()).padStart(2, '0');
//    return `${yyyy}-${mm}-${dd}`;
//}

//async function checkPaid() {
//    const fromDate = getTodayDate();
//    const url = `${API_GET_PAID_BASE}?fromDate=${fromDate}&page=1&pageSize=1&sort=ASC`;

//    try {
//        const response = await fetch(url, {
//            headers: {
//                Authorization: `apikey ${APIKey}`,
//                "Content-Type": "application/json"
//            }
//        });

//        const result = await response.json();
//        console.log(result.data.records);

//    } catch (error) {
//        console.error("Lỗi khi lấy giao dịch:", error);
//    }
//}

//setInterval(checkPaid, 30000);