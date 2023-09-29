const { meeting } = require('../Model/meeting.model');
const { meetingUsers } = require('../Model/meeting-user.model');
const meetingUser = require('../Model/meeting-user-model');


//get the users details in the meeting according to there meeting id
async function getAllMeetingUsers(meetId, callback) {
    meetingUser.find({ meeetingId: meetId }).then((responce) => {
        return callback(null, responce);
    }).catch((error) => {
        return callback(error);
    })
}

//when we click the start meeting it will start the meetingSchemaobject.

async function startMeeting(params, callback) {
    const meetingSchema = new meeting(params);
    meetingSchema.save().then((response) => {
        return callback(null, response);
    }).catch((error) => {
        return callback(error);
    })
}

//add users in to th meeting
async function joinMeeting(params, callback) {
    const meetingUserModel = new meetingUser(params);

    meetingUserModel.save().them(async (responce) => {
        await meeting.findAndUpdate({ id: params.meeetingId }, { $addToSet: { "meetingUsers": meetingUserModel } })
                return callback(null, responce);
    }).catch((error) => {
        return callback(error);
    })

}

//checking the meeting is valid or not
async function isMeetingPresent(meetingId, callback) {
    meeting.findById(meetingId,"hostId, hostName, startTime").populate("meetingUsers", "MeetingUser").then((response) => {
        if (!response) callback("invalid meeting Id");
        else callback(null, true);
    }).catch((error) => {
        return callback(error, false);
    });
}

//checking the meeting is valid or not
async function checkMeetingExists(meetingId, callback) {
    meeting.findById(meetingId).populate("meetingUsers", "MeetingUser").then((response) => {
        if (!response) callback("invalid meeting Id");
        else callback(null, true);
    }).catch((error) => {
        return callback(error, false);
    });
}

async function getMeetingUser(params, callback) {
    const { meetingId, userId } = params;

    meetingUser.find({ meetingId, userID }).then((responce) => { return callback(null, responce[0]) })
        .catch((error) => { return callback(error) });

}

//store the socket id or userDetails
async function updateMeetingUser(params, callback) {
    meetingUser.updateOne({ userId: params.userId }, { $set: params }, { new: true }).then((responce) => {
        return callback(null, responce);
    }).catch((error) => {
        return callback(error);
    })
}

//get socketId
async function getUserSocketID(params, callback) {
    const { meetingId, socketID } = params;

    meetingUser
        .find({ meetingId, socketId })
        .limit(1)
        .then((response) => {
        return callback(null, response);
        })
    .catch((error) => {
        return callback(error);
    });
} 

module.exports = {
    getAllMeetingUsers,
    startMeeting,
    joinMeeting,
    isMeetingPresent,
    getMeetingUser,
    updateMeetingUser,
    getUserSocketID,
    checkMeetingExists
}

