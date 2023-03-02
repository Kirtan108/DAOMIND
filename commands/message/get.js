const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: {
      name: "get",
      aliases: ['get'],
      description: "Information",
    },
    run: async (client, message, args) => {
      //await message.delete()

      const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      //.setImage("https://cdn.discordapp.com/attachments/1034106468800135168/1052043063771541534/logo_1.png")
      .setTitle('Link to the App')
      .setDescription(`Push button below`)
      
      const button = new ButtonBuilder()
	    .setCustomId('abc')
	    .setLabel('Connect')
	    .setStyle(ButtonStyle.Success)

      const button2 = new ButtonBuilder()
      .setURL("https://connect.mindfolk.art/")
      .setLabel('Connect App')
      .setStyle('Link')
      .setEmoji(':logoapp:1065033438069002241')

      const row = new ActionRowBuilder().addComponents(button)
      
      // await message.channel.send({ embeds: [embed], components: [row] })
      await message.channel.send({ content: "I'm here!", components: [row] })
    },
  };