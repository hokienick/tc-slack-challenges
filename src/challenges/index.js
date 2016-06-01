'use strict';

const _ = require('lodash')
const VError = require('verror')
const request = require('request')
const moment = require('moment')
const config = require('../config')

var endpoint = 'http://api.topcoder.com/v2/challenges/active?type=develop&sortcolumn=registrationEndDate&sortorder=asc';

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

        var result = JSON.parse(body);
        let challenges = [];

        _.each(result.data, (challenge) => {
                if (moment(challenge.registrationStartDate) > moment().subtract(config('HOOK_INTERVAL_IN_MINUTE'), 'm') &&
                    moment(challenge.registrationStartDate) < moment()) {
                       
                    var detail = `*Prize*:$ ${challenge.totalPrize}`
                    detail += `\n*Registeration ends*:${moment(challenge.registrationEndDate).format('MMM DD, YYYY HH:mm')}`
                    detail += `\n*Technologies*: ${challenge.technologies.join(', ')}`
                    detail += `\n*Type*:${challenge.challengeType}`
                    var item = {
                        title: `${challenge.challengeName}`,
                        title_link: `https://www.topcoder.com/challenge-details/${challenge.challengeId}/?type=develop&nocache=true`,
                        text: detail,
                        mrkdwn_in: ['text', 'text', 'pretext']
                    }
                   
                    challenges.push(item);
                }
            })
            callback(null, challenges)
    })
}

module.exports = challenge;
