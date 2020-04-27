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
    $('#header-user-name').text(currentUser.name)
    $chatContainer.html('');
    socket.emit('load mesasges', { receiverId, senderId: userId });
    $('#main-content').addClass('main-visible');
    $('#initial-chat, #user-settings').fadeOut(function(){
      $('#chat-screen').fadeIn();
    })
    $('.chat-content').animate({
      scrollTop: 1000
    }, 800);
  });
  $profileDropZone = document.querySelector('.dropzone-profile');
  const url = $profileDropZone.getAttribute('data-dz-url');
  const clickable = $profileDropZone.querySelector('.dropzone-button-js').id;
  const profileDropZone = new Dropzone($profileDropZone, {
    url, clickable: `#${clickable}`
  });
  profileDropZone.on('success', (file) => {
    file.previewElement.innerHTML = "";

  });
  profileDropZone.on('error', (error, message) => {
    console.log(message);
  });
  // [].forEach.call(document.querySelectorAll('.dropzone-form-js'), (el) => {
    //   const clickable = el.querySelector('.dropzone-button-js').id;
    //   const url = el.getAttribute('data-dz-url');
    //   const previewsContainer = el.querySelector('.dropzone-previews-js');

    //   const myDropzone = new Dropzone(el, {
    //     url,
    //     previewTemplate: template ? template.innerHTML : '',
    //     previewsContainer,
    //     clickable: `#${clickable}`,
    //   });
    // });

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
      this.saveProfile();
    },
    newMessage: function() {
      socket.on('new message', (data) => {
        if (data.message && data.senderId === receiverId) {
          $chatContainer.append(data.message).hide().fadeIn();
        }
      });
    },
    addUser: function() {
      socket.emit('add user', { userId });
    },
    saveProfile: function() {
      socket.on('save profile', (data) => {
        console.log(data);
        $("#profile-success").hide().fadeIn().fadeOut(3000);
      });
    }
  };

  chat.init();
});
