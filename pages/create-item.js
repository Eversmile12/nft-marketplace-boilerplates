import {useState} from 'react'
import { useRouter } from 'next/router'
import {ethers} from 'ethers'
import {create} from 'ipfs-http-client'
import Web3Modal from 'web3modal'

const client = create(new URL("https://ipfs.infura.io:5001"))

import {
    nftAddress, marketplaceAddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Marketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { list } from 'postcss'


function CreateItem(){
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''});    
    const router = useRouter();

    async function uploadImageOnIPFS(e){
        const file = e.target.files[0];
        try{
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            console.log(url)
            setFileUrl(url)
        }catch(error){
            console.log(`Error uploading file ${error}`)
        }
    }

    async function uploadItemMetadataToIPFS(){
        const {name, description, price} = formInput;
        if(!name || !description || !price){
            console.log('check your inputs')
            return
        }
        const data = JSON.stringify({name, description, image: fileUrl})
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            addNFTToMarketplace(url);
        }catch(error){
            console.log(`Error uploading file: ${error}`)
        }
    }

    async function addNFTToMarketplace(url){
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait();
        console.log(tx.events)
        let event = tx.events[0];
        let tokenId = event.args[2].toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer)
        let listingPrice  = await contract.getListingPrice()
        listingPrice = listingPrice.toString();

        transaction = await contract.createMarketItem(nftAddress, tokenId, price, { value: listingPrice })
        await transaction.wait();
        router.push('/')
    }
    return(
        <>
            <div>
                <input
                    placeholder='Asset Name'
                    onChange={e => updateFormInput({...formInput, name: e.target.value})}
                />
                <textarea 
                    placeholder='asset description'
                    onChange= {e=> updateFormInput({...formInput, description: e.target.value})}
                />
                <input
                    placeholder='Price Matic'
                    onChange={e => updateFormInput({...formInput, price: e.target.value})}
                />
                <input
                    type='file'
                    name='Asset'
                    onChange={uploadImageOnIPFS}
                />
                {
                    // fileUrl && (
                    //     <img src={fileUrl} width='450' />
                    // )
                }
                <button onClick={uploadItemMetadataToIPFS}>Create Digital Asset</button>
            </div>  
        </>
    )
}

export default CreateItem;