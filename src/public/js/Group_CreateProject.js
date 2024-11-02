document.getElementById('createProjectBtn').addEventListener('click', function () {
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('projectForm').style.display = 'block';
});

document.getElementById('closeFormBtn').addEventListener('click', function () {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('projectForm').style.display = 'none';
});

function removeJob(button) {
    button.parentElement.remove();
}

document.getElementById('submitProjectBtn').addEventListener('click', function () {
    const projectName = document.getElementById('projectName').value.trim();
    const projectInfo = document.getElementById('projectInfo').value.trim();
    const jobsContainer = document.getElementById('jobsContainer');
    const groupId = document.querySelector('.team4').getAttribute('data-group-id');

    if (projectName === '') {
        showToast('Project Name is required!', true);
        return;
    }

    const jobs = [];
    for (let job of jobsContainer.children) {
        const jobName = job.children[0].children[1].value.trim();
        const jobDescription = job.children[1].children[1].value.trim();
        const jobDeadline = job.children[2].children[1].value;

        if (jobName === '') {
            showToast('Job Name is required!', true);
            return;
        }

        if (jobDeadline) {
            const currentDate = new Date().toISOString().split('T')[0];
            if (jobDeadline < currentDate) {
                showToast('Job Deadline must be today or later!', true);
                return;
            }
            jobs.push({ NameJob: jobName, DescriptionJob: jobDescription, approximateTime: jobDeadline });
        } else {
            jobs.push({ NameJob: jobName, DescriptionJob: jobDescription });
        }
    }

    const token = localStorage.getItem('authToken');
    const projectData = {
        NameProject: projectName,
        Progress: 0,
        InfoProject: projectInfo,
        jobs: jobs
    };
    fetch(`/project/create/${groupId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData)
    })
        .then(response => {
            if (response.ok) {
                showToast('Project created successfully!');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                showToast('Error creating project!', true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('An error occurred!', true);
        });
});

function removeMember(groupId, userId) {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
        const token = localStorage.getItem('authToken');

        fetch(`/group/removeMember/${groupId}/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.ok) {
                    showToast('Đã xóa thành viên thành công!');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);

                } else {
                    showToast('Lỗi khi xóa thành viên!', true);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Đã xảy ra lỗi!', true);
            });
    }
}