jQuery(document).ready(function () {
    GetAllPositions();
});
var dataPosition;
var poId = 0;
var isRole = parseInt($("#isRole").val());

// Bắt sự kiện enter khi tìm kiếm
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
        }

        GetAllPositions();
    }
});

function GetAllPositions() {
    $.ajax({
        url: '/Position/GetAllPositions',
        type: 'GET',
        data: {
            keywword: $('#poKeyword').val(),
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            dataPosition = data.po;
            let colunms = [
                {
                    title: "Mã chức vụ",
                    field: "Code",
                    width: 200,
                    formatter: "textarea", hozAlign: "center",
                },
                {
                    title: "Tên chức vụ",
                    field: "Name",
                    width: 200,
                    formatter: "textarea", hozAlign: "center",
                    bottomCalc: "count",
                    bottomCalcFormatterParams: { precision: false, }
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
                    title: "Mô tả",
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
                            let htmlAction = `<button data-bs-toggle="modal" data-bs-target="#modal_position" onclick="return onEditPosition(${cell.getValue()});" class="btn btn-primary btn-sm")>
                    <i class="fas fa-pen"></i>
                </button>
                <button onclick="return onDeletedPosition(${cell.getValue()}, '${code}');" type="button" class="btn btn-danger btn-sm ms-1")>
                    <i class="fas fa-trash"></i>
                </button>`;
                            if (cell.getValue() <= 0) htmlAction = '';
                            return htmlAction;
                        },
                        download: false

                    },
                );
            }

            var table = new Tabulator("#position_tb", {
                data: dataPosition,
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
                columns: colunms,
            });

            document.getElementById("poExportExcel").addEventListener("click", function () {
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

                table.download("xlsx", `DanhSachChucVu.xlsx`, {
                    sheetName: "DANH SÁCH CHỨC VỤ",

                    documentProcessing: function (workbook) {

                        var ws_name = workbook.SheetNames[0];
                        var ws = workbook.Sheets[ws_name];

                        ws['!cols'] = wscols;
                        ws['!autofilter'] = { ref: "A1:D1" };

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

function onEditPosition(id) {
    $("#positionId").val(id);

    if (id === 0) Reset();
    else $("#btn_update_position").html('Cập nhật');
    $.ajax({
        url: '/Position/onEditPosition',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (dt) {
            if (parseInt(dt.status) === 1) {
                debugger
                var poCode = dt.po.Code != null ? dt.po.Code : "";
                var poName = dt.po.Name != null ? dt.po.Name : "";
                var poDescription = dt.po.Description != null ? dt.po.Description : "";

                $("#poCode").val(poCode);
                $("#poName").val(poName);
                $("#poDes").val(poDescription);

            } else {
                messageError(data.message);
            }

        },
        error: function (err) {
            messageError(err.responseText);
        }
    });
}

function onDeletedPosition(id, code) {
    debugger
    if (!confirm(`Bạn có chắc chắn muốn xóa chức vụ ${code} không?`)) {
        return;
    }
    $.ajax({
        url: '/Position/onDeletedPosition',
        type: 'GET',
        data: {
            id: id,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {
                messageSuccess(data.message);
                GetAllPositions();
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
    var id = parseInt($("#positionId").val());

    if (id === 0) {
        if (!confirm(`Bạn có chắc chắn muốn thêm mới thông tin chức vụ không?`)) {
            return;
        }
    } else {
        if (!confirm(`Bạn có chắc chắn muốn thay đổi thông tin chức vụ không?`)) {
            return;
        }
    }
    var poCode = $("#poCode").val();
    var poName = $("#poName").val();
    var poDescription = $("#poDes").val();

    if (poCode == "" || poCode == null) {
        alert("Vui lòng nhập mã chức vụ!"); return;
    }

    if (poName == "" || poName == null) {
        alert("Vui lòng nhập tên chức vụ!"); return;
    }

    if (poDescription == "" || poDescription == null) {
        alert("Vui lòng nhập mô tả!"); return;
    }


    $.ajax({
        url: '/Position/SaveInfor',
        type: 'GET',
        data: {
            id: id,
            poCode: poCode,
            poName: poName,
            poDescription: poDescription,
        },
        dataType: 'json',
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (parseInt(data.status) === 1) {

                $('#modal_position').removeClass('show').css('display', 'none');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();

                messageSuccess(data.message);
                GetAllPositions();
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
    $("#poCode").val('');
    $("#poName").val('');
    $("#poDes").val('');
    $("#btn_update_position").html('Thêm mới');
}