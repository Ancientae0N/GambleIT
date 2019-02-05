const express = require('express');
const bodyParser = require("body-parser"); // parse json
const app = express();
var session = require('express-session');
app.use(session({secret:"123e#$#$#$#", resave:false, saveUninitialized:true}));
app.use(bodyParser.json());
const path = require('path');
mongoose = require('mongoose').set('debug', true);
mongoose.connect("mongodb://localhost/users", {useNewUrlParser:true});
var mySchema = mongoose.Schema({
    username: String,
    password: String,
    coins: Number

});
var myModel = mongoose.model('gambler', mySchema);
var newGambler = new myModel();
app.get('/', (req, res)=>{
    res.redirect('/login');
});
app.get('/login', (req, res)=>{
    res.sendFile(path.join(__dirname, 'login.html'));
});
count = 0;
app.post('/login', (req, res)=>{
    success = 0;
    console.log(count);
    us = req.body.username;
    password = req.body.password;
    //console.log(email, password);
    myModel.findOne({username:us, password:password}, function(err, user){
        if(err || !user){
            res.sendStatus(404);
        }
    
        else{
            console.log("hey",user);
            req.session.user = user;
            console.log(req.session.user);
            res.sendStatus(200);
            //res.redirect('/');
        }
    });
});
app.get('/dashboard', function(req, res){
    if(!req.session.user){
        return res.status(401).send();
    }
    return res.status(200).sendFile(path.join(__dirname, 'loginPage.html'));;
});
app.get('/getUsers', (req, res)=> {
    if(!req.session.user){
        return res.status(401).send();
    }
    return(res.status(200).send(req.session.user));

})
app.get('/gamble', (req, res)=>{
    res.sendFile(path.join(__dirname, 'gamble.html'));
})
app.post('/takeBet', (req,res)=>{
    console.log("this is my session", req.session.user);
    var query = {'username': req.session.user.username};
    lucky = req.body.luck;
    if(lucky == 1){
        console.log(req.body.bet);
        newData = req.session.user.coins + req.body.bet;
        myModel.findOneAndUpdate(query, {$set:{coins:newData}}, {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            req.session.user.coins = newData;
            return res.send("succesfully saved");
        });
    }
    else{
        console.log(req.body.bet);
        newData = req.session.user.coins - req.body.bet;
        myModel.findOneAndUpdate(query, {$set:{coins:newData}}, {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            req.session.user.coins = newData;
            return res.send("succesfully saved");
        });
    }

});
app.get('/register', (req, res)=>{
    res.sendFile(path.join(__dirname, 'register.html'));
});
app.post('/register', (req,res)=>{
    //console.log(req.body.emai);
    //console.log(req.body.password);
    us = req.body.username;
    password = req.body.password;
    newGambler.username = us;
    newGambler.password = password;
    newGambler.coins = 50000
    newGambler.save((err, savedObject)=>{
        //console.log("hey", savedObject);
        res.send(savedObject);
    });
});



app.listen(3000,()=>{
 console.log('connected');
        });