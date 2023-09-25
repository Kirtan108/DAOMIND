const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const web3 = require('@solana/web3.js');

const createTransactionLink = async (senderPublicKeyStr, recipientPublicKeyStr, amount) => {
  // Convert public key strings to PublicKey instances
  const senderPublicKey = new web3.PublicKey(senderPublicKeyStr);
  const recipientPublicKey = new web3.PublicKey(recipientPublicKeyStr);

  const solana = new web3.Connection('https://api.mainnet-beta.solana.com/');

  // Manually create a transfer instruction
  const transferInstruction = new web3.TransactionInstruction({
    keys: [
      { pubkey: senderPublicKey, isSigner: true, isWritable: true },
      { pubkey: recipientPublicKey, isSigner: false, isWritable: true },
    ],
    programId: web3.SystemProgram.programId,
    data: Buffer.alloc(8).fill(0),
  });

  // Set lamports amount in the instruction data
  transferInstruction.data.writeUInt32LE(amount);

  // Add the transfer instruction to the transaction
  const transaction = new web3.Transaction().add(transferInstruction);

  let recentBlockhash = (await solana.getLatestBlockhash()).blockhash;
  transaction.recentBlockhash = recentBlockhash;
  transaction.feePayer = senderPublicKey;
  const serializedTransaction = transaction.serialize();
  const transactionBuffer = Buffer.from(serializedTransaction);
  const transactionData = transactionBuffer.toString('base64');
  const link = `solana://signTransaction?message=${encodeURIComponent(transactionData)}`;
  console.log(link)

  return link;
};


// async function createTransactionLink(senderPublicKey, recipientPublicKey, amount) {
//   // Create a connection to the Solana cluster
//   const connection = new web3.Connection('https://spring-sleek-shard.solana-mainnet.discover.quiknode.pro/86050a4119dd4d9f6d5279cfd00316fee4d4a3cb/');

//   // The public key of the sender's Solana wallet
//   const fromPubkey = new web3.PublicKey(senderPublicKey);

//   // The public key of the recipient's Solana wallet
//   const toPubkey = new web3.PublicKey(recipientPublicKey);

//   // Build the transaction
//   const transaction = new web3.Transaction().add(
//     web3.SystemProgram.transfer({
//       fromPubkey: senderPublicKey,
//       toPubkey: recipientPublicKey,
//       lamports: amount
//     })
//   );
//   let recentBlockhash;
//   while (!recentBlockhash) {
//     try {
//       // Get the recent blockhash
//       recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//     } catch (error) {
//       console.log(`Error retrieving recent blockhash: ${error.message}`);
//     }
//   }
  

//   // Set the recent blockhash for the transaction
//   transaction.recentBlockhash = recentBlockhash;
//   transaction.feePayer = fromPubkey

//   // Serialize the transaction and create a buffer from it
//   const serializedTransaction = transaction.serialize();
//   const transactionBuffer = Buffer.from(serializedTransaction);

//   // Create a Base64-encoded string from the transaction buffer
//   const transactionData = transactionBuffer.toString('base64');
//   console.log(transaction)

//   // Create a link to sign the transaction
//   const link = `solana://signTransaction?message=${encodeURIComponent(transactionData)}`;

//   // Return the link
//   return link;
// }



module.exports = {
    data: {
      name: "get",
      aliases: ['get'],
      description: "Information",
    },
    run: async (client, message, args) => {
      //await message.delete()

      const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      //.setImage("https://cdn.discordapp.com/attachments/1034106468800135168/1052043063771541534/logo_1.png")
      .setTitle('Link to the App')
      .setDescription(`Push button below`)
      
      const button = new ButtonBuilder()
	    .setCustomId('abc')
	    .setLabel('Connect')
	    .setStyle(ButtonStyle.Success)

      const button2 = new ButtonBuilder()
      .setURL("https://connect.mindfolk.art/")
      .setLabel('Connect App')
      .setStyle('Link')
      .setEmoji(':logoapp:1065033438069002241')
      const senderPublicKey = "5qNFMxtekPsiqvz6T9mssC13RQfPAusUNnG13CQSQmEc"
      const recipientPublicKey = "CGDqzxvAs72vMxsw9tXjdTxzRwp43oaEszhUNgPzrbiz"
      const amount = 1000000

      const link = await createTransactionLink(senderPublicKey, recipientPublicKey, amount)
      return console.log(link)

      const button3 = new ButtonBuilder()
        .setLabel('Sign Transaction')
        .setStyle('Link')
        .setURL(link);
    


      const row = new ActionRowBuilder().addComponents(button3)
      
      // await message.channel.send({ embeds: [embed], components: [row] })
      await message.channel.send({ content: "Sign the Transaction!", components: [row] })
    },
  };