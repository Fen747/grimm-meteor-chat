import { FlowRouter } from 'meteor/kadira:flow-router';

class editProfile extends BlazeComponent {
  // Life-cycle hook to initialize component's state.
  onCreated() {
    // It is a good practice to always call super.
    super.onCreated();
  }

  // Mapping between events and their handlers.
  events() {
    // It is a good practice to always call super.
    return super.events().concat({
      // You could inline the handler, but the best is to make
      // it a method so that it can be extended later on.
      //'change #profile-image-input': this.uploadProfilePicture
    });
  }



}

// Register a component so that it can be included in templates. It also
// gives the component the name. The convention is to use the class name.
editProfile.register('editProfile');
