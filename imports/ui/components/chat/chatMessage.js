import { Messages } from '../../../collections/chat/messages.js';
import { Rooms } from '../../../collections/chat/rooms.js';
import '../../../api/chat/chat.js';

class chatMessage extends BlazeComponent {
    constructor() {
        super();

        this._lastOwnerId = '';
        this.limitMessage = new ReactiveVar(25);
    }

  // Life-cycle hook to initialize component's state.
  onCreated(e) {
    // It is a good practice to always call super.
    super.onCreated();
    self = this;

    this.lastHeightMessages = 0;

    $(window).resize(function() {
      let height = $(window).height() - $('.navbar').height() - $('.room-name-contenair').height() - 49;

      $('.chatScrollable').css('max-height', height+'px');
       $('.chatWrapper').css('height', height+'px');

      self.updateScrollMessage(true);
    });
  }

  onRendered(e) {
      super.onRendered();
     self = this;

     // observe scroll to reset scroll alert
     $('.chatScrollable').on('scroll', function() {
         if (self._isScrollBot(this)) {
            self._setScrollAlert('hide', self);
        }
        if (self._isScrollTop(this)) {
             self.limitMessage.set(self.limitMessage.get()+20);
        }
    }).scrollbar();

     this.autorun(function () {
       let roomId = Template.currentData().roomId;

       self.countMessage = 0;

       console.log('---- reset context ----');

       self.messagesHandler = Meteor.subscribe('messages', roomId, self.limitMessage.get());
       Meteor.subscribe('messages_rewrite');

       self.updateScrollMessage(false);
     });
  }

  updateScrollMessage(fromResize) {
      let messageContenair = $('.chatWrapper');
      let doScroll = false;
      let scrollableElement = this.find('.chatScrollable');
      let cancelShowAlert = false;

      if (this._isScrollBot(scrollableElement)) {
          // Update now, because he read the last messages
          // @TODO some improvements :
          doScroll = true;
      }

      if (this.lastHeightMessages != scrollableElement.scrollHeight) {
          // we must calculate the compensation to keep the scrool
          let difference = scrollableElement.scrollHeight - this.lastHeightMessages;

          scrollableElement.scrollTop = scrollableElement.scrollTop + difference;
          this.lastHeightMessages = scrollableElement.scrollHeight;

          if (!doScroll) {
              // Si on avait pas planifier de scroller en bas, on annule l'affichage de la notification de nouveau message
              cancelShowAlert = true;
          }
      }

      if (doScroll && scrollableElement) {
          this._setScrollBarBottom(scrollableElement);
          this._setScrollAlert('hide', this);
      } else {
          if (!cancelShowAlert) {
              this._setScrollAlert('show', this);
          }
      }
  }

  _isScrollBot(scrollableElement) {
      if (scrollableElement) {
          //console.log((scrollableElement.scrollTop + scrollableElement.clientHeight + 20),  scrollableElement.scrollHeight, scrollableElement.offsetHeight);

          return ((scrollableElement.scrollTop + scrollableElement.clientHeight + 20 ) >= scrollableElement.scrollHeight) ? true : false;
      } else {
          return false;
      }
  }

  _isScrollTop(scrollableElement) {
      if (scrollableElement) {
          return ((scrollableElement.scrollTop + scrollableElement.clientHeight ) <= scrollableElement.offsetHeight) ? true : false;
      } else {
          return false;
      }
  }

  _setScrollBarBottom(scrollableElement) {
      if (scrollableElement) {
          $(scrollableElement).scrollTop(999999);
      }
  }



  _setScrollAlert(value, context) {
       let scrollAlert = context.find('.chat-scroll-alert-unread');

       if (scrollAlert) {
           if (value == 'show') {
               $(scrollAlert).show('slow');
           } else {
                $(scrollAlert).hide('slow');
           }
       }
  }

  // Mapping between events and their handlers.
  events() {
    // It is a good practice to always call super.
    return super.events().concat({
      'click #sendChatButton': this.addMessage,
      'click .editMessage': this.startMessageRewrite,
      'click .sendRewriteChatButton': this.addMessageRewrite,
      'keypress #messageTextarea': this.handleAddMessage,
      'keydown #message-rewrite-textarea': this.handleAddMessageRewrite
    });
  }

  getRoomName(roomId) {
      return Chat.getRoomName(roomId);
  }

  getUsername(user) {
      return Chat.getUsername(user);
  }

  getTime(timestamp) {
      return Chat.getTime(timestamp);
  }

  getUsers(roomId) {
      let room = Rooms.findOne({
          _id: roomId
      }, {
          fields: {users: true}
      });

      if (room) {
          Chat._cleanUsers(room.users);
          return room.users;
      }

      return [];
  }

  getMessages(roomId) {
      if (1) {
          let self = this;
          let startResize = true;
          let messages = Messages.find({
              roomId: roomId
          },{
              sort: { createdAt: -1 },
              limit: self.limitMessage.get()
          });


          messages.observeChanges({
              addedBefore: function(id, field, before) {
                  if (before) {
                      self.countMessage++;
                      self.limitMessage.set(self.countMessage + self.limitMessage.get());
                  }

                  if (startResize) {
                      Tracker.afterFlush(function(){
                          // check if the guy read some text upper than convers
                          console.log("start resize !");

                          $(window).resize();
                      });
                      startResize = false;
                  }
              },
          });

          if ( messages ) {
              // On va générer le nom des rooms en fonction des utilisateurs présent dans la room
              let myMessages = [];
              let lastOwnerId = '';
              let lastTimeStamp = moment();

              messages.forEach(function (message) {
                  let messageDate = moment(message.createdAt);

                  // make date as human readable
                  if (message.lastUpdated !== undefined) {
                      message.lastUpdatedHumanReadable = Chat.getTime(message.lastUpdated);
                  }

                  if (lastOwnerId != message.ownerId || messageDate.diff(lastTimeStamp, 'minutes') >= 1 ) {
                      myUser = Meteor.users.findOne({
                          _id:  message.ownerId
                      }, {
                          md5hash: true
                      });
                      message.md5hash = myUser.md5hash;

                      myMessages.push([message]);
                      lastOwnerId = message.ownerId;
                      lastTimeStamp = messageDate;
                  } else {
                      myMessages[myMessages.length -1].unshift(message);
                  }
              });

              return myMessages.reverse();
          }
      } else {
          console.log("subscribe not ready");

      }
  }

  isMyMessage(ownerId) {
      return (ownerId == Meteor.userId());
  }

  handleAddMessage(e) {
      if (e.which === 13 && !event.shiftKey) {
          e.stopPropagation();
          e.preventDefault();
          this.addMessage();
          return false;
      }
  }

  handleAddMessageRewrite(e) {
      if (e.which === 13) {
          e.stopPropagation();
          e.preventDefault();
          this.addMessageRewrite(e);
          return false;
      }
  }

  startMessageRewrite(e) {
      if (!$(e.target).hasClass('editingInProgress')) {
          $(e.target).addClass('editingInProgress').removeClass('editMessage');

          let contenair = $('<div class="inputMessage input-group contenair-rewrite" />');
          let editor = $('<textarea id="message-rewrite-textarea" class="form-control" required />');
          let sendButton = $('<span class="input-group-addon btn btn-primary sendRewriteChatButton"><i class="fa fa-paper-plane"></i></span>');

          contenair.append(editor).append(sendButton);
          editor.val(e.target.innerHTML);
          $(e.target).html(contenair);
          editor.focus();
      }
  }

  addMessageRewrite(e) {
      let message = {
          message: $(e.target).parent().find('textarea').val(),
          messageId: $(e.target).parent().parent().attr('data-id'),
      };
      let self = this;

      // @TODO il faudrait passer un object ici et vérifier ensuite qu'il ne possède que deux attributs coté serveur
      Meteor.call('messageRewrite.insert', message.message, message.messageId, function(error) {
          if (!error) {
              self._endMessageRewrite(e);
          }
      });
  }

  addMessage() {
      let oMessage = this.find('#messageTextarea');

      let message = {
          message: this.find('#messageTextarea').innerHTML,
          roomId: this.find('#roomId').value
      };

      let self = this;

      Meteor.call('message.insert', message, function(error) {
          if (!error) {
              oMessage.innerHTML = '';
              self._setScrollBarBottom(self.find('.chatScrollable'));
          } else {
              console.log(error);
          }
      });
  }

  _endMessageRewrite(e) {
      // end rewriting
      $(e.target).parent().parent().addClass('editMessage').removeClass('editingInProgress');

      // delete the div who contains texteditor
      $(e.target).parent().remove();

      // reinsert the new message
      $(e.target).parent().parent().html($(e.target).parent().find('#messageTextarea').value);
  }
}

chatMessage.register('chatMessage');
