const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const mfpage = "https://mindfolk.art/"
const token = "<:dwood:1055600798756777984>"
module.exports = {
    data: {
      name: "uidao",
      aliases: ['uidao'],
      description: "User Interface",
    },
    run: async (client, message, args) => {
      await message.delete()

      const embed1 = new EmbedBuilder()
      .setImage("https://cdn.discordapp.com/attachments/1083674351737503825/1083674372218310707/notion_DAO.png")
      .setColor(0x2f3136)     

      const embed = new EmbedBuilder()
      .setColor(0x95D8E5)
      //.setAuthor({ name: "DAOmind" })
      .setImage("https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png")
      .setTitle('⸺ DASHBOARD')
      .setDescription(`This is the panel where you can access information and perform actions related to the DAO.Interact with the buttons below to perform the respective action.\n\n**__Claim Vote Power__** will take several seconds since it will run through all your wallets counting your Founders.\n**Please, be patient**`)
      .setFooter({ text: "DAOmind" })
      
      const votePower = new ButtonBuilder()
        .setCustomId('vote_power')
        .setLabel('Claim Vote Power')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📩')

      const profile = new ButtonBuilder()
        .setCustomId('dao_profile')
        .setLabel('DAO Profile')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔍')

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

      

      const row = new ActionRowBuilder().addComponents(votePower, profile)

      await message.channel.send({ embeds: [embed1, embed], components: [row] })
    },
  };