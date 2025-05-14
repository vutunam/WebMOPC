jQuery(document).ready(function () {
    GetAllservices();
    if (isRole != 4) {
        document.getElementById("seExportExcel").style.display = "none";
        document.getElementById("btn_add_service").style.display = "none";
    }
});
var dataService;
var deptId = 0;
var isRole = parseInt($("#isRole").val());

// Bắt sự kiện enter khi tìm kiếm
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }

        GetAllservices();
    }
});

function GetAllservices() {
    $.ajax({
        url: '/ServiceType/GetAllservices',
        type: 'GET',
        data: {
            keywword: $('#deKeyword').val(),
            deId: parseInt($("#seDepartment").val()),
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            dataService = data.se;
            let colunms = [
                {
                    title: "Mã dịch vụ",
                    field: "Code",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                {
                    title: "Tên dịch vụ",
                    field: "Name",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }
                },
                {
                    title: "Phòng khám",
                    field: "DepartmentName",
                },
                {
                    title: "Bác sĩ trưởng",
                    field: "DoctorName",
                    width: 200,
                    formatter: "textarea", hozAlign: "left",
                },
                {
                    title: "Giá/ lần khám",
                    field: "Price",
                    width: 200,
                    formatter: "money", hozAlign: "left",
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
                    },
                },
                {
                    title: "Mô tả dịch vụ",
                    field: "Description",
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
                            let htmlAction = `<button data-bs-toggle="modal" data-bs-target="#modal_service" onclick="return onEditService(${cell.getValue()});" class="btn btn-primary btn-sm")>
                    <i class="fas fa-pen"></i>
                </button>
                <button onclick="return onDeletedService(${cell.getValue()}, '${code}');" type="button" class="btn btn-danger btn-sm ms-1")>
                    <i class="fas fa-trash"></i>
                </button>`;
                            if (cell.getValue() <= 0) htmlAction = '';
                            return htmlAction;
                        },
                        download: false

                    },
                );
            }

            var table = new Tabulator("#service_tb", {
                data: dataService,
                maxHeight: "100%",
                columnDefaults: {
                    vertAlign: "middle", headerHozAlign: "center", headerWordWrap: true, hozAlign: "center"
                },
                layout: "fitDataStretch",
                pagination: "local",
                paginationSize: 10,
                groupBy: "DepartmentName",
                groupHeader: function (value) {

                    return value;
                },
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

            document.getElementById("seExportExcel").addEventListener("click", function () {
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

                table.download("xlsx", `DanhSachDichVu.xlsx`, {
                    sheetName: "DANH SÁCH DỊCH VỤ",

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

function onEditService(id) {
    $("#serviceId").val(id);

    if (id === 0) Reset();
    else $("#btn_update_service").html('Cập nhật');
    $.ajax({
        url: '/ServiceType/onEditService',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (dt) {
            if (parseInt(dt.status) === 1) {
                var seCode = dt.se.Code != null ? dt.se.Code : "";
                var seName = dt.se.Name != null ? dt.se.Name : "";
                var sePrice = dt.se.Price != null ? dt.se.Price : "";
                var seDes = dt.se.Description != null ? dt.se.Description : "";
                var seDepart = parseInt(dt.se.DepartmentId);

                $("#seCode").val(seCode);
                $("#seName").val(seName);
                $("#seDes").val(seDes);
                $("#sePrice").val(sePrice);
                $("#seDepart").val(seDepart);

            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

document.getElementById("sePrice").addEventListener("input", function (e) {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");
    value = Number(value).toLocaleString('en-US');
    e.target.value = value;
});

function onDeletedService(id, code) {
    debugger
    if (!confirm(`Bạn có chắc chắn muốn xóa thông tin dịch vụ ${code} không?`)) {
        return;
    }
    $.ajax({
        url: '/ServiceType/onDeletedService',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllservices();
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
    var id = parseInt($("#serviceId").val());

    if (id === 0) {
        if (!confirm(`Bạn có chắc chắn muốn thêm mới thông tin dịch vụ không?`)) {
            return;
        }
    } else {
        if (!confirm(`Bạn có chắc chắn muốn thay đổi thông tin dịch vụ không?`)) {
            return;
        }
    }

    var seCode = $("#seCode").val();
    var seName = $("#seName").val();
    var sePrice = $("#sePrice").val();
    var seDes = $("#seDes").val();
    var seDepart = parseInt($("#seDepart").val());

    if (seCode == "" || seCode == null) {
        alert("Vui lòng nhập mã dịch vụ!"); return;
    }

    if (seName == "" || seName == null) {
        alert("Vui lòng nhập tên dịch vụ!"); return;
    }

    if (sePrice == "" || sePrice == null) {
        alert("Vui lòng nhập giá dịch vụ!"); return;
    }

    if (seDepart == 0) {
        alert("Vui lòng chọn phòng khám!"); return;
    }

    $.ajax({
        url: '/ServiceType/SaveInfor',
        type: 'GET',
        data: {
            id: id,
            seCode: seCode,
            seName: seName,
            sePrice: sePrice,
            seDes: seDes,
            seDepart: seDepart,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {

                $('#modal_service').removeClass('show').css('display', 'none');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();

                messageSuccess(data.message);
                GetAllservices();
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
    $("#seCode").val('');
    $("#seName").val('');
    $("#seDes").val('');
    $("#sePrice").val(0);
    $("#seDepart").val(0);
    $("#btn_update_service").html('Thêm mới');
}