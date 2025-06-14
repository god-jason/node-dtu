const {SerialPort} = require('serialport');
const net = require('net');


const config = {
    serial: {
        path: "COM3",
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    },
    client: {
        id: "1234567890",
        host: "iot.cloud-dian.cn",
        port: 60010
    }
}


const serial = new SerialPort(config.serial);
let serial_connected = false

const client = net.createConnection(config.client)
let client_connected = false;


//TCP相关事件处理

client.on('connect', (socket) => {
    console.log("tcp connected")
    client_connected = true;
    client.write(config.client.id)
})

client.on('data', data => {
    console.log("tcp data:", data.length, "<" + data.toString("hex") + ">", data.toString())
    serial.write(data)
})
client.on('error', err => {
    console.log('tcp error: ', err.message);
})
client.on('end', () => {
    console.log("tcp end")
    client_connected = false;
})
client.on('close', () => {
    console.log("tcp close")
    client_connected = false;

})


//串口相关事件处理

serial.on('open', () => {
    console.log("serial open")
    serial_connected = true;
});

serial.on('data', data => {
    console.log("serial data:", data.length, "<" + data.toString("hex") + ">", data.toString())
    client.write(data)
})

serial.on('error', (err) => {
    console.log('serial error: ', err.message);
});

serial.on('close', () => {
    console.log("serial close")
    serial_connected = false;
})



//自动重连
setInterval(() => {
    if (!serial_connected) {
        serial.open()
    }
    if (!client_connected) {
        client.connect(config.client)
    }
}, 5000)