import { Messages } from '../../../collections/chat/messages.js';
import { Rooms } from '../../../collections/chat/rooms.js';
import '../../../api/chat/chat.js';
import '../../../api/chat/chatScroll.js';

varGlob = null;

class chatMessage extends BlazeComponent {
    constructor() {
        super();

        this._lastOwnerId = '';
        this.roomsSubscribed = {};
        this.cursorMessages = Messages.find();
        this._loadMoreMessage = _.throttle(function() {
               let scrollableElement = this.find('.scroll-content');

               if (scrollableElement.scrollHeight > scrollableElement.clientHeight) {
                   let roomIdReactiveVar = this.roomsSubscribed[Session.get('roomId')];
                   roomIdReactiveVar.set(roomIdReactiveVar.get()+1);

                   this.callSubscribeMessages();
               }
           }, 500, { 'trailing': false });
    }

  // Life-cycle hook to initialize component's state.
  onCreated(e) {
    // It is a good practice to always call super.
    super.onCreated();
    self = varGlob = this;

    this.lastHeightMessages = 0;

    ChatScroll.initializeResize(this);

    this.autorun(function(){
        let roomId = Session.get('roomId');

        if (this.roomId != roomId) {
            this.roomId = roomId;

            console.log('---- reset context for '+this.roomId+' ----');
            // @TODO CONSTANTE
            self.firstTopCancel = false;
            //self.limitMessage.set(1);
            self.callSubscribeMessages();
        }
    });
  }

  onRendered(e) {
      super.onRendered();
      this.scrollEvent = ChatScroll.initializeScroll(this);
  }

  callSubscribeMessages() {
      if (this.roomId) {
          // Have we read this room already ?
          if (!(this.roomId in this.roomsSubscribed)) {
              // No, so please initialize this roomsSubscribed
              this.roomsSubscribed[this.roomId] = new ReactiveVar(1);
          }

          this.messageHandler = Meteor.subscribe('messages', this.roomsSubscribed);
      }
  }



  // Mapping between events and their handlers.
  events() {
    // It is a good practice to always call super.
    return super.events().concat({
      'click #sendChatButton': this.addMessage,
      'click .editMessage': this.startMessageRewrite,
      'click #sendRewriteChatButton': this.addMessageRewrite,
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

  getMessages() {
      let roomId = Session.get('roomId');

      if (this.roomsSubscribed[roomId]) {
          let self = this;
          let myLimit = 50 * this.roomsSubscribed[roomId].get();

          let startResize = true;
          this.cursorMessages = Messages.find({
              roomId: roomId
          },{
              sort: { createdAt: -1 },
              limit: myLimit
          });

          this.cursorMessages.observeChanges({
              addedBefore: function(id, field, before) {
                  if (startResize) {
                      Tracker.afterFlush(function(){
                          // check if the guy read some text upper than convers
                          $(window).resize();
                      });
                      startResize = false;
                  }
              },
          });

          let messages = this.cursorMessages;

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
      if (e.which === 13 && !event.shiftKey) {
          e.stopPropagation();
          e.preventDefault();
          this.addMessageRewrite(e);
          return false;
      }
  }

  startMessageRewrite(e) {
      let self = this;

      // Close all other edit essage !
      $('.editingInProgress').each(function(){
          self._cancelMessageRewrite(this);
      });


      // Start edit this message
      if (!$(e.target).hasClass('editingInProgress')) {
          $(e.target).addClass('editingInProgress').removeClass('editMessage');

          let contenair = $('<div class="inputMessage contenair-rewrite" />');
          let editor = $('<div contenteditable id="message-rewrite-textarea" class="text-box" />');
          let sendButton = $('<span id="sendRewriteChatButton" class="send-chat-button"><i class="fa fa-paper-plane"></i></span>');

          contenair.append(editor).append(sendButton);
          editor.html(e.target.innerHTML);
          $(e.target).html(contenair);
          editor.focus();

          // check if the user cancel edition
          $(document).on('click.cancelRewrite', function(e){
            if($(e.target).closest('.editingInProgress').size() === 0){
                $(document).off('click.cancelRewrite');
                self._cancelMessageRewrite($('.editingInProgress'));
            }
        });
      }
  }

  addMessageRewrite(e) {
      let message = {
          message: $(e.target).parent().find('div#message-rewrite-textarea').html(),
          messageId: $(e.target).parent().parent().attr('data-id'),
      };
      let self = this;

      // @TODO il faudrait passer un object ici et vérifier ensuite qu'il ne possède que deux attributs coté serveur
      Meteor.call('messageRewrite.insert', message.message, message.messageId, function(error) {
          if (!error) {
              self._endMessageRewrite(e);
          }
          console.log(error);

      });
  }

  addMessage() {
      let oMessage = this.find('#messageTextarea');
      let self = this;
      let message = {
          message: this.find('#messageTextarea').innerHTML,
          roomId: this.roomId
      };

      Meteor.call('message.insert', message, function(error) {
          if (!error) {
              oMessage.innerHTML = '';
              ChatScroll.setScrollBarBottom(self.find('.scroll-content'));
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

  _cancelMessageRewrite(context) {
      // Cancel this message rewrite !
      $(context).removeClass('editingInProgress').addClass('editMessage');

      // Override the content of message by the mongo doScroll
      let messageText = Messages.findOne({_id: $(context).attr('data-id')});
      if (messageText) {
          $(context).html(messageText.message);
      }
  }
}

chatMessage.register('chatMessage');
