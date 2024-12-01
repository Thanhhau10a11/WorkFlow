const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

function showToast(message, isError = false) {
    toastMessage.textContent = message;

    if (isError) {
        toast.classList.remove('toast-success');
        toast.classList.add('toast-error');
        toastIcon.className = 'fas fa-exclamation-circle'; 
    } else {
        toast.classList.remove('toast-error');
        toast.classList.add('toast-success');
        toastIcon.className = 'fas fa-check-circle'; 
    }

    toast.classList.add('show');

    setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    toast.classList.remove('show');
}
