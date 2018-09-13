/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
//@flow

// FIXME drop:
import { splitPath, foreach } from "./utils";
import type Transport from "@ledgerhq/hw-transport";

/**
 * Ark API
 *
 * @example
 * import Ark from "@arkecosystem/ark-ledger-transport";
 * const ark = new Ark(transport)
 */
export default class Ark {
  transport: Transport<*>;

  constructor(transport: Transport<*>) {
    this.transport = transport;
    transport.decorateAppAPIMethods(
      this,
      [
        "getAddress",
        "signTransaction",
        "getAppConfiguration"
      ],
      "w0w"
    );
  }

  /**
   * get Ark address for a given BIP 32 path.
   * @param path a path in BIP 32 format
   * @return an object with a publicKey, address and (optionally) chainCode
   * @example
   * ark.getAddress("44'/111'/0'/0/0").then(o => o.address)
   */
  getAddress(
    path: string
  ): Promise<{
    publicKey: string,
    address: string
  }> {
    const paths = splitPath(path);
    const buffer = Buffer(1 + paths.length * 4);
    buffer[0] = paths.length;
    paths.forEach((element, index) => {
      buffer.writeUInt32BE(element, 1 + 4 * index);
    });
    return this.transport
      .send(
        0xe0,
        0x02,
        0x00,
        0x40,
        buffer
      )
      .then(response => {
        let result = {};
        let publicKeyLength = response[0];
        let addressLength = response[1 + publicKeyLength];
        result.publicKey = response
          .slice(1, 1 + publicKeyLength)
          .toString("hex");
        result.address =
          response
            .slice(
              1 + publicKeyLength + 1,
              1 + publicKeyLength + 1 + addressLength
            )
            .toString("ascii");
        return result;
      });
  }

  /**
   * You can sign a transaction and retrieve the signature given the raw transaction
   * @example
   ark.signTransaction("44'/111'/0'/0/0", "00f93df6010289f519c77e4e9f5438c2ae5ac2978efcc91fd53c15bc17f63ad5de3bf47a00a31ed904b866c2224523524f080010c59cebd95da36a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e1f505000000008096980000000000").then(result => ...)
   */
  signTransaction(
    path: string,
    rawTxHex: string
  ): Promise<{
    signature: string,
  }> {
    let paths = splitPath(path);
    let offset = 0;
    let rawTx = new Buffer(rawTxHex, "hex");
    let toSend = [];
    let response;
    while (offset !== rawTx.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150;
      let chunkSize =
        offset + maxChunkSize > rawTx.length
          ? rawTx.length - offset
          : maxChunkSize;
      let buffer = new Buffer(
        offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize
      );
      if (offset === 0) {
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
          buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize);
      }
      toSend.push(buffer);
      offset += chunkSize;
    }
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x04, i === 0 ? 0x00 : 0x81, 0x40, data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      return {
        signature: response.slice(0, response.length - 2).toString('hex')
      };
    });
  }

  /**
   */
  getAppConfiguration(): Promise<{
    arbitraryDataEnabled: number,
    version: string
  }> {
    return this.transport.send(0xe0, 0x06, 0x00, 0x00).then(response => {
      let result = {};
      result.arbitraryDataEnabled = response[0] & 0x01;
      result.version = "" + response[1] + "." + response[2] + "." + response[3];
      return result;
    });
  }
}
