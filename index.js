const csv = require("csv-parser");
const fs = require("fs");
let noParamKey = [];
let noParamData = [];
let matchDateData = [];
let total = 0;
const transaction = async (...params) => {
  // One parameters
  if (params[0] && !params[1]) {
    // check if timestamp
    if (Number(params[0])) {
      let date = new Date(params[0] * 1000);
      let startDay = Math.floor(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime() / 1000
      );
      let endDay =
        Math.floor(
          new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime() / 1000
        ) + 86399;
      await fs
        .createReadStream("data.csv")
        .pipe(csv())
        .on("data", data => {
          total++;
          if (
            Number(startDay) <= Number(params[0]) &&
            Number(endDay) >= Number(params[0])
          ) {
            matchDateData.push(data);
          }
          if (total % 100000 === 0) {
            console.log(
              "=======================",
              total,
              "============================"
            );
            console.log(
              "start date: ",
              startDay,
              "         end date: ",
              endDay
            );
            console.log(
              "portfolio value match date " + params[0] + ":",
              matchDateData.length ? matchDateData : "[]"
            );
          }
        })
        .on("end", () => {
          matchDateData.length
            ? console.log("File read successfully!")
            : console.log("No matching results were found");
        });
    } else {
      // search follow token
      await fs
        .createReadStream("data.csv")
        .pipe(csv())
        .on("data", data => {
          total++;
          if (noParamKey.indexOf(data.token) === -1) {
            noParamKey.push(data.token);
            noParamData.push(data);
          } else {
            if (
              noParamData[noParamKey.indexOf(data.token)]?.timestamp <
              data.timestamp
            ) {
              noParamData[noParamKey.indexOf(data.token)] = { ...data };
            }
          }
          if (total % 100000 === 0) {
            console.log(
              "=======================",
              total,
              "============================"
            );
            console.log(
              "portfolio value follow token " + params[0] + ":",
              noParamData[noParamKey.indexOf(params[0])]
                ? noParamData[noParamKey.indexOf(params[0])]
                : "[]"
            );
          }
        })
        .on("end", () => {
          noParamData.length
            ? console.log("File read successfully!")
            : console.log("No matching results were found");
        });
    }
  } else if (params[1]) {
    // check when we get two parameter
    let date = new Date(params[0] * 1000);
    let startDay = Math.floor(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() /
        1000
    );
    let endDay =
      Math.floor(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime() / 1000
      ) + 86399;
    await fs
      .createReadStream("data.csv")
      .pipe(csv())
      .on("data", data => {
        total++;
        if (
          Number(startDay) <= Number(params[0]) &&
          Number(endDay) >= Number(params[0]) &&
          params[1] === data.token
        ) {
          matchDateData.push(data);
        }
        if (total % 100000 === 0) {
          console.log(
            "=======================",
            total,
            "============================"
          );
          console.log("start date: ", startDay, "         end date: ", endDay);
          console.log(
            "portfolio value match date and token " + params[0] + ":",
            matchDateData
          );
        }
      })
      .on("end", () => {
        matchDateData.length
          ? console.log("File read successfully!")
          : console.log("No matching results were found");
      });
  } else {
    // check if we don't have any parameter
    await fs
      .createReadStream("data.csv")
      .pipe(csv())
      .on("data", data => {
        total++;
        if (noParamKey.indexOf(data.token) === -1) {
          noParamKey.push(data.token);
          noParamData.push(data);
        } else {
          if (
            noParamData[noParamKey.indexOf(data.token)]?.timestamp <
            data.timestamp
          ) {
            noParamData[noParamKey.indexOf(data.token)] = { ...data };
          }
        }
        if (total % 100000 === 0) {
          console.log(
            "=======================",
            total,
            "============================"
          );
          console.log("portfolio value: ", noParamData);
        }
      })
      .on("end", () => {
        noParamData.length
          ? console.log("File read successfully!")
          : console.log("No matching results were found");
      });
  }
};

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// readline.question(
//   "Chose your option: \n1. No parameter\n2. One parameter(timestamp or token)\n3. Two parameter(timestamp and token)\n",
//   option => {
//     switch (Number(option)) {
//       case 1: {
//         transaction();
//         break;
//       }
//       case 2: {
//         readline.question("Type timestamp or token", value => {
//           transaction(value);
//         });
//       }
//       case 3: {
//         readline.question("Type timestamp:", timestamp => {
//           readline.question("Type token: ", token => {
//             transaction(timestamp, token);
//           });
//         });
//         break;
//       }
//     }
//     readline.close();
//   }
// );

const prompt = require("prompt-sync")({ sigint: true });

console.log(
  "Chose your option: \n1. Get the latest portfolio value per token\n2. Get the latest portfolio value follow token or timestamp \n3. Get the latest portfolio value follow token and timestamp\n"
);
let option = prompt("Your option:  ");
switch (option) {
  case "1": {
    transaction();
    break;
  }
  case "2": {
    let value = prompt("Type timestamp or token:  ");
    transaction(value);
    break;
  }
  case "3": {
    let timestamp = prompt("Type timestamp:  ");
    let token = prompt("Type token:  ");
    transaction(timestamp, token);
    break;
  }
}
