const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format, getNFTWallet } = require("../../utils/functions")

module.exports = {
  data: new ContextMenuCommandBuilder()
	.setName('User Profile')
	.setType(ApplicationCommandType.User),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
      // await interaction.deferReply()
      const member = interaction.targetUser.id
      const mention = interaction.targetUser

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
        const a = "`"

        const chopList = r.user.chop_list === true ? "Approved" : "Pending"
        const whiteList = r.user.approved === true ? "Approved" : "Pending"
        const wallet = r.user.public_key
        const userWallets = r.user.wallet.map(i => i.public_key).filter(val => !wallet.includes(val))
        const balance = !r.user.reward ? 0 : r.user.reward.balance

        const infoEmbed = new EmbedBuilder()
        .setColor(0xBFF5A1)
        .setTitle(`${mention.username}#${mention.discriminator} Details`)
        .setDescription(`**• ${mention} Wallet:**${b}${r.user.public_key}${b}\n${token} $WOOD\n> Balance: **${format(balance)}**\n> Total: **${format(r.user.reward.total)}**`)
        .setThumbnail(`${mention.displayAvatarURL()}`)
        .addFields(
            { name: '• Discord', value: `${discord}`, inline: true },
            { name: '• Twitter', value: `${twitter}`, inline: true },
            { name: `• Linked Wallets:`, value: `${a}${userWallets.toString().replace(",", "\n")}${a}`, inline: false },
            //{ name: '\u200B', value: '**⸺ NFTS**\u200B' },
            //{ name: '• Application Status', value: `**WL ⸺** ${whiteList}\n**CL ⸺** ${chopList}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
        if (r.user.twitter !== null){
          const username = r.user.twitter.username 
          const profileLink = `https://twitter.com/${username}`
          const button2 = new ButtonBuilder()
          .setURL(profileLink)
          .setLabel(' Go to Twitter profile')
          .setStyle('Link')
          .setEmoji(':profile:1065817448223358976')
          
         const row = new ActionRowBuilder().addComponents(button2)
         return interaction.editReply({ embeds: [infoEmbed], components: [row], ephemeral: false })
        }
        await interaction.editReply({ embeds: [infoEmbed], ephemeral: false })
      })
    },
};