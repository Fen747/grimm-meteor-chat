import {Messages} from '../../../collections/chat/messages.js';
import {Rooms} from '../../../collections/chat/rooms.js';

// Publications
Meteor.publish( 'messages', function() {
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
});

Messages.allow({
    'insert': function (userId,doc) {
      // @TODO Il faudrait vérifier ici que le user a le droit de poster dans cette room
      return true;
    }
  });
