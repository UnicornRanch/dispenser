const gpio = require('pigpio').Gpio;
const engineTea = new gpio(4, {mode: gpio.OUTPUT});
const engineEspresso = new gpio(17, {mode: gpio.OUTPUT});

var awsIot = require('aws-iot-device-sdk');
var name = '<<THING NAME>>';

function open(engine) {

  var increment = 0
  var moveClose = setInterval(() => {
  
    increment++
    if (increment === 1) {
      engine.servoWrite(2500);
      console.log('open');
    } else if (increment === 3) {
      console.log('wait');
    } else if (increment === 5) {
      engine.servoWrite(550);
      console.log('close');
    } else if (increment === 6) {
      clearInterval(moveClose);
      console.log('clean');
    }
    
  }, 1000);  
}

var device = awsIot.thingShadow({
   keyPath: './certs/<<THING KEY>>.pem.key',
  certPath: './certs/<<THING CERT>>.pem.crt',
    caPath: './certs/rootca.pem',
  clientId: name,
      host: '<<THING ENDPOINT>>'
});

let deviceState = {
  type: "none"
};

let clientToken;

device.register( name, {}, () => {
  console.log('connected to AWS IoT...');
});

device.on('connect', () => {
  setTimeout(() => {
    const coffeeState = {
      "state": {
        "desired": {
          "type": "none"
        }
      }
    };
    clientToken = device.update(name, coffeeState);
    if (clientToken === null) console.log('shadown operation in progress');
  }, 5000);
});

device.on('status', (thingName, statusType, clientToken, stateObject) => {
  if (statusType === 'rejected') {
    if (stateObject.code !== 404) {
      console.log('resync with thing shadow');
      clientToken = device.get(thingName);
      if (clientToken === null) {
          console.log('operation in progress');
      }
    }
  }
  if (statusType === 'accepted') {
      if (thingName === name) {
        deviceState = stateObject.state.desired;
        console.log(deviceState);
      }
  }
});

device.on('delta', function(thingName, stateObject) {
  if (thingName === name) {
    if (stateObject.state.type !== "none") {
      deviceState.type = stateObject.state.type;
    }
  }
});

device.on('reconnect', function() {
  console.log('reconnect/re-register');

  device.register(name, {
    persistentSubscribe: true
  });
    
  setTimeout(() => {
    clientToken = device.update(name, {
      state: {
        desired: deviceState
      }
    });

    if (clientToken === null) {
      console.log('operation in progress');
    }

  }, 2000);
});

device.on('offline', function() {
  console.log('offline');
});

device.on('error', function(error) {
  console.log('error', error);
});

device.on('message', function(topic, payload) {
  console.log('message', topic, payload.toString());
});

device.on('close', function() {
  console.log('close');
  device.unregister(name);
});

setInterval(() => {
  if (deviceState.type === "tea") {
    open(engineTea);
    let waitTea = setTimeout(() => {
      const coffeeState = {
        "state": {
          "desired": {
            "type": "none"
          }
        }
      };
      clientToken = device.update(name, coffeeState);
      if (clientToken === null) console.log('shadown operation in progress');
      else clearInterval(waitTea);
    }, 5000);
  }
  else if (deviceState.type === "espresso") {
    open(engineEspresso);
    let waitEspresso = setTimeout(() => {
      const coffeeState = {
        "state": {
          "desired": {
            "type": "none"
          }
        }
      };
      clientToken = device.update(name, coffeeState);
      if (clientToken === null) console.log('shadown operation in progress');
      else clearInterval(waitEspresso);
    }, 5000);
  }
  else if (deviceState.type === "cappuccino") {
    let waitCappuccino = setTimeout(() => {
      const coffeeState = {
        "state": {
          "desired": {
            "type": "none"
          }
        }
      };
      clientToken = device.update(name, coffeeState);
      if (clientToken === null) console.log('shadown operation in progress');
      else clearInterval(waitCappuccino);
    }, 5000);
  }
  
  console.log(`Type: ${deviceState.type}`); //output converted to console

}, 10000);
