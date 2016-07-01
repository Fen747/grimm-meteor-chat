
export const Triggers = {};
Triggers.mustBe = {};
Triggers.mustNotBe = {};

Triggers.mustBe.loggedIn = ( context, redirect ) => {
  if ( !( Meteor.loggingIn() || Meteor.userId() ) ) {
    console.log("[ROUTER] ::: redirect from 'loggedIn' trigger");

    redirect('/');
  }
};

Triggers.mustBe.admin = ( context, redirect ) => {
  if ( !Roles.userIsInRole( Meteor.user(), ['admin'] ) ) {
    console.log("[ROUTER] ::: redirect from 'admin' trigger");

		redirect('/');
  }
};

Triggers.mustNotBe.loggedIn = ( context, redirect ) => {
  if ( Meteor.loggingIn() || Meteor.userId() ) {
    console.log("[ROUTER] ::: redirect from '! loggedIn' trigger");

    FlowRouter.go('/home');
  }
};
