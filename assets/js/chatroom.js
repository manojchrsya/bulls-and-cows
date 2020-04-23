/* eslint-disable */
$(function() {
  const socket = io();
  let receiverId = '';
  const $message = $("#chat-id-1-input");
  const $chatForm = $("#chat-id-1-form");
  const $chatContainer = $(".chat-container");
  const userId = $("#tab-content-user").attr('data-user-id');

  // set selected friend
  $('.friend').on('click', function() {
    const currentUser = JSON.parse($(this).attr('user-data'));
    receiverId = currentUser._id;
    $('#header-user-name').text(currentUser.name)
    $chatContainer.html('');
    socket.emit('load mesasges', { receiverId, senderId: userId });
    $('#main-content').addClass('main-visible');
    $('#initial-chat').fadeOut(function(){
      $('#chat-screen').fadeIn();
    })
  });
  $chatForm.on('submit', function(e) {
    e.preventDefault();
    const message = $message.val();
    if (!(message && receiverId)) return false;
    socket.emit('new message', { message, receiverId, senderId: userId });
    $message.val('');
  })


  const chat = {
    init: function() {
      this.addUser();
      this.newMessage();
    },
    newMessage: function() {
      socket.on('new message', (data) => {
        if (data.message && data.senderId === receiverId) {
          $chatContainer.append(data.message);
        }
      });
    },
    addUser: function() {
      socket.emit('add user', { userId });
    }
  };

  chat.init();
});
