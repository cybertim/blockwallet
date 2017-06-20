import { config } from "./config";

const TIMEOUT = 10000;

export interface IRequest {
  method: string;
  jsonrpc: string;
  params: Object;
  id: number;
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

export interface ICComp { 'BTC': number, 'USD': number, 'EUR': number, 'GBP': number, 'CAD': number }

const JSONRPC = '2.0';
const ID = 1;

export class RPCManager {
  constructor() { }

  private hexxer(hex: string, empty?: boolean) {
    let v = hex.substr(0, 2) === '0x' ? hex.substr(2) : hex;
    v = v.length % 2 !== 0 ? '0' + v : v;
    if (!empty) return '0x' + v;
    else v === '00' ? '' : '0x' + v;
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

  public cryptoCompareETH(): Promise<ICComp> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.call('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR,CAD,GBP', 'GET');
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
      // const fingerprints = ["89 10 24 09 12 DD 61 7C 31 71 03 D7 03 9C 89 DA DA EF 2F 17 34 94 AE 35 21 AE 95 46 BF F9 E8 22", "5A 78 65 89 62 56 54 03 2C 6B 47 06 B8 D1 B7 6A C4 A7 13 33"];
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
