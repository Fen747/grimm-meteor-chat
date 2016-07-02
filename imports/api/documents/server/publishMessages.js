import {Messages} from '../../../collections/chat/messages.js';
import {Rooms} from '../../../collections/chat/rooms.js';

// Publications
Meteor.publish( 'messages', function(roomId, limit) {
    try {
        check(roomId, String);
        check(limit, Number);

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

        return myMessages;
    } catch(e) {
        throw new Meteor.Error(500, 'unknow-error');
    }
});
