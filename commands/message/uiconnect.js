const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const mfpage = "https://mindfolk.art/"
const token = "<:dwood:1055600798756777984>"
module.exports = {
    data: {
      name: "uiconnect",
      aliases: ['uiconnect'],
      description: "User Interface",
    },
    run: async (client, message, args) => {
      await message.delete()

      const embed1 = new EmbedBuilder()
      .setImage("https://cdn.discordapp.com/attachments/1062678878545518683/1064854170559058011/Connect_dashboards.png")
      .setColor(0x2f3136)     

      const embed = new EmbedBuilder()
      .setColor(0xBFF5A1)
      .setAuthor({ name: "Connect" })
      .setImage("https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png")
      .setTitle('⸺ DASHBOARD')
      .setDescription(`This is the user panel where you can access both the store and the information of your Discord $WOOD account. ${token}
      \nInteract with the buttons below to perform the respective action.`)
      .setFooter({ text: "Connect - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
      
      const store = new ButtonBuilder()
        .setCustomId('store')
        .setLabel('Store')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(':store:1055660886188097659')

      const balance = new ButtonBuilder()
        .setCustomId('balance')
        .setLabel('Balance')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(':balance:1055660883130466314')

      const quests = new ButtonBuilder()
        .setCustomId('questboard')
        .setLabel('Quests')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(':quests:1067123538575773757')

      const leaderboard = new ButtonBuilder()
      .setCustomId('leaderboard')
      .setLabel('Leaderboard')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(':leaderboard:1055793477436317706')

      

      const row = new ActionRowBuilder().addComponents(store, balance, quests)

      await message.channel.send({ embeds: [embed1, embed], components: [row] })
    },
  };