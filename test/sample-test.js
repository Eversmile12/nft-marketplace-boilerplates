const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Market = await ethers.getContractFactory("NFTMarketplace");
    const market = await Market.deploy();
    await market.deployed();

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(market.address);
    await nft.deployed();
    const nftContractAddress = nft.address;


    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('1', 'ether');


    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken('https://www.mytokenlocation2.com');

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {value: listingPrice});
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {value: listingPrice});

    const [_, buyerAddress] = await ethers.getSigners()

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {value: auctionPrice});

    items = await market.fetchMarketItems();
    items = await Promise.all(items.map( async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    
    console.log('items: ', items);
  });
});