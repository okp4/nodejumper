<p align="center">
  <a href="https://nodejumper.io" target="_blank" rel="noopener noreferrer"><img width="200" src="https://avatars.githubusercontent.com/u/101663253" alt="Nodejumper logo"></a>
</p>
<h1 align="center">Nodejumper web app</h1>
<h3 align="center">Welcome to Nodejumper's Open Source Multi tool for Cosmos based chains!</h3>

*:rocket: *:rocket: *:rocket: Developing by [Nodejumper](https://nodejumper.io) with love*

### About
Nodejumper is a multi tool for cosmos based networks.
The aim of the project is to provide a bunch of helpful support features for cosmos blockchains.
It's built on dedicated server infrastructure with advanced monitoring and alerting system on top of it. 
Nodejumper supports around 17 networks so far and the number is constantly growing.

Currently, Nodejumper supports the following features:
1. Installation scripts;
2. Synchronization scripts;
3. Cheat sheet;
4. On chain analytics;

Let's dive deeper in every feature individually.

# Installation scripts page

Nodejumper provides installation scripts of two kinds:

### Automatic Installation

<img width="500" alt="Automatic Installation" src="https://user-images.githubusercontent.com/102145525/181235145-e25a918c-7d56-40c2-ad84-03d34eb6cb30.png">

Automatic installation script spins up a node in few clicks.
It uses all the best practices like installing very few required system packages, minimum-gas-prices, pruning custom/100/0/10, etc.
Depends on type of the network it synchronizes a node under the hood either by using snapshots or state sync.

### Manual Installation

<img width="500" alt="Manual Installation" src="https://user-images.githubusercontent.com/102145525/181235156-5a55e603-2f1a-4c4a-80eb-961f42978f60.png">

Manual installation script allows newbies to go through every step of the installation script line by line.
This gives them better understanding of what's going on and reduce the time spent on debugging, if something goes wrong.

Here's the quick demo on how easy chain installation can be, taken Bitcanna as example:

![Bitcanna Installation](https://user-images.githubusercontent.com/27004732/181461881-fe42af03-41cd-44b6-a76c-189e6a43660a.gif)

# Synchronization scripts page

This page includes:

### RPC Server

<img width="500" alt="RPC Server" src="https://user-images.githubusercontent.com/102145525/181228580-4acf18c0-b0d5-4e2a-8ebd-76fcf9c6ca82.png">

Exposes the chain state in real time. It uses https securing all the traffic.

### Live Peers

<img width="500" alt="Live Peers" src="https://user-images.githubusercontent.com/102145525/181234818-2ccc61ce-5f7a-47bd-8db1-8e7dee1f4fcc.png">

Dynamic real time peers list in/out. It also has a command to quickly apply the peers in config.toml in case
of issues with peers.

### Snapshot

<img width="500" alt="Snapshot" src="https://user-images.githubusercontent.com/102145525/181234851-33dcd40b-9de6-49e0-9aa0-51fe915dc24d.png">

This section provides a set of instructions on how to use snapshots to synchronize the node. It includes size of the snapshot and date time information when it was taken.
Snapshots are taken every day. We're doing our best to keep the size relatively small, so you don't have to waste a tone of time on downloading.

### State Sync

<img width="500" alt="State Sync" src="https://user-images.githubusercontent.com/102145525/181234866-2e123778-59b9-474f-8b5b-b20f15a4b015.png">

This section provides a set of instructions on how to use state sync to synchronize the node.
We use 2k snapshot window so in worse case scenario you'll need to fetch 2k blocks to fully catch up.
State sync also can be very handy when it comes to reducing size of the db as it flushes all existing data before applying snapshot chunks.

# Cheat sheet

This page provides the whole list of possible CLI commands users might need on a day-to-day basis. Starting from adding a key and ending with removing a node.
All the commands are divided by sections for better navigation. They already prepopulated with correct binary name, chain id and denom.
If you want to find a specific command, there's a search bar which hides irrelevant results. We believe it makes your journey as a cosmos validator easy and enjoyable.  
Here's a quick tour around the page:

![Cheat Sheet Tour](https://user-images.githubusercontent.com/27004732/181461297-7c313bed-d2ab-45bd-a38e-810886f4c6f9.gif)

# Summary page

This page provides on chain analytics. You can find actual token price, blockchain height, total number of transaction and other metrics from realtime RPC node.We're also building some helpful ratios, so you can find out how decentralized is the chain (how many validators own more than 50% of the total bonded tokens), percentage of current price in ATH price and bonded token ratio (how many tokens are bonded from the total supply). 
There are few fancy charts available: price/volume chart, voting power chart, distribution of the commission among active validators and missed blocks chart.
This is BETA version of the page, and we're going to enhance it in the nearest future.
Here's quick overview of the section:

![Summary Page Overview](https://user-images.githubusercontent.com/27004732/181466738-eb2f1d44-c512-4987-aa11-61a77a0e97ce.gif)

# Supported networks

<table>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181469582-a31e1ff9-fa4e-4343-a3d0-70db43a6e566.png" alt="Bitcanna"></td>
    <td>Bitcanna</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/bitcanna</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181469604-8491b24b-33e4-4c83-8acd-5d92e43f4841.png" alt="Desmos"></td>
    <td>Desmos</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/desmos</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181469623-42f3636c-5975-4cb5-84db-ad69d3850f7e.png" alt="Evmos"></td>
    <td>Evmos</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/evmos</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470533-68d3c332-ec1b-4cfc-89e7-d8905549d64a.png" alt="Galaxy"></td>
    <td>Galaxy</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/galaxy/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470537-c07bd8de-ff8c-49de-bfbd-ad17f6a4e23b.png" alt="Kichain"></td>
    <td>Kichain</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/kichain</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470548-8bf66965-10b0-45c1-84ab-cea682795560.png" alt="Omniflix"></td>
    <td>Omniflix</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/omniflix</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470551-f78a5b30-a0f8-4d71-899e-1da9fb14423b.png" alt="Osmosis"></td>
    <td>Osmosis</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/osmosis</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470568-446965aa-13ce-4200-abf8-2e9364307493.png" alt="Rizon"></td>
    <td>Rizon</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/rizon</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470579-05165565-d707-4d04-b501-7f4d33130e06.png" alt="Starname"></td>
    <td>Starname</td>
    <td>Mainnet</td>
    <td>https://nodejumper.io/starname</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470499-4df4e7ac-271f-4126-93b8-6743d0c15d79.png" alt="Another 1"></td>
    <td>Another 1</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/another1-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470528-91c89337-6a0e-439f-bf49-23f7a253cdaa.png" alt="DWS"></td>
    <td>DWS</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/dws-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470554-3b67d447-f406-48e5-9506-18260b416ce3.png" alt="Paloma"></td>
    <td>Paloma</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/paloma-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470573-53b472ee-784a-4f5e-8a63-7315e057f494.png" alt="Sei"></td>
    <td>Sei</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/sei-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470576-ff1a41c6-8a23-40e4-8f18-87b128fdafe3.png" alt="Stafihub"></td>
    <td>Stafihub</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/stafihub-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181472237-c1f1d4dc-34ee-467a-a594-f8bf021ed2fe.png" alt="Stride"></td>
    <td>Stride</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/stride-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470582-b3c2859e-43f6-4bcb-81b0-4803b2833fd9.png" alt="Teritori"></td>
    <td>Teritori</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/teritori-testnet/installation</td>
  </tr>
  <tr>
    <td><img width="50" src="https://user-images.githubusercontent.com/27004732/181470588-c21ad706-9b62-4b83-a903-89a88fed750d.png" alt="Uptick"></td>
    <td>Uptick</td>
    <td>Testnet</td>
    <td>https://nodejumper.io/uptick-testnet/installation</td>
  </tr>
</table>
