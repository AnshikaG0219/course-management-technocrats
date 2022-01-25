const passport = require("passport")
const User = require("../models/user")
const mongoose = require("mongoose")

exports.profileGET = (req, res) => {
    if (req.isAuthenticated()) {
        res.render("profile", { user: req.user });
    } else res.redirect("/login");
}
exports.editProfile = (req, res) => {
    if (req.isAuthenticated()) {
        res.render("edit-profile", { user: req.user });
    } else res.redirect("/login");
}