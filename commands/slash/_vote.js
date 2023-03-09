const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format, getNFTWallet, getNFTS, shyftNFT, countAllNFTS } = require("../../utils/functions")
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
        const userWallets = r.user.wallet.map(i => i.public_key)
        const wallet = await r.user.public_key

        //return shyftNFT(wallet)
        //return getNFTS(wallet)
        
        //let count = 0
        async function awaitTasks(object) {
          const promises = [];
          Object.keys(object).forEach(async key => {
            const promise = new Promise(async (resolve, reject) => {
              const wallet = object[key]
              const collectionNFT = await getNFTS(wallet)
              if(collectionNFT.length === 0) return resolve()
              collectionNFT.forEach(function (x) {
                const collection = x.collectionName
                if (collection === undefined || collection !== 'Mindfolk') return
                count++
              })
              resolve(count)
            });
            promises.push(promise)
          });
          await Promise.all(promises).catch(error => console.error(error))
        }

        //await awaitTasks(userWallets)

        const result = await countAllNFTS(userWallets)
        // console.log(result.tokenKeys)
        
        console.log("COUNT: ", result.count)
        const votePowerEmbed = new EmbedBuilder()
        .setColor(0x0a0a0a)
        .setAuthor({ name: mention.username })
        .setTitle(`⸺ VOTE POWER`)
        .setDescription(`> **${result.count}**`)
        .setThumbnail(`${mention.displayAvatarURL()}`)

        return interaction.followUp({ embeds: [votePowerEmbed] })
      })
    },
};