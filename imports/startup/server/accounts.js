import { Accounts } from 'meteor/accounts-base';


Accounts.onCreateUser( (options, user) => {
  user.md5hash = Gravatar.hash( user.emails[0].address );

  return user;
});
