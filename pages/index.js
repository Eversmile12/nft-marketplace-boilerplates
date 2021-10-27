import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import axios from 'axios'

import {ethers} from 'ethers'
import {useState, useEffect} from 'react'

import {
  nftAddress,
  marketplaceAddress
} from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Marketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';


export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoad] = useState('not-loaded');
  
  useEffect(() =>{
    loadNFTs();
  }, [])

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/bmDBIX5beHYWsgAHle518JRg1lRe1Kpk");
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(marketplaceAddress, Marketplace.abi, provider);
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i =>{
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      console.log(i.itemId.toNumber())
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
        
      }
      return item;
    }))
    setNfts(items);
    console.log(items)
    setLoad('loaded');
  
  }


  async function buyNFT(nft){
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    
    const contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer);

    const price = ethers.utils.parseUnits(nft.price, 'ether');
    const transaction = await contract.createMarketSale(nftAddress, nft.itemId, {
      value: price
    })

    await transaction.wait();
    loadNFTs()
  }

  if(loadingState == 'loaded' && !nfts.length) return(<h1>No items in the marketplace</h1>)
  
 
  return (
    
    <div>
      <p>
        items {nfts.length}
      </p>
      {
        
        nfts.map((nft, i) => (
          <div key={i}>
              <img src={nft.image}/>
              <p>{nft.itemId}</p>
              <p>{nft.description}</p>
              <p>{nft.price} ETH</p>
              <button onClick={() => {buyNFT(nft)}}>Buy</button>
         
          </div>
      ))
      }
    </div>
  
  )
}
