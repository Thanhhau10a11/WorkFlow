
document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
    loadJobs();
    loadJobsForReview(); 
    setupEventListeners();
});

let allJobs = []; // Biến để lưu trữ tất cả các jobs từ backend
let jobsForReview = []; // Biến để lưu trữ tất cả các jobs cua stage backend

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
    }

     // Cập nhật số lượng công việc trong tab Browse Jobs
     const jobCountElement = document.getElementById('jobCount');
     jobCountElement.textContent = allJobs.length;
}



// Hàm tải danh sách các job để duyệt từ backend
async function loadJobsForReview() {
    try {
        const token = localStorage.getItem('authToken'); // Lấy token từ localStorage
        const response = await fetch(`/api/job/getForRecipient`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch jobs for review');
        const jobsForReview = await response.json();
        renderJobsForReview(jobsForReview); // Hiển thị các job để duyệt

        // Cập nhật số lượng công việc để duyệt trong tab Review Jobs
        const notificationReviewCountElement = document.getElementById('notificationReviewCount');
        if (notificationReviewCountElement) {
            // Cập nhật số lượng công việc trong thẻ span
            notificationReviewCountElement.textContent = jobsForReview.length;

            // Hiển thị thẻ span nếu có công việc để duyệt
            if (jobsForReview.length > 0) {
                notificationReviewCountElement.style.display = 'inline';
            } else {
                
            }
        }
    } catch (error) {
        console.error('Error loading jobs for review:', error);
    }
}


// Hàm hiển thị các job cần duyệt
function renderJobsForReview(filteredJobs) {
    const reviewJobListings = document.getElementById('reviewJobListings');
    reviewJobListings.innerHTML = ''; // Clear previous listings

    if (filteredJobs.length === 0) {
        reviewJobListings.innerHTML = '<p class="no-jobs">Không có công việc nào cần duyệt.</p>';
        return;
    }

    const jobGrid = document.createElement('div');
    jobGrid.className = 'job-grid';

    filteredJobs.forEach(jobStage => {
        const job = jobStage.JobStage_Job;
        const stage = jobStage.JobStage_Stage;

        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';

        // Khởi tạo nội dung cho card
        jobCard.innerHTML = `
            <h3 class="job-title">${job.NameJob}</h3>
            <div class="job-group"><i class="fa-solid fa-users-viewfinder"></i> Nhóm: ${stage.Workflow.WorkFlowGroup.GroupName || 'N/A'}</div>
            <div class="job-group"><i class="ph-swap"></i> WorkFlow: ${stage.Workflow.Name || 'N/A'}</div>
            <p class="job-description"><i class="bi bi-journal-text"></i> Mô tả: ${job.DescriptionJob || 'Không có mô tả'}</p>
            <div class="job-info">
                <span class="job-stage">
                    <i class="bi bi-diagram-3"></i> Giai đoạn: ${stage.NameStage || 'N/A'}
                </span>
                <span class="job-status ${jobStage.status}">
                    <i class="bi bi-check-circle"></i> ${getStatusText(jobStage.status)}
                </span>
            </div>
            <div class="job-created">
                <i class="bi bi-envelope"></i> Người gửi: ${job.Performer.Username}
            </div>
            <div class="job-created">
                <i class="bi bi-calendar"></i> Nhận lúc: ${new Date(jobStage.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div class="job-attachments mb-2">
                <i class="bi bi-file-earmark-text"></i> Mô tả nộp: ${jobStage.submissionDescription || 'Không có mô tả nộp'}
            </div>`;

        // Kiểm tra nếu có tệp đính kèm
        if (jobStage.attachmentFile) {
            jobCard.innerHTML += `
                <div>
                    <a href="${jobStage.attachmentFile}" class="btn btn-file bg white-color" target="_blank">Xem tệp</a>
                </div>`;
        }

        // Kiểm tra nếu có liên kết đính kèm
        if (jobStage.attachmentLink) {
            jobCard.innerHTML += `
                <div>
                    <a href="${jobStage.attachmentLink}" class="btn btn-link bg white-color" style="text-decoration:none" target="_blank">Xem liên kết</a>
                </div>`;
        }

        jobCard.innerHTML += `
            </div>
            <div class="job-actions">
                <button class="btn btn-approve" onclick="approveJob(${job.IDJob}, ${stage.IdStage})" ${jobStage.status !== 'pending' ? 'disabled' : ''}>Duyệt</button>
                <button class="btn btn-reject" onclick="rejectJob(${job.IDJob}, ${stage.IdStage})" ${jobStage.status !== 'pending' ? 'disabled' : ''}>Từ chối</button>
            </div>
        `;

        jobGrid.appendChild(jobCard);
    });

    reviewJobListings.appendChild(jobGrid);
}


function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Chờ duyệt';
        case 'approved': return 'Đã duyệt';
        case 'rejected': return 'Từ chối';
        default: return 'Không xác định';
    }
}



// Hàm duyệt job
async function approveJob(jobId,IdStage) {
    if (!confirm('Bạn có chắc chắn muốn duyệt job này?')) return;

    try {
        const bodyData = {
            accepted: true
        };
        const response = await fetch(`/api/job/${jobId}/stages/${IdStage}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            showToast('Job đã được duyệt.');
            setTimeout(()=>{
                window.location.reload();
            },1000)
        } else {
            const errorData = await response.json();
            showToast(`Không thể duyệt job: ${errorData.error}`, true);
        }
    } catch (error) {
        console.error('Error approving job:', error);
        showToast('Đã xảy ra lỗi khi duyệt job.', true);
    }
}

// Hàm từ chối job


async function rejectJob(jobId,IdStage) {
    if (!confirm('Bạn có chắc chắn muốn từ chối job này?')) return;

    const reason = prompt('Vui lòng nhập lý do hoàn:');
    if (!reason) {
        showToast('Lý do hoàn không được để trống.', true);
        return;
    }

    try {
        const bodyData = {
            accepted: false,
            description: reason
        };
        const response = await fetch(`/api/job/${jobId}/stages/${IdStage}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body : JSON.stringify(bodyData)
        });

        if (response.ok) {
            showToast('Job đã được hoàn.');
            setTimeout(()=>{
                window.location.reload();
            },1000)
        } else {
            const errorData = await response.json();
            showToast(`Không thể từ chối job: ${errorData.error}`, true);
        }
    } catch (error) {
        console.error('Error rejecting job:', error);
        showToast('Đã xảy ra lỗi khi từ chối job.', true);
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
        const jobCard = document.createElement('div');
        jobCard.className = 'col';
        jobCard.innerHTML = `
  <form class="card job-card position-relative" enctype="multipart/form-data">
    <div class="card-body d-flex flex-column" style="position: relative;">
      <h5 class="card-title text mb-3">${job.JobStage_Job.NameJob}</h5>
      <h6 class="card-subtitle mb-2 text-muted text-sm">Group: ${job.JobStage_Stage.Workflow.WorkFlowGroup.GroupName}</h6>
      
      <p class="card-text text-sm mb-2">Workflow: ${job.JobStage_Stage.Workflow.Name}</p>
      <p class="card-text text-sm mb-2">Stage: ${job.JobStage_Stage.NameStage}</p>

      <div class="mb-3">
        <i class="bi bi-calendar me-2 text-sm"></i>
        <span class="text-sm">Ngày bắt đầu: ${job.JobStage_Job.TimeStart ? new Date(job.JobStage_Job.TimeStart).toLocaleDateString('vi-VN') : 'Không có ngày bắt đầu'}</span>
      </div>

      <div class="d-flex align-items-center mb-3">
        <i class="bi bi-envelope me-2 text-sm"></i>
        <span class="text-sm">Người nhận: ${job.JobStage_Job.Performer.Username}</span>
      </div>

      ${job.description ? ` 
        <div class="d-flex align-items-center mb-3 p-2" style="background-color: #fff3cd; border-left: 5px solid #ffc107;">
          <i class="bi bi-info-circle me-2 text-sm" style="color: #856404;"></i>
          <span class="text-sm" style="font-weight: bold; color: #856404;">Lý do hoàn task: ${job.description}</span>
        </div>` : ''}

      <div class="mt-2">
        <label for="attachment" class="form-label">Đính kèm tệp tin:</label>
        <input type="file" class="form-control form-control-sm" id="attachment" name="attachment">
      </div>
      
      <div class="mt-1">
        <label for="attachmentLink" class="form-label">Hoặc đính kèm link:</label>
        <input type="text" class="form-control form-control-sm" id="attachmentLink" name="attachmentLink" placeholder="Nhập link">
      </div>

      <div class="mt-1">
        <label for="submissionDescription" class="form-label">Mô tả nộp:</label>
        <textarea id="submissionDescription" class="form-control form-control-sm" name="submissionDescription" placeholder="Nhập mô tả nộp (nếu có)" rows="3"></textarea>
      </div>

      <label for="progressInput" class="form-label text-sm mb-2 mt-1">Tiến trình:</label>
      <div class="progress mb-2" style="height: 15px; border-radius: 5px;">
        <div class="progress-bar bg" role="progressbar" style="width: ${job.progress || 0}%;"
             aria-valuenow="${job.JobStage_Job.Progress || 0}" aria-valuemin="0" aria-valuemax="100">
          <span style="position: absolute; left: 50%; transform: translateX(-50%); color: white;">${job.progress || 0}%</span>
        </div>
      </div>
      
      <div class="d-flex align-items-center justify-content-between mt-4">
        <input type="number" class="form-control form-control-sm w-25" id="progressInput" name="progressInput" value="${job.JobStage_Job.Progress || 0}" min="0" max="100" step="1">
        
        <button type="button" class="btn btn-sm btn-primary ms-2" onclick="updateProgress(${job.IDJob}, ${job.IDStage})">
          Cập nhật
        </button>
        
        <button type="button" class="btn btn-sm btn-success ms-2 bg" onclick="finishJob(${job.IDJob}, ${job.IDStage})">
          Hoàn thành
        </button>
      </div>

      <div class="position-absolute top-0 end-0 p-2">
        <span style="background-color: ${job.status === 'completed' ? '#28a745' : 
                      job.status === 'processing' ? '#007bff' : 
                      job.status === 'canceled' ? '#dc3545' : '#f8f9fa'}; 
                      color: white; padding: 0.5em; border-radius: 0.25em;">
          ${job.status}
        </span>
      </div>
    </div>
  </form>
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
// async function finishJob(jobId, IdStage) {  
//     if (!confirm('Bạn có chắc chắn muốn hoàn thành job này?')) return;  

//     // Lấy dữ liệu từ form  
//     const formData = new FormData();  
//     const attachmentInput = document.getElementById('attachment');  
//     const attachmentLinkInput = document.getElementById('attachmentLink');  

//     // Thêm tệp vào FormData nếu có  
//     if (attachmentInput.files.length > 0) {  
//         formData.append('attachment', attachmentInput.files[0]);  
//     }  

//     // Thêm link vào FormData nếu có  
//     if (attachmentLinkInput.value) {  
//         formData.append('attachmentLink', attachmentLinkInput.value);  
//     }  

//     // Gửi yêu cầu đến API  
//     try {  
//         const response = await fetch(`/api/job/submitJob/${jobId}/${IdStage}`, {  
//             method: 'POST',  
//             body: formData, // Gửi FormData thay vì JSON  
//             headers: {  
//                 'Authorization': `Bearer ${token}` // Xác thực  
//             }  
//         });  

//         if (response.ok) {  
//             showToast('Job đã được nộp.');  
//             setTimeout(() => {  
//                 window.location.reload();  
//             }, 1000);  
//         } else {  
//             const errorData = await response.json();  
//             showToast(`Không thể hoàn thành job: ${errorData.error}`, true);  
//         }  
//     } catch (error) {  
//         console.error('Error finishing job:', error);  
//         showToast('Đã xảy ra lỗi khi hoàn thành job.', true);  
//     }  
// }

async function finishJob(jobId, IdStage) {  
    if (!confirm('Bạn có chắc chắn muốn hoàn thành job này?')) return;  

    // Lấy dữ liệu từ form  
    const formData = new FormData();  
    const attachmentInput = document.getElementById('attachment');  
    const attachmentLinkInput = document.getElementById('attachmentLink');  
    const submissionDescriptionInput = document.getElementById('submissionDescription'); // Sử dụng ID chính xác  

    // Ghi lại các giá trị để kiểm tra  
    console.log('Attachment:', attachmentInput.files.length > 0 ? attachmentInput.files[0] : 'No attachment');  
    console.log('Attachment Link:', attachmentLinkInput.value);  
    console.log('Submission Description:', submissionDescriptionInput.value);  

    // Thêm tệp vào FormData nếu có  
    if (attachmentInput.files.length > 0) {  
        formData.append('attachment', attachmentInput.files[0]);  
    }  

    // Thêm link vào FormData nếu có  
    if (attachmentLinkInput.value) {  
        formData.append('attachmentLink', attachmentLinkInput.value);  
    }  

    // Thêm mô tả nộp vào FormData nếu có  
    if (submissionDescriptionInput.value) {  
        formData.append('submissionDescription', submissionDescriptionInput.value);  
    }  

    // Gửi yêu cầu đến API  
    try {  
        const response = await fetch(`/api/job/submitJob/${jobId}/${IdStage}`, {  
            method: 'POST',  
            body: formData, // Gửi FormData thay vì JSON  
            headers: {  
                'Authorization': `Bearer ${token}` // Xác thực  
            }  
        });  

        if (response.ok) {  
            showToast('Job đã được nộp.');  
            setTimeout(() => {  
                window.location.reload();  
            }, 1000);  
        } else {  
            const errorData = await response.json();  
            showToast(`Không thể hoàn thành job: ${errorData.error}`, true);  
        }  
    } catch (error) {  
        console.error('Error finishing job:', error);  
        showToast('Đã xảy ra lỗi khi hoàn thành job.', true);  
    }  
}

//cap nhat tien trinh 
function updateProgress(jobId, stageId) {
    if (!confirm('Bạn có chắc chắn muốn cập nhật tiến trình job này?')) return;
    const progressValue = document.getElementById('progressInput').value;
  
    if (progressValue < 0 || progressValue > 100) {
      showToast('Tiến trình phải nằm trong khoảng 0-100',true);
      return;
    }
  
    const updateData = {
      IDJob: jobId,
      IDStage: stageId,
      progress: progressValue,
    };
  
    fetch('/api/job/updateProgress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showToast('Cập nhật tiến trình thành công');
        setTimeout(() => {
            location.reload();
          }, 1000);
      } else {
        alert('Cập nhật tiến trình thất bại: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  