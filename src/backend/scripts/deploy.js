const { ethers, artifacts } = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)
  console.log('Account Balance:', (await deployer.getBalance()).toString())

  const Nft = await ethers.getContractFactory('Nft')
  const nft = await Nft.deploy()

  const Marketplace = await ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy(1);

  console.log("Deployed address of Nft contract is",nft.address);
  console.log("Deployed address of Marketplace contract is",marketplace.address);

  saveFrontendFiles(marketplace,"Marketplace")
  saveFrontendFiles(nft, 'Nft')
  
}

function saveFrontendFiles(contract, name) {
  const fs = require('fs')
  const contractsDir = __dirname + '/../../frontend/contractsData'

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  )

  const contractArtifact = artifacts.readArtifactSync(name)

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
