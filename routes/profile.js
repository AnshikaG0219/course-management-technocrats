const passport = require("passport");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.profileGET = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("profile", { user: req.user });
  } else res.redirect("/login");
};
exports.editProfile = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("edit-profile", { user: req.user });
  } else res.redirect("/login");
};
exports.updateProfile = (req, res) => {
  if(req.body.name)
  {
    const newName = req.body.name;
  }

  const ID = req.params.user_id;
  if (req.isAuthenticated()) {
    User.updateOne(
      { _id: ID },
      {name: newName},
      function (err) {
        if (!err) {
          if (req.user.role === "teacher") res.redirect(`/teacher/${ID}`);
          else if (req.user.role === "student") res.redirect(`/student/${ID}`);
        }
      }
    );
  }
};
