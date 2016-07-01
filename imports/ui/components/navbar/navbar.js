import { FlowRouter } from 'meteor/kadira:flow-router';

class navbar extends BlazeComponent {
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
      'click #logOut': this.logOut,
      'click #editProfile': this.editProfile
    });
  }

  editProfile() {
      FlowRouter.go('/editProfile');
  }

  logOut(e) {
    e.stopPropagation();
    e.preventDefault();

    Meteor.logout( () => { FlowRouter.go('/'); });

  };

}

// Register a component so that it can be included in templates. It also
// gives the component the name. The convention is to use the class name.
navbar.register('navbar');
