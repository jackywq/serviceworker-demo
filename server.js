const http = require("http");
const data = require("./api.json");

const delay = (wait = 1000) => {
  let startTime = Date.now();
  while (Date.now() - startTime < wait) {}
};

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.url === "/list") {
      delay(3000);
      res.write(JSON.stringify(data));
      res.end();
    } else {
      res.end("Hello World\n");
    }
  })
  .listen(3000, () => {
    console.log("服务运行在3000端口上");
  });
