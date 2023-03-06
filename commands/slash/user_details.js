const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js')

const { userInfo } = require("../../utils/connect")
const { format } = require("../../utils/functions")
const { daoModel } = require("../../models.js")
const fs = require("fs")


module.exports = {
    data: new SlashCommandBuilder()
    .setName('user_details')
    .setDescription('Check the details of specific User')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
              .setRequired(true)),
    run: async ({ client, interaction }) => {
      //console.log(interaction.options/*._hoistedOptions*/)
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

        if(r === undefined || r.error !== null) return interaction.editReply({ embeds:[errorEmbed], ephemeral: true })

        // const infoEmbed = new EmbedBuilder()
        // .setColor(0xBFF5A1)
        // .setTitle(`${mention.username}#${mention.discriminator} Transactions`)
        // .setDescription(`**• Balance:  **${format(r.user.reward.balance)}**\n• Total:   **${format(r.user.reward.total)}`)
        // .setThumbnail(`${mention.displayAvatarURL()}`)
        // .addFields(
        //     { name: '• Discord', value: `${discord}`, inline: true },
        //     { name: '• Twitter', value: `${twitter}`, inline: true },
        //     { name: '\u200B', value: '\u200B', inline: true },
        // )

        let profile = await daoModel.findOne({ userID: member })
        if (!profile) return interaction.editReply({ content: "This users doesn't have a DAO profile yet.", ephemeral: true })
        //   try {
        //       profile = await daoModel.findOne({ userID: interaction.user.id })
        //       if (!profile) {
        //           let profile = await daoModel.create({
        //               userID: interaction.user.id,
        //               serverID: interaction.guildId,
        //           })
        //           profile.save()
        //       }
        //   } catch (error) {
        //       console.log(error)
        //   }
        const daoProfile = JSON.stringify(profile, null, 2)
        fs.writeFileSync('./daoprofile.csv', daoProfile)
        const attachment = new AttachmentBuilder(
            './daoprofile.csv',
            {
                name: 'dao_profile.csv'
            }
        )
         //await channel.send({ content: `${mention}`, embeds: [infoEmbed] })
        await channel.send({ content: `${mention}`,files: [attachment], ephemeral: false })
        await interaction.editReply({ content: "Success!", ephemeral: true })
        fs.unlinkSync('./daoprofile.csv')
      })
    },
};