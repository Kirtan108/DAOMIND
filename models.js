const mongoose = require('mongoose')

const daoSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true},
    serverID: { type: String, require: true},
    publicKey: { type: String },
    councilVotes: [ String ],
    NFTKeys: [ String ],
    voteLimit: { type: Number, default: 0 },
    votePower: { type: Number, default: 0 },
    snapshot: { type: Boolean, default: false }
    //receivedVotes: [ String ],
})

// const candidatesSchema = new mongoose.Schema({
//     name: { type: String, require: true },
//     votes: [ String ]
// })

const electionSchema = new mongoose.Schema({
    name: { type: String, require: true, unique: true},
    votes: { type: Number, default: 0 },
    voteKeys: [ String ],
    voteIds: [ String ],
    voteWallets: [ String ]
})

const daoModel = mongoose.model('daosSecond', daoSchema)
const electionModel = mongoose.model('secondelection', electionSchema)
module.exports = { daoModel, electionModel }