'use-strict';

const lexResponses = require("./lexResponses");
const elasticSearch = require("./elasticSearch");
const iot = require("./iotShadow");
const types = ['espresso', 'cappuccino', 'tea'];

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (messageContent == null) {
    console.log(`Message null!`);
    return {
      isValid,
      violatedSlot,
    };
  }
  console.log(`Message receive!`);
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
  };
};

function validateDrinkOrder(drinkType) {
  if (drinkType && types.indexOf(drinkType.toLowerCase()) === -1) {
    console.log(`Invalid drink type: ${drinkType}`);
    return buildValidationResult(false, 'drink', `We don\'t have ${drinkType}, would you like a differente type like espresso, cappuccino or tea?`);
  }

  console.log(`Correct drink type: ${drinkType}`);
  return buildValidationResult(true, null, null);
};

module.exports = (intentRequest, callback) => {
  var drinkType = intentRequest.currentIntent.slots.drink;
    
  console.log(`drinkType=${drinkType}`);
    
  const source = intentRequest.invocationSource;
    
  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateDrinkOrder(drinkType);
        
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }
        
    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }
    
  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');
    const payload = { 
      'id': intentRequest.userId,
      'drink': drinkType,
      'gender': intentRequest.currentIntent.slots.gender,
      'age': intentRequest.currentIntent.slots.age
    };
    iot.update(drinkType);
    elasticSearch.post(JSON.stringify(payload), '<<INDEX>>');
    callback(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: 'Order was placed!' }));
    return;
  }  
};