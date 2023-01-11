// SPDX-License-Identifier:MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Nft is ERC721URIStorage {
    uint public tokenCount;

    constructor() ERC721("Blockskillo NFT", "BSNFT") {}

    function mint(string memory _tokenURI) external returns (uint) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        return (tokenCount);
    }
}
