import { keccak_256 } from 'js-sha3';
import * as secp256k1 from 'secp256k1/elliptic';
import * as RLP from 'rlp';
import * as getRandomValues from 'get-random-values';
import * as bip39 from 'bip39';
import * as sjcl from 'sjcl';

const UNCOMPRESSED_PUBKEY_HEADER = 27; // https://bitcoin.stackexchange.com/questions/38351/ecdsa-v-r-s-what-is-v/38909#38909
const CHAIN_ID = 1; // EIP 155 chainId - mainnet: 1, ropsten: 3
const ETHER = 1000000000000000000;

export interface TxEther {
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    to: string;
    value: string;
    data: string;
    chainId: string;
}

export interface VRS {
    v: number;
    r: Buffer;
    s: Buffer;
}

export class UtilManager {
    constructor() { }

    public createHash(msgHash: Buffer): Buffer {
        return Buffer.from(keccak_256.update(msgHash).hex(), 'hex');
    }

    public signHash(hash: Buffer, privateKey: string): VRS {
        const sig = secp256k1.sign(hash, Buffer.from(privateKey, 'hex'));
        return {
            v: sig.recovery + UNCOMPRESSED_PUBKEY_HEADER,
            r: sig.signature.slice(0, 32),
            s: sig.signature.slice(32, 64)
        };
    }

    public sign(tx: TxEther, privateKey: string): string {
        let raw = [];
        for (let k in tx) {
            let v = tx[k].length % 2 !== 0 ? '0' + tx[k] : tx[k];
            if (v === '00' || v === '') raw.push(new Buffer([]));
            else raw.push(Buffer.from(v, 'hex'));
        }
        // EIP155 spec:
        // when computing the hash of a transaction for purposes of signing or recovering,
        // instead of hashing only the first six elements (ie. nonce, gasprice, startgas, to, value, data),
        // hash nine elements, with v replaced by 0x1b or 0x1c (27 or 28), r = 0 and s = 0
        raw.push(Buffer.from([])); // empty r
        raw.push(Buffer.from([])); // empty s

        const hash = this.createHash(RLP.encode(raw));
        const signed = this.signHash(hash, privateKey);
        raw.pop(); // remove chainId (v)
        raw.pop(); // remove empty r
        raw.pop(); // remove empty s

        raw.push(Buffer.from(this.decimalToHex(signed.v), 'hex'));
        raw.push(signed.r);
        raw.push(signed.s);

        return RLP.encode(raw).toString('hex');
    }

    public publicKeyFromSignedHex(z: string) {
        let raw = RLP.decode(Buffer.from(z, 'hex'));
        const vrs: VRS = {
            s: raw.pop(),
            r: raw.pop(),
            v: this.hexToDecimal(raw.pop().toString('hex'))
        }
        raw.push(Buffer.from(this.decimalToHex(CHAIN_ID), 'hex')); // chain_id
        raw.push(new Buffer([])); // empty r
        raw.push(new Buffer([])); // empty s

        const hash = this.createHash(RLP.encode(raw));
        const signature = Buffer.concat([vrs.r, vrs.s], 64);
        const recovery = vrs.v - UNCOMPRESSED_PUBKEY_HEADER;

        if (recovery !== 0 && recovery !== 1) throw new Error('Invalid signature v value');

        const senderPubKey = secp256k1.recover(hash, signature, recovery);
        return senderPubKey;
    }

    public extractPublicKey(privateKey: Buffer): Buffer {
        return secp256k1.publicKeyCreate(privateKey);
    }

    public publicKeyToAddress(publicKey: Buffer) {
        // Only take the lower 160bits of the hash = public address
        const pubKey = secp256k1.publicKeyConvert(publicKey, false).slice(1);
        return this.createHash(pubKey).slice(-20);
    }

    public verifyPrivateKey(privateKey: string): boolean {
        return secp256k1.privateKeyVerify(Buffer.from(privateKey, 'hex'));
    }

    public verifyVRS(hash: Buffer, vrs: VRS, publicKey: Buffer): Boolean {
        return secp256k1.verify(hash, Buffer.concat([vrs.r, vrs.s]), publicKey);
    }

    public generatePrivateKey(): Buffer {
        let privKey;
        do {
            let arr = new Uint8Array(32);
            getRandomValues(arr);
            let privateKeyBytes = []
            for (var i = 0; i < arr.length; ++i)
                privateKeyBytes[i] = arr[i]
            privKey = Buffer.from(privateKeyBytes);
        } while (!secp256k1.privateKeyVerify(privKey));
        return privKey;
    }

    public decimalToHex(value: number) {
        let v = value.toString(16);
        v = v.length % 2 !== 0 ? '0' + v : v;
        return v;
    }

    public hexToDecimal(hex: string) {
        return parseInt(hex, 16);
    }

    public etherToWei(ether: number) {
        return ether * ETHER;
    }

    public weiToEther(wei: number) {
        return wei / ETHER;
    }

    public privateKeyFromMnemonic(mnemonic: string): string {
        return bip39.mnemonicToEntropy(mnemonic);
    }

    public privateKeyToMnemonic(privateKey: string): string {
        return bip39.entropyToMnemonic(privateKey);
    }

    public validateMnemonic(phrase: string): boolean {
        return bip39.validateMnemonic(phrase);
    }

    public validAddress(hex: string) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(hex)) {
            // check if it has the basic requirements of an address
            return false;
        } else if (/^(0x)?[0-9a-f]{40}$/.test(hex) || /^(0x)?[0-9A-F]{40}$/.test(hex)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            const address = hex.replace('0x', '');
            var addressHash = keccak_256(address.toLowerCase());
            for (var i = 0; i < 40; i++) {
                // the nth letter should be uppercase if the nth digit of casemap is 1
                if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                    return false;
                }
            }
            return true;
        }
    }

    public encrypt(message: string, password: string): sjcl.SjclCipherEncrypted {
        try {
            return sjcl.encrypt(password, message);
        } catch (err) {
            throw err;
        }
    }

    public decrypt(encrypted: sjcl.SjclCipherEncrypted, password: string): string {
        try {
            return sjcl.decrypt(password, encrypted);
        } catch (err) {
            throw err;
        }
    }
}
