

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar')
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'vi',
        themeSystem: 'bootstrap5',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
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
        dayMaxEvents: true,
        editable: true,
        droppable: true,
        events: [
        ]
    })
    calendar.render()
})

document.addEventListener("DOMContentLoaded", function () {
    const startTime = document.getElementById("startTime");
    const endTime = document.getElementById("endTime");

    // Lấy thời gian hiện tại + 1 giờ
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const minStart = now.toISOString().slice(0, 16);

    // Thiết lập min cho startTime
    startTime.min = minStart;
    startTime.value = minStart;

    // Thiết lập min cho endTime theo startTime
    endTime.min = minStart;
    endTime.value = minStart;

    // Khi người dùng chọn lại thời gian bắt đầu
    startTime.addEventListener("change", function () {
        const startVal = startTime.value;
        endTime.min = startVal;

        // Nếu endTime đang nhỏ hơn startTime thì tự chỉnh lại
        if (endTime.value < startVal) {
            endTime.value = startVal;
        }
    });
});

jQuery(document).ready(function () {

});


