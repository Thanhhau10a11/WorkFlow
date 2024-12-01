
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

async function checkIfStageAssigned(stageId) {
    const stage = await Stage.findOne({ where: { IdStage: stageId } });
  
    if (stage && (stage.IDRecipient || stage.EmailRecipient)) {
      return stage.IDRecipient || stage.EmailRecipient;
    }
  
    return null;
  }
  
module.exports = {
    getNextStage,
    getPreviousStage,
    checkIfStageAssigned
};
