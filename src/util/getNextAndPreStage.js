
const  Stage  = require('../app/models/Stage_Model'); 

async function getNextStage(stageId) {
    const nextStage = await Stage.findOne({
        where: { previousStage: stageId }, 
    });

    if (!nextStage) {
        throw new Error('Stage tiếp theo không tìm thấy');
    }

    return nextStage;
}

async function getPreviousStage(stageId) {
    const previousStage = await Stage.findOne({
        where: { nextStage: stageId }, 
    });

    if (!previousStage) {
        throw new Error('Stage trước đó không tìm thấy');
    }

    return previousStage;
}

module.exports = {
    getNextStage,
    getPreviousStage,
};
