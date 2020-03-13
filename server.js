const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

var MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017";
// Database Name
const dbName = "ChatRoom";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://10.41.15.72:3000",
  allowedHeaders: "Content-Type",
  credentials: true
};

let socketID;

app.use(cors(corsOptions)); // 要在 API 的上面先使用

app.use(
  session({
    secret: "lionf2e_chatroom",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000 * 3 // 存活時間為三小時
    }
  })
);

app.get("/loginStatus", (req, res) => {
  if (req.session.user) {
    console.log("user name", req.session.user.name);
    console.log("socketID", socketID);
    console.log("session: ", req.session.user.session);

    MongoClient.connect(url, function(err, client) {
      const col = client.db(dbName).collection("users");
      col.update(
        { name: req.session.user.name },
        { $set: { socketID: socketID } },
        (err, result) => {
          if (err) throw err;
          client.close();
        }
      );
    });
    req.session.user.socketID = socketID;
    res.send({
      success: true,
      message: "登入成功！",
      data: req.session.user
    });
  } else {
    res.send({
      success: false,
      message: "尚未登入！"
    });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  console.log("user name", req.body.username);
  console.log("socketID", socketID);
  console.log("session: ", req.sessionID);

  const user = {
    session: req.sessionID,
    name: username,
    socketID: socketID
  };

  MongoClient.connect(url, function(err, client) {
    const col = client.db(dbName).collection("users");

    col.find({ name: user.name }).toArray(function(err, items) {
      if (err) {
        res.send({
          success: false,
          message: "登入失敗！"
        });
        throw err;
      }
      if (items.length !== 0) {
        col.update(
          { name: user.name },
          { $set: { login: true, socketID: socketID } },
          (err, result) => {
            if (err) throw err;
            req.session.user = {
              ...user,
              name: items[0].name
            };
            res.send({
              success: true,
              message: "登入成功！",
              data: req.session.user,
              login: true
            });
            client.close();
          }
        );
      } else {
        col.insertOne({ ...user, login: true }, function(err, result) {
          if (err) throw err;
          req.session.user = user;
          res.send({
            success: true,
            message: "登入成功！",
            data: req.session.user,
            login: true
          });
          client.close();
        });
      }
    });
  });
});

app.get("/online", (req, res) => {
  MongoClient.connect(url, function(err, client) {
    const col = client.db(dbName).collection("users");
    col.find({}).toArray(function(err, items) {
      if (err) throw err;
      res.send({
        success: true,
        message: "登入人數",
        data: items
      });
    });
  });
});

//將 express 放進 http 中開啟 Server 的 3000 port ，正確開啟後會在 console 中印出訊息
const server = require("http")
  .Server(app)
  .listen(8000, () => {
    console.log("open server!");
  });

//將啟動的 Server 送給 socket.io 處理
const io = require("socket.io")(server);

//監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
io.on("connection", socket => {
  //經過連線後在 console 中印出訊息

  socketID = socket.id;
  console.log(`success connect! socketID is "${socket.id}"`);
  //監聽透過 connection 傳進來的事件
  socket.on("online", () => {
    io.emit("online");
  });

  // 傳訊息通知 client 誰連線了

  /*回傳給除了發送者外所有連結著的 client*/
  socket.on("getMessage", message => {
    socket.broadcast.emit("getMessageLess", {
      name: message.name,
      message: message.message
    });
  });

  socket.on("disconnect", function() {
    console.log("disconnent", socketID);
    console.log(
      "--------------------------------------------------------------"
    );
  });
});
