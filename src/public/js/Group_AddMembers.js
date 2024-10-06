document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const emailList = document.getElementById('emailList');
    const submitBtn = document.getElementById('submitBtn');
    const addMemberLink = document.querySelector('.add-member-link');
    const addMemberForm = document.querySelector('.add-member-form');
    const memberOverlay = document.querySelector('.add-member-overlay');
    const closeMemberButton = document.getElementById('closeMemberFormBtn');
    let emails = [];



    function addEmail(email) {
        if (email && !emails.includes(email)) {
            emails.push(email);
            const li = document.createElement('li');
            li.className = 'email-item';
            li.innerHTML = `  
                        <span>${email}</span>  
                        <button class="remove-btn" aria-label="Xóa ${email}">X</button>  
                    `;
            emailList.appendChild(li);
            emailInput.value = '';
        } else if (emails.includes(email)) {
            showToast('Email đã được chọn.', true);
        }
    }

    emailInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addEmail(emailInput.value.trim());
        }
    });

    emailList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const email = event.target.previousElementSibling.textContent;
            emails = emails.filter(e => e !== email);
            event.target.parentElement.remove();
        }
    });

    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        if (emails.length === 0) {
            showToast('Vui lòng chọn ít nhất một địa chỉ email.', true);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const groupId = document.querySelector('.team4').getAttribute('data-group-id');
            const response = await fetch('/api/group/addMember', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ emails, groupId })
            });

            if (!response.ok) {
                throw new Error('Lỗi mạng, mã trạng thái: ' + response.status);
            }

            const data = await response.json();
            if (data.success) {
                showToast('Thêm thành viên thành công!');
                setTimeout(() => {
                    window.location.href = `/group/detail/${groupId}`;
                }, 1000);
            } else {
                throw new Error('Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            showToast('Có lỗi xảy ra: ' + error.message, true);
        }
    });

    addMemberLink.addEventListener('click', function (event) {
        event.preventDefault();
        addMemberForm.style.display = 'block';
        memberOverlay.style.display = 'block';
    });

    memberOverlay.addEventListener('click', function () {
        addMemberForm.style.display = 'none';
        memberOverlay.style.display = 'none';
    });

    if (closeMemberButton) {
        closeMemberButton.addEventListener('click', function () {
            addMemberForm.style.display = 'none';
            memberOverlay.style.display = 'none';
        });
    }

    emailInput.focus();
});  