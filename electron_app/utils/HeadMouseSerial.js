const serialport = require('serialport');
const Readline = require('@serialport/parser-readline')

class HeadMouseSerial {
    constructor(){
        this.updateHandlers = [];
    }

    updateHandler(type, message){
        this.updateHandlers.map((hander) => {
            hander(type, message);
        });
    }

    establishArduinoComunication = async () => {
        try {
            if(this.SerialPort){
                if(this.SerialPort.isOpen){
                    this.SerialPort.close();
                    this.SerialPort = undefined;
                }else{
                    this.SerialPort = undefined;
                }
            }
            this.ARDUINO_ADRESS = await this._findArduinoPort();
            this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });

            const parser = new Readline();
            this.SerialPort.pipe(parser);

            this._bindEvents(parser);
            this.updateHandler("connected", null);
        } catch (error) {
            setTimeout(() => {
                this.updateHandler("error", error.message);
            }, 500);
        }
    }

    _findArduinoPort = async () => {
        try {
            const availablePorts = await serialport.list();
            const MY_ARDUINO = availablePorts.filter(port => {
                return port.manufacturer && port.manufacturer.includes("Arduino");
            })[0];

            if (!MY_ARDUINO) {
                throw new Error("El HeadMouse no esta conectado");
            }

            return MY_ARDUINO.comName;
        } catch (error) {
            throw error;
        }
    }

    _bindEvents(_parser){
        _parser.on('data', line => {
            try{
                const jsonEvent = JSON.parse(line);
                
                switch(jsonEvent.type){
                    case 'ERROR':
                        setTimeout(() => {
                            this.updateHandler("error", jsonEvent.payload);
                        }, 500);
                    break;

                    case 'MESSAGE':
                        this.updateHandler("info", jsonEvent.payload);
                    break;

                    case 'ACTION':
                        this.updateHandler("action", jsonEvent.payload);
                    break;
                }
            }catch(error){
                setTimeout(() => {
                    this.updateHandler("error", error.message);
                }, 500);
            }
        });
    }

    subscribeUpdater(updateHandler){
        this.updateHandlers.push(updateHandler);
    }

    unsubscribeUpdater(updateHander) {
        const index = this.updateHandlers.findIndex(handler => {
            return handler === updateHander
        })

        this.updateHandlers.splice(index, 1);
    }

    send = ({ type, payload }) => {
        const json = {
            type: type,
            payload: payload
        }
        
        try {
            this.SerialPort.write(JSON.stringify(json));
        } catch (error) {
            this.updateHandler("error" ,"Conecte el HeadMouse para configurar");
        }
    }
}

module.exports = (new HeadMouseSerial());