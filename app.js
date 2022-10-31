require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Hello from Au th system -LCO</h1>");
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All feilds are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(401).send("User Already exists");
    }

    const myEncPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: myEncPassword,
    });

    //token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    //update or not in db

    //handle password situation

    user.password = undefined;
    //send token or send just sucess yes and redirect - choice
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  //use try catch block or u can go with promisess
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("Feild is Required");
    }

    const user = await User.findOne({ email });

    // if (!user) {
    //   res.status(400).send("you are not registerd");
    // }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
      );
      user.token = token;
      user.password = undefined;

      // res.status(200).json(user);

      //if you want to use cookies

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // (days) - (day)-(minutes)-(sec)-(1000)
        httpOnly: true,
      };

      res.status(200).cookie("token", token, options).json({
        sucess: true,
        token,
        user,
      });
    }

    res.status(400).send("email or password is incorrect");
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.send("welcome to secret info");
});

module.exports = app;
