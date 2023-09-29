const meetingService = require('../service/meeting-service');

exports.startMeeting = (req, res, next) => {
    const { hostId, hostName } = req.body;

    var model = {
        hostId: hostId,
        hostName: hostName,
        startTime: Date.now()
    };


    meetingService.startMeeting(model, (error, results) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({ message: "Success", data: results.id });
        
    });
}

//validating meetingId and all
exports.checkMeetingExists = (req, res, next) => {
    const { meetingId } = req.query;

    meetingService.checkMeetingExists(meetingId, (error, results) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results

        });
    })
}

//validating meetingId and all
exports.getAllMeetingUsers = (req, res, next) => {
    const { meetingId } = req.query;

    meetingService.checkMeetingExists(meetingId, (error, results) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results

        });
    })
}

