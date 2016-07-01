import { Messages } from '../../collections/chat/messages.js';
import { MessagesRewrite } from '../../collections/chat/messages_rewrite.js';

Meteor.methods({
    'messageRewrite.insert'(text, messageId) {
        try {
            //let's do some test to validate
            try {
                check(text, Match.Where(function (x) {
                    check(x, String);
                    return x.length > 0;
                }));
            } catch(e) {
                throw new Meteor.Error('500', 'empty-string');
            }
            check(messageId, String);

            // Make sure the user is logged in before inserting a task
            if (! this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            let date = new Date();
            let myText = '';

            // we get the original text to save on messages_rewrite
            let originalMessage = Messages.findOne({
                _id: messageId
            }, {
                message: true,
                ownerId: true
            });

            if (originalMessage.ownerId === this.userId) {
                // It's the owner, so we replace the text
                // let's insert the new message
                Messages.update(messageId, {
                    $set: { message: text, lastUpdated: date }
                });

                // let's save the original
                myText = originalMessage.message;
            } else {
                // It's not the owner, so we store a second message for the correction
                myText = text;
            }

            let message = {
                message: myText,
                messageId: messageId,
                ownerId: this.userId,
                createdAt: date,
            }
            MessagesRewrite.insert(message);

            return true;
        } catch(e) {
            throw new Meteor.Error(500, 'unknow-error');
        }
    },
});
