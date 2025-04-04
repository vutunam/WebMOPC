// Hàm hiển thị thông báo tự động và ẩn sau 1 giây
function showAlert(message, i) {
    var status;
    if (i === 1) { status = "#28a745"; }
    else status = "#dc3545";
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "50%";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translate(-50%, -50%)";
    
    alertBox.style.backgroundColor = status; 
    alertBox.style.color = "#ffffff";  
    alertBox.style.textTransform = "uppercase"; 
    alertBox.style.fontSize = "20px";  
    alertBox.style.padding = "30px"; 
    alertBox.style.border = "1px solid #c3e6cb"; 
    alertBox.style.borderRadius = "10px"; 
    alertBox.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)"; 
    alertBox.style.zIndex = "9999";
    alertBox.style.fontWeight = "bold"; 
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.style.display = "none";
    }, 2000); 
}

function messageSuccess(message) {
    Swal.fire({
        position: "center",
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 1500
    });
}

function messageError(message) {
    Swal.fire({
        position: "center",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 1500
    });
}

function messageWarning(message) {
    Swal.fire({
        position: "center",
        icon: "warning",
        title: message,
        showConfirmButton: false
    });
}


