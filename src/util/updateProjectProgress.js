// updateProjectProgress.js
const {Project,Job} = require('../app/models/index');

const sequelize = require('sequelize');

async function updateProjectProgress(projectId) {
  try {
    // Tính toán số công việc đã hoàn thành và tổng số công việc trong project
    const totalJobs = await Job.count({ where: { IDProject: projectId } });
    const completedJobs = await Job.count({ where: { IDProject: projectId, Status: 'completed' } });
    
    // Cập nhật tiến trình của project dựa trên tỷ lệ công việc hoàn thành
    const progress = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
    await Project.update({ Progress: `${progress}%` }, { where: { IdProject: projectId } });
    
    console.log(`Đã cập nhật tiến trình của project ID ${projectId} thành ${progress}%`);
  } catch (error) {
    console.error('Lỗi khi cập nhật tiến trình project:', error);
  }
}

module.exports = updateProjectProgress;
