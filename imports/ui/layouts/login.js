import { Bert } from 'meteor/themeteorchef:bert';
import { FlowRouter } from 'meteor/kadira:flow-router';

Bert.defaults.hideDelay = 5000;

class login extends BlazeComponent {
  // Life-cycle hook to initialize component's state.
  onCreated() {
    // It is a good practice to always call super.
    super.onCreated();
  }

  // Mapping between events and their handlers.
  events() {
    // It is a good practice to always call super.
    return super.events().concat({
      // Ici on map les events du templace
      'submit #form-createNewUser': this.createNewUser,
      'submit #form-login': this.loginUser
    });
  }

  loginUser(e) {
      e.stopPropagation();
      e.preventDefault();

      username = this.find('#lg_username').value.trim();
      password = this.find('#lg_password').value.trim();

      Meteor.loginWithPassword(username, password, (error) => {
          if (error) {
              console.log(error);

              if (error.reason == 'Incorrect password') {
                  message = 'Sorry, the password doesn\'t seem to match';
              } else if (error.reason == 'User not found') {
                  message = 'Sorry, we don\'t know this user !';
              } else {
                  message = 'Sorry, cant loggin in, unknown error';
              }

              let alertLogin = $('#alertLogin');
              alertLogin.html(message);
              alertLogin.show('slow');
          } else {
              FlowRouter.go('/home');
          }
      });
  }

  createNewUser(e) {
    e.stopPropagation();
    e.preventDefault();

    const ERROR_PASSWORD = 'Password errors';
    const iUsernameChars = 4;
    const iPasswordChars = 8;

    let email = this.find('#email').value.trim();
    let username = this.find('#username').value.trim();
    let password = this.find('#password').value.trim();
    let passwordConfirm = this.find('#passwordConfirm').value.trim();

    if (username.length < iUsernameChars) {
      Bert.alert({
        title: 'Username error',
        message: 'You username must be at least '+iUsernameChars+' chars',
        type: 'danger'
      });
      this.cleanForm();
    }
    if (password.length < iPasswordChars) {
      Bert.alert({
        title: ERROR_PASSWORD,
        message: 'You password must be at least '+iPasswordChars+' chars',
        type: 'danger'
      });
      this.cleanForm();
    }
    if (password != passwordConfirm) {
      Bert.alert({
        title: ERROR_PASSWORD,
        message: 'Your password must match',
        type: 'danger'
      });
      this.cleanForm();
    }

    let options = {
      email: email,
      password: password,
      username: username
    }

    Accounts.createUser(options, (e, r) => {

      if (e) {

        if (e.reason == 'Username already exists.') {
          Bert.alert({
            title: 'Username error',
            message: 'Username already exists.',
            type: 'danger'
          });
        } else if (e.reason == 'Email already exists.') {
          Bert.alert({
            title: 'Email error',
            message: 'Email already exists.',
            type: 'danger'
          });
        } else {
          Bert.alert({
            title: 'Unknow Error : Something happend',
            message: 'Please retry later or contact the webmaster.',
            type: 'danger'
          });
        }

      } else {
        Bert.alert({
          title: 'Success',
          message: 'Account successfully created',
          type: 'success'
        });

        FlowRouter.go('/home');
      }

    });



  };

  cleanForm() {
    this.find('#password').value = '';
    this.find('#passwordConfirm').value = '';
  };
}

// Register a component so that it can be included in templates. It also
// gives the component the name. The convention is to use the class name.
login.register('login');
