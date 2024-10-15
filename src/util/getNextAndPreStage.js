
const  Stage  = require('../app/models/Stage_Model'); 

async function getNextStage(stageId) {
    const nextStage = await Stage.findOne({
        where: { previousStage: stageId }, 
    });

    return nextStage;
}

async function getPreviousStage(stageId) {
    const previousStage = await Stage.findOne({
        where: { nextStage: stageId }, 
    });

    return previousStage;
}

module.exports = {
    getNextStage,
    getPreviousStage,
};
