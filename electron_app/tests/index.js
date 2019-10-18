const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

findArduinoPort = async () => {
    try {
        const availablePorts = await SerialPort.list();
        const MY_ARDUINO = availablePorts.filter(port => port.manufacturer.match(/Arduino LLC/))[0];

        if(!MY_ARDUINO){
            throw "Arduino not found";
        }
        
        console.log('Returning ' + MY_ARDUINO.comName);
        return MY_ARDUINO.comName;
    }catch(err){
        throw err;
    }
}

findArduinoPort().then((_port) => {
    const port = new SerialPort(_port, { baudRate: 9600 })
    const parser = new Readline();
    const obj = {
        "type": "config",
        "payload": "SENS_1"
    }
    
    port.pipe(parser)
    setInterval(() => {
        port.write(JSON.stringify(obj) + '\n');
    }, 2000);

    parser.on('data', line => console.log(`> ${line}`))
}).catch((err) => {
    console.log(err);
});