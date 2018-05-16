'use strict';

const _ = require('lodash')
const VError = require('verror')
const request = require('request')
const moment = require('moment')
const config = require('../config')

var endpoint = 'https://api.topcoder.com/v3/challenges?filter=status=ACTIVE%26track=DEVELOP%26isTask=0'
const challenge = {};

challenge.active = (callback) => {
    request(endpoint, function(err, response, body) {
        //Check for error
        if (err) {
            return callback(new VError(err, 'unable to get challenges.'))
        }

        //Check for right status code
        if (response.statusCode !== 200) {
            return callback(new VError(err, 'Invalid Status Code Returned: %s', response.statusCode));
        }

        var body = JSON.parse(body);
        let challenges = [];

        _.each(body.result.content, (challenge) => {
                if (moment(challenge.registrationStartDate) > moment().subtract(config('HOOK_INTERVAL_IN_MINUTE'), 'm') &&
                    moment(challenge.registrationStartDate) < moment()) {
                       
                    var detail = `*Prize*:$ ${challenge.totalPrize}`
                    detail += `\n*Registration ends*:${moment(challenge.registrationEndDate).format('MMM DD, YYYY HH:mm')}`
                    detail += `\n*Technologies*: ${challenge.technologies}`
                    detail += `\n*Type*:${challenge.subTrack}`
                    if(challenge.events && challenge.events.length){
                        detail += `\n*Eligible Events*: ${challenge.events.map(i=>i.eventName).join(', ')}`
                    }
                    var item = {
                        title: `${challenge.name}`,
                        title_link: `https://www.topcoder.com/challenge-details/${challenge.id}/?type=develop&nocache=true`,
                        text: detail,
                        mrkdwn_in: ['text', 'text', 'pretext'],
                        actions: [
                            {
                              "type": "button",
                              "text": "Forum",
                              "url": `https://apps.topcoder.com/forums/?module=Category&categoryID=${challenge.forumId}`,
                              "style": "primary"
                            },
                            {
                              "type": "button",
                              "text": "Apply as Reviewer",
                              "url" : `https://www.topcoder.com/challenges/${challenge.id}/review-opportunities`,
                              "style": "danger"
                            }
                          ]
                    }
                   
                    challenges.push(item);
                }
            })
            callback(null, challenges)
    })
}

module.exports = challenge;
