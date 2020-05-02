/* eslint-disable */
$(function() {
  const socket = io();
  let receiverId = '';
  const $message = $("#chat-id-1-input");
  const $chatForm = $("#chat-id-1-form");
  const $chatContainer = $(".chat-container");
  const userId = $("#tab-content-user").attr('data-user-id');
  $("#profile-details").on('submit', function(e){
    e.preventDefault();
    const formdata = $("#profile-details").serializeArray();
    var data = { id: userId };
    $(formdata).each(function(index, obj){
      data[obj.name.split('-').pop()] = obj.value;
    });
    socket.emit('save profile', data);
    return false;
  });

  $("#social-details").on('submit', function(e){
    e.preventDefault();
    const formdata = $("#social-details").serializeArray();
    var data = { id: userId, social: {} };
    $(formdata).each(function(index, obj){
      data.social[obj.name.split('-').pop()] = obj.value;
    });
    socket.emit('save profile', data);
    return false;
  });

  $("#open-settings").on('click', function(){
    $('#main-content').addClass('main-visible');
    $('#initial-chat, #chat-screen').fadeOut(function(){
      $('#user-settings').fadeIn();
    })
  });
  // set selected friend
  $('.friend').on('click', function(e) {
    const currentUser = JSON.parse($(this).attr('user-data'));
    receiverId = currentUser._id;
    $('nav.nav a').removeClass('active');
    $(this).addClass('active');
    $('#header-user-name').text(currentUser.name);
    $('#header-user-status').text(currentUser.lastSeen);
    if (currentUser.profilePic && currentUser.profilePic.url) {
      const image = new Image();
      image.src = currentUser.profilePic.url;
      image.alt = currentUser.name;
      image.class = 'avatar-img';
      $('#header-user-profile').html(image)
    } else {
      $('#header-user-profile').html(`<i class="icon-md fe-user"></i>`);
    }
    $chatContainer.html('');
    socket.emit('load mesasges', { receiverId, senderId: userId });
    $('#main-content').addClass('main-visible');
    $('#initial-chat, #user-settings').fadeOut(function(){
      $('#chat-screen').fadeIn();
      chat.scrollToEnd();
    });
  });
  $profileDropZone = document.querySelector('.dropzone-profile');
  const url = $profileDropZone.getAttribute('data-dz-url');
  const clickable = $profileDropZone.querySelector('.dropzone-button-js').id;
  const profileDropZone = new Dropzone($profileDropZone, {
    url, clickable: `#${clickable}`, paramName: 'profile'
  });
  profileDropZone.on('success', (file, response) => {
    file.previewElement.innerHTML = "";
    if (response && response.url) {
      $("img.profile-pic").attr('src', `${response.url}?v=${new Date().getTime()}`);
    }
  });
  profileDropZone.on('error', (error, message) => {
    console.log(message);
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
      this.onDisconnect();
      this.newMessage();
      this.saveProfile();
      this.chatSideBar();
    },
    newMessage: function() {
      socket.on('new message', (data) => {
        if (data.message && data.senderId === receiverId) {
          $chatContainer.append(data.message).hide().fadeIn();
        }
        if (data.profile) {
          $("#chat-1-info").html(data.profile);
          this.chatSideBar();
          this.scrollToEnd();
        }
      });
    },
    addUser: function() {
      socket.emit('add user', { userId });
    },
    saveProfile: function() {
      socket.on('save profile', (data) => {
        $("#profile-success").hide().fadeIn().fadeOut(3000);
      });
    },
    onDisconnect: function() {
      socket.on('disconnect', (data) => {
        this.addUser();
      });
    },
    chatSideBar: function() {
      [].forEach.call(document.querySelectorAll('[data-chat-sidebar-close]'), (a) => {
        a.addEventListener('click', (event) => {
          event.preventDefault();
          document.body.classList.remove('sidebar-is-open');
          [].forEach.call(document.querySelectorAll('.chat-sidebar'), (a) => {
            a.classList.remove('chat-sidebar-visible');
          });
        }, false);
      });
    },
    scrollToEnd: function() {
      if (document.querySelector('.end-of-chat')) {
        document.querySelector('.end-of-chat').scrollIntoView();
      }
    },
  };

  chat.init();
});
