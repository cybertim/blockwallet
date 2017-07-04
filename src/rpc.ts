import { config } from "./config";

const TIMEOUT = 10000;

export interface IRequest {
  method: string;
  jsonrpc: string;
  params: Object;
  id: number;
}

export interface IRTokens {
  tokens: {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
  }[];
}

export interface IReply {
  id: number;
  result: string;
  jsonrpc: string;
}

export interface ITHashReply {
  id: number;
  jsonrpc: string;
  result: {
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
  }
}

export interface ILog { transactionHash: string, transactionIndex: string, data: string };
export interface ITReceiptReply {
  id: number;
  jsonrpc: string;
  result: {
    blockHash: string;
    blockNumber: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    from: string;
    gasUsed: string;
    logs: ILog[];
    root: string;
    to: string;
    transactionHash: string;
    transactionIndex: string;
  }
}

export interface ICComp { 'RUB': number, 'BTC': number, 'USD': number, 'EUR': number, 'GBP': number, 'CAD': number, 'BRL': number, 'CNY': number, 'HKD': number, 'AUD': number, 'INR': number, 'CHF': number, 'SGD': number, 'JPY': number }
const CURRENCIES = 'RUB,BTC,USD,EUR,CAD,GBP,BRL,CNY,HKD,AUD,INR,CHF,SGD,JPY';

const JSONRPC = '2.0';
const ID = 1;

export class RPCManager {
  constructor() { }

  private cleanhex(hex: string) {
    let v = hex.substr(0, 2) === '0x' ? hex.substr(2) : hex;
    return v.length % 2 !== 0 ? '0' + v : v;
  }

  private hexxer(hex: string, empty?: boolean) {
    const v = this.cleanhex(hex);
    if (!empty) return '0x' + v;
    else v === '00' ? '' : '0x' + v;
  }

  // thanks to this awesome post:
  // https://ethereum.stackexchange.com/questions/9034/how-can-i-retrieve-my-accounts-augur-rep-token-balance-via-json-rpc
  // web3 is an easy way to translate so-calls to data addresses 
  public erc20Name(token: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_call',
      params: [{ 'to': this.hexxer(token), 'data': this.hexxer('06fdde03') }, 'latest']
    });
  }

  public erc20Decimals(token: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_call',
      params: [{ 'to': this.hexxer(token), 'data': this.hexxer('313ce567') }, 'latest']
    });
  }

  public erc20Symbol(token: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_call',
      params: [{ 'to': this.hexxer(token), 'data': this.hexxer('95d89b41') }, 'latest']
    });
  }

  public erc20BalanceOf(token: string, address: string) {
    const v = this.cleanhex(address);
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_call',
      params: [{ 'to': this.hexxer(token), 'data': this.hexxer('70a08231000000000000000000000000' + v) }, 'latest']
    });
  }

  public gasPrice() {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_gasPrice',
      params: []
    });
  }

  public getBalance(address: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_getBalance',
      params: [this.hexxer(address), 'latest']
    });
  }

  public getTransactionCount(address: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_getTransactionCount',
      params: [this.hexxer(address), 'pending']
    });
  }

  public sendRawTransaction(raw: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_sendRawTransaction',
      params: [this.hexxer(raw)]
    });
  }

  public getTransactionByHash(hash: string) {
    return this.doHTTPCall<ITHashReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_getTransactionByHash',
      params: [this.hexxer(hash)]
    });
  }

  public getTransactionReceipt(transaction: string) {
    return this.doHTTPCall<ITReceiptReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_getTransactionReceipt',
      params: [this.hexxer(transaction)]
    });
  }

  public cryptoCompareTokens(tkns: string[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.call('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + tkns.join() + '&tsyms=ETH', 'GET');
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  }

  public cryptoCompareETH(): Promise<ICComp> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.call('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=' + CURRENCIES, 'GET');
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  }

  public getTokens(): Promise<IRTokens> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.call('https://www.blockwallet.eu/tokens.json', 'GET');
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  }

  public estimateGas(to: string, gas: string, gasPrice: string, value: string) {
    return this.doHTTPCall<IReply>({
      id: ID,
      jsonrpc: JSONRPC,
      method: 'eth_estimateGas',
      params: [{
        to: this.hexxer(to, true),
        gas: this.hexxer(gas, true),
        gasPrice: this.hexxer(gasPrice, true),
        value: this.hexxer(value, true)
      }]
    });
  }

  private fingerprint(domain: string, fingerprints: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      (<any>window).plugins.sslCertificateChecker.check(
        (msg) => {
          resolve(true);
        },
        (msg) => {
          if (msg.indexOf('CONNECTION_FAILED') > -1) {
            reject(new Error(msg));
          } else {
            reject(new Error(msg));
          }
        },
        domain, fingerprints
      );
    });
  }

  private call(url: string, method: string, login?: boolean, postData?: IRequest): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // uncomment if testing direct on NodeJS
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

        let req = new XMLHttpRequest();
        req.open(method, url);
        req.ontimeout = () => {
          req = null;
          reject('timeout of ' + TIMEOUT + 'ms exceeded');
        }
        req.onerror = (err) => {
          req = null;
          reject(err);
        }
        req.timeout = TIMEOUT;
        req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        req.setRequestHeader('Accept', 'application/json');
        if (login) req.setRequestHeader('Authorization', 'Basic ' + new Buffer(config.USERNAME + ':' + config.PASSWORD).toString('base64'));
        req.onreadystatechange = () => {
          if (!req || req.readyState !== 4 || req.status === 0) return;
          resolve(req.responseText);
        }
        if (postData) req.send(JSON.stringify(postData));
        else req.send();
      } catch (err) {
        reject(err);
      }
    });
  }

  private doHTTPCall<T>(postData: IRequest): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(JSON.parse(await this.call(config.DOMAIN, 'POST', true, postData)));
      } catch (err) {
        reject(err);
      }
    });
  }

}
