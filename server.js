const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index');
});

server = app.listen(3000, () => {
  console.log('App listening to port 3000');
});

mongoose.connect('mongodb://localhost/task4', (err) => {
  if (err) {
    console.log(err);
  } else console.log('Connection to MongoDB was successed!');
});

const Chat = require('./models/chat');

const io = require('socket.io')(server);
let users = {};
io.on('connection', socket => {
  Chat.find()
    .limit(15)
    .sort("-created")
    .exec((err, docs) => {
      if (err) {
        throw err;
      }
      socket.emit('load_message_history', docs);
    });

  socket.on('load_more_message_history', (factor = 1) => {
    let skippedMessages = 15 * factor;
    Chat.find()
    .skip(skippedMessages)
    .limit(15)
    .sort("-created")
    .exec((err, docs) => {
      if (err) {
        throw err;
      }
      socket.emit('load_more_message_history', docs);
    });
  })

  console.log('A user has connected!');

  socket.username = 'Anonymous';

  socket.on('change_username', (data, callback) => {
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      console.log(data)
      socket.username = data.username;
      console.log(socket.username);
      users[socket.username] = socket;
      _updateUsername();
    }
  });

  console.log(socket.username);

  const _updateUsername = () => {
    io.sockets.emit('change_username', Object.keys(users));
  }

  socket.on('new_message', (data, callback) => {
    console.log(data.message);
    var msg = data.message.trim();
    if (msg.substr(0, 3) === '/w ') {
      msg = msg.substr(3);
      const ind = msg.indexOf(' ');
      if (ind !== -1) {
        var name = msg.substr(0, ind);
        var msg = msg.substr(ind + 1);
        if (name in users) {
          const newMessage = new Chat({ username: socket.username, message: msg });
          users[name].emit('whisper', { message: msg, username: socket.username });
        } else {
          callback('Error: Enter a valid user');
        }
      } else {
        callback('Error: Please enter a message for your whisper');
      }
    } else {
      const newMessage = new Chat({ username: socket.username, message: msg, created: data.created });
      console.log(newMessage);
      newMessage.save((err) => {
        if (err) {
          throw err;
        }
        io.sockets.emit('new_message', { message: msg, username: socket.username, created: data.created });
      });
    }
  });

  socket.on('typing', data => {
    socket.broadcast.emit('typing', { username: socket.username });
  });

  socket.on('disconnect', data => {
    if (!socket.username) return;
    delete (users[socket.username]);
    _updateUsername();
  });

  socket.on('join_private_room', (data) => {
    socket.join(data.usr);
  });
  io.sockets.in('solo').emit('new_mes', {msg: 'hello'});
});

const User = require('./models/user');

app.route('/register')
.post((req, res, next) => {
  User.findOne({username: req.body.username}, (err, foundUsers) => {
    
    if (err) {
      console.log('Error: ' + err);
      next(err);
    }
    else if (foundUsers) {
      console.log('User already existed');
      // res.redirect('/dangnhap');
      res.json({Message: 'Existed'});
    }
    else {
      console.log('New User');
      const newUser = new User({
        username: req.body.username,
        password: req.body.password
      });
      newUser.save((err, doc)=>{
        if (err) next(err);
        else next(null, doc);
      });
      res.json({Message: 'Success'});
      // res.redirect('/profile');
    }
  });
});

app.post('/login', (req, res, next) => {

  console.log(req.body)
  User.findOne({
    username: req.body.username,
    password: req.body.password
  }, (err, foundUsers) => {
    if (err) {
      return next(err);
    } else if (foundUsers) {
      foundUsers.isOnline = true;
      foundUsers.save((err,updatedUser)=>{
        if (err) throw err;
        next(null, updatedUser);
      })
      console.log('Login Sucess');
      res.json({Message: 'success'})
      // res.redirect('/profile');
    } else {
      console.log('Login Fail!');
      res.json({Message: 'error'});
      //res.redirect('/');
    }
  });
});

app.post('/logout', (req,res,next)=>{

})

app.post('/reset-password', (req,res,next)=>{
  User.findOneAndUpdate({username: req.body.username}, {$set: {password: req.body.password}}, {new: true}, (err, updatedUser) => {
    if (err) next(err);
    else next(null, updatedUser);
  });
});

app.get('/dangnhap', (req, res) => {
  res.render('loginPage');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/private-chat/', (req,res) => {
  res.render('conversation');
});

app.get('/online-users', (req,res)=>{
  User.find({isOnline:true})
  .limit(10)
  .exec((err, foundUsers)=>{
    if (err) console.log(err);
    else {
      console.log(foundUsers);
      res.json(foundUsers);
    }
  })
});

app.get('/search', (req, res) => {
  User.find({username: req.body.username})
  .exec((err, foundUsers)=> {
    if (err) throw err;
    else if (!foundUsers) {
      res.json({Message: 'Not Found'})
    } else {
      res.json({
        username: foundUsers.username, 
        password: foundUsers.password, 
        isOnline: foundUsers.isOnline
      });
    }
  })
})