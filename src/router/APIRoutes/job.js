const express = require('express');
const router = express.Router();
const upload = require('../../config/multer/index.js');
const jobController = require('../../app/controllers/APIController/jobController.js');
const authorize = require('../../util/authorize.js')

router.get('/getAll', authorize(['admin']),jobController.getALl)
router.get('/getAllJobs', authorize(['admin', 'LeaderGroup', 'user']),jobController.getAllJobs)
router.get('/getAllDetailJobs', authorize(['admin', 'LeaderGroup', 'user']),jobController.getAllDetailJobs)
router.get('/getJobStagesByJobID/:jobId', authorize(['admin', 'LeaderGroup', 'user']),jobController.getJobStagesByID)
router.get('/getForRecipient', jobController.getJobsForRecipient);
router.get('/:id', jobController.getById)
router.get('/', jobController.getById)
router.post('/create',  authorize(['admin']),jobController.create)
router.post('/update/:id', authorize(['admin']), jobController.update)
router.post('/delete/:id',  authorize(['admin']),jobController.delete)
router.post('/markJobComplete/:JobID', jobController.markJobComplete)
router.post('/createForGroup',  authorize(['admin','LeaderGroup']),jobController.createJobForGroup)
router.post('/submitJob/:jobId/:stageId',upload.single('attachment'), jobController.submitJobToStage);
router.post('/updateProgress', jobController.updateJobProgress);

// api test chuyen job <-> stage
router.post('/:jobId/stages/:stageId/review', jobController.reviewStage)



module.exports = router