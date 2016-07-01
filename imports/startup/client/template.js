Template.registerHelper( 'avatar', function( avatarSize, md5hash ) {
    md5hash = md5hash || "3eda6fcd3204ef285fa52176c28c4d3e"; // Equivalent to Gravatar.hash( 'none@none.com' );

    return Gravatar.imageUrl( md5hash, { secure: true, size: avatarSize, d: 'mm', rating: 'g' } );
});

Template.registerHelper( 'isUserOnline', function( userId ) {

    myUser = Meteor.users.findOne({
        _id: userId
    },{
        status: true
    });

    return (myUser) ? myUser.status.online : false;
});

Template.registerHelper( 'getUsername', function( userId ) {

    myUser = Meteor.users.findOne({
        _id: userId
    },{
        username: true
    });

    return (myUser) ? myUser.username : 'Someone';
});
