const Discord = require("discord.js")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');

const loadSlashCommands = async (client) => {
  try {
    const commands = [];
    const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));
    client.slashcommands = new Discord.Collection()
    
    const clientId = process.env.CLIENT_ID
    const guildId = process.env.GUILD_ID
    
    console.log('Loading slash commands:')
    for (const file of slashCommandFiles) {
      const command = require(`./commands/slash/${file}`);
      console.log(command.data.name)
      commands.push(command.data);
      client.slashcommands.set(command.data.name, command)
    }
    
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

const loadMessageCommands = async (client) => {
  console.log('Loading message commands:')
  client.commands = new Discord.Collection();
  const commandFiles = fs.readdirSync('./commands/message').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/message/${file}`);
    console.log(command.data.name)
    client.commands.set(command.data.name, command);
  }
}

module.exports = {
  start: async (client) => {
  	await loadSlashCommands(client)
    await loadMessageCommands(client)
  }
}