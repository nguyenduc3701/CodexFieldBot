const questionTypes = {
  IS_DAILY_CLAIM: "isDailyClaim",
  IS_PLAY_GAME: "isPlayGame",
  IS_DO_TASK: "isDoTask",
};

const questions = [
  // {
  //   type: questionTypes.IS_DAILY_CLAIM,
  //   question: "Do you want to claim daily?(y/n): ",
  // },
  {
    type: questionTypes.IS_PLAY_GAME,
    question: "Do you want to play game?(y/n): ",
  },
  {
    type: questionTypes.IS_DO_TASK,
    question: "Do you want to do task?(y/n): ",
  },
];

const METHOD = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
};

const ToolName = "CodexField";

const randPoint = 154;

module.exports = { questions, questionTypes, ToolName, METHOD, randPoint };
