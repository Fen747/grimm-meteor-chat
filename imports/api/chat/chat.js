import { Rooms } from '../../collections/chat/rooms.js';

class Chat {
    getRoomName(room) {
        usernames = [];

        room = this._getRoomObject(room);

        // @TODO isrendered ?
        if (room !== undefined) {
            room.users.forEach(function(user) {
                if (user != Meteor.userId()) {
                    // @TODO remplacer par getUsername
                    myUser = Meteor.users.findOne({
                        _id: user
                    }, {
                        fields: { username: true }
                    });

                    if (myUser) {
                        usernames.push(myUser.username);
                    }
                }
            });

            return usernames.join(', ');
        }
    };

    getUsername(user) {
            user = Meteor.users.findOne({
                _id: user
            }, {
                username: true
            });

            return (user) ? user.username : 'Someone';
    };

    getRoomImageMD5(room) {
        room = this._getRoomObject(room);

        if (room.users.length == 2) {
            myUser = Meteor.users.findOne({
                _id: room.users[0]
            }, {
                md5hash: true
            });

            return (myUser !== undefined) ? myUser.md5hash : '';
        } else {
            // @TODO send some picture to simulate groups
        }
    };

    getTime(timestamp) {
        if ( timestamp ) {
          let today         = moment().format( 'YYYY-MM-DD' ),
              datestamp     = moment( timestamp ).format( 'YYYY-MM-DD' ),
              isBeforeToday = moment( today, 'YYYY-MM-DD' ).isAfter( datestamp ),
              format        = isBeforeToday ? 'MMMM Do, YYYY hh:mm a' : 'hh:mm a';
          return moment( timestamp ).format( format );
        }
    };

    _getRoomObject(room) {
        if (typeof room === 'string') {
            room = Rooms.findOne({
                _id: room
            });
        }

        return room;
    };

    _cleanUsers(_usersList) {
        let index = _usersList.indexOf(Meteor.userId());
        if (index > -1) {
            _usersList.splice(index, 1);
        }
    };
}

this.Chat = new Chat();
