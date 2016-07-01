import { Rooms } from '../../../collections/chat/rooms.js';
import '../../../api/chat/chat.js';

class chatRoomsBar extends BlazeComponent {
  // Life-cycle hook to initialize component's state.
  onCreated() {
    // It is a good practice to always call super.
    super.onCreated();

    Session.set('filterRooms', '')
    Meteor.subscribe('rooms', '');
  }

  rooms() {
      let options = {};

      let filterRooms = Session.get('filterRooms');

    if (filterRooms != '') {
        options.roomName = {$regex: ".*"+filterRooms+".*", $options: 'i'};
    }

    let rooms = Rooms.find(options, {
        sort: { lastActivity: -1 }
    });

    if ( rooms ) {
        // On va générer le nom des rooms en fonction des utilisateurs présent dans la room
        myRooms = [];

        let showNoResult = 'block';

        if (rooms.count() > 0) {
            showNoResult = 'none';

            rooms.forEach(function(room) {
                let roomName = Chat.getRoomName(room);
                let lastActivityHumanReadable = '';

                if (room.lastActivity !== undefined) {
                    lastActivityHumanReadable = Chat.getTime(room.lastActivity);
                }

                Chat._cleanUsers(room.users);

                let oneRoom = {
                    id: room._id,
                    users: room.users,
                    lastActivityHumanReadable: lastActivityHumanReadable,
                    md5hash: Chat.getRoomImageMD5(room)
                };

                myRooms.push(oneRoom);
            });
        }

        let divSearchNoResult = this.find('#search-no-result');
        if (divSearchNoResult !== undefined) {
            divSearchNoResult.style = 'display:'+showNoResult;
        }

        return myRooms;
    }
  }

  isRoomActive(roomId, roomSelected) {
      if (roomId == roomSelected) {
          return true;
      }
      return false;
  }

  filterRooms() {
      let search = this.find('input').value;

      self = this;
      Meteor.subscribe("rooms", search, function() {
          Session.set('filterRooms', search);
          self.rooms();
      });
  }

  // Mapping between events and their handlers.
  events() {
    // It is a good practice to always call super.
    return super.events().concat({
      // You could inline the handler, but the best is to make
      // it a method so that it can be extended later on.
      'keyup #search-input-chat': this.filterRooms

    });
  }


}

// Register a component so that it can be included in templates. It also
// gives the component the name. The convention is to use the class name.
chatRoomsBar.register('chatRoomsBar');
