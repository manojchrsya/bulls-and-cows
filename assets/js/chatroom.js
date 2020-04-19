/* eslint-disable */
$(function() {
  const socket = io();
  let receiverId = '';
  const $message = $("#chat-id-1-input");
  const $chatForm = $("#chat-id-1-form");
  const $chatContainer = $(".chat-container");

function addLeftChatMessage(options = {}) {
  const $leftMessage = `<div class="message">
      <a class="avatar avatar-sm mr-4 mr-lg-5" href="#" data-chat-sidebar-toggle="#chat-1-user-profile">
          <img class="avatar-img" src="images/9.jpg" alt="">
      </a>
      <div class="message-body">
          <div class="message-row">
              <div class="d-flex align-items-center">
                  <div class="message-content bg-light">
                      <div>${options.message}</div>
                      <div class="mt-1">
                          <small class="opacity-65">8 mins ago</small>
                      </div>
                  </div>
                  <div class="dropdown">
                      <a class="text-muted opacity-60 ml-3" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i class="fe-more-vertical"></i>
                      </a>
                      <div class="dropdown-menu">
                          <a class="dropdown-item d-flex align-items-center" href="#">
                              Edit <span class="ml-auto fe-edit-3"></span>
                          </a>
                          <a class="dropdown-item d-flex align-items-center" href="#">
                              Share <span class="ml-auto fe-share-2"></span>
                          </a>
                          <a class="dropdown-item d-flex align-items-center" href="#">
                              Delete <span class="ml-auto fe-trash-2"></span>
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>`;

    $chatContainer.append($leftMessage);
}
  // set selected friend
  $('.friend').on('click', function() {
    receiverId = $(this).attr('data-user-id');
    $('#initial-chat').fadeOut(function(){
      $('#chat-screen').fadeIn();
    })
  });
  $chatForm.on('submit', function(e) {
    e.preventDefault();
    const message = $message.val();
    if (!(message && receiverId)) return false;
    addLeftChatMessage({ message });
    socket.emit('new message', { message, receiverId });
    $message.val('');
  })

  socket.on('new message', (data) => {
    if (data.message) {
      $chatContainer.append(data.message);
    }
  });

});
