const mongoose = require('mongoose')

const daoSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true},
    serverID: { type: String, require: true},
    councilVotes: [ String ],
    voteLimit: { type: Number, default: 0 },
    votePower: { type: Number, default: 0 },
    //receivedVotes: [ String ],
})

const model = mongoose.model('daos', daoSchema)
module.exports = model