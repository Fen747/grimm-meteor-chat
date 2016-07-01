import { Messages } from '../../../collections/chat/messages.js';
import { Rooms } from '../../../collections/chat/rooms.js';
import '../../../api/chat/chat.js';

class chatMessage extends BlazeComponent {
    constructor() {
        super();

        this._lastOwnerId = '';
    }

  // Life-cycle hook to initialize component's state.
  onCreated(e) {
    // It is a good practice to always call super.
    super.onCreated();

    Meteor.subscribe('messages');
    Meteor.subscribe('messages_rewrite');

    self = this;

    $(window).resize(function() {
      let height = $(window).height() - $('.navbar').height() - $('.room-name-contenair').height() - 49;

      $('.chatScrollable').css('max-height', height+'px');
       $('.chatWrapper').css('height', height+'px');

      self.updateScrollMessage(true);
    });



  }

  updateScrollMessage(fromResize) {
      let messageContenair = $('.chatWrapper');
      let doScroll = false;
      let scrollableElement = this.find('.chatScrollable');
      let scrollAlert = this.find('.chat-scroll-alert-unread');

      if (this._isScrollBot(scrollableElement)) {
          // Update now, because he read the last messages
          // @TODO some improvements :
          doScroll = true;
      }

      if (doScroll && scrollableElement) {
          scrollableElement.scrollTop = scrollableElement.scrollHeight;
          scrollAlert.style = 'display: none';
      } else {
          scrollAlert.style = 'display: block';
      }

      console.log('update');
  }

  _isScrollBot(scrollableElement) {
      if (scrollableElement) {
          return ((scrollableElement.scrollTop + scrollableElement.clientHeight + $('.message-contenair:last').height()) >= scrollableElement.scrollHeight) ? true : false;
      } else {
          return false;
      }
  }

  onRendered(e) {
     $(window).resize();

     this.autorun(function () {
       let roomId = Template.currentData().roomId;

       self.updateScrollMessage(false);
     });
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
    let messages = Messages.find({
        roomId: roomId
    },{
        sort: { createdAt: -1 },
        limit: 25
    });

    let self = this;

    messages.observeChanges({
        addedBefore: function() {
            Tracker.afterFlush(function(){
                // check if the guy read some text upper than convers


                self.updateScrollMessage(false);

            });
        }
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
                myMessages[myMessages.length -1].push(message);
            }
        });

        return myMessages.reverse();
    }

    this.updateScrollMessage(false);
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

      Meteor.call('message.insert', message, function(error) {
          if (!error) {
              oMessage.innerHTML = '';
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
