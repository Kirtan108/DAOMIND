const { EmbedBuilder } = require('discord.js')
const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

const appEmbed = new EmbedBuilder()
.setColor(0x2f3136)
.setTitle("You need to connect to the App")
.setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })

const votedCandidate = new EmbedBuilder()
.setImage(`${downpage}`)
.setColor(0xFFE586)
.setTitle(`You have already voted this candidate!`)

const voteLimit = new EmbedBuilder()
.setImage(`${downpage}`)
.setColor(0xFFE586)
.setTitle(`You have already voted this candidate!`)

module.exports = { appEmbed, votedCandidate, voteLimit }