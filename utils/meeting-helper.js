const meetingService = require('../service/meeting-service');
const { MeetingPayloadEnum } = require('../utils/meeting-payload-enum');

async function joinMeeting(meetingId, socket, meetingServer, payload) {
    const { userId, name } = payload.data;

    meetingService.isMeetingPresent(meetingId, async (error, results) => {
        if (error && !results) {
            sendMessage(socket, {
                type: MeetingPayloadEnum.NOT_FOUND
            })
        }
        if (results) {
            addUser(socket, { meetingId, userId, name }).then((result) => {
                if (result) {
                    sendMessage(socket, {
                        type: MeetingPayloadEnum.JOINED_MEETING, data: {
                            userId
                        }
                    });

                    broadcastUsers(meetingId, socket, meetingServer, {
                        type: MeetingPayloadEnum.USER_JOINED, data: {
                            userId,
                            name,
                            ...payload.data
                        }
                    });
                }
            }, (error) => { 
                console.log(error); 
            }
                
            )
        }
    })
}



//use when any other use wants to connect to the meeting
function forwardConnectionRequest(meetingId, socket, payload, meetingServer) { 
    const { userID, otherserverID, name } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: userID,
    };

    meetingService.getMeetingUser(model, (error, results) => { 
        if (results) {
            var sendPayLoad = JSON.stringify({
                type: MeetingPayloadEnum.INCOMMING_CONNECTION_REQUEST,
                data: {
                    userID,
                    name,
                    ...payload.data
                }
            });
            meetingServer.to(results.socketId).emit("message", sendPayLoad);
        }
    })
    
}


function forwardIceCandidate(meetingId, socket, payload, meetingServer) { 
    const { userID, otherserverID, candidate } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: userID,
    };

    meetingService.getMeetingUser(model, (error, results) => { 
        if (results) {
            var sendPayLoad = JSON.stringify({
                type: MeetingPayloadEnum.ICECANDIDATE,
                data: {
                    userID,
                    candidate,
                    
                }
            });
            meetingServer.to(results.socketId).emit("message", sendPayLoad);
        }
    })
    
}

function forwardOfferSDP(meetingId, socket, payload, meetingServer) { 
    const { userID, otherserverID, sdp } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: userID,
    };

    meetingService.getMeetingUser(model, (error, results) => { 
        if (results) {
            var sendPayLoad = JSON.stringify({
                type: MeetingPayloadEnum.OFFER_SDP,
                data: {
                    userID,
                    sdp
                }
            });
            meetingServer.to(results.socketId).emit("message", sendPayLoad);
        }
    })
    
}

function forwardAnswerSDP(meetingId, socket, payload, meetingServer) { 
    const { userID, otherserverID, sdp } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: userID,
    };

    meetingService.getMeetingUser(model, (error, results) => { 
        if (results) {
            var sendPayLoad = JSON.stringify({
                type: MeetingPayloadEnum.ANSWER_SDP,
                data: {
                    userID,
                    sdp
                }
            });
            meetingServer.to(results.socketId).emit("message", sendPayLoad);
        }
    })
    
}


//when user left the meeting this wil broadcast to tother users
function userLeft(meetingId, socket, payload, meetingServer) { 
    const { userID} = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.USER_LEFT,
        data: {
            userID,
           
        }
    });
    
    
}

function endMeeting(meetingId, socket, payload, meetingServer) { 
    const { userID} = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.MEETING_ENDED,
        data: {
            userID,
           
        }
    });
    
    //remove all users ffrom the meeting

    meetingService.getAllMeetingUsers(meetingId, (error, results) => {
        for (let i = 0; i < results.length; i++) { 
            const meetingUser = results[i];
            meetingServer.sockets.connected[meetingUser.socketId].disconnect();

        }
    });
    
}

function ForwardEvent(meetingId, socket, payload, meetingServer) { 
    const { userID} = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: payload.type,
        data: {
            userID: userID,
            ...payload.data
           
        }
    });
    
}

function addUser(socket, {meetingId, userId, name}) {
    let promise = new Promise(function (resolve, reject) {
        meetingService.getMeetingUser({ meetingId, userId }, (error, results) => {
            if (!results) {
                var model = {
                    socketId: socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive: true
                };

                meetingService.joinMeeting(model, (error, results) => {
                    if (results) {
                        resolve(true);
                    }
                    if (error) {
                        reject(error);
                    }
                });
            }
            else {
                meetingService.updateMeetingUser({
                    userId: userId,
                    socketId: socket.id,

                }, (error, results) => {
                    if (results) {
                        resolve(true);
                    } if (error) {
                        reject(error);
                    }
                }
                
                )
            }
        });
    });

    return promise;
}

function sendMessage(socket, payload){
        socket.send(JSON.stringify(payload));
}

//broadcast messsage to the all users
function broadcastUsers(meetingId, socket, meetingServer, payload) {
    socket.broadcastUsers.emit("message", JSON.stringify(payload));
}

module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    userLeft,
    endMeeting,
    ForwardEvent
}