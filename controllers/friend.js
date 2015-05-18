var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var Friend = mongoose.model('friend', schemas.friend);
module.exports = {
    /*
        description: tests the state of two users
            0: nothing
            1: request
            2: friends
        inputs:
            u1, u2
        exits:
            success: returns true
            error: returns false
    */
    getState: function(inputs, exits){
        Friend.findOne({users: inputs.u1, users: inputs.u2}, function(err, friend){
            if(err) throw err;
            if(friend)
                return exits.success(friend.state);
            return exits.success(0);
        });
    },
    
    /*
        description: adds a friend request
        inputs: 
            user: the user that is logged in.
            request: the ID that you are making a request to.
    */
    addRequest: function(inputs, exits){
        Friend.findOne({users: inputs.user, users: inputs.request}, function(err, friend){
            if(err) throw err;
            if(friend){
                return exits.error("Request already sent");
            }
            var obj = {users: [inputs.user, inputs.request], state: 1};
            (new Friend(obj)).save(function(err, friend){
                if(err) throw err;
                return exits.success(friend);
            });
        });
    },
    
    /*
        description: deletes a friend request
        inputs:
            user: the user that is logged in.
            request: the ID that you are making a request to.
    */
    deleteRequest: function(inputs, exits){
        Friend.findOne({users: inputs.user, users: inputs.request}, function(err, friend){
            if(err) throw err;
            if(!friend)
                return exits.error("Request not found");
            if(friend.state==2)
                return exits.error("Already friends");
            Friend.remove({users: inputs.user, users: inputs.request}, function(err){
                if(err) throw err;
                return exits.success();
            })
        });
    },
    
    /*
        description: validates a friend request
        inputs: 
            user: the user that is logged in.
            request: the ID that you are making a request to.
    */
    validateRequest: function(inputs, exits){
        
    }
}