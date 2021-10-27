import axios from 'axios'
import Web3Modal from 'web3modal'
import {ethers} from 'ethers'

import {
    nftAddress,
    marketplaceAddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Marketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { useEffect, useState } from 'react'

export default function CreatorDashboard(){
    const [nfts, setNfts] = useState([])
    const [soldNfts, setSoldNfts] = useState([])
    const [loadingState, setLoadingState] = useState(['not-loaded'])

    useEffect(() => {
        loadCreatedNfts();
    }, [])

    async function loadCreatedNfts(){
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner()
        const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
        const marketContract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer);

        const data = await marketContract.ItemsCreate();

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

            let item = {
                price,
                itemId: i.itemId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                sold: i.sold,
                image: meta.data.image,
            }

            return item;
        }))
            console.log(items)
            const soldItems = items.filter(i => i.sold);
            setSoldNfts(soldItems);
            setNfts(items);
            setLoadingState('loaded');
        
   
        }
        if(loadingState === 'loaded' && !nfts.length) return(<h1>Start by creating an asset</h1>)
    
        return(
            <div>
                <h2>
                    Created Items
                </h2>
                <div>
                    
                    {
                        
                        nfts.map((nft, i) =>(
                            
                            <div key={i}>
                                <p>{i}</p>
                                <img src={nft.image}/>
                                <p>{nft.price}</p>
                            </div>
                        ))
                    }
                </div>
                {
                    Boolean(soldNfts.length) && 
                    <div>
                        <h2>Sold Items</h2>
                        {
                            soldNfts.map((nft, i) =>(
                                <div key={i}>
                                    <img src={nft.image}/>
                                    <p>nft.price</p>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
        )
    
}