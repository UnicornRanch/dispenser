'use-strict';

const orderCoffee = require("./orderDrink");

module.exports = (intentRequest, callback) => {
  console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
  const intentName = intentRequest.currentIntent.name;
    
  if (intentName === 'CoffeOrder') {
    console.log(intentName + ' was called');
    return orderCoffee(intentRequest, callback);
  }
    
  throw new Error(`Intent with name ${intentName} not supported`);
};