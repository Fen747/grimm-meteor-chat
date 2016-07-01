import { Messages } from '../../collections/chat/messages.js';
import { Rooms } from '../../collections/chat/rooms.js';

Meteor.methods({
    'message.insert'(message, roomId) {
        try {
            //let's do some test to validate
            check(message, Object);
            try {
                check(message.message, Match.Where(function (x) {
                    check(x, String);
                    return x.length > 0;
                }));
            } catch(e) {
                throw new Meteor.Error('500', 'empty-string');
            }
            check(message.roomId, String);

            // Make sure the user is logged in before inserting a task
            if (! this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            let date = new Date();

            // let's insert the new message
            message.ownerId = this.userId;
            message.createdAt = date;

            Messages.insert(message);

            //update the last activity room
            Rooms.update(message.roomId, {
                $set: {
                    lastActivity: date
                }
            });

            return true;
        } catch(e) {
            console.log(e);

            throw new Meteor.Error(500, 'unknow-error');
        }
    },
});
;
