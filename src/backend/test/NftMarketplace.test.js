const { ethers } = require("hardhat")
const {expect} = require('chai')

describe('NFTMarketplace tests',() => {
    let Nft,nft,deployer,addr1,addr2
    let URI = "Sample URI"

    beforeEach(async () => {
        Nft = await ethers.getContractFactory('Nft');
        [deployer,addr1,addr2] = await ethers.getSigners()

        nft = await Nft.deploy()
    })

    describe('Deployment',() => {
        it("should track name and symbol of NFT collection",async () => {
            const nftName = "Blockskillo NFT"
            const nftSymbol = "BSNFT"

            expect(await nft.name()).equal(nftName)
            expect(await nft.symbol()).equal(nftSymbol)
        })
    })

    describe("Minting NFTs",() => {
        it("should track each minted NFT",async () => {
            // addr1 mints an nft

            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).equal(1)
            expect(await nft.tokenURI(1)).equal(URI)

            // addr2 mints an nft

             await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).equal(2)
            expect(await nft.tokenURI(2)).equal(URI)

      
        })
    })
})