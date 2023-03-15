const { Collection, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// const web3 = require("@solana/web3.js")
// const bs58 = require("bs58")
// async function Transaction (){
//   await interaction.deferReply({ ephemeral: true })
//   const fromWallet = web3.Keypair.fromSecretKey(
//     bs58.decode(
//       process.env.P_KEY
//     )
//   );
//   console.log (fromWallet.publicKey.toString());
//   const solana = new web3.Connection("https://spring-sleek-shard.solana-mainnet.discover.quiknode.pro/86050a4119dd4d9f6d5279cfd00316fee4d4a3cb/");
//   // Replace fromWallet with your public/secret keypair, wallet must have funds to pay transaction fees.
//   const toWallet = web3.Keypair.generate();
//   const transaction = new web3.Transaction().add(
//     web3.SystemProgram.transfer({
//       fromPubkey: fromWallet.publicKey,
//       toPubkey: "CGDqzxvAs72vMxsw9tXjdTxzRwp43oaEszhUNgPzrbiz",
//       lamports: 1230000,
//     })
//   );
//   const TX = await web3.sendAndConfirmTransaction(solana, transaction, [fromWallet])
//   console.log(TX);
//   return interaction.editReply({ content: "The Sol has been sent to your wallet."})
// }

const VOTE_LIMIT = 7

const { userInfo } = require("./utils/connect")
const { format, getNFTWallet, countAllNFTS } = require("./utils/functions")
const { appEmbed, votedCandidate, voteLimit } = require("./utils/embeds")
const { appLink } = require("./utils/buttons")

const { daoModel, electionModel } = require("./models.js")


const dotenv = require('dotenv')
dotenv.config()

const downpage = "https://cdn.discordapp.com/attachments/1034106468800135168/1041668169426817044/downpage_1.png"

let count = 0
setInterval(() => {
  count = 0
}, 1000)

// EVENT HANDLER BELOW ///
const eventHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true })
  // await interaction.deferUpdate({ ephemeral: true })

  return interaction.followUp({ content: "The voting period for Council election has officially come to an end. The results will be announced officially iin the following hours.", ephemeral: true })

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
    profile = await daoModel.findOne({ userID: interaction.user.id })
    if (!profile) {
      let profile = await daoModel.create({
        userID: interaction.user.id,
        serverID: interaction.guildId,
      })
      profile.save()
    }
  } catch (error) {
    console.log(error)
  }
  const profileCandidate = async (person) => {
    let profileElection
    try {
      profileElection = await electionModel.findOne({ name: person })
      if (!profileElection) {
        let profileElection = await electionModel.create({
          name: person,
        })
        profileElection.save()
      }
      return profileElection
    } catch (error) {
      console.log(error)
    }
  }

  const updateProfilePush = async (action) => {
    const update = await daoModel.findOneAndUpdate(
      {
        userID: interaction.user.id
      },
      {
        $push: action
      }
    )
  }
  const updateProfileSet = async (action) => {
    const update = await daoModel.findOneAndUpdate(
      {
        userID: interaction.user.id
      },
      {
        $set: action
      }
    )
  }
  const updateElection = async (person, action) => {
    await profileCandidate(person)
    const update = await electionModel.findOneAndUpdate(
      {
        name: person
      },
      {
        $push: action
      }
    )
  }

  //let searchLike = !profile ? -1 : profile.tweetLikes.findIndex(r => r === interaction.message.id)

  const voteLimit = !profile ? null : profile.voteLimit
  const votePower = !profile ? null : profile.votePower
  const voteKeys = !profile ? null : profile.NFTKeys
  const votePublicKey = !profile ? null : profile.publicKey  
  const snapshot = !profile ? false : profile.snapshot  

  if (interaction.customId === 'vote_power'){
    await interaction.deferReply({ ephemeral: true })
    if (snapshot === true) return interaction.followUp({ content: "You have already verified your voting power!", ephemeral: true })

    await userInfo(interaction.user.id).then(async r => {
      if (r === undefined || r.error !== null) return interaction.followUp({ embeds: [appEmbed], components: [appLink], ephemeral: true })
      
      const userWallets = r.user.wallet.map(i => i.public_key)
      const mainWallet = r.user.public_key
      await updateProfileSet({ publicKey: mainWallet })
      const result = await countAllNFTS(userWallets)
      const count = result.count
      const tokenKeys = result.tokenKeys

      await updateProfileSet({ NFTKeys: tokenKeys })
      await updateProfileSet({ votePower: count })

      const button = new ButtonBuilder()
      .setCustomId(`snapshot`)
      .setLabel('Confirm Snapshot')
      .setStyle(ButtonStyle.Primary)

      const verifyPanel = new EmbedBuilder()
      .setColor(0x0a0a0a)
      .setTitle(`⸺ Vote Power Verification`)
      .setDescription(`Make sure your Vote Power matches the number of Founders you hold.\n**Accepting this message will confirm the snapshot.**\n\n**BEWARE:**\nIf the voting doesn't match with the Founders you hold, make sure those wallets are also linked in Connect. If the issue persists might be due to the Solana chain so just dismiss this message and press the Claim Vote Power button again.`)
        //.setThumbnail(`${mention.displayAvatarURL()}`)
      .addFields({ name: '• Vote Power', value: `> **${count}**`, inline: true })

      const verifyRow = new ActionRowBuilder().addComponents(button)
      return interaction.followUp({ embeds: [verifyPanel], components: [verifyRow], ephemeral: true })
    })
  }

  if (interaction.customId === 'dao_profile'){
    await interaction.deferReply({ ephemeral: true })
    if (snapshot !== true) return interaction.followUp({ content: "To be able to see your DAO profile you first need to Claim Vote Power!", ephemeral: true })

    const profileEmb = new EmbedBuilder()
        .setTitle("DAOmind Profile")
        .addFields(
          { name: `• Vote Power:`, value: `> ${votePower}`, inline: false },
          { name: `• Remaining Council Votes:`, value: `> ${VOTE_LIMIT - voteLimit}`, inline: false },
        )
        .setColor(0x95D8E5)
        .setImage(`${downpage}`)
        .setThumbnail(`${member.displayAvatarURL({ size: 1024, format: 'png', dynamic: true })}`)
        .setFooter({ text: `Discord User: ${interaction.user.username + '#' + interaction.user.discriminator}` })
    return interaction.followUp({ embeds: [profileEmb], ephemeral: true })
  }

  if (interaction.customId === 'snapshot'){
    await interaction.deferUpdate({ ephemeral: true })
    await updateProfileSet({ snapshot: true })
    const success = new EmbedBuilder()
      .setColor(0x95D8E5)
      .setTitle(`Snapshot Confirmed!`)
      //.setDescription(`Make sure your Vote Power matches the number of Founders you hold.\n**Accepting this message will confirm the snapshot.**`)
        //.setThumbnail(`${mention.displayAvatarURL()}`)
      //.addFields({ name: '• Vote Power', value: `> **${count}**`, inline: true })
    return interaction.editReply({ embeds: [success], components: [], ephemeral: true })
  }

  if (interaction.customId === 'council_election'){
    await interaction.deferReply({ ephemeral: true })
    if (snapshot !== true) return interaction.followUp({ content: "You need to verify the Vote Power in the DAOmind dashboard to be able to vote!", ephemeral: true })
    if (voteLimit === VOTE_LIMIT){
      votedCandidate.setTitle(`You have reached the limit of votes for this election!`)
      return interaction.followUp({ embeds: [votedCandidate], ephemeral: true })
    }
    const candidate = interaction.message.embeds[0].data.fields[0].value
    const searchVote = !profile ? -1 : profile.councilVotes.findIndex(r => r === candidate)
    if (searchVote !== -1){
      votedCandidate.setTitle(`You have already voted this candidate!`)
      return interaction.followUp({ embeds: [votedCandidate], ephemeral: true })
    }

    await userInfo(interaction.user.id).then(async r => {
      if (r === undefined || r.error !== null) return interaction.followUp({ embeds: [appEmbed], components: [appLink], ephemeral: true })
      
      const userWallets = r.user.wallet.map(i => i.public_key)
      const mainWallet = r.user.public_key
      await updateProfileSet({ publicKey: mainWallet })
      // let count = 0
      // let tokenKeys = []
      // async function awaitTasks(object) {
      //   const promises = [];
      //   Object.keys(object).forEach(async key => {
      //     const promise = new Promise(async (resolve, reject) => {
      //       const wallet = object[key]
      //       const collectionNFT = await getNFTWallet(wallet)
      //       if (collectionNFT.length === 0) return resolve()
      //       await collectionNFT.forEach(function (x) {
      //         const collection = x.collectionName
      //         if (collection === undefined || collection !== 'mindfolk') return
      //         const tokenID = x.mintAddress
      //         tokenKeys.push(tokenID)
      //         count++
      //       })
      //       resolve(count)
      //     });
      //     promises.push(promise)
      //   });
      //   await Promise.all(promises).catch(error => console.error(error))
      // }
      // await awaitTasks(userWallets)
      // const result = await countAllNFTS(userWallets)
      // const count = result.count
      // const tokenKeys = result.tokenKeys
      const count = votePower

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
      //await updateProfileSet({ NFTKeys: tokenKeys })
      //await updateProfileSet({ votePower: count })
      return interaction.followUp({ embeds: [verifyPanel], components: [verifyRow], ephemeral: true })
    })
  }

  //if(){}

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
    
    async function voteSteps() {
      return new Promise(async (resolve, reject) => {
        try{
        await updateElection(candidate, { voteKeys: voteKeys })
        await updateElection(candidate, { voteIds: interaction.user.id })
        await updateElection(candidate, { voteWallets: votePublicKey })
        await electionModel.findOneAndUpdate({ name: candidate }, { $set: { votes: newVotes } })

        const newCount = voteLimit + 1
        await updateProfileSet({ voteLimit: newCount })
        await updateProfilePush({ councilVotes: candidate })
        return interaction.editReply({ content: "Voting sucessful!", embeds: [], components: [], ephemeral: true })
        } catch (err){
          console.log("ERROR VOTE STEPS FUNCTION")
          reject(error);
        }
      })
    }
    voteSteps()
  }
  return
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