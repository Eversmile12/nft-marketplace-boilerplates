const hre = require("hardhat");

async function main() {

  const Nft = await hre.ethers.getContractFactory("NFT");
  const Marketplace = await hre.ethers.getContractFactory('NFTMarketplace')
  const marketplace = await Marketplace.deploy()
  await marketplace.deployed();
  
  const nft = await Nft.deploy(marketplace.address);

  await nft.deployed();

  console.log("Marketplace deployed to:", marketplace.address);
  console.log("nft deployed to:", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
