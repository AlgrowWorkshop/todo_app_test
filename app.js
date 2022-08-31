const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const model = require("./models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const mongo_url = process.env.MONGO_DB_URI;

mongoose.connect(mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;
const salt = +process.env.SALT;

const privateKey = process.env.PRIVATE_KEY;

app.use("/", express.static(path.join(__dirname, "todo")));

app.post("/register", async (req, res) => {
  const { name, userName, password } = req.body;

  const avtaar = +Math.floor(Math.random() * 3) + 1;

  const encryptedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = await model.create({
      username: userName,
      password: encryptedPassword,
      name: name,
      avtaar: avtaar,
    });

    res.json({ status: "true", message: "User registered." });
  } catch (err) {
    if (err.code == "11000") {
      res.json({ status: "false", message: "Username is taken." });
    } else {
      res.json({ status: "false", message: "Some error occurred." });
    }
  }
});

app.post("/login", async (req, res) => {
  const { userName, password: userPassword } = req.body;

  try {
    const databaseuser = await model.findOne({ username: userName });

    if (databaseuser) {
      var ePass = databaseuser.password;
      const isPassCorrect = await bcrypt.compare(userPassword, ePass);

      if (isPassCorrect) {
        const userToken = await jwt.sign(
          { userName: databaseuser.username, id: databaseuser._id },
          privateKey
        );

        res.json({
          status: "true",
          message: "Login Successful",
          token: userToken,
        });
      } else {
        res.json({ status: "false", message: "Password/Username incorrect !" });
      }
    } else {
      res.json({ status: "false", message: "Password/Username incorrect !" });
    }
  } catch (err) {
    res.json({
      status: "false",
      message: "Some Error Occured, try reloading the page!",
    });
  }
});

app.post("/getdetails", async (req, res) => {
  const { token } = req.body;

  try {
    const userDetails = jwt.verify(token, privateKey);
    if (userDetails) {
      const userName = userDetails.userName;

      try {
        const databaseuser = await model.findOne({ username: userName });

        res.json({
          status: "true",
          message: "user details",
          userDetails: {
            name: databaseuser.name,
            avtaar: databaseuser.avtaar,
            todos: databaseuser.todos,
          },
        });
      } catch (err) {
        res.json({ status: "false", message: "user not verified" });
      }
    } else {
      res.json({ status: "false", message: "user not verified" });
    }
  } catch (err) {
    res.json({ status: "false", message: "user auth invalid" });
  }
});

app.post("/addtodo", async (req, res) => {
  const { token, text, priority, isCompleted, date } = req.body;

  try {
    const userDetails = jwt.verify(token, privateKey);
    if (userDetails) {
      const userName = userDetails.userName;

      try {
        const addtodo = await model.updateOne(
          { username: userName },
          {
            $push: {
              todos: {
                text: text,
                priority: priority,
                isCompleted: isCompleted,
                date: date,
              },
            },
          }
        );
        const databaseuser = await model.findOne({ username: userName });

        res.json({
          status: "true",
          message: "todo added",
          userDetails: { todos: databaseuser.todos },
        }); //specific todo details to be sent
      } catch (err) {}
    } else {
      res.json({ status: "false", message: "user not verified" });
    }
  } catch (err) {
    res.json({ status: "false", message: "user not verified" });
  }
});

app.post("/deletetodo", async (req, res) => {
  const { token, id } = req.body;
  try {
    const userDetails = jwt.verify(token, privateKey);
    if (userDetails) {
      const userName = userDetails.userName;
      const idTodo = id;

      try {
        const deleteTodo = await model.updateOne(
          { $and: [{ username: userName }, { "todos._id": idTodo }] },
          {
            $pull: {
              todos: {
                _id: idTodo,
              },
            },
          }
        );
        const databaseuser = await model.findOne({ username: userName });

        res.json({
          status: "true",
          message: "todo deleted",
          userDetails: { todos: databaseuser.todos },
        }); //specific todo details to be sent
      } catch (err) {
        console.log(err);
      }
    } else {
      res.json({ status: "false", message: "user not verified" });
    }
  } catch (err) {
    res.json({ status: "false", message: "user not verified" });
  }
});

app.post("/edittodo", async (req, res) => {
  const { token, id, text, priority, date } = req.body;

  try {
    const userDetails = jwt.verify(token, privateKey);
    if (userDetails) {
      const userName = userDetails.userName;

      try {
        const editodo = await model.updateOne(
          {
            $and: [{ username: userName }, { "todos._id": id }],
          },
          {
            $set: {
              "todos.$.text": text,
              "todos.$.priority": priority,
              "todos.$.date": date,
            },
          }
        );

        const databaseuser = await model.findOne({ username: userName });

        res.json({
          status: "true",
          message: "todo edited",
          userDetails: { todos: databaseuser.todos },
        }); //specific todo details to be sent
      } catch (err) {
        console.log(err);
      }
    } else {
      res.json({ status: "false", message: "user not verified" });
    }
  } catch (err) {
    res.json({ status: "false", message: "user not verified" });
  }
});

app.post("/completedtodo", async (req, res) => {
  const { token, id, isCompleted } = req.body;

  try {
    const userDetails = jwt.verify(token, privateKey);
    if (userDetails) {
      const userName = userDetails.userName;

      try {
        const completedtodo = await model.updateOne(
          {
            $and: [{ username: userName }, { "todos._id": id }],
          },
          {
            $set: {
              "todos.$.isCompleted": isCompleted,
            },
          }
        );

        const databaseuser = await model.findOne({ username: userName });

        res.json({
          status: "true",
          message: "complted status changed",
          userDetails: { todos: databaseuser.todos },
        }); //specific todo details to be sent
      } catch (err) {
        console.log(err);
      }
    } else {
      res.json({ status: "false", message: "user not verified" });
    }
  } catch (err) {
    res.json({ status: "false", message: "user not verified" });
  }
});

// Set server to Listen State
app.listen(port, () => {
  console.log("Hey app started at " + port);
});
