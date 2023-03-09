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
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
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

async function getNFTS(Wallet){
  const data = {
    jsonrpc: "2.0",
    id: 1,
    method: "qn_fetchNFTs",
    params: {
      wallet: Wallet,
      omitFields: ["provenance", "traits"],
      page: 1,
      perPage: 40,
    },
  }
  const config = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
  const NFTs = []
  const response = await fetch(`https://spring-sleek-shard.solana-mainnet.discover.quiknode.pro/${process.env.SOLANA_NODE}`, config)
  const collection = await response.json()
  const totalPages = collection.result.totalPages
  NFTs.push(...collection.result.assets)
  if (totalPages === 1) return NFTs
  let currentPage = 2
  while (currentPage <= totalPages){
    const data = {
      jsonrpc: "2.0",
      id: 1,
      method: "qn_fetchNFTs",
      params: {
        wallet: Wallet,
        omitFields: ["provenance", "traits"],
        page: currentPage,
        perPage: 40,
      },
    }
    const config = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(`https://spring-sleek-shard.solana-mainnet.discover.quiknode.pro/${process.env.SOLANA_NODE}`, config)
      const pageCollection = await response.json()
      const pageNFTs = pageCollection.result.assets
      NFTs.push(...pageNFTs)
      currentPage++
  }
  return NFTs
  } catch(err){
      // handle error
      console.log(err);
  }
}

var myHeaders = new Headers();
myHeaders.append("x-api-key", process.env.SHYFT_TOKEN);

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

// async function shyftNFT(wallet){
//   const updateAuth = "7hYkx2CNGRB8JE7X7GefX1ak1dqe7GxgYKbpfj9moE9D"
//   let page
//   try {
//     page = 1
//     const response = await fetch(`https://api.shyft.to/sol/v2/nft/read_all?network=mainnet-beta&address=${wallet}&page=${page}&size=50&update_authority=${updateAuth}`, requestOptions)
//     const data = await response.json()
//     if (!data.result) return console.log(data)
//     const result = data.result
//     const nfts = !result.nfts ? null : result.nfts
//     if (result.page > 1){
//     }
//     return nfts
//   } catch (err) {
//     return console.log(err)
//   }
// }

async function shyftNFT(wallet){
  const updateAuth = "7hYkx2CNGRB8JE7X7GefX1ak1dqe7GxgYKbpfj9moE9D"
  let count = 0
  let currentPage = 1
  let totalpages
  let tokenKeys = []
  console.log("START")
  await new Promise(resolve => setTimeout(resolve, 1100));
  try {
    const response = await fetch(`https://api.shyft.to/sol/v2/nft/read_all?network=mainnet-beta&address=${wallet}&page=${currentPage}&size=50&update_authority=${updateAuth}`, requestOptions)
    const data = await response.json()
    if (!data.result) return console.log(data)
    totalpages = data.result.total_pages
    await data.result.nfts.map( async x => {
      if(x.collection.name === 'Mindfolk') count++ + tokenKeys.push(x.mint)
    })
    console.log("Current page: ", currentPage, "Total pages: ", totalpages)
    if (totalpages <= 1) return { count, tokenKeys }
    currentPage++
    while (currentPage <= totalpages){
      console.log("WHILE")
      await new Promise(resolve => setTimeout(resolve, 1100))
      const response = await fetch(`https://api.shyft.to/sol/v2/nft/read_all?network=mainnet-beta&address=${wallet}&page=${currentPage}&size=50&update_authority=${updateAuth}`, requestOptions)
      const data = await response.json()
      if (!data.result) return console.log(data)
      totalpages = data.result.total_pages
      await data.result.nfts.map(async x => {
      if(x.collection.name === 'Mindfolk') count++
      })
      console.log("Current page: ", currentPage, "Total pages: ", totalpages)
      currentPage++
    }
    return { count, tokenKeys }
  } catch (err) {
    return console.log(err)
  }
}

async function countAllNFTS(object) {
  let count = 0
  let tokens = []
  const keys = Object.keys(object);
  for (const key of keys) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const wallet = object[key]
    const collectionNFT = await shyftNFT(wallet)
    if (collectionNFT === undefined) return
    count = count + collectionNFT.count
    tokens.push(collectionNFT.tokenKeys)
  }
  const tokenKeys = tokens.flat();
  return { count, tokenKeys }
}


module.exports = { format, getNFTWallet, getNFTS, shyftNFT, countAllNFTS }

