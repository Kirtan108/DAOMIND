const fetch = require('node-fetch')
const puppeteer = require('puppeteer')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

function format(number){
    const filter = number.toString().length
    if (filter <= 3){
      const res = parseFloat(number)
      return res
    } 
    if (filter <= 6){
      const res = (number/1000).toFixed(3)
      const num = res.replace(".", ",")
      return num
    }
}

async function getNFTWallet(publicKey){
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.04103.116 Safari/537.36'
  );
  try {
    await page.goto(`https://api-mainnet.magiceden.io/rpc/getNFTsByOwner/${publicKey}`, {
      timeout: 1000 * 60,
    });
    await page.content();

    const data = await page.evaluate(() => {
      return JSON.parse(document.querySelector('body').innerText)
    })

    const collection = await data.results
    await browser.close()
    return collection

  } catch (error) {
    return console.log(error)
  }
}

module.exports = { format, getNFTWallet }