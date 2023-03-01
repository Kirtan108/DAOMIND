const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format } = require("../../utils/functions")
const token = "<:dwood:1055600798756777984>"

module.exports = {
    data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check the information of specific User')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
              .setRequired(true)),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
      // await interaction.deferReply()
      const channel_id = await interaction.channel.id
      const channel = await interaction.guild.channels.cache.get(`${channel_id}`)
      const member = interaction.options._hoistedOptions[0].value
      const mention = interaction.options.getUser('user')

      await userInfo(member).then(async r => {
        const errorEmbed = new EmbedBuilder()
         .setColor(0x0a0a0a)
         .setTitle(`User not Connected to the App`)
         .setDescription(`• ${mention}`)
         .setThumbnail(`${mention.displayAvatarURL()}`)
         .setTimestamp()
         .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
        
        if(r === undefined) return interaction.editReply({ embeds:[errorEmbed], ephemeral: true })
        if(r.error !== null){
         return interaction.editReply({ embeds:[errorEmbed], ephemeral: false })
        }
        const discord = r.user.discord === null ? "Not Connected 🔴" : "Connected 🟢"
        const twitter = r.user.twitter === null ? "Not Connected 🔴" : "Connected 🟢"
        const b = "```"
        const balance = !r.user.reward ? 0 : r.user.reward.balance

        // memberTransaction
        // const button = new ButtonBuilder()
        //   .setURL(`http://localhost/3000/member/transactions/publicKey=${publicKey}`)
        //   .setLabel('📝 Transactions')
        //   .setStyle('Link')

        // const row = new ActionRowBuilder().addComponents(button) 

        const infoEmbed = new EmbedBuilder()
        .setColor(0xBFF5A1)
        .setTitle(`${mention.username}#${mention.discriminator} Details`)
        .setDescription(`**• ${mention} Wallet:**${b}${r.user.public_key}${b}\n${token} $WOOD\n> Balance: **${format(balance)}**\n> Total: **${format(r.user.reward.total)}**`)
        .setThumbnail(`${mention.displayAvatarURL()}`)
        .addFields(
            { name: '• Discord', value: `${discord}`, inline: true },
            { name: '• Twitter', value: `${twitter}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
        await channel.send({ embeds: [infoEmbed], ephemeral: false })
        return interaction.editReply({ content: "Success!", ephemeral: true })
      })
    },
};