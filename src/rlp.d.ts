declare module 'rlp' {
    function encode(plain: Array<Object> | Buffer | String): Buffer;
    function decode(encoded: Array<Object> | Buffer | String, skipRemainderCheck?: Boolean):  Buffer[];
}