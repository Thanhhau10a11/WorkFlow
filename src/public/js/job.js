document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
    loadJobs();
    setupEventListeners();
});

let allJobs = []; // Biến để lưu trữ tất cả các jobs từ backend

// Hàm tải danh sách Groups từ backend
const IDUser = localStorage.getItem('IDUser');
const token = localStorage.getItem('authToken');
async function loadGroups() {
    try {
        const response = await fetch(`/api/group/get/${IDUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch groups');
        const groups = await response.json();
        console.log(groups);
        populateGroups(groups);
    } catch (error) {
        console.error('Error loading groups:', error);
        showToast('Không thể tải danh sách nhóm.', true);
    }
}

// Hàm điền các Group vào dropdown
function populateGroups(groups) {
    const groupSelect = document.getElementById('groupSelect');
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.GroupID;
        option.textContent = group.GroupName;
        groupSelect.appendChild(option);
    });
}

// Hàm tải danh sách Jobs từ backend
async function loadJobs() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('api/job/getAllJobs', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch jobs');
        const jobs = await response.json();
        allJobs = jobs;
        renderJobs(allJobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        showToast('Không thể tải danh sách công việc.', true);
    }
}


// Hàm hiển thị các Jobs lên giao diện
function renderJobs(filteredJobs) {
    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';
    if (filteredJobs.length === 0) {
        jobListings.innerHTML = '<p>Không có công việc nào được tìm thấy.</p>';
        return;
    }
    filteredJobs.forEach(job => {
        console.log(job)
        const jobCard = document.createElement('div');
        jobCard.className = 'col';
        jobCard.innerHTML = `
    <div class="card job-card">
        <div class="card-body d-flex flex-column">
            <h5 class="card-title text">${job.NameJob}</h5>
            <h6 class="card-subtitle mb-2 text-muted text-sm">Group: ${job.GroupName}</h6>
            
            <!-- Thêm trạng thái với màu sắc -->
           <div class="mb-2">
                <span style="background-color: ${job.Status === 'completed' ? '#28a745' :  // Màu xanh cho 'completed'
                            job.Status === 'pending' ? '#007bff' :  // Màu xanh dương cho 'pending'
                                job.Status === 'canceled' ? '#dc3545' :  // Màu đỏ cho 'canceled'
                                    '#f8f9fa'}; color: white; padding: 0.5em; border-radius: 0.25em;">
                    ${job.Status}
                </span>
            </div>
             <!-- Thêm ngày bắt đầu -->
             <p class="card-text flex-grow-1 text-sm">Mô tả: ${job.DescriptionJob && job.DescriptionJob.trim() !== '' ? job.DescriptionJob : 'Không có mô tả'}</p>
             <div class="mb-2">
                 <i class="bi bi-calendar me-2 text-sm"></i>
                 <span class="text-sm">Ngày bắt đầu: ${job.TimeStart ? new Date(job.TimeStart).toLocaleDateString('vi-VN') : 'Không có ngày bắt đầu'}</span>
             </div>
            
            <div class="d-flex align-items-center mb-2">
                <i class="bi bi-envelope me-2 text-sm"></i>
                <span class="text-sm">Người nhận :${job.Username}</span>
            </div>
            <div class="mb-3">
                ${Array.isArray(job.Tags) ?
                job.Tags.map(tag => `<span class="badge bg-light text-dark me-1 mb-1"><i class="bi bi-tag me-1"></i>${tag}</span>`).join('') :
                '<span class="badge bg-light text-dark me-1 mb-1">No Tags</span>'}
            </div>
            <button class="btn btn-outline-primary mt-auto bg" style="color:white;!important" onclick="finishJob(${job.IDJob})">Finish</button>
        </div>
    </div>
`;


        jobListings.appendChild(jobCard);
    });
}

// Hàm thiết lập các sự kiện cho tìm kiếm và lọc
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterJobs);
    document.getElementById('filterType').addEventListener('change', filterJobs);
    document.getElementById('filterGroup').addEventListener('change', filterJobs);
    document.getElementById('groupSelect').addEventListener('change', onGroupChange);
    document.getElementById('postJobForm').addEventListener('submit', handlePostJob);
}

// Hàm lọc Jobs dựa trên tiêu chí tìm kiếm
function filterJobs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    const filterGroup = document.getElementById('filterGroup').value;

    const filteredJobs = allJobs.filter(job =>
        (job.NameJob.toLowerCase().includes(searchTerm) ||
            job.Company.toLowerCase().includes(searchTerm) ||
            job.DescriptionJob.toLowerCase().includes(searchTerm)) &&
        (filterType === "All" || job.Type === filterType) &&
        (filterGroup === "All" || job.GroupID.toString() === filterGroup)
    );
    renderJobs(filteredJobs);
}

// Hàm xử lý khi chọn một Group
async function onGroupChange() {
    const groupId = this.value;
    if (groupId) {
        try {
            const response = await fetch(`/api/group/getDetailInGroup/${groupId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch workflows and projects');
            const data = await response.json();
            populateWorkflows(data.workflows);
            populateProjects(data.projects);
            populateMembers(data.members); // Gọi hàm điền thành viên
        } catch (error) {
            console.error('Error fetching workflows and projects:', error);
            showToast('Không thể tải workflow và project cho nhóm đã chọn.', true);
        }
    } else {
        clearDropdown('workflowSelect', 'WorkFlow');
        clearDropdown('projectSelect', 'Project');
        clearDropdown('memberSelect', 'Thành Viên'); // Xóa lựa chọn trong dropdown thành viên
    }
}


// Hàm điền Workflows vào dropdown
function populateWorkflows(workflows) {
    const workflowSelect = document.getElementById('workflowSelect');
    workflowSelect.innerHTML = '<option value="">-- Chọn WorkFlow --</option>';
    workflows.forEach(workflow => {
        const option = document.createElement('option');
        option.value = workflow.IDWorkFlow; // Thay đổi trường IDWorkFLow nếu khác
        option.textContent = workflow.Name; // Thay đổi trường Name nếu khác
        workflowSelect.appendChild(option);
    });
}

// Hàm điền Projects vào dropdown
function populateProjects(projects) {
    const projectSelect = document.getElementById('projectSelect');
    projectSelect.innerHTML = '<option value="">-- Chọn Project --</option>';
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.IdProject; // Thay đổi trường IDProject nếu khác
        option.textContent = project.NameProject; // Thay đổi trường Name nếu khác
        projectSelect.appendChild(option);
    });
}

// Hàm điền Members vào dropdown
function populateMembers(members) {
    const memberSelect = document.getElementById('memberSelect');
    memberSelect.innerHTML = '<option value="">-- Chọn Thành Viên --</option>'; // Thiết lập placeholder
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.IDUser; // Thay đổi trường IDUser nếu khác
        option.textContent = member.Username; // Thay đổi trường Name nếu khác
        memberSelect.appendChild(option);
    });
}


// Hàm xóa các lựa chọn trong dropdown
function clearDropdown(selectId, placeholder) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">-- Chọn ${placeholder} --</option>`;
}

// Hàm xử lý khi submit form tạo job
async function handlePostJob(e) {
    e.preventDefault();

    // Thu thập dữ liệu từ form
    const formData = new FormData(e.target);
    const jobData = {
        NameJob: formData.get('nameJob'),
        DescriptionJob: formData.get('descriptionJob'),
        //IDPriorityLevel: parseInt(formData.get('priorityLevel')),
        //Priority: formData.get('priority'),
        GroupID: parseInt(formData.get('groupId')),
        IDWorkFlow: parseInt(formData.get('workflowId')),
        IDProject: parseInt(formData.get('projectId')),
        //TimeStart: formData.get('timeStart') ? new Date(formData.get('timeStart')) : null,
        //TimeComplete: formData.get('timeComplete') ? new Date(formData.get('timeComplete')) : null,
        approximateTime: formData.get('approximateTime') ? new Date(formData.get('approximateTime')) : null,
        IDUserPerform: parseInt(formData.get('IDUserPerform')),

        // Các trường khác như IDUserAssign, IDCreator có thể được set tại backend
    };

    try {
        const response = await fetch('/api/job/createForGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Ensure token is valid
            },
            body: JSON.stringify(jobData) // Ensure jobData is structured correctly
        });

        if (response.ok) {
            // If the request is successful, handle the response
            const createdJob = await response.json();
            console.log('Job created:', createdJob);


            //goi ham de lay job

            //allJobs.push(createdJob);  // Add the new job to the list
            // filterJobs();  // Apply any job filters if necessary
            e.target.reset();  // Reset the form
            document.getElementById('browse-tab').click();  // Optionally switch tabs
            showToast('Job created successfully!');
            setTimeout(()=>{
                window.location.reload();
            },(1000));
        } else {
            // If the request failed, handle the error
            const errorData = await response.json();
            showToast(`Failed to create job: ${errorData.message}`, true);  // Show error message
        }
    } catch (error) {
        // If an unexpected error occurs, handle it here
        console.error('Error creating job:', error);
        showToast('An error occurred while creating the job.', true);  // Show error toast
    }

}

// Hàm để xử lý khi nhấn nút Finish (ví dụ: cập nhật status job)
async function finishJob(jobId) {
    if (!confirm('Bạn có chắc chắn muốn hoàn thành job này?')) return;

    try {
        const response = await fetch(`/api/jobs/${jobId}/finish`, { // Thay đổi URL API nếu cần
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // Cập nhật trạng thái trong biến allJobs
            const jobIndex = allJobs.findIndex(job => job.IDJob === jobId);
            if (jobIndex !== -1) {
                allJobs[jobIndex].Status = 'completed';
                filterJobs();
            }
            showToast('Job đã được hoàn thành.');
        } else {
            const errorData = await response.json();
            showToast(`Không thể hoàn thành job: ${errorData.error}`, true);
        }
    } catch (error) {
        console.error('Error finishing job:', error);
        showToast('Đã xảy ra lỗi khi hoàn thành job.', true);
    }
}