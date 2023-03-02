const { Client, Events, EmbedBuilder, ChannelType, ThreadAutoArchiveDuration, GatewayIntentBits, Partials, WebhookClient, ActivityType, GuildForumThreadManager, ForumChannel, GuildChannel } = require("discord.js")
const dotenv = require("dotenv")

const commandLoader = require('./commandLoader')
const eventHandler = require("./events")
const { keepAlive } = require("./server")

const moongose = require('mongoose')
const { default: mongoose } = require("mongoose")

dotenv.config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message, 
    Partials.Channel, 
    Partials.Reaction
  ],
})

commandLoader.start(client)

client.on("ready", async () => {
  client.user.setPresence({
    activities: [{ name: `the DAO`, type: ActivityType.Watching }],
    status: 'online', 
  });

  console.log(`Logged in as ${client.user.tag}`)
})


client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  const chnnl = message.guild.channels.cache.get(message.channelId)    
  const member = message.guild.members.cache.get(message.author.id)

  //const hasPioneer = await member["_roles"].findIndex(r => r === process.env.PIONEER_ROLE)
  //if (hasPioneer === -1) return

  const prefix = "+"
  if (!message.content.startsWith(prefix)) return

  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const cmd = client.commands.find((c) => c.data.name === command || c.data.alias && c.data.alias.includes(command))

  if (cmd){
   cmd.run(client, message, args)
  }
})

//catches slash commands
client.on("interactionCreate", async (interaction) => {
  async function handleCommand() {
    try {
      if (!interaction.isChatInputCommand()) return
      await interaction.deferReply({ ephemeral: true })

      const slashcmd = client.slashcommands.get(interaction.commandName)
      if (!slashcmd) interaction.editReply({ content: "Not a valid command", ephemeral: true })

      //await interaction.deferReply()
      if (slashcmd) await slashcmd.run({ client, interaction })
    } catch (error) {
      return console.log(error)
    }
  }
  async function handleCommand2() {
    try {
      if (!interaction.isUserContextMenuCommand()) return
      await interaction.deferReply({ ephemeral: true })

      const slashcmd = client.slashcommands.get(interaction.commandName)
      if (!slashcmd) interaction.editReply({ content: "Not a valid command", ephemeral: true })
      if (slashcmd) await slashcmd.run({ client, interaction })
    } catch (error) {
      return console.log(error)
    }
  }
  async function handleCommand3() {
    try {
      if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) return
      await eventHandler(interaction)
    } catch (error) {
      return console.log(error)
    }

  }
  handleCommand()
  handleCommand2()
  handleCommand3()
})

// client.on('threadCreate', async (thread) => {
//   //const forumTag = client.guilds.cache.get(`${process.env.GUILD_ID}`).channels.cache.get('1080930588892078163')//.availableTags
//     if (thread.parentId === '1080930588892078163') await thread.send(`Hello there boss!`)
//     // if (thread.type == ChannelType.PublicThread) {
//     //    //await thread.send(`<@&1038779597686309034>`)    
//     //     // When a new forum post is created
//     //     console.log(thread)
//     //     console.log(thread.appliedTags)
//     //     console.log(thread.parentId) // The forum channel ID
//     //     console.log(thread.id) // The forum post ID
//     //     console.log(thread.name) // The name of the forum post
//     // }
//     // const tagName = forumTag.map(t => t.id)
//     // console.log(forumTag.availableTags)
//     // if(tagName == 'Solidity') console.log(tagName)
//     // if(tagName == 'Hyperledger Fabric') console.log(tagName)
//     // if(tagName == 'Typescript') console.log(tagName)
// })

mongoose.connect(process.env.MONGODB).then(() => console.log('Connected to the database!')).catch((err) => console.log(err))

keepAlive();
client.login(process.env.TOKEN)