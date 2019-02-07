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
var betsSchema = mongoose.Schema({
    username: String,
    coins: Number,

});
var betModel = mongoose.model('placedBets', betsSchema);

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
app.post('/gamble', (req, res)=>{
    betModel.find({}, (err, results)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(results);
            toSend = {'allresults': results};
            return res.send(toSend);
        }
    });
});
app.post('/takeBet', (req,res)=>{
    console.log("this is my session", req.session.user);
    var query = {'username': req.session.user.username};
    lucky = req.body.luck;
    if(lucky == 1){
        console.log(req.body.bet);
        newData1 = req.session.user.coins + req.body.bet;
        newData2 = req.body.hiscoins - req.body.bet;
        myModel.findOneAndUpdate(query, {$set:{coins:newData1}}, {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            req.session.user.coins = newData1;
            return res.send("succesfully saved");
        });
        myModel.findOneAndUpdate({'username': req.body.owner}, {$set:{coins:newData2}}, {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            console.log("Updated the other user too!");
        });
    }
    else{
        console.log(req.body.bet);
        newData1 = req.session.user.coins - req.body.bet;
        newData2 = req.body.hiscoins + req.body.bet;
        myModel.findOneAndUpdate(query, {$set:{coins:newData1}}, {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
            req.session.user.coins = newData1;
            return res.send("succesfully saved");
        });
        myModel.findOneAndUpdate({'username': req.body.owner}, {$set:{coins:newData2}}, {upsert:true}, function(err, doc){
            if (err) return res.send(500, { error: err });
        });
    }
    betModel.deleteOne({'_id': req.body.id}, (err, result)=> {
        console.log('succesfully removed');
    });

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

app.post('/placeBet', (req,res)=>{
    //console.log(req.body.emai);
    //console.log(req.body.password);
    console.log("ohoho",req.session.user);
    if(req.session.user.coins < req.body.coins){
        return res.send({'coins': -1});
    }
    us = req.session.user.username;
    coins = req.body.coins;
    newBet = new betModel();
    newBet.username = us;
    newBet.coins = coins;
    newBet.save((err, savedObject)=>{
        console.log("hey", savedObject);
        res.send(savedObject);
    });
});
app.get('/getBet/:betid', (req,res)=> {
    betModel.findOne({'_id': req.params.betid}, (err, result)=>{
        let b = result.toJSON();
        b['currentuser'] = req.session.user.username;
        myModel.findOne({'username': b.username }, (err, results)=>{
            c = results.coins;
            b['hiscoins'] = c;
            res.send(b);
        });
    } );

});
app.get('/logout', (req,res)=>{
    req.session.destroy(err => {
        res.sendFile(path.join(__dirname, 'login.html'));
    })
})

app.listen(3000,()=>{
 console.log('connected');
        });