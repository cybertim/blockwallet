declare module 'bip39' {
    function mnemonicToSeedHex(plain: string): string;
    // function mnemonicToSeed(phrase: string): buffer;
    function generateMnemonic(): string;
    function validateMnemonic(plain: string, wordlist?: string): boolean;
    function entropyToMnemonic(hex: string, wordlist?: string): string;
    function mnemonicToEntropy(phrase: string, wordlist?: string): string;
}