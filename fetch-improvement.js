import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";



var mint_address = "";
var image_link = "";
var attributes_relevant = [];
var wheat_amt = 0;
var steel_amt = 0;

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [testGifs, setTestGifs] = useState("");
  const [metadata, setMetadata] = useState([]);
  const [doneChanging, setDoneChanging] = useState(true);

  const get_tokens = async (wallet) => {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
    const owner = new PublicKey(wallet);
    let response = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });
  
    response.value.forEach((accountInfo) => {
      if (accountInfo.pubkey.toBase58() == "GPSn3fGmScofCKvZBYvjwU28xsiyYGBHNSNAbUdAgDks"){
        wheat_amt = accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]/10;
      }
      if (accountInfo.pubkey.toBase58() == "EAK1iWc5Vrk8kc22xDQygEQ39hgyt6VSZtRQZVeHkvB4"){
        steel_amt = accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]/10;
      }
      /*
      console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
      console.log(`mint: ${accountInfo.account.data["parsed"]["info"]["mint"]}`);
      console.log(
        `owner: ${accountInfo.account.data["parsed"]["info"]["owner"]}`
      );
      console.log(
        `decimals: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"]}`
      );
      console.log(
        `amount: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]}`
      );
      console.log("====================");
      */
    });
  };




  const get_nfts = async (wallet_address) => {
    const connection = new Connection(clusterApiUrl("devnet"));
    const keypair = Keypair.generate();
    
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));
    
    
    const owner = new PublicKey(wallet_address);
    const allNFTs = await metaplex.nfts().findAllByOwner(owner).run();

    // Now we will pick only the NFT that is in our collection

    var i = 0;
    while (i<allNFTs.length){
      if (allNFTs[i]["creators"][0]["address"].toString() == "FCgPRqRxajVfTGEpJ3AJtawjMkpQCAoUcwWYRro83gTQ"){
        mint_address = allNFTs[i]["mintAddress"].toString();
        break
      }
      i += 1;
    }
    
    var mint = new PublicKey(mint_address);
    var nft = await metaplex.nfts().findByMint(mint).run();
    image_link = nft.json["image"];
    var attributes = nft.json["attributes"];
    attributes_relevant = [];
    attributes_relevant.push(attributes[12], attributes[6], attributes[13], attributes[14]) // Energy, Head, Pants, Cape
    setDoneChanging(!doneChanging);

    return image_link, attributes_relevant;
  };

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          get_nfts(response.publicKey.toString());
          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      get_tokens(response.publicKey.toString());
      get_nfts(response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      <div className="gif-grid">
        {
          <div className="gif-item">
            <img src={testGifs} alt={testGifs} />
          </div>
        }
        {
          <div className="gif-item">
            <p className='header'>Metadata:</p>
          {metadata.map(el => (
            <p className='sub-text' key={el["trait_type"]}>{el["trait_type"]} : {el["value"]}</p>
          ))}
          </div>
        }
        {
          <div className="gif-item">
            <img src={"https://www.arweave.net/dPXgvMQjO0dTOsYhFRLjrbg26gqV8CnpSVQ11ouIE7k?ext=png"} alt={"stp"} />
            <p className='sub-text' key={"wheat-text"}>Amount: {steel_amt}</p>
          </div>
        }
        {
          <div className="gif-item">
            <img src={"https://www.arweave.net/AWAp9u3qQ12kuZArgLKdNFHDDstYYQG0Z5_to5iF890?ext=png"} alt={"stp"} />
            <p className='sub-text' key={"steel-text"}>Amount: {wheat_amt}</p>
          </div>
        }

      </div>
    </div>
  );

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    setTestGifs(image_link);
    setMetadata(attributes_relevant);
    renderConnectedContainer();
  }, [doneChanging]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">NFT Portal</p>
          <p className="sub-text">
            View your NFTs
        </p>
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;

