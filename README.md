# DISCONTINUED!
Blockwallet.eu (site) does not exist anymore and all apps have been pulled from the appstores.
You can still use the keytools (in this repo) to retrieve your private key from the secret words if necessary.

[![alt text](logo.png)](https://www.blockwallet.eu)

Block Wallet is a easy to use and secure Ethereum App.

### Opensource
In this repo you will find the library used by the iOS and Android App. It contains all code which is used to generate, store and sign the transactions. All RPC call implementations are included used by the Apps. All encryption is based on peer reviewed and well known libraries.

### Handy Features
  - Use the ./keytools or visit [Blockwallet/keytools](https://www.blockwallet.eu/keytools/) to view your private key behind the recovery phrase
  - Uses [Cryptocompare.com](https://cryptocompare.com) to convert ETH to your local currency
  - Uses [Etherscan.io](https://etherscan.io) to retrieve new Transactions for your address

### Security Highlights
  - Signs transactions on the device itself
  - Sends signed transactions through SSL to a secured [RPC Geth](https://github.com/ethereum/go-ethereum/wiki/geth) server
  - SSL Server Certificate Fingerprint check implemented to warn about MITM Proxys (compromised networks)
  - AES Encryption on Private Key with custom Passcode, only decoded when needed 
  - All Data stored in AES128 Encrypted contrainer [Stanford Javascript Crypto Library](https://github.com/bitwiseshiftleft/sjcl)
  - Uses [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Mnemonic code for Recovery of Private Keys
  - Implemented [EIP55](https://github.com/ethereum/EIPs/issues/55) capitals-based checksum on send addresses
  - Using QR Codes and Scanner with checksum to prevent typo errors
