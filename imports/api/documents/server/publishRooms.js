import {Rooms} from '../../../collections/chat/rooms.js';
// Publications
Meteor.publish( 'rooms', function(filter) {
    check(filter, String);

    let options = {
        users: this.userId
    }

    if (filter != '') {
        options.roomName = {$regex: '.*'+filter+'.*', $options: 'i'};
    }

    let myRooms = Rooms.find(options);

    // On publish également les users concernés
    let usersId = [];
    myRooms.forEach(function(room) {
        room.users.forEach(function(user) {
            usersId.push(user);
        });
    });

    let myUsers = Meteor.users.find({
        _id: { $in: usersId }
    });

    // search last activity in the room


    return [myRooms, myUsers];
});
