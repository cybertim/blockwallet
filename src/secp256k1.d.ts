declare module 'secp256k1' {
    function privateKeyVerify(privateKey: Buffer): Boolean;
    function privateKeyExport(privateKey: Buffer, compressed?: Boolean): Buffer;
    function privateKeyImport(privateKey: Buffer): Buffer;
    function privateKeyTweakAdd(privateKey: Buffer, tweak: Buffer): Buffer;
    function privateKeyTweakMul(privateKey: Buffer, tweak: Buffer): Buffer;
    function publicKeyCreate(privateKey: Buffer, compressed?: Boolean): Buffer;
    function publicKeyConvert(publicKey: Buffer, compressed?: Boolean): Buffer;
    function publicKeyVerify(publicKey: Buffer): Boolean;
    function publicKeyTweakAdd(publicKey: Buffer, tweak: Buffer, compressed?: Boolean): Buffer;
    function publicKeyTweakMul(publicKey: Buffer, tweak: Buffer, compressed?: Boolean): Buffer;
    function publicKeyCombine(publicKeys: Array<Buffer>, compressed?: Boolean): Buffer;
    function signatureNormalize(signature: Buffer): Buffer;
    function signatureExport(signature: Buffer): Buffer;
    function signatureImport(signature: Buffer): Buffer;
    function signatureImportLax(signature: Buffer): Buffer;
    function sign(message: Buffer, privateKey: Buffer, options?: Object): { signature: Buffer, recovery: number };
    function verify(message: Buffer, signature: Buffer, publicKey: Buffer): Boolean;
    function recover(message: Buffer, signature: Buffer, recovery: Number, compressed?: Boolean): Buffer;
    function ecdh(publicKey: Buffer, privateKey: Buffer): Buffer;
    function ecdhUnsafe(publicKey: Buffer, privateKey: Buffer, compressed?: Boolean): Buffer;
}