const { Collection, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const { userInfo } = require("./utils/connect")
const { format, getMagicEdenWatchList, deletePath } = require("./utils/functions")

const profileModel = require("./models.js")

const dotenv = require('dotenv')
dotenv.config()

const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

let count = 0
setInterval(() => {
  count = 0
}, 1000)

// EVENT HANDLER BELOW ///
const eventHandler = async (interaction) => {
  // FILTER HIDDEN SINCE IT'S IN INDEX
  // if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) return
  // await interaction.deferUpdate({ ephemeral: true })
  await interaction.deferReply({ ephemeral: true })

  const member = interaction.guild.members.cache.get(interaction.user.id)
  const time = 1000 * 60

  const embedLog = new EmbedBuilder().setImage(`${downpage}`).setThumbnail(`${member.displayAvatarURL()}`).setDescription(`• ${member}`).setFooter({ text: `ID: ${member.id}` }).setTimestamp()

  const rateLimit = async () => {
    count++
  }
  rateLimit()
  if (count === 25) return console.log("WARNING Discord API LIMIT PEAK")

  // MONGO PROFILE
  // let profile
  // try {
  //   profile = await profileModel.findOne({ userID: interaction.user.id })
  //   if (!profile) {
  //     let profile = await profileModel.create({
  //       userID: interaction.user.id,
  //       serverID: interaction.guildId,
  //       discordAvatar: `https://cdn.discordapp.com/guilds/${interaction.guildId}/users/${interaction.user.id}/avatars/${member.avatar}.png?size=4096`,
  //     })
  //     profile.save()
  //   }
  // } catch (error) {
  //   console.log(error)
  // }

  // const updateProfile = async (action) => {
  //   const update = await profileModel.findOneAndUpdate(
  //     {
  //       userID: interaction.user.id
  //     },
  //     {
  //       $push: action
  //     }
  //   )
  // }
  
  // let searchComment = !profile ? -1 : profile.tweetComments.findIndex(r => r === interaction.message.id)
  // let searchQuest = !profile || interaction.values === undefined ? -1 : profile.quests.findIndex(r => r === interaction.values[0])

  // STORE
  if (interaction.customId === 'store') {

    const items = new StringSelectMenuBuilder()
      .setCustomId('items')
      .setPlaceholder('Select an item...')
      .addOptions(
        // {
        //   label: '🎟️ Ticket to enter Raffles',
        //   description: 'Price: 3,000$',
        //   value: 'raffle_ticket',
        // },
        {
          label: '🪵 15K $WOOD Drop',
          description: 'Price: 15,000$',
          value: 'wood_drop',
        },
        {
          label: '📤 Withdraw to the Bank',
          description: 'Only if you have the $15K WOOD Drop',
          value: 'withdraw',
        },
      )
    const shop = new ActionRowBuilder().addComponents(items)
    await interaction.followUp({ embeds: [connectStore1, connectStore2], components: [shop], ephemeral: true })
  } // STORE ITEMS BELOW
  if (interaction.customId === 'items') {
    const selected = await interaction.values[0]

    await userInfo(interaction.user.id).then(async r => {
      if (r === undefined) return interaction.followUp({ content: "To many ongoing requests, please wait 5s and try again!", ephemeral: true })
      const wallet = await r.user.public_key
      const balance =  !r.user.reward ? 0 : r.user.reward.balance
      const total = !r.user.reward ? 0 : r.user.reward.total

      // TICKET ROLE
      // if (selected === 'raffle_ticket') {
      //   const hasRole = await member["_roles"].findIndex(r => r === process.env.TICKET_ROLE)
      //   const reason = 'storeItem: raffle ticket'
      //   if (hasRole !== -1) return interaction.followUp({ content: "You already have a ticket!", ephemeral: true })

      //   await claimToken(wallet, 3000, reason).then(async r => {
      //     if (r === undefined) return interaction.editReply({ content: "To many ongoing requests, please wait 5s and try again!", ephemeral: true })
      //     // If user has balance vs if user doesn't have balance
      //     if (r.error === null) {
      //       member.roles.add(ticketRole).catch(err => console.log(err))
      //       return interaction.followUp({ content: "Congratulations, item purchased! You are now able to enter the raffles.", components: [], ephemeral: true })
      //     } else {
      //       return interaction.followUp({ content: "Not enought funds!", components: [], ephemeral: true })
      //     }
      //   })
      // }
      // WOOD DROP ROLE
      if (selected === 'wood_drop') {
        const amount = 15000
        //return interaction.followUp({ content: "All transactions are being reviewed for legitimacy so this service is currently unavailable, please await until further notification. It will be available again soon! - *Estimated time: 12-24h*", ephemeral: true })
        const hasRole = await member["_roles"].findIndex(r => r === process.env.CLAIM_ROLE)
        const hasRole2 = await member["_roles"].findIndex(r => r === process.env.WEEKLY_ROLE)
        const reason = 'storeItem: 15k wood drop'
        if (hasRole !== -1) return interaction.followUp({ content: "You already have the item!", ephemeral: true })
        if (hasRole2 !== -1) return interaction.followUp({ content: "You need to wait until next week to request more $WOOD.", ephemeral: true })
        if (balance < amount) return interaction.followUp({ content: "Not enought funds!", ephemeral: true })

        await claimToken(wallet, amount, reason).then(async r => {
          //if (r === undefined) return interaction.followUp({ content: "To many ongoing requests, please wait 5s and try again!", ephemeral: true })
          // If user has balance vs if user doesn't have balance
          if (r.error === null) {
            //bankDrop(wallet)
            member.roles.add(claimRole).catch(err => console.log(err))
            return interaction.followUp({ content: "Item purchased! To withdraw choose the option **Withdraw to the Bank** in the Store.", components: [], ephemeral: true })
          } else {
            return interaction.followUp({ content: "Not enought funds!", components: [], ephemeral: true })
          }
        })
      }
      // WITHDRAWAL
      if (selected === 'withdraw') {
        //return interaction.followUp({ content: "All transactions are being reviewed for legitimacy so this service is currently unavailable, please await until further notification. It will be available again soon! - *Estimated time: 12-24h*", ephemeral: true })
        const hasRole = await member["_roles"].findIndex(r => r === process.env.CLAIM_ROLE)
        const hasRole2 = await member["_roles"].findIndex(r => r === process.env.TWOCLAIM_ROLE)
        if (hasRole2 !== -1) {
          await member.roles.add(weeklyRole).then(async () => {
            const embedLog = new EmbedBuilder()
              .setTitle(`KINGDOM 2K BANK WITHDRAWAL`)
              .setThumbnail(`${member.displayAvatarURL()}`)
              .setDescription(`• ${member} has withdraw the $WOOD to the Kingdom Bank\n> Balance: **${format(balance)}** ${token}\n> Total: **${format(total)}** ${token}`)
              .setColor(0xFFDE59).setFooter({ text: `ID: ${member.id}` })
              .setTimestamp()
            await bankDrop(wallet, 2000)
            await member.roles.remove(claimRole2K)
            await interaction.editReply({ content: "Congratulations $Wood has been dropped!\nIt's now available in the [Wood Bank](https://quest.mindfolk.art/bank)\n\n**BE AWARE:** Only Phantom or Solflare Wallets are supported", components: [], ephemeral: true })
            return interaction.guild.channels.cache.get(process.env.DROPLOG_CH).send({ embeds: [embedLog] })
          })
        }
        if (hasRole === -1) {
          return interaction.followUp({ content: "You need to buy first the $15K WOOD Drop", ephemeral: true })
        } else {
          if (hasRole !== -1) {
            await member.roles.add(weeklyRole).then(async () => {
              const embedLog = new EmbedBuilder()
                .setTitle(`KINGDOM 15K BANK WITHDRAWAL`)
                .setThumbnail(`${member.displayAvatarURL()}`)
                .setDescription(`• ${member} has withdraw the $WOOD to the Kingdom Bank\n> Balance: **${format(balance)}** ${token}\n> Total: **${format(total)}** ${token}`)
                .setColor(0xFF4CBA).setFooter({ text: `ID: ${member.id}` })
                .setTimestamp()
              await bankDrop(wallet, 15000)
              await member.roles.remove(claimRole)
              await interaction.editReply({ content: "Congratulations $Wood has been dropped!\nIt's now available in the [Kingdom Bank](https://kingdom.mindfolk.art/)\n [Video-Tutorial](https://youtu.be/DpEdortRaSw)\n\n**BE AWARE:** Only Phantom or Solflare Wallets are supported", components: [], ephemeral: true })
              return interaction.guild.channels.cache.get(process.env.DROPLOG_CH).send({ embeds: [embedLog] })
            })
          }
        }
      }
    })
  }
  // BALANCE
  if (interaction.customId === 'balance') {
    await userInfo(interaction.user.id).then(async d => {
      if (!d || !d.user) return console.log(d)
      const balanceA = !d.user.reward ? 0 : d.user.reward.balance
      const balance = format(balanceA)
      const claimed = format(d.user.reward.total - d.user.reward.balance)
      //const tickets = d.user.reward.tickets === null ? "0" : format(d.user.reward.tickets)
      //const Founders = d.user.reward.founders === null ? "0" : d.user.reward.founders
      // const username = !d.user.discord ? '' : d.user.discord.username
      // const discriminator = !d.user.discord ? '' : d.user.discord.discriminator
      const twitter = d.user.twitter === null ? `Twitter User: Not Connected` : `Twitter User: @${d.user.twitter.username}`
      const wallet = d.user.public_key
      const wallet1 = wallet.slice(0, 13)
      const wallet2 = wallet.slice(-13)
      const b = "```"
      const a = "`"
      const userWallets = d.user.wallet.filter(i => i.is_primary === false).map(r => r.public_key.slice(0, 13) + "....." + r.public_key.slice(-13))

      const balanceEmb = new EmbedBuilder()
        .setTitle("Your current balance")
        .addFields(
          { name: `• Balance:`, value: `>  ${balance} ${token}`, inline: false },
          { name: `• Main Wallet:`, value: `${b}${wallet1 + "....." + wallet2}${b}`, inline: false },
          { name: `• Linked Wallets:`, value: `${a}${userWallets.toString().replace(",", "\n")}${a}`, inline: false },
        )
        .setColor(0xBFF5A1)
        .setImage(`${downpage}`)
        .setThumbnail(`${member.displayAvatarURL({ size: 1024, format: 'png', dynamic: true })}`)
        .setFooter({ text: `Discord User: ${interaction.user.username + '#' + interaction.user.discriminator} ⸺ ${twitter}` });

      return interaction.followUp({ embeds: [connectBalance1, balanceEmb], ephemeral: true })
    })
  }
}

module.exports = eventHandler