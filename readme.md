# Coin Flip dApp

## Table of Contents

- [General Information](#general-information)
- [Technologies](#technologies)
- [Setup](#setup)

## General Information

This project is a decentralized betting game where a user can bet an amount of Ether using an Ethereum smart contract currently deployed on the Ethereum Ropsten Testnet. The player either wins or loses base on 50:50 odds. When the player places their bet, a random number, either 1 or 0, is requested from [Provable](https://provable.xyz/)'s oracle service. If the random number is 0, the player receives double their bet. If the random number is 1, the player loses their bet to the smart contract. This project was built as part of coursework in the [Ivan on Tech Blockchain Academy](https://academy.ivanontech.com/).

## Technologies

This project was created with:

- Truffle v5.1.58 (core: 5.1.58)
- Solidity - 0.6.12 (solc-js)
- Node v10.16.3
- Web3.js v1.2.9
- jQuery v3.4.1
- Bootstrap v4.5.2

## Setup

1. `$ git clone` this repository to your local machine
2. Make sure you have Metamask installed in your browser and that you have a balance of test Ether in your wallet
3. `cd client` to navigate to the web client files folder
4. Use your program of choice to serve the files in the `client` folder to your browser
5. Make sure to connect metamask to the site
6. Play away!
