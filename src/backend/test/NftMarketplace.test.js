const { ethers } = require("hardhat")
const {expect} = require('chai')

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe('NFTMarketplace tests',() => {
    let Nft,nft,deployer,addr1,addr2,addr3,Marketplace,marketplace
    let URI = "Sample URI"
    let feePercent = 1

    beforeEach(async () => {
       
        [deployer,addr1,addr2,addr3] = await ethers.getSigners()
         Nft = await ethers.getContractFactory('Nft');
         Marketplace = await ethers.getContractFactory('Marketplace');

         nft = await Nft.deploy()
         marketplace = await Marketplace.deploy(feePercent)
    })

    describe('Deployment',() => {
        it("should track name and symbol of NFT collection",async () => {
            const nftName = "Blockskillo NFT"
            const nftSymbol = "BSNFT"

            expect(await nft.name()).equal(nftName)
            expect(await nft.symbol()).equal(nftSymbol)
        })

        it("Should track feeAccount and feePercent of marketplace",async () => {
            expect(await marketplace.feeAccount()).equal(deployer.address);
            expect(await marketplace.feePercent()).equal(feePercent);
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

    describe("Making marketplace items",() => {
        let price = 1;
        let result

        beforeEach(async () => {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)

            // addr1 approves marketplace to spend nft
            nft.connect(addr1).setApprovalForAll(marketplace.address,true)
        })

        it("Should track newly created item,transfer nft from seller to marketplace,emit offered event",async () => {
            expect(
                marketplace.connect(addr1).makeItem(nft.address,1,toWei(price))
            ).emit(marketplace,"Offered").withArgs(1,nft.address,1,toWei(price),addr1.address);

            // owner of nft should be marketplace now
            expect(await nft.ownerOf(1)).equal(marketplace.address)

            // Item count should be 1
            expect(await marketplace.itemCount()).equal(1)

            // checking item fields
            const item = await marketplace.items(1)
            expect(item.itemId).equal(1)
            expect(item.nft).equal(nft.address)
            expect(item.tokenId).equal(1)
            expect(item.price).equal(toWei(price))
            expect(item.sold).equal(false)
        })

        it("Should fail if price is set to zero",async () => {
            await expect(marketplace.connect(addr1).makeItem(nft.address,1,0)).revertedWith("Price must be greater than zero")
        })
    })

    describe("Purchasing marketplace items",() => {
        let price = 2
        let fee = (feePercent/100)*price
        let totalPriceInWei

        beforeEach(async () => {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)

            // addr1 approves marketplace to spend tokens
            await nft.connect(addr1).setApprovalForAll(marketplace.address,true)

            // addr1 makes their nft a marketplace item
            await marketplace.connect(addr1).makeItem(nft.address,1,toWei(price))
        })

        it("should update item as sold,pay seller,transfer Nft to buyer,charge fees and emit Bought event",async () => {
            const sellerInitialEthBal = await addr1.getBalance()
            const feeAccountInitialBal = await deployer.getBalance()

            totalPriceInWei = await marketplace.getTotalPrice(1);
            await expect(
                marketplace.connect(addr2).purchaseItem(1,{value:totalPriceInWei})
                ).emit(marketplace,"Bought").withArgs(1,nft.address,1,toWei(price),addr1.address,addr2.address)
            
            const sellerFinalEthBal = await addr1.getBalance()
            const feeAccountFinalBal = await deployer.getBalance()

            expect((await marketplace.items(1)).sold).equal(true)
            // expect(+fromWei(sellerFinalEthBal)).equal(+price + +fromWei(sellerInitialEthBal))
            // expect(+fromWei(feeAccountFinalBal)).equal(+fee + +fromWei(feeAccountInitialBal))
            expect(await nft.ownerOf(1)).equal(addr2.address);
        })

        it("Should fail for invalid Item ids,sold items and when ether is not enough paid",async () => {
            // fails for invalid item ids
            await expect(
                marketplace.connect(addr2).purchaseItem(2,{value:totalPriceInWei})
            ).revertedWith("Item doesnot exists")

            // fails when not enough ether paid
            await expect(
                marketplace.connect(addr2).purchaseItem(1,{value:toWei(price)})
                ).revertedWith("not enough ether to cover item price and market fee")
            
            // addr2 purchases item 1
            await  marketplace.connect(addr2).purchaseItem(1,{value:totalPriceInWei})

            // addr3 tries to purchase item 1 after it is sold
            await expect(
                marketplace.connect(addr3).purchaseItem(1,{value:totalPriceInWei})
                ).revertedWith("Item already sold")

            
        })
    })


})