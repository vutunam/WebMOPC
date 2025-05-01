jQuery(document).ready(function () {
    GetAllDepartments();
});
var dataDepartment;
var deptId = 0;


// Bắt sự kiện enter khi tìm kiếm
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }

        GetAllDepartments();
    }
});

function GetAllDepartments() {
    debugger
    $.ajax({
        url: '/Department/GetAllDepartments',
        type: 'GET',
        data: {
            keywword: $('#deKeyword').val(),
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            dataDepartment = data.departments;
            console.log(dataDepartment);
            var table = new Tabulator("#department_tb", {
                data: dataDepartment,
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
                            "first": "Trang đầu",
                            "last": "Trang cuối",
                            "prev": "Trước",
                            "next": "Sau",
                        }
                    }
                },
                locale: "vi",
                columns: [
                    {
                        title: "Thao tác",
                        field: "Id",
                        width: 88,
                        headerSort: false,
                        frozen: true,
                        formatter: function (cell, formatterParams) {
                            const rowData = cell.getRow().getData();
                            const code = rowData.Code;
                            let htmlAction = `<button data-bs-toggle="modal" data-bs-target="#modal_department" onclick="return onEditDepartment(${cell.getValue()});" class="btn btn-primary btn-sm")>
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button onclick="return onDeletedDepartment(${cell.getValue()}, '${code}');" type="button" class="btn btn-danger btn-sm ms-1")>
                                        <i class="fas fa-trash"></i>
                                    </button>`;
                            if (cell.getValue() <= 0) htmlAction = '';
                            return htmlAction;
                        },
                        download: false

                    },
                    {
                        title: "Mã phòng khám",
                        field: "Code",
                        width: 200,
                        formatter: "textarea", hozAlign: "left",
                    },
                    {
                        title: "Tên phòng khám",
                        field: "Name",
                        width: 200,
                        formatter: "textarea", hozAlign: "left",
                        bottomCalc: "count",
                        bottomCalcFormatterParams: { precision: false, }
                    },
                    {
                        title: "Trưởng phòng",
                        field: "DoctorHead",
                        width: 200,
                        formatter: "textarea", hozAlign: "left",
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
                        title: "Vị trí",
                        field: "Address",
                        width: 200,
                        formatter: "textarea", hozAlign: "left",
                    },
                ],
            });

            document.getElementById("deExportExcel").addEventListener("click", function () {
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

                table.download("xlsx", `DanhSachPhongKham.xlsx`, {
                    sheetName: "DANH SÁCH PHÒNG KHÁM",

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

function onEditDepartment(id) {
    $("#departId").val(id);

    if (id === 0) Reset();
    else $("#btn_update_department").html('Cập nhật');
    $.ajax({
        url: '/Department/onEditDepartment',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (dt) {
            if (parseInt(dt.status) === 1) {
                debugger
                var deCode = dt.de.Code != null ? dt.de.Code : "";
                var deName = dt.de.Name != null ? dt.de.Name : "";
                var deAddress = dt.de.Address != null ? dt.de.Address : "";
                var deHead = dt.de.HeadId != null ? parseInt(dt.de.HeadId) : 0;
                var deCreated = moment(dt.de.CreatedDate).isValid() ? moment(dt.de.CreatedDate).format("YYYY-MM-DD") : '';


                $("#deCode").val(deCode);
                $("#deName").val(deName);
                $("#deAddress").val(deAddress);
                $("#deCreatedDate").val(deCreated);
                $("#deHeadId").val(deHead);

            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function onDeletedDepartment(id, code) {
    debugger
    if (!confirm(`Bạn có chắc chắn muốn xóa thông tin phòng khám ${code} không?`)) {
        return;
    }
    $.ajax({
        url: '/Department/onDeletedDepartment',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllDepartments();
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
    var id = parseInt($("#departId").val());

    if (id === 0) {
        if (!confirm(`Bạn có chắc chắn muốn thêm mới thông tin phòng khám không?`)) {
            return;
        }
    } else {
        if (!confirm(`Bạn có chắc chắn muốn thay đổi thông tin phòng khám không?`)) {
            return;
        }
    }
    var deCode = $("#deCode").val();
    var deName = $("#deName").val();
    var deAddress = $("#deAddress").val();
    var deCreatedDate = moment($("#deCreatedDate").val()).format("YYYY-MM-DD");  
    var deHeadId = parseInt($("#deHeadId").val());

    if (deCode == "" || deCode == null) {
        alert("Vui lòng nhập mã phòng ban!"); return;
    }

    if (deName == "" || deName == null) {
        alert("Vui lòng nhập tên phòng ban!"); return;
    }

    if (deCreatedDate == "" || deCreatedDate == null) {
        alert("Vui lòng chọn ngày lập!"); return;
    }

    if (deAddress == "" || deAddress == null) {
        alert("Vui lòng nhập vị trí phòng khám!"); return;
    }

    $.ajax({
        url: '/Department/SaveInfor',
        type: 'GET',
        data: {
            id: id,
            deCode: deCode,
            deName: deName,
            deAddress: deAddress,
            deHeadId: deHeadId,
            deCreatedDate: deCreatedDate,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {

                $('#modal_department').removeClass('show').css('display', 'none');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();

                messageSuccess(data.message);
                GetAllDepartments();
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
    $("#deCode").val('');
    $("#deName").val('');
    $("#deCreatedDate").val('');
    $("#deHeadId").val(0);
    $("#btn_update_department").html('Thêm mới');
}