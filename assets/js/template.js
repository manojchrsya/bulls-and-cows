/* eslint-disable */
(function ($) {
  // eslint-disable-next-line no-undef
  Dropzone = Dropzone || {};
  Dropzone.autoDiscover = false;

  $(document).ready(() => {
    //
    // Horizontal scroll
    //

    [].forEach.call(document.querySelectorAll('[data-horizontal-scroll]'), (el) => {
      function scrollHorizontally(e) {
        e = window.event || e;
        const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        el.scrollLeft -= (delta * 28);
        e.preventDefault();
      }

      if (el.addEventListener) {
        el.addEventListener('mousewheel', scrollHorizontally, false);
        el.addEventListener('DOMMouseScroll', scrollHorizontally, false);
      } else {
        el.attachEvent('onmousewheel', scrollHorizontally);
      }
    });

    //
    // Detect mobile devices
    //

    var isMobile = {
      Android() {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry() {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS() {
        return navigator.userAgent.match(/iPhone|iPod|iPad/i);
      },
      Opera() {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
      },
      any() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      },
    };

    //
    // Modified accordion(settings.html)
    //

    if (!isMobile.any()) {
      [].forEach.call(document.querySelectorAll('.modified-accordion [data-toggle="collapse"]'), (e) => {
        e.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });

      [].forEach.call(document.querySelectorAll('.modified-accordion .collapse'), (e) => {
        e.classList.add('show');
      });
    }

    //
    // Emoji
    //

    if (!isMobile.any()) {
      [].forEach.call(document.querySelectorAll('[data-emoji-form]'), (form) => {
        const button = form.querySelector('[data-emoji-btn]');
        if (!button) return;
        const picker = new EmojiButton({
          position: 'top',
          zIndex: 1020,
        });

        picker.on('emoji', (emoji) => {
          form.querySelector('[data-emoji-input]').value += emoji;
        });

        button.addEventListener('click', () => {
          picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button);
        });
      });
    } else {
      [].forEach.call(document.querySelectorAll('[data-emoji-form]'), (form) => {
        form.querySelector('[data-emoji-btn]').style.display = 'none';
      });
    }

    //
    // Toggle chat
    //

    [].forEach.call(document.querySelectorAll('[data-chat="open"]'), (a) => {
      a.addEventListener('click', () => {
        document.querySelector('.main').classList.toggle('main-visible');
      }, false);
    });

    //
    // Toggle chat`s sidebar
    //

    [].forEach.call(document.querySelectorAll('[data-chat-sidebar-toggle]'), (e) => {
      e.addEventListener('click', (event) => {
        event.preventDefault();
        const chat_sidebar_id = e.getAttribute('data-chat-sidebar-toggle');
        const chat_sidebar = document.querySelector(chat_sidebar_id);

        if (typeof (chat_sidebar) !== 'undefined' && chat_sidebar != null) {
          if (chat_sidebar.classList.contains('chat-sidebar-visible')) {
            chat_sidebar.classList.remove('chat-sidebar-visible');
            document.body.classList.remove('sidebar-is-open');
          } else {
            [].forEach.call(document.querySelectorAll('.chat-sidebar'), (e) => {
              e.classList.remove('chat-sidebar-visible');
              document.body.classList.remove('sidebar-is-open');
            });
            chat_sidebar.classList.add('chat-sidebar-visible');
            document.body.classList.add('sidebar-is-open');
          }
        }
      });
    });



    //
    // Dropzone
    //

    // if (document.querySelector('#dropzone-template-js')) {
    //   var template = document.querySelector('#dropzone-template-js');
    //   const template_element = document.querySelector('#dropzone-template-js');
    //   template_element.parentNode.removeChild(template_element);
    // }

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

    //
    // Mobile screen height minus toolbar height
    //

    function mobileScreenHeight() {
      if (document.querySelectorAll('.navigation').length && document.querySelectorAll('.sidebar').length) {
        document.querySelector('.sidebar').style.height = `${windowHeight - document.querySelector('.navigation').offsetHeight}px`;
      }
    }

    if (isMobile.any() && (document.documentElement.clientWidth < 1024)) {
      var windowHeight = document.documentElement.clientHeight;
      mobileScreenHeight();

      window.addEventListener('resize', (event) => {
        if (document.documentElement.clientHeight != windowHeight) {
          windowHeight = document.documentElement.clientHeight;
          mobileScreenHeight();
        }
      });
    }


    //
    // Autosize
    //

    autosize(document.querySelectorAll('[data-autosize="true"]'));

    //
    // SVG inject
    //

    SVGInjector(document.querySelectorAll('img[data-inject-svg]'));
  });
}(jQuery));
