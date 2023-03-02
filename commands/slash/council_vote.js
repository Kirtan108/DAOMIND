const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format } = require("../../utils/functions")
const token = "<:dwood:1055600798756777984>"

module.exports = {
    data: new SlashCommandBuilder()
    .setName('council_vote')
    .setDescription('Create the vote panel for the candidate')
    .addStringOption(option =>
      option.setName('candidate')
        .setDescription('The name of the candidate')
              .setRequired(true)),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)
      const candidate = interaction.options._hoistedOptions[0].value
      //const mention = interaction.options.getUser('user')

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
	    .setStyle(ButtonStyle.Success)

      const voteRow = new ActionRowBuilder().addComponents(button)
      
      await channel.send({ embeds: [votePanel], components: [voteRow], ephemeral: false })
      return interaction.editReply({ content: "Success!", ephemeral: true })
    },
};