const fs = require("fs");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");
const { DateTime } = require("luxon");
const { HttpsProxyAgent } = require("https-proxy-agent");
const {
  questions,
  questionTypes,
  ToolName,
  METHOD,
  randPoint,
} = require("./config");

const BaseRoot = require("./ultils");

class Tools extends BaseRoot {
  constructor() {
    super();
    this.toolsName = ToolName || "";
    this.version = "1.0";
    this.waitingTime = 0;
    this.userInfo = null;
    this.gameTickets = null;
    this.randPoint = randPoint;
    this.delayTime = {
      playGame: null,
    };
    this.questionStatuses = {
      isPlayGame: false,
      isDailyClaim: false,
      isDoTask: false,
    };
  }

  async renderQuestions() {
    for (let i = 0; i < questions.length; i++) {
      const questionAnswer = await this.askQuestion(questions[i].question);
      this.questionStatuses[questions[i].type] =
        questionAnswer.toLowerCase() === "y" ?? true;
    }
  }

  processAccount = async (queryId, dataUser) => {
    this.log(colors.yellow(`====== [Process Account] ======`));
    const token = await this.login(queryId, dataUser);
    await this.sleep(1000);
    await this.buildHeader({
      Authorization: `Bearer ${this.userInfo.session}`,
    });
    if (true) {
      // Logic here
      // await this.farmingClaim();
      if (this.questionStatuses.isDailyClaim) {
        await this.dailyCheckInClaim(queryId, dataUser, token);
      }
      if (this.questionStatuses.isPlayGame) {
        await this.playGame(queryId, dataUser, token);
      }
      if (this.questionStatuses.isDoTask) {
        await this.resolveTask(queryId, dataUser, token);
      }
    }
  };

  login = async (queryId, dataUser) => {
    this.log(colors.yellow(`====== [Login] ======`));
    const header = this.getHeader();
    try {
      const request = {
        initDataRaw: queryId,
        randPoint: this.randPoint,
      };
      const response = await this.callApi(
        METHOD.POST,
        "https://api.codexfield.com/api/1/user/login",
        request,
        header
      );
      if (response && response.data.code === 0) {
        this.log(colors.green(`Login ${this.toolsName} successfully!`));
        if (response.data.data) {
          this.userInfo = response.data.data;
          this.randPoint = this.randPoint - 2;
        }
      } else {
        this.log(colors.red(`Fail to login ${this.toolsName}!`));
      }
    } catch (error) {
      this.log(colors.red(`Fail to login ${this.toolsName}!`));
    }
  };

  dailyCheckInClaim = async (queryId, dataUser, token) => {
    this.log(colors.yellow(`====== [Daily Checkin Claim] ======`));
    const header = this.getHeader();
    const request = { checkinId: "eb78eb75-3592-4253-ba07-b17678fddffa" };
    try {
      const response = await this.callApi(
        METHOD.POST,
        "https://api.codexfield.com/api/1/user/claim",
        request,
        header
      );
      if (response && response.data.code === 0) {
        this.log(colors.green(`Claim daily reward successfully!`));
        if (response.data.data) {
          this.gameTickets = response.data.data;
        }
      } else {
        this.log(colors.red(`Fail to claim daily reward!`));
      }
    } catch (error) {
      this.log(colors.red(`Fail to claim daily reward!`));
    }
  };

  watchAds = async (queryId, dataUser, token) => {
    this.log(colors.yellow(`====== [Watch Ads] ======`));
    const header = this.getHeader();
  };

  farmingClaim = async (queryId, dataUser, token) => {
    this.log(colors.yellow(`====== [Farm Claim] ======`));
    const header = this.getHeader();
  };

  playGame = async (queryId, dataUser, token) => {
    this.log(colors.yellow(`====== [Play Game] ======`));
    await this.getTicketNumber();
    await this.sleep(1000);

    if (!this.gameTickets.ticketCount || this.gameTickets.ticketCount < 1) {
      this.log(colors.red(`Have 0 ticket to play name!`));
      return;
    }
    if (this.delayTime.playGame && this.delayTime.playGame < new Date()) {
      this.log(colors.red(`It's not time to play games yet.`));
      return;
    }
    const myTicketCount = this.gameTickets.ticketCount;
    this.log(colors.yellow(`Game ticket :${myTicketCount}`));
    const header = this.getHeader(
      { "Content-Type": "application/json; charset=utf-8", Accept: "*/*" },
      ["Content-Type", "Accept"],
      false
    );
    for (let i = 0; i < myTicketCount; i++) {
      this.log(colors.yellow(`Play game ticket ${i + 1}...`));
      await this.sleep(3000);
      console.log(header);
      try {
        const point = Math.floor(Math.random() * (15 - 13 + 1)) + 13;
        const request = { Points: point };
        const response = await this.callApi(
          METHOD.POST,
          "https://api.codexfield.com/api/1/minigame/claim",
          request,
          header
        );
        console.log(response);
        if (response && response.data.code === 0) {
          this.log(colors.green(`Claim ${point} successfully!`));
          this.delayTime.playGame = this.addHoursToDatetime(4);
        } else {
          this.log(colors.red(`Fail to claim play game!`));
        }
      } catch (error) {
        console.log(error);
        this.log(colors.red(`Fail to claim play game!`));
      }
    }
  };

  getTicketNumber = async () => {
    this.log(colors.yellow(`====== [Check game tickets] ======`));
    const header = await this.getHeader();
    await this.sleep(1000);
    const request = {};
    try {
      const response = await this.callApi(
        METHOD.POST,
        "https://api.codexfield.com/api/1/minigame/ticket/count",
        request,
        header
      );
      if (response && response.data.code === 0) {
        this.log(colors.green(`Get tickets successfully!`));
        if (response.data.data) {
          this.gameTickets = response.data.data;
        }
      } else {
        this.log(colors.red(`Fail to get game tickets!`));
      }
      // await this.sleep(1000);
      // const responseConsume = await this.callApi(
      //   METHOD.POST,
      //   "https://api.codexfield.com/api/1/minigame/ticket/consume",
      //   null,
      //   header
      // );
      // if (responseConsume && responseConsume.data.code === 0) {
      //   this.log(colors.green(`Get tickets successfully!`));
      //   if (response.data.data) {
      //     this.gameTickets = response.data.data;
      //   }
      // } else {
      //   this.log(colors.red(`Fail to get game tickets!`));
      // }
      await this.sleep(1000);
    } catch (error) {
      this.log(colors.red(`Fail to get game tickets!`));
      return;
    }
  };

  resolveTask = async (queryId, dataUser, token) => {
    this.log(colors.yellow(`====== [Resolve Task] ======`));
    const header = this.getHeader();
    await this.getTasks();
    await this.sleep(1000);
    if (!this.tasks || !this.tasks?.socialTasks?.length) {
      return;
    }

    const wrkTasks = [...this.tasks.socialTasks];
    for (let i = 0; i < wrkTasks.length; i++) {
      const task = wrkTasks[i];
      this.log(colors.yellow(`Resolve task ${task.taskType}...`));
      await this.sleep(3000);
      try {
        const request = {
          taskGroup: task.taskGroup,
          claimKey: task.id,
          taskType: task.taskType,
        };
        const response = await this.callApi(
          METHOD.POST,
          "https://api.codexfield.com/api/1/task/claim",
          request,
          header
        );
        if (response && response.data.code === 0) {
          this.log(colors.green(`Claim task ${task.taskType} successfully!`));
          if (response.data.data) {
            this.userInfo.point = response.data.data;
          }
        } else {
          this.log(colors.red(`Fail claim task ${task.taskType}!`));
        }
      } catch (error) {
        this.log(colors.red(`Fail claim task ${task.taskType}!`));
      }
    }
  };

  getTasks = async () => {
    this.log(colors.yellow(`====== [Checking Tasks] ======`));
    const header = this.getHeader();
    try {
      const response = await this.callApi(
        METHOD.GET,
        "https://api.codexfield.com/api/1/task/status",
        null,
        header
      );
      console.log(response);
      if (response && response.data.code === 0) {
        this.log(colors.green(`Get tasks successfully!`));
        if (response.data.data) {
          this.tasks = response.data.data;
        }
      } else {
        this.log(colors.red(`Fail to get tasks!`));
      }
    } catch (error) {
      this.log(colors.red(`Fail to get tasks!`));
    }
  };

  connectWallets = async (queryId, dataUser, token) => {
    this.log(colors.yellow(`====== [Connect Wallets] ======`));
    const wallets = this.getWalletFile();
    if (!wallets.length) return;
    const header = this.getHeader();
  };

  buildHeaderTools = () => {
    const excludeKey = ["Accept", "Origin", "Referer"];
    const addional = {
      Origin: "https://punny.pingo.work",
      Referer: "https://punny.pingo.work/",
      Accept: "application/json, text/plain, */*",
    };
    return this.buildHeader(addional, excludeKey);
  };

  async main() {
    this.renderFiglet(this.toolsName, this.version);
    await this.sleep(1000);
    if (!fs.existsSync("auto_run.txt")) {
      await this.renderQuestions();
    } else {
      const autoRun = this.getAutoRunFile();
      const autoRunStatuses = await this.updateQuestionStatuses(
        autoRun,
        this.questionStatuses
      );
      this.questionStatuses = autoRunStatuses;
      await this.sleep(1000);
      try {
        fs.unlinkSync("auto_run.txt");
      } catch (err) {}
    }
    await this.sleep(1000);

    if (
      !this.questionStatuses.isPlayGame &&
      !this.questionStatuses.isDailyClaim &&
      !this.questionStatuses.isDoTask
    ) {
      return;
    }

    while (true) {
      const data = this.getDataFile();
      if (!data || data.length < 1) {
        this.log(
          colors.red(`Don't have any data. Please check file data.txt!`)
        );
        await this.sleep(100000);
      }
      for (let i = 0; i < data.length; i++) {
        const queryId = data[i];
        const dataUser = await this.extractUserData(queryId);
        await this.sleep(1000);
        this.log(
          colors.cyan(
            `----------------------=============----------------------`
          )
        );
        this.log(
          colors.cyan(
            `Working with user #${i + 1} | ${dataUser.user.first_name} ${
              dataUser.user.last_name
            }`
          )
        );
        await this.processAccount(queryId, dataUser);
      }
      const extraMinutes = 1 * 60;
      await this.countdown(this.waitingTime + extraMinutes);
    }
  }
}

const client = new Tools();
client.main().catch((err) => {
  client.log(err.message, "error");
});
