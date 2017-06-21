[![alt text](logo.png)](https://www.blockwallet.eu)

Block Wallet is a easy to use and secure Ethereum App.

### Opensource
In this repo you will find the library used by the iOS and Android App. It contains all code which is used to generate, store and sign the transactions. All RPC call implementations are included used by the Apps. All encryption is based on peer reviewed and well known libraries.

### Security Features of Block Wallet
  - Signs transactions in the App sends them through SSL to an [RPC Geth](https://github.com/ethereum/go-ethereum/wiki/geth) server
  - SSL Server Certificate Fingerprint check implemented to prevent MITM Proxys
  - Uses [Intel App Security API](https://software.intel.com/en-us/app-security-api/api)
  - AES128 Encryption on Private Key with [Stanford Javascript Crypto Library](https://github.com/bitwiseshiftleft/sjcl)
  - Private Key only decoded when needed - protected with a custom passcode only the owner knows
  - Uses [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) Mnemonic code for Recovery of Private Keys
  - Implemented [EIP55](https://github.com/ethereum/EIPs/issues/55) capitals-based checksum on send addresses
  - Using QR Codes and Scanner with checksum to prevent typo errors

