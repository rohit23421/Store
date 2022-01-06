const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  //checking validator of express-validator for errors and handling them
  const errors = validationResult(req);

  //handling the error if there is error
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      //console.log(err);
      return res.status(400).json({
        err: "NOT ABLE TO SAVE USER IN DB",
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
  });
};

exports.signin = (req, res) => {
  //checking validator of express-validator for errors and handling them
  const errors = validationResult(req);

  const { email, password } = req.body; //destructuring the incoming data

  //handling the error if there is error
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "USER DOESN'T EXIST IN DB",
      });
    }

    //if authentication fails then do this
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "EMAIL AND PASSWORD DO NOT MATCH",
      });
    }

    //if user found in DB then signin the user
    //creation of token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    //now put token in the cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //sending a response to frontend with decontruction
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  //clearing the cookie whose name is token
  res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "ACCESS DENIED, THIS REQUIRES ADMIN PRIVILEGES",
    });
  }
  next();
};
