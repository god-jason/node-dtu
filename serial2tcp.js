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
        options: {
            host: "iot.cloud-dian.cn",
            port: 60010
        }
    }
}


const serial = new SerialPort(config.serial);

const client = net.createConnection(config.client.options)


client.on('connect', (socket) => {
    console.log("tcp connected")
    client.write(config.client.id, err => {
        if (err) console.error(err)
    })
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
})
client.on('close', () => {
    console.log("tcp close")
    //重连
    setTimeout(() => {
        client.connect(config.client.options)
    }, 5000)
})


serial.on('open', () => {
    console.log("serial open")
});

serial.on('data', data => {
    console.log("serial data:", data.length, "<" + data.toString("hex") + ">", data.toString())
    client.write(data)
})

serial.on('error', (err) => {
    console.log('serial error: ', err.message);
});

serial.on('close', () => {
    //process.exit(0);
    console.log("serial close")
})