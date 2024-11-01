const fs = require("fs");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");
const { DateTime } = require("luxon");
const { HttpsProxyAgent } = require("https-proxy-agent");
const figlet = require("figlet");

class BaseRoot {
  constructor() {
    this.header = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      Origin: "https://wallet.codexfield.com",
      Priority: "u=1, i",
      Referer: "https://wallet.codexfield.com/",
      "Sec-Ch-Ua":
        '"Chromium";v="130", "Microsoft Edge";v="130", "Not?A_Brand";v="99", "Microsoft Edge WebView2";v="130"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
    };
  }

  getHeader = async (addional = {}, excludeKey = [], isUpdateHeader = true) => {
    if (excludeKey.length || (addional && Object.keys(addional).length)) {
      return this.buildHeader(addional, excludeKey, isUpdateHeader);
    }
    return this.header;
  };

  getHeader = async (addional = {}, excludeKey = []) => {
    if (excludeKey.length || (addional && Object.keys(addional).length)) {
      return this.buildHeader(addional, excludeKey);
    }
    return this.header;
  };

  buildHeader = async (
    addional = {},
    excludeKey = [],
    isUpdateHeader = true
  ) => {
    const cusHeader = { ...this.header };
    if (excludeKey.length) {
      excludeKey.forEach((k) => {
        if (cusHeader[k]) {
          delete cusHeader[k];
        }
      });
    }
    if (addional && Object.keys(addional).length) {
      for (const key in addional) {
        cusHeader[key] = addional[key];
      }
    }
    if (isUpdateHeader) {
      this.header = cusHeader;
    }
    return cusHeader;
  };

  getDataFile = () => {
    const data = fs
      .readFileSync("data.txt", "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);
    return data;
  };

  getWalletFile = () => {
    const wallets = fs
      .readFileSync("wallets.txt", "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);
    return wallets;
  };

  getAutoRunFile = () => {
    this.log(colors.bgCyan("Start by AutoGetQueryIds Tool"));
    console.log("\n");
    console.log("\n");
    const data = fs
      .readFileSync("auto_run.txt", "utf8")
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean);
    return data;
  };

  updateQuestionStatuses(arr, obj) {
    const wrkObj = { ...obj };
    arr.forEach((item) => {
      const [key, value] = item.split("=");
      if (value === "y" && wrkObj.hasOwnProperty(key)) {
        wrkObj[key] = true;
      }
    });
    return wrkObj;
  }

  log = (msg, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    switch (type) {
      case "success":
        console.log(`\n[${timestamp}] [*] ${msg}`.green);
        break;
      case "custom":
        console.log(`\n[${timestamp}] [*] ${msg}`.magenta);
        break;
      case "error":
        console.log(`\n[${timestamp}] [!] ${msg}`.red);
        break;
      case "warning":
        console.log(`\n[${timestamp}] [*] ${msg}`.yellow);
        break;
      default:
        console.log(`\n[${timestamp}] [*] ${msg}`.blue);
    }
  };

  renderFiglet(name, version) {
    figlet(`${name} Tools by Nguyen Duc`, function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
      }
      console.log("\n");
      console.log("\n");
      console.log(data);
      console.log("\n");
      console.log("\n");
      console.log(colors.cyan(`${name} version ${version}`));
      console.log(colors.cyan(`Author: Nguyen Duc`));
      console.log(
        colors.cyan(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
      );
      console.log(
        colors.bgRed(
          `=========[CLOSE ${name.toUpperCase()} ON DESKTOP AND MOBILE BEFORE RUNNING]=========`
        )
      );
      console.log("\n");
    });
  }

  addSecondsToDatetime = (dateTime, seconds) => {
    const date = new Date(dateTime);
    date.setTime(date.getTime() + seconds * 1000);
    return date;
  };

  addHoursToDatetime = (hours) => {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    return date;
  };

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  extractUserData(queryId) {
    const urlParams = new URLSearchParams(queryId);
    const user = JSON.parse(decodeURIComponent(urlParams.get("user")));
    return {
      auth_date: urlParams.get("auth_date"),
      hash: urlParams.get("hash"),
      query_id: urlParams.get("query_id"),
      user: user,
    };
  }

  askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }

  async callApi(method, url, request = {}, header = this.header) {
    try {
      const config = {
        method: method,
        url: url,
        headers: header,
      };
      if (request && Object.keys(request).length) {
        config.data = request;
      }
      const response = await axios(config);
      return response;
    } catch (err) {
      this.log(colors.red(`Failed to call API: ${err.message}`));
      return null; // Optional: return a fallback value or rethrow the error
    }
  }

  async countdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
      const timestamp = new Date().toLocaleTimeString();
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(
        `${colors.blue(`\n[${timestamp}] [*]`)} ${colors.white(
          `===== Wait ${i} second to continue =====`
        )}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

module.exports = BaseRoot;
