const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ButtonStyle } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format, getNFTWallet, getNFTS, shyftNFT, countAllNFTS } = require("../../utils/functions")
const fs = require("fs")

const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

module.exports = {
  data: new ContextMenuCommandBuilder()
	.setName('Candidate')
	.setType(ApplicationCommandType.User),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
      // await interaction.deferReply()
      const member = interaction.targetUser.id
      const mention = interaction.targetUser
      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)

      const candidate = mention.username

      const votePanel = new EmbedBuilder()
      .setColor(0x0a0a0a)
      .setAuthor({ name: "DAOmind" })
      .setTitle(`⸺ Council Vote`)
      .setDescription(`To vote for the candidate interact below. Remember that your voting power is equal to the number of Founders you hold.`)
      //.setThumbnail(`${mention.displayAvatarURL()}`)
      .addFields(
        { name: '• Candidate', value: `${candidate}`, inline: true },
        { name: '• Votes', value: `0`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
      )
      //.setTimestamp()
      //.setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
      
      const button = new ButtonBuilder()
	    .setCustomId(`council_election`)
	    .setLabel('Vote')
	    .setStyle(ButtonStyle.Primary)

      const voteRow = new ActionRowBuilder().addComponents(button)
      
      await channel.send({ embeds: [votePanel], components: [voteRow], ephemeral: false })
      return interaction.editReply({ content: "Success!", ephemeral: true })

    },
};