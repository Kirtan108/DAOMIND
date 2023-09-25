const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const { daoModel } = require("../../models.js")
module.exports = {
  data: {
    name: "winner",
    aliases: ['winner'],
    description: "winner",
  },
  run: async (client, message, args) => {
    //await message.delete()
    const members = await daoModel.find({})
    const winner = members[Math.floor(Math.random() * members.length)]

    return message.channel.send({ content: `${winner}`})
  },
};