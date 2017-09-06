const express = require("express");
const mustacheExpress = require("mustache-express");
const session = require("express-session");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const sessionConfig = require("./sessionConfig");
const users = require("./data.js")
const checkAuth = require("./middlewares/checkAuth");
const app = express();
const port = process.env.PORT || 8000;

app.engine("mustache", mustacheExpress());
app.set("views", "./views");
app.set("view engine", "mustache");

app.use(express.static(path.join(__dirname, "./public")));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session(sessionConfig));


app.get("/", (req, res) => {
    if (req.session.user) {
        return res.render("home", {
            user: req.session.user
        });
    } else {
        return res.render("home");
    }
});


app.get("/signup", (req, res) => {
    res.render("signup");
});


app.post("/signup", (req, res) => {
    let newUser = req.body;
    users.push(newUser);
    console.log(newUser);
    res.redirect("/login");
});


app.get("/login", (req, res) => {
    res.render("login");
});


app.post("/login", (req, res) => {
    let reqUsername = req.body.username;
    console.log(req.body.username);
    let reqPassword = req.body.password;
    console.log(req.body.password);

    let foundUser = users.find(user => user.username === reqUsername);
    console.log(foundUser);
    if (!foundUser) {
        return res.render("login", {
            errors: ["User not found"]
        });
    }

    if (foundUser.password !== reqPassword) {
        return res.render("login", {
            errors: ["Password does not match"]
        });
    }

    delete foundUser.password;
    req.session.user = foundUser;
    res.redirect("/profile");

});


app.get("/profile", checkAuth, (req, res) => {
    res.render("profile", {
        user: req.session.user
    });
});


app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});


app.listen(port, () => {
    console.log("Running on port ${port}!");
});