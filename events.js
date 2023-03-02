const { Collection, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const { userInfo } = require("./utils/connect")
const { format, getNFTWallet } = require("./utils/functions")

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
  // await interaction.deferReply({ ephemeral: true })
  // await interaction.deferUpdate({ ephemeral: true })

  const member = interaction.guild.members.cache.get(interaction.user.id)

  const embedLog = new EmbedBuilder().setImage(`${downpage}`).setThumbnail(`${member.displayAvatarURL()}`).setDescription(`• ${member}`).setFooter({ text: `ID: ${member.id}` }).setTimestamp()

  const rateLimit = async () => {
    count++
  }
  rateLimit()
  if (count === 25) return console.log("WARNING Discord API LIMIT PEAK")

  // MONGO PROFILE
  let profile
  try {
    profile = await profileModel.findOne({ userID: interaction.user.id })
    if (!profile) {
      let profile = await profileModel.create({
        userID: interaction.user.id,
        serverID: interaction.guildId,
      })
      profile.save()
    }
  } catch (error) {
    console.log(error)
  }

  const updateProfilePush = async (action) => {
    const update = await profileModel.findOneAndUpdate(
      {
        userID: interaction.user.id
      },
      {
        $push: action
      }
    )
  }
  const updateProfileSet = async (action) => {
    const update = await profileModel.findOneAndUpdate(
      {
        userID: interaction.user.id
      },
      {
        $set: action
      }
    )
  }

  const voteLimit = profile.voteLimit
  const votePower = profile.votePower

  if (interaction.customId === 'council_election'){
    await interaction.deferReply({ ephemeral: true })
    if(voteLimit === 2) return interaction.followUp({ content: "Already reached limit in votes!", ephemeral: true })
    const candidate = interaction.message.embeds[0].data.fields[0].value

    await userInfo(interaction.user.id).then(async r => {
      if (r === undefined || r.error !== null) {
        const appEmbed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle("You need to connect to the App")
          .setFooter({ text: "ConnectApp - Powered by Mindfolk", iconURL: "https://media.discordapp.net/attachments/1048740961561366589/1055593587741564988/logoapp.png" })
        const button = new ButtonBuilder()
          .setURL("https://connect.mindfolk.art/")
          .setLabel('Connect App')
          .setStyle('Link')
        const row = new ActionRowBuilder().addComponents(button)
        return interaction.followUp({ embeds: [appEmbed], components: [row], ephemeral: true })
      }
      const userWallets = r.user.wallet.map(i => i.public_key)
      let count = 0
      async function awaitTasks(object) {
        const promises = [];
        Object.keys(object).forEach(async key => {
          const promise = new Promise(async (resolve, reject) => {
            const wallet = object[key]
            const collectionNFT = await getNFTWallet(wallet)
            if (collectionNFT.length === 0) return resolve()
            await collectionNFT.forEach(function (x) {
              const collection = x.collectionName
              if (collection === undefined || collection !== 'mindfolk') return
              count++
            })
            resolve(count)
          });
          promises.push(promise)
        });
        await Promise.all(promises).catch(error => console.error(error))
      }
      await awaitTasks(userWallets)
      console.log(count)

      const button = new ButtonBuilder()
        .setCustomId(`candidate_${candidate}`)
        .setLabel('Vote')
        .setStyle(ButtonStyle.Success)

      const verifyPanel = new EmbedBuilder()
        .setColor(0x0a0a0a)
        .setTitle(`⸺ Verification`)
        .setDescription(`Do you want to vote for this candidate?\n**Accepting this message will confirm the action.**\n\n**• Candidate:** ${candidate}`)
        //.setThumbnail(`${mention.displayAvatarURL()}`)
        .addFields({ name: '• Vote Power', value: `> **${count}**`, inline: true })

      const verifyRow = new ActionRowBuilder().addComponents(button)
      await updateProfileSet({ votePower: count })
      return interaction.followUp({ embeds: [verifyPanel], components: [verifyRow], ephemeral: true })
    })
  }

  if (interaction.customId.startsWith('candidate')){
    await interaction.deferUpdate({ ephemeral: true })
    const candidate = await interaction.customId.split('_')[1]
    const messages = await interaction.guild.channels.cache.get(interaction.channelId).messages.fetch()
    const voteEmbed = messages.filter(m => m.author.id === process.env.CLIENT_ID).values().next()

    const message = await interaction.guild.channels.cache.get(interaction.channelId).messages.fetch(voteEmbed.value.id);

    const receivedEmbed = message.embeds[0];
    const newEmbed = EmbedBuilder.from(receivedEmbed)
    const newVotes = Number(newEmbed.data.fields[1].value) + votePower
    newEmbed.data.fields[1] = { name: '• Votes', value: `${newVotes}`, inline: true }
    message.edit({ embeds: [newEmbed] })
    return interaction.editReply({ content: "Voting sucessful!", embeds: [], components: [], ephemeral: true })
    profileModel.find({}, (err, data) => {
      if (err) console.error(err)
      const user = data.find(i => i.userID === interaction.user.id)
      console.log(user.voteLimit)
    });
    if(voteLimit === 3) return interaction.followUp({ content: "Already reached limit in votes!", ephemeral: true })
    const newCount = voteLimit + 1
    await updateProfileSet({ voteLimit: newCount })
    return interaction.followUp({ content: "Test", ephemeral: true })
  }
  
  // 
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