const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

function showToast(message, isError = false) {
    // Set message
    toastMessage.textContent = message;

    // Set background color and icon
    if (isError) {
        toast.classList.remove('toast-success');
        toast.classList.add('toast-error');
        toastIcon.className = 'fas fa-exclamation-circle'; // Icon for error
    } else {
        toast.classList.remove('toast-error');
        toast.classList.add('toast-success');
        toastIcon.className = 'fas fa-check-circle'; // Icon for success
    }

    // Show the toast
    toast.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    toast.classList.remove('show');
}
