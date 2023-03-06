const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const buttonLinkApp = new ButtonBuilder()
.setURL("https://connect.mindfolk.art/")
.setLabel('Connect App')
.setStyle('Link')

const appLink = new ActionRowBuilder().addComponents(buttonLinkApp)

module.exports = { appLink }