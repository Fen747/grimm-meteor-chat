import {Messages} from '../../../collections/chat/messages.js';
import {Rooms} from '../../../collections/chat/rooms.js';

// Publications
Meteor.smartPublish( 'messages', function(args) {
    try {
        check(args, Object);
        // @TODO check if user have rights

        let tabCursor = [];

        for (let oneRoom in args) {
            let myLimit = args[oneRoom].curValue * 50;

            tabCursor.push(Messages.find({
                roomId: oneRoom
            },{
                sort: { "createdAt": -1 },
                limit: myLimit
            }));
        }

        return tabCursor;
    } catch(e) {
        console.log(e);

        throw new Meteor.Error(500, 'unknow-error');
    }
});
