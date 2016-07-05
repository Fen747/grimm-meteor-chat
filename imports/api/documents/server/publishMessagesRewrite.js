import {Messages} from '../../../collections/chat/messages.js';
import {MessagesRewrite} from '../../../collections/chat/messages_rewrite.js';
import {Rooms} from '../../../collections/chat/rooms.js';

// Publications
Meteor.publish( 'messages_rewrite', function() {
    myRooms = Rooms.find({
        users: this.userId
    });

    roomsId = [];
    myRooms.forEach(function(room) {
        roomsId.push(room._id);
    });

    myMessages = Messages.find({
        roomId: { $in: roomsId}
    });

    messagesId = [];
    myMessages.forEach(function(message) {
        messagesId.push(message._id);
    });

    myMessagesRewrite = MessagesRewrite.find({
        messageId: { $in: messagesId}
    });

    return myMessages;
});
