const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true},
    serverID: { type: String, require: true},
    discordAvatar: { type: String },
    tweetLikes: [ String ],
    tweetRetweets: [ String ],
    tweetComments: [ String ],
    quests: [ String ],
    userFollowed: [ String ],
    userLikes: [ String ],
    userRetweets: [ String ],
    counter: { type: Number, default: 0 }
})

// const twitterSchema = new mongoose.Schema({
//     userID: { type: String, require: true, unique: true},
//     serverID: { type: String, require: true},
//     discordAvatar: { type: String },
//     twitterAvatar: { type: String },
//     userFollowed: [ String ],
//     following: { type: Number, default: 0 }
// })

const model = mongoose.model('ProfileModels', profileSchema)
//const modelTwitter = mongoose.model('TwitterModels', twitterSchema)
module.exports = model