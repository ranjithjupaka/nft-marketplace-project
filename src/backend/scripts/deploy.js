const { ethers, artifacts } = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)
  console.log('Account Balance:', (await deployer.getBalance()).toString())

  const Nft = await ethers.getContractFactory('Nft')
  const nft = await Nft.deploy()

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
