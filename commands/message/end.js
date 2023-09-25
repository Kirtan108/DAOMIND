const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const { electionModel } = require("../../models.js")
module.exports = {
  data: {
    name: "end",
    aliases: ['end'],
    description: "End",
  },
  run: async (client, message, args) => {
    //await message.delete()
    const candidates = await electionModel.find({})
    const votes = candidates.map(x => {
      return { name: x.name, votes: x.votes }
    })
    votes.sort((a, b) => b.votes - a.votes);
    //const result = candidates
    votes.forEach(async m => {
      await message.channel.send(`${m.name} - ${m.votes}`)
    })
    return console.log(votes)
  },
};