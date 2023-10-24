import express from "express";
import * as dgram from "dgram";
import * as crypto from "crypto";

const app = express()
const socket = dgram.createSocket('udp4')
const stunServerAddress = 'stun.l.google.com'
const stunServerPort = 19302
const magicCookie = Buffer.from('2112a442', 'hex');
const buildStunMessage = () => {
    const messageType = Buffer.from('0001', 'hex')
    const messageLength = Buffer.from('0000', 'hex')
    const transactionID = crypto.randomBytes(12)
    return Buffer.concat([messageType, messageLength, magicCookie, transactionID])
}

const decodeXORAddress = (hex, magicCookie) => {
    let hexStr = hex.slice(hex.length - 6, hex.length)
    console.log(hexStr)
    let portHex = parseInt('0x' + hexStr.slice(0, 2).toString('hex'), 16)

    console.log(portHex ^ magicCookie.slice(0, 2) & 0xFF)
    const adrHex = parseInt('0x' + hexStr.slice(2, 6).toString('hex'), 16)
    // console.log(adrHex)
    console.log((adrHex >>> 16) >> 8 ^ 0x21)
    // console.log("Port: " + parseInt('0x' + portHex.toString('hex'), 16))
    // const decoded = parseInt(hex, 16) ^ magicCookie;
    return (adrHex >>> 24) +
        '.' +
        ((adrHex >> 16) & 0xFF) +
        '.' +
        ((adrHex >> 8) & 0xFF) +
        '.' +
        (adrHex & 0xFF);
};

const message = buildStunMessage()

socket.send(message, 0, message.length, stunServerPort, stunServerAddress, (err) => {
    if (err) {
        console.error('Error sending message: ' + err);
        socket.close();
    }
    console.log('Message sent to ' + stunServerAddress + ':' + stunServerPort);
})


socket.on('message', (msg, rInfo) => {
    console.log('Received ' + msg.length + ' bytes from ' + rInfo.address + ':' + rInfo.port);
    console.log('Response message: ' + msg.toString('hex'));
    console.log("IPAddress: " + decodeXORAddress(msg, magicCookie))
    // Xử lý phản hồi từ STUN server ở đây
});


setTimeout(() => {
    socket.close()
}, 5000)
// app.listen(3000, () => {
//     console.log("Server connected")
// })
