const fetch = require('node-fetch')
const dotenv = require('dotenv');
dotenv.config()

// CONNECT APIS BELLOW //

// ----------- USER INFO
const userInfo = async (userId) => {
  try {
    const response = await fetch(`https://connect.mindfolk.art/.netlify/functions/user-by-discord-id?discordId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.X_API
      }
    })
    if (response.status !== 200 && response.status !== 404) {
      console.log("CONNECT ERROR", response.status)
      return //userInfo(userId)
    }
    if (response.status === 404) {
      console.log('User Info STATUS: ', response.status)
      return
    } else {
      const data = await response.json()
      console.log('User Info STATUS: ', response.status)
      return data

    }
  } catch (error) {
    return console.log(error)
  }
}

module.exports = { userInfo }