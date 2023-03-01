const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format, getNFTWallet } = require("../../utils/functions")
const fs = require("fs")

const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

module.exports = {
  data: new ContextMenuCommandBuilder()
	.setName('Vote Power')
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
        //const wallet = r.user.public_key
        const userWallets = r.user.wallet.map(i => i.public_key)

        let count = 0
        Object.keys(userWallets).forEach(async key => {
          const wallet = userWallets[key]
          const collectionNFT = await getNFTWallet(wallet)
          await collectionNFT.forEach(function (x) {
            const collection = x.collectionName
            if (collection !== 'mindfolk') return
            count++
          })
        })
        return
      })
    },
};