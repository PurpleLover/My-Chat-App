$(function () {
  var socket = io.connect('http://localhost:3000');

  var message = $("#message");
  var username = $("#username");
  var send_message = $("#send_message");
  var send_username = $("#send_username");
  var chatroom = $("#chatroom");
  var feedback = $("#feedback");
  var load_more_history = $("#load_more_history");

  var container = document.getElementById('container');
  var error = $("#error");
  var users_list = $("#users_list");
  var change_username = $("#change_username");


  send_message.click(() => {
    socket.emit('new_message', { message: message.val(), created: new Date() }, data => {
      $("<p class='error'>" + data + "</p>").insertBefore(feedback);
    });
  });

  socket.on('new_message', data => {
    let chatroom = document.getElementById('chatroom');
    let isScrolledToBottom = chatroom.scrollHeight - chatroom.clientHeight <= chatroom.scrollTop + 1;
    feedback.html('');
    message.val('');
    _displayMessages(data, 'message');
    if (isScrolledToBottom) chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
  });

  _displayMessages = (data, type) => {
    $("<p class='" + type + "'><b>" + data.username + ":</b> " + data.message + "</p>").insertBefore(feedback);
  }

  send_username.click(() => {
    socket.emit('change_username', { username: username.val() }, data => {
      if (data) {
        change_username.hide();
      } else {
        error.html("The username already taken, try again.");
      }
    });
    send_username.val('');
  });

  socket.on('change_username', data => {
    // console.log(data);
    let html = '';
    for (let i = 0; i < data.length; i++) {
      html += "<button id='private_chat"+i+"' type='button'>" + data[i] + "</button>" + "<br/>";
      //users_list.append("<p>"+data[i]+"</p>");
    }
    users_list.html(html);

    var private_chat = $("#private_chat0");

    private_chat.click(()=>{
      socket.emit('join_private_room', {usr: 'solo'});
    });
  });

  socket.on('new_mes', (data) => {
    alert(data);
  });

  message.bind("keypress", () => {
    socket.emit('typing');
  });

  socket.on('typing', data => {
    let chatroom = document.getElementById('chatroom');
    let isScrolledToBottom = chatroom.scrollHeight - chatroom.clientHeight <= chatroom.scrollTop + 1;
    feedback.html("<p><i>" + data.username + " is typing...</i></p>");
    if (isScrolledToBottom) chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
  });

  socket.on('load_message_history', data => {
    for (let i = data.length - 1; i > -1; --i) {
      _displayMessages(data[i], 'message');
    }
  });
  let countHistoryPress = 1;
  load_more_history.click(() => {
    socket.emit('load_more_message_history', countHistoryPress);
    ++countHistoryPress;
  });

  socket.on('load_more_message_history', data => {
    for (let i = 0; i < data.length; ++i) {
      _displayEarlierMessage(data[i], 'message');
    }
  });

  _displayEarlierMessage = (data, type) => {
    $("<p class='" + type + "'><b>" + data.username + ":</b> " + data.message + "</p>").insertBefore($(".message")[0]);
  }

  socket.on('whisper', data => {
    let chatroom = document.getElementById('chatroom');
    let isScrolledToBottom = chatroom.scrollHeight - chatroom.clientHeight <= chatroom.scrollTop + 1;
    feedback.html('');
    message.val('');
    _displayMessages(data, 'message whisper');
    if (isScrolledToBottom) chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
  });


});