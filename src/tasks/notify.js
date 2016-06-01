
'use strict'

const _ = require('lodash')
const config = require('../config')
const challenges = require('../challenges')
const Botkit = require('botkit')

var controller = Botkit.slackbot({})
var bot = controller.spawn()

bot.configureIncomingWebhook({ url: config('WEBHOOK_URL') })

const msgDefaults = {
  response_type: 'in_channel',
  parse:'full',
  link_names:'1'
}

challenges.active((err, challenges) => {
  if (err) throw err
  // if(challenges.length>0){
  //   challenges.unshift({
  //     text:`Hey @channel, Checkout this challenge(s), you might be interested.`
  //   })
  // }
 
  let msg = _.defaults({ attachments: challenges }, msgDefaults)

  bot.sendWebhook(msg, (err, res) => {
    if (err) throw err

    console.log(`\n🚀 ${challenges.length} new challenges posted 🚀`)
  })
})
