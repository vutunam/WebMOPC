jQuery(document).ready(function () {
    GetAllMedication();
});
var dataMedicate;
var isRole = parseInt($("#isRole").val());

// Bắt sự kiện enter khi tìm kiếm
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }

        GetAllMedication();
    }
});

function GetAllMedication() {
    $.ajax({
        url: '/Medication/GetAllMedication',
        type: 'GET',
        data: {
            keywword: $('#deKeyword').val(),
            status: parseInt($("#meStatus").val())
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            dataDepartment = data.medication;
            let colunms = [
                {
                    title: "Mã thuốc",
                    field: "Code",
                    width: 200,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Tên thuốc",
                    field: "Name",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }
                },
                {
                    title: "Trạng thái",
                    field: "Status",
                    width: 200,
                    formatter: function (cell) {
                        const value = cell.getValue();
                        switch (value) {
                            case 1:
                                return "<span class='text-success'>Còn thuốc</span>";
                            case 2:
                                return "<span class='text-danger'>Đã hết</span>";
                            case 3:
                                return "<span class='text-warning'>Order</span>";
                            default:
                                return "";
                        }
                    },
                    hozAlign: "center",
                },
                {
                    title: "Số lượng",
                    field: "Quantity",
                    width: 100,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Đơn vị",
                    field: "Unit",
                    width: 100,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Giá",
                    field: "Price",
                    width: 200,
                    formatter: "money", hozAlign: "left",
                },
                {
                    title: "Nhà cùng cấp",
                    field: "Supplier",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                {
                    title: "Liên hệ",
                    field: "SupplierContact",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                {
                    title: "Ghi chú",
                    field: "Note",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                
            ];

            if (isRole == 4) {
                colunms.unshift(
                    {
                        title: "Thao tác",
                        field: "Id",
                        width: 88,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            const rowData = cell.getRow().getData();
                            const code = rowData.Code;
                            let htmlAction = `<button data-bs-toggle="modal" data-bs-target="#modal_medication" onclick="return onEditMedication(${cell.getValue()});" class="btn btn-primary btn-sm")>
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button onclick="return onDeletedMedication(${cell.getValue()});" type="button" class="btn btn-danger btn-sm ms-1")>
                                    <i class="fas fa-trash"></i>
                                </button>`;
                            if (cell.getValue() <= 0) htmlAction = '';
                            return htmlAction;
                        },
                        download: false

                    },
                );
            }

            var table = new Tabulator("#medication_tb", {
                data: dataDepartment,
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
                            "first": "Trang đầu",
                            "last": "Trang cuối",
                            "prev": "Trước",
                            "next": "Sau",
                        }
                    }
                },
                locale: "vi",
                columns: colunms,
            });

            document.getElementById("meExportExcel").addEventListener("click", function () {
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

                table.download("xlsx", `DanhSachThuoc.xlsx`, {
                    sheetName: "DANH SÁCH THUỐC",

                    documentProcessing: function (workbook) {

                        var ws_name = workbook.SheetNames[0];
                        var ws = workbook.Sheets[ws_name];

                        ws['!cols'] = wscols;
                        ws['!autofilter'] = { ref: "A1:E1" };

                        return workbook;
                    },
                });
            });

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

document.getElementById("medPrice").addEventListener("input", function (e) {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");
    value = Number(value).toLocaleString('en-US');
    e.target.value = value;
});

function onDeletedMedication(id) {
    debugger
    if (!confirm(`Bạn có chắc chắn muốn xóa thông tin thuốc đã chọn không?`)) {
        return;
    }
    $.ajax({
        url: '/Medication/onDeletedMedication',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllMedication();
            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function onEditMedication(id) {
    $("#medicationId").val(id);

    if (id === 0) Reset();
    else $("#btn_update_medication").html('Cập nhật');
    $.ajax({
        url: '/Medication/onEditMedication',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (dt) {
            if (parseInt(dt.status) === 1) {
                debugger

                var data = dt.me; 

                $("#medCode").val(data.Code ?? "");
                $("#medName").val(data.Name ?? "");
                $("#medStatus").val(data.Status ?? 1); 
                $("#medQuantity").val(data.Quantity ?? 0);
                $("#medSupplier").val(data.Supplier ?? "");
                $("#medPrice").val(data.Price != null ? data.Price : 0);
                $("#medUnit").val(data.Unit ?? "");
                $("#medSupplierContact").val(data.SupplierContact ?? "");
                $("#medNote").val(data.Note ?? "");

            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function SaveInfor() {
    debugger
    var id = parseInt($("#medicationId").val());

    if (id === 0) {
        if (!confirm(`Bạn có chắc chắn muốn thêm mới thông tin thuốc không?`)) {
            return;
        }
    } else {
        if (!confirm(`Bạn có chắc chắn muốn thay đổi thông tin thuốc không?`)) {
            return;
        }
    }

    var meCode = $("#medCode").val();
    var meName = $("#medName").val();
    var meStatus = parseInt($("#medStatus").val());
    var meQuantity = $("#medQuantity").val();
    var meSupplier = $("#medSupplier").val();
    var mePrice = $("#medPrice").val();
    var meUnit = $("#medUnit").val();
    var meSupplierContact = $("#medSupplierContact").val();
    var meNote = $("#medNote").val();

    if (!meCode?.trim()) {
        alert("Vui lòng nhập mã thuốc!"); return;
    }

    if (!meName?.trim()) {
        alert("Vui lòng nhập tên thuốc!"); return;
    }

    if (isNaN(meStatus) || meStatus === 0) {
        alert("Vui lòng chọn trạng thái thuốc!"); return;
    }

    if (!meQuantity || parseInt(meQuantity) <= 0) {
        alert("Vui lòng nhập số lượng hợp lệ!"); return;
    }

    if (!meSupplier?.trim()) {
        alert("Vui lòng nhập tên nhà cung cấp!"); return;
    }

    if (!mePrice?.trim() || isNaN(parseFloat(mePrice.replace(/,/g, '')))) {
        alert("Vui lòng nhập giá hợp lệ!"); return;
    }

    if (!meUnit?.trim()) {
        alert("Vui lòng nhập đơn vị!"); return;
    }

    $.ajax({
        url: '/Medication/SaveInfor',
        type: 'GET',
        data: {
            id: id,
            meCode: meCode,
            meName: meName,
            meStatus: meStatus,
            meQuantity: meQuantity,
            meSupplier: meSupplier,
            mePrice: mePrice,
            meUnit: meUnit,
            meSupplierContact: meSupplierContact,
            meNote: meNote,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {

                $('#modal_medication').removeClass('show').css('display', 'none');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();

                messageSuccess(data.message);
                GetAllMedication();
            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function Reset() {
    $("#medCode").val('');
    $("#medName").val('');
    $("#medStatus").val(1);
    $("#medQuantity").val(0);
    $("#medSupplier").val('');
    $("#medPrice").val(0);
    $("#medUnit").val('');
    $("#medSupplierContact").val('');
    $("#medNote").val('');
    $("#btn_update_medication").html('Thêm mới');
}
