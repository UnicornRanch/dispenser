'use strict';

const aws = require('aws-sdk');
const config = {
  '<<THING NAME>>': {
    'thingName': '<<THING NAME>>',
      'endpointAddress': '<<THING ENDPOINT>>',
  }
}

module.exports.update = (drink) => {
    
  let update = {
    'state': {
      'desired': {
        'type': drink,
      }
    }
  }
    
  const iotdata = new aws.IotData({endpoint: config['<<THING NAME>>'].endpointAddress});
  iotdata.updateThingShadow({
    payload: JSON.stringify(update),
    thingName: config['<<THING NAME>'].thingName
  }, (err, data) => {
    if (err) console.log(err);
    else console.log(data);
  });
};