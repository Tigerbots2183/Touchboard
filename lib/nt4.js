//This licence applies to all code not marked between //<Copyright (c) 2025 Tigerbots 2183> ... <end>

// MIT License
// Copyright (c) 2025 FRC 6328
// http://github.com/Mechanical-Advantage

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

//This licence applies to all code marked between //<Copyright (c) 2025 Tigerbots 2183> ... <end>

// MIT License
// Copyright (c) 2025 Tigerbots
// https://github.com/Tigerbots2183

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


import { serialize, deserialize } from "./msgpack.js";
let rawDecoder = new TextDecoder('utf-8')
let rawEncoder = new TextEncoder('utf-8')

const typestrIdxLookup = {
  boolean: 0,
  double: 1,
  int: 2,
  float: 3,
  string: 4,
  json: 4,
  raw: 5,
  rpc: 5,
  msgpack: 5,
  protobuf: 5,
  "boolean[]": 16,
  "double[]": 17,
  "int[]": 18,
  "float[]": 19,
  "string[]": 20,
};



class NT4_Subscription {
  uid = -1;
  topics = new Set();
  options = new NT4_SubscriptionOptions();
  toSubscribeObj() {
    return {
      topics: Array.from(this.topics),
      subuid: this.uid,
      options: this.options.toObj(),
    };
  }
  toUnsubscribeObj() {
    return {
      subuid: this.uid,
    };
  }
}
class NT4_SubscriptionOptions {
  periodic = 0.1;
  all = false;
  topicsOnly = false;
  prefix = false;
  toObj() {
    return {
      periodic: this.periodic,
      all: this.all,
      topicsonly: this.topicsOnly,
      prefix: this.prefix,
    };
  }
}
export class NT4_Topic {
  uid = -1; // "id" if server topic, "pubuid" if published
  name = "";
  type = "";
  properties = {};
  toPublishObj() {
    return {
      name: this.name,
      type: this.type,
      pubuid: this.uid,
      properties: this.properties,
    };
  }
  toUnpublishObj() {
    return {
      pubuid: this.uid,
    };
  }
  getTypeIdx() {
    if (this.type in typestrIdxLookup) {
      return typestrIdxLookup[this.type];
    } else {
      return 5; // Default to binary
    }
  }
}
export class NT4_Client {
  appName;
  onTopicAnnounce;
  onTopicUnannounce;
  onNewTopicData;
  onConnect;
  onDisconnect;
  serverBaseAddr;
  ws = null;
  serverAddr = "";
  serverConnectionActive = false;
  serverConnectionRequested = false;
  serverTimeOffset_us = null;
  networkLatency_us = 0;
  rxLengthCounter = 0;
  subscriptions = new Map();
  publishedTopics = new Map();
  serverTopics = new Map();
  //<Copyright (c) 2025 Tigerbots 2183>
  schemas = new Map()
  typeLengths = {
    "double": 8,
    "float64": 8,
    "int32": 4,
    "int64": 8,
    "float32": 4,
    "bool": 1, //TODO: Fix this
    //TODO: Finish adding types and lengths
  }
  //<end>
  /**
   * Creates a new NT4 client without connecting.
   * @param serverAddr Network address of NT4 server
   * @param appName Identifier for this client (does not need to be unique).
   * @param onTopicAnnounce Gets called when server announces enough topics to form a new signal
   * @param onTopicUnannounce Gets called when server unannounces any part of a signal
   * @param onNewTopicData Gets called when any new data is available
   * @param onConnect Gets called once client completes initial handshake with server
   * @param onDisconnect Gets called once client detects server has disconnected
   */
  constructor(
    serverAddr,
    appName,
    onTopicAnnounce,
    onTopicUnannounce,
    onNewTopicData,
    onConnect,
    onDisconnect
  ) {
    this.serverBaseAddr = serverAddr;
    this.appName = appName;
    this.onTopicAnnounce = onTopicAnnounce;
    this.onTopicUnannounce = onTopicUnannounce;
    this.onNewTopicData = onNewTopicData;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    setInterval(() => {
      // Update timestamp
      this.ws_sendTimestamp();
      // Log bitrate
      let bitrateKbPerSec = ((this.rxLengthCounter / 1000) * 8) / 5;
      this.rxLengthCounter = 0;
      console.log(
        "[NT4] Bitrate: " + Math.round(bitrateKbPerSec).toString() + " kb/s"
      );
    }, 5000);
  }
  //////////////////////////////////////////////////////////////
  // PUBLIC API
  /** Starts the connection. The client will reconnect automatically when disconnected. */
  connect() {
    console.log("Current Ip: " + this.serverBaseAddr)
    if (!this.serverConnectionRequested) {
      this.serverConnectionRequested = true;
      this.ws_connect();
    }
  }
  /** Terminates the connection. */
  disconnect() {
    if (this.serverConnectionRequested) {
      this.serverConnectionRequested = false;
      if (this.serverConnectionActive && this.ws) {
        this.ws.close();
      }
    }
  }
  /**
   * Add a new subscription, reading value updates
   * @param topicPatterns A list of topics or prefixes to include in the subscription.
   * @param prefixMode If true, use patterns as prefixes. If false, only subscribe to topics that are an exact match.
   * @param sendAll If true, send all values. If false, only send the most recent value.
   * @param periodic How frequently to send updates (applies regardless of "sendAll" option)
   * @returns A subscription ID that can be used to unsubscribe.
   */
  subscribe(topicPatterns, prefixMode, sendAll = false, periodic = 0.1) {
    let newSub = new NT4_Subscription();
    newSub.uid = this.getNewUID();
    newSub.topics = new Set(topicPatterns);
    newSub.options.prefix = prefixMode;
    newSub.options.all = sendAll;
    newSub.options.periodic = periodic;
    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub.uid;
  }
  /**
   * Add a new subscription, reading only topic announcements (not values).
   * @param topicPatterns A list of topics or prefixes to include in the subscription.
   * @param prefixMode If true, use patterns as prefixes. If false, only subscribe to topics that are an exact match.
   * @returns A subscription ID that can be used to unsubscribe.
   */
  subscribeTopicsOnly(topicPatterns, prefixMode) {
    let newSub = new NT4_Subscription();
    newSub.uid = this.getNewUID();
    newSub.topics = new Set(topicPatterns);
    newSub.options.prefix = prefixMode;
    newSub.options.topicsOnly = true;
    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub.uid;
  }
  /** Given an existing subscription, unsubscribe from it. */
  unsubscribe(subscriptionId) {
    let subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw 'Unknown subscription ID "' + subscriptionId + '"';
    }
    this.subscriptions.delete(subscriptionId);
    if (this.serverConnectionActive) {
      this.ws_unsubscribe(subscription);
    }
  }
  /** Unsubscribe from all current subscriptions. */
  clearAllSubscriptions() {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.unsubscribe(subscriptionId);
    }
  }
  /**
   * Set the properties of a particular topic.
   * @param topic The topic to update
   * @param properties The set of new properties
   */
  setProperties(topic, properties) {
    // Update local topics
    let updateTopic = (toUpdate) => {
      for (const key of Object.keys(properties)) {
        let value = properties[key];
        if (value === null) {
          delete toUpdate.properties[key];
        } else {
          toUpdate.properties[key] = value;
        }
      }
    };
    let publishedTopic = this.publishedTopics.get(topic);
    if (publishedTopic) updateTopic(publishedTopic);
    let serverTopic = this.serverTopics.get(topic);
    if (serverTopic) updateTopic(serverTopic);
    // Send new properties to server
    if (this.serverConnectionActive) {
      this.ws_setproperties(topic, properties);
    }
  }
  /** Set whether a topic is persistent.
   *
   * If true, the last set value will be periodically saved to
   * persistent storage on the server and be restored during server
   * startup. Topics with this property set to true will not be
   * deleted by the server when the last publisher stops publishing.
   */
  setPersistent(topic, isPersistent) {
    this.setProperties(topic, { persistent: isPersistent });
  }
  /** Set whether a topic is retained.
   *
   * Topics with this property set to true will not be deleted by
   * the server when the last publisher stops publishing.
   */
  setRetained(topic, isRetained) {
    this.setProperties(topic, { retained: isRetained });
  }
  /** Publish a topic from this client with the provided name and type. Can be a new or existing. */
  publishTopic(topic, type) {
    if (this.publishedTopics.has(topic)) {
      return;
    }
    let newTopic = new NT4_Topic();
    newTopic.name = topic;
    newTopic.uid = this.getNewUID();
    newTopic.type = type;
    this.publishedTopics.set(topic, newTopic);
    if (this.serverConnectionActive) {
      this.ws_publish(newTopic);
    }
    return;
  }
  /** Unpublish a previously-published topic from this client. */
  unpublishTopic(topic) {
    let topicObj = this.publishedTopics.get(topic);
    if (!topicObj) {
      throw 'Topic "' + topic + '" not found';
    }
    this.publishedTopics.delete(topic);
    if (this.serverConnectionActive) {
      this.ws_unpublish(topicObj);
    }
  }
  /** Send some new value to the server. The timestamp is whatever the current time is. */
  addSample(topic, value) {
    let timestamp = this.getServerTime_us();
    if (timestamp === null) timestamp = 0;
    this.addTimestampedSample(topic, timestamp, value);
  }
  /** Send some new timestamped value to the server. */
  addTimestampedSample(topic, timestamp, value) {
    let topicObj = this.publishedTopics.get(topic);
    if (!topicObj) {
      throw 'Topic "' + topic + '" not found';
    }
    // console.log(topicObj.uid)
    let txData = serialize([
      topicObj.uid,
      timestamp,
      topicObj.getTypeIdx(),
      value,
    ]);
    if(this.serverTopics.get(topic)){
      this.onNewTopicData(this.serverTopics.get(topic), timestamp, value);

    }
    this.ws_sendBinary(txData);
  }
  //<Copyright (c) 2025 Tigerbots 2183>
  //Struct decodeing curdiosy of me :)
  /** Store the ./schema/ topics and their values */
  storeStructSchemas(topic, value) {
    let topicSplit = topic.name.split(":")
    let schemaName = topicSplit[topicSplit.length - 1]
    let schemaNamedArray = rawDecoder.decode(value).split(";")
    let schemaMap = new Map()
    let currentClient = this


    for (let i = 0; i < schemaNamedArray.length; i++) {
      
      let splitSchema = schemaNamedArray[i].split(" ")
      //Schema map is set to Value:Type.
      if(splitSchema[0] == "" || splitSchema[1] == "") continue

      schemaMap.set(splitSchema[1], splitSchema[0])
      schemaMap.set("esc-esc-length-esc-esc", "unset")


    }

    this.schemas.set(schemaName, schemaMap)


  }
  structToJsObject(topic, value) {
    let finalTypes = Object.keys(this.typeLengths)


    //Values in order will not have any substructs in a object,
    //all final types will be in the object even from substructs.
    let valuesInOrder = []
    let currentClient = this
    // let index = 0
    let view = new DataView(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    let currentVal = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)

    if (topic.type.includes("[]")) {
      let thisKey
      let thisLength
      let newArray = []

      for (let types of currentClient.schemas.keys()) {
        if (topic.type == "struct:" + types + "[]") {
          thisKey = types
          break
        }
      }

      if (!thisKey) return

      thisLength = findSchemaLength(topic)


      let arraySize = Math.floor(value.byteLength / thisLength)
      for (let j = 0; j < arraySize; j++) {
        valuesInOrder = []
        newArray.push(deriveValuesFromStructs(topic.type, 0, (j * thisLength)))
      }

      return newArray
    }

    return deriveValuesFromStructs(topic.type, 0)



    function deriveValuesFromStructs(currentType, i = 0, bytesOffseted = 0) {

      

      let schemaKey
      let newObject = {}
      //Check for schema of current stuct
      for (let types of currentClient.schemas.keys()) {
        if (currentType == "struct:" + types || currentType == "struct:" + types + "[]") {
          schemaKey = types
          break
        }
      }

      if (!schemaKey) {
        return
      }



      let derivedSchema = currentClient.schemas.get(schemaKey)
      //Add finalTypes to endObject
      for (let [name, type] of derivedSchema) {
        if (name == "esc-esc-length-esc-esc") continue
        if (finalTypes.includes(type)) {
          valuesInOrder.push({ name: name, value: 0, type: type })
          newObject[name] = valuesInOrder[valuesInOrder.length - 1]
        } else {
          newObject[name] = deriveValuesFromStructs("struct:" + type, i + 1)
        }
      }
      //   "double": 8,
      // "float64": 8,
      // "int32":4,
      // "int64":8,
      // "float32":4,
      // "bool":1, 

      if (i == 0) {
        let currentByteIndex = 0
        for (let j = 0; j < valuesInOrder.length; j++) {
          switch (valuesInOrder[j].type) {
          
            case "double": 
            case "float64":
              valuesInOrder[j].value = view.getFloat64(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 8
              break
            case "float":
            case "float32":
              valuesInOrder[j].value = view.getFloat32(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 4
              break
            case "int64":
              valuesInOrder[j].value = view.getBigInt64(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 8
              break
            case "int32":
              valuesInOrder[j].value = view.getInt32(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 4
              break
            case "int16":
              valuesInOrder[j].value = view.getInt16(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 2
              break
            case "int8":
              valuesInOrder[j].value = view.getInt8(currentByteIndex + bytesOffseted, true)
              currentByteIndex++
              break
            case "uint64":
              valuesInOrder[j].value = view.getBigUint64(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 8
              break
            case "uint32":
              valuesInOrder[j].value = view.getUint32(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 4
              break
            case "uint16":
              valuesInOrder[j].value = view.getUint16(currentByteIndex + bytesOffseted, true)
              currentByteIndex += 2
              break
            case "uint8":
              valuesInOrder[j].value = view.getUint8(currentByteIndex + bytesOffseted, true)
              currentByteIndex++
              break
            case "char":
              String.fromCharCode(value[currentByteIndex+ bytesOffseted])
              currentByteIndex += 2
              break
            case "bool":
              valuesInOrder[j].value = view.getInt8(currentByteIndex + bytesOffseted) > 0
              currentByteIndex++
              break
            default:
              break
          }
        }
      }

      return newObject

    }

    function findSchemaLength(topic) {

      let finalTypes = Object.keys(currentClient.typeLengths)

      // if (finalTypes.includes(topic.type)) {
      //   currentClient.typeLengths[topic.type] = value.byteLength
      //   return value.byteLength;
      // }
      return deriveTypesFromStructs(topic.type)

      function deriveTypesFromStructs(currentType, i = 0, bytesOffseted = 0) {
        let schemaKey
        let foundLength = 0
        // console.log(topic)
        //Check for schema of current stuct
        for (let types of currentClient.schemas.keys()) {
          if (currentType == "struct:" + types || currentType == "struct:" + types + "[]") {
            schemaKey = types
            break
          }
        }

        if (!schemaKey) {
          return
        }

        let derivedSchema = currentClient.schemas.get(schemaKey)
        //Add finalTypes to endObject
        for (let [name, type] of derivedSchema) {
          if (name == "esc-esc-length-esc-esc") continue
          if (finalTypes.includes(type)) {
            foundLength += currentClient.typeLengths[type]
          } else {
            foundLength += deriveTypesFromStructs("struct:" + type, i + 1)
          }
        }

        return foundLength

      }
    }
  }
  // <end>

  //////////////////////////////////////////////////////////////
  // Server/Client Time Sync Handling
  /** Returns the current client time in microseconds. */
  getClientTime_us() {
    return new Date().getTime() * 1000;
  }
  /** Returns the current server time in microseconds (or null if unknown). */
  getServerTime_us(clientTime) {
    if (this.serverTimeOffset_us === null) {
      return null;
    } else {
      return (
        (clientTime === undefined ? this.getClientTime_us() : clientTime) +
        this.serverTimeOffset_us
      );
    }
  }
  /** Returns the current network latency in microseconds */
  getNetworkLatency_us() {
    return this.networkLatency_us;
  }
  ws_sendTimestamp() {
    let timeToSend = this.getClientTime_us();
    let txData = serialize([-1, 0, typestrIdxLookup["int"], timeToSend]);
    this.ws_sendBinary(txData);
  }
  ws_handleReceiveTimestamp(serverTimestamp, clientTimestamp) {
    let rxTime = this.getClientTime_us();
    // Recalculate server/client offset based on round trip time
    let rtt = rxTime - clientTimestamp;
    this.networkLatency_us = rtt / 2.0;
    let serverTimeAtRx = serverTimestamp + this.networkLatency_us;
    this.serverTimeOffset_us = serverTimeAtRx - rxTime;
    console.log(
      "[NT4] New server time: " +
      (this.getServerTime_us() / 1000000.0).toString() +
      "s with " +
      (this.networkLatency_us / 1000.0).toString() +
      "ms latency"
    );
  }
  //////////////////////////////////////////////////////////////
  // Websocket Message Send Handlers
  ws_subscribe(subscription) {
    this.ws_sendJSON("subscribe", subscription.toSubscribeObj());
  }
  ws_unsubscribe(subscription) {
    this.ws_sendJSON("unsubscribe", subscription.toUnsubscribeObj());
  }
  ws_publish(topic) {
    this.ws_sendJSON("publish", topic.toPublishObj());
  }
  ws_unpublish(topic) {
    this.ws_sendJSON("unpublish", topic.toUnpublishObj());
  }
  ws_setproperties(topic, newProperties) {
    this.ws_sendJSON("setproperties", {
      name: topic,
      update: newProperties,
    });
  }
  ws_sendJSON(method, params) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify([
          {
            method: method,
            params: params,
          },
        ])
      );
    }
  }
  ws_sendBinary(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }
  //////////////////////////////////////////////////////////////
  // Websocket connection Maintenance
  ws_onOpen() {
    // Set the flag allowing general server communication
    this.serverConnectionActive = true;
    console.log('[NT4] Connected with identity "' + this.appName + '"');
    // Sync timestamps
    this.ws_sendTimestamp();
    // Publish any existing topics
    for (const topic of this.publishedTopics.values()) {
      this.ws_publish(topic);
    }
    // Subscribe to existing subscriptions
    for (const subscription of this.subscriptions.values()) {
      this.ws_subscribe(subscription);
    }
    // User connection-opened hook
    this.onConnect();
  }
  ws_onClose(event) {
    // Clear flags to stop server communication
    this.ws = null;
    this.serverConnectionActive = false;
    // User connection-closed hook
    this.onDisconnect();
    // Clear out any local cache of server state
    this.serverTopics.clear();
    if (event.reason !== "") {
      console.log("[NT4] Socket is closed: ", event.reason);
    }
    if (this.serverConnectionRequested) {
      setTimeout(() => this.ws_connect(), 500);
    }
  }
  ws_onError() {
    if (this.ws) this.ws.close();
  }
  ws_onMessage(event) {
    if (typeof event.data === "string") {
      // JSON array
      this.rxLengthCounter += event.data.length;
      let msgData = JSON.parse(event.data);
      if (!Array.isArray(msgData)) {
        console.warn(
          "[NT4] Ignoring text message, JSON parsing did not produce an array at the top level."
        );
        return;
      }
      msgData.forEach((msg) => {
        // Validate proper format of message
        if (typeof msg !== "object") {
          console.warn(
            "[NT4] Ignoring text message, JSON parsing did not produce an object."
          );
          return;
        }
        if (!("method" in msg) || !("params" in msg)) {
          console.warn(
            "[NT4] Ignoring text message, JSON parsing did not find all required fields."
          );
          return;
        }
        let method = msg["method"];
        let params = msg["params"];
        if (typeof method !== "string") {
          console.warn(
            '[NT4] Ignoring text message, JSON parsing found "method", but it wasn\'t a string.'
          );
          return;
        }
        if (typeof params !== "object") {
          console.warn(
            '[NT4] Ignoring text message, JSON parsing found "params", but it wasn\'t an object.'
          );
          return;
        }
        // Message validates reasonably, switch based on supported methods
        if (method === "announce") {
          let newTopic = new NT4_Topic();
          newTopic.uid = params.id;
          newTopic.name = params.name;
          newTopic.type = params.type;
          newTopic.properties = params.properties;

          this.serverTopics.set(newTopic.name, newTopic);
          this.onTopicAnnounce(newTopic);
        } else if (method === "unannounce") {
          let removedTopic = this.serverTopics.get(params.name);
          if (!removedTopic) {
            console.warn(
              "[NT4] Ignoring unannounce, topic was not previously announced."
            );
            return;
          }
          this.serverTopics.delete(removedTopic.name);
          this.onTopicUnannounce(removedTopic);
        } else if (method === "properties") {
          let topic = this.serverTopics.get(params.name);
          if (!topic) {
            console.warn(
              "[NT4] Ignoring set properties, topic was not previously announced."
            );
            return;
          }
          for (const key of Object.keys(params.update)) {
            let value = params.update[key];
            if (value === null) {
              delete topic.properties[key];
            } else {
              topic.properties[key] = value;
            }
          }
        } else {
          console.warn(
            "[NT4] Ignoring text message - unknown method " + method
          );
          return;
        }
      });
    } else {
      // MSGPack
      this.rxLengthCounter += event.data.byteLength;
      deserialize(event.data, { multiple: true }).forEach((unpackedData) => {
        let topicID = unpackedData[0];
        let timestamp_us = unpackedData[1];
        let typeIdx = unpackedData[2];
        let value = unpackedData[3];

        if (topicID >= 0) {
          let topic = null;
          for (let serverTopic of this.serverTopics.values()) {
            if (serverTopic.uid === topicID) {
              topic = serverTopic;
              break;
            }
          }
          if (!topic) {
            console.warn(
              "[NT4] Ignoring binary data - unknown topic ID " +
              topicID.toString()
            );
            return;
          }
          //<Copyright (c) 2025 Tigerbots 2183>

          let rawValue = value

          if (topic.type == "structschema") {
            this.storeStructSchemas(topic, value)
            value = rawDecoder.decode(value)
          }

          if (topic.type.includes("struct:")) {

            value = this.structToJsObject(topic, value)

            if (value == undefined) {
              value = rawValue
            }
          }

          topic.value = value
          topic.rawValue = rawValue
          //<end>
          this.onNewTopicData(topic, timestamp_us, value, rawValue);

        } else if (topicID === -1) {
          this.ws_handleReceiveTimestamp(timestamp_us, value);
        } else {
          console.warn(
            "[NT4] Ignoring binary data - invalid topic ID " +
            topicID.toString()
          );
        }
      });
    }
  }
  ws_connect() {
    let port = 5810;
    let prefix = "ws://";
    this.serverAddr =
      prefix +
      this.serverBaseAddr +
      ":" +
      port.toString() +
      "/nt/"
      + this.appName;
    this.ws = new WebSocket(this.serverAddr, "networktables.first.wpi.edu");
    this.ws.binaryType = "arraybuffer";
    this.ws.addEventListener("open", () => this.ws_onOpen());
    this.ws.addEventListener("message", (event) => this.ws_onMessage(event));
    this.ws.addEventListener("close", (event) => this.ws_onClose(event));
    this.ws.addEventListener("error", () => this.ws_onError());
  }
  //////////////////////////////////////////////////////////////
  // General utilities
  getNewUID() {
    return Math.floor(Math.random() * 99999999);
  }
}