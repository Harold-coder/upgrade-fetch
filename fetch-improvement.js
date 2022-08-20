import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

var TEST_GIFS = [];

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [testGifs, setTestGifs] = useState([]);
  const [doneChanging, setDoneChanging] = useState(true);

  const get_nfts = async (wallet_address) => {
    const connection = new Connection(clusterApiUrl("devnet"));
    const keypair = Keypair.generate();
    
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));
    
    
    const owner = new PublicKey(wallet_address);
    const allNFTs = await metaplex.nfts().findAllByOwner(owner).run();
    
    var i=0;
    var mint_address = "ok";
    var addresses_array = [];
    while (i < allNFTs.length){
      mint_address = allNFTs[i]["mintAddress"].toString();
      console.log("mint:", mint_address);
      addresses_array.push(mint_address);
      i += 1;
    }
    
    var j=0;
    var link_array = [];
    while (j<addresses_array.length){
      var mint = new PublicKey(addresses_array[j]);
      var nft = await metaplex.nfts().findByMint(mint).run();
      var json_file = nft.json;
      var image_link = json_file["image"];
      console.log("Metadata: ", image_link);
      
      TEST_GIFS.push(image_link);
      j += 1;
    }
    setDoneChanging(!doneChanging);
    return TEST_GIFS;
    
  };

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log("we here");
          get_nfts(response.publicKey.toString());
          console.log("vamos");

          console.log(
            'Found Pubkey!!!!',
            response.publicKey.toString()
          );
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
      console.log('Connected with Public Key:', response.publicKey.toString());
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
        {testGifs.map(gif => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
          
        ))}
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
    console.log("Done Changing", doneChanging);
    renderConnectedContainer();
    setTestGifs(TEST_GIFS);
    console.log("Here", testGifs);
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