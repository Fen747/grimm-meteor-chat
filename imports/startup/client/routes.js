import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import  { Triggers } from './triggers.js';

if (Meteor.isClient) Meteor.startup(function () { BlazeLayout.setRoot('body'); });

allRoutes = FlowRouter.group({
  name: 'allRoutes',
  triggersEnter: []
});

exposed_Routes = FlowRouter.group({
  name: 'exposed_Routes',
  triggersEnter: [Triggers.mustNotBe.loggedIn]
});

loggedIn_Routes = FlowRouter.group({
  name: 'loggedIn_Routes',
  triggersEnter: [Triggers.mustBe.loggedIn]
});


exposed_Routes.route('/', {
  name: 'login',
  triggersEnter: [],
  action: function(query, queryParams) {
    BlazeLayout.render('login');
  }
});

loggedIn_Routes.route('/home', {
  name: 'home',
  triggersEnter: [],
  action: function(query, queryParams) {
    BlazeLayout.render('loggedIn', { content: 'home'});
  }
});

loggedIn_Routes.route('/editProfile', {
  name: 'editProfile',
  triggersEnter: [],
  action: function(query, queryParams) {
    BlazeLayout.render('loggedIn', { content: 'editProfile'});
  }
});

loggedIn_Routes.route('/chat', {
  name: 'chat',
  triggersEnter: [],
  action: function(query, queryParams) {
    BlazeLayout.render('loggedIn', { content: 'chat'});
  }
});

loggedIn_Routes.route('/chat/:roomId', {
  name: 'chatRoom',
  triggersEnter: [],
  action: function(query, queryParams) {
    BlazeLayout.render('loggedIn', { content: 'chat', roomId: query.roomId});
  }
});
