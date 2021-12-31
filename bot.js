// name: bot.js
// author: Zelin Liu (zelliu@cisco.com)
// date: 12/13/21

// This is the main file for the PTO-Tracker bot.


// Load process.env values from .env file
require('dotenv').config();

let stateStorage = null;
if (process.env.MONGO_URI) {
    const { MongoDbStorage } = require('botbuilder-storage-mongodb');
    stateStorage = new MongoDbStorage({ url: process.env.MONGO_URI })
}

// Import a platform-specific adapter for webex.
const { WebexAdapter } = require('botbuilder-adapter-webex');
const adapter = new WebexAdapter({
  access_token: process.env.ACCESS_TOKEN,
  public_address: process.env.PUBLIC_ADDRESS ? process.env.PUBLIC_ADDRESS : 'http://127.0.0.1',
})

const { Botkit } = require('botkit');
const controller = new Botkit({
  webhook_uri: '/api/messages',
  adapter: adapter,
  stateStorage
});

if (process.env.MONGO_URI){
  const { PTOMongoDB } = require( './lib/mongo.js' )
  controller.db = new PTOMongoDB( process.env.MONGO_URI);
}

// Create Botkit controller
if (process.env.CMS_URI) {
  const { BotkitCMSHelper } = require('botkit-plugin-cms');
  controller.usePlugin(new BotkitCMSHelper({
    uri: process.env.CMS_URI,
    token: process.env.CMS_TOKEN
  }));
};

// -----------------------------------------------------------------------
// Express response stub to supply to processWebsocketActivity
// Luckily, the Webex adapter doesn't do anything meaningful with it
class responseStub {
  status(){}
  end(){}
}

function processWebsocketActivity( event ) {
  // Express request stub to fool the Activity processor
  let requestStub = {};
  // Event details are expected in a 'body' property
  requestStub.body = event;

  // Hand the event off to the Botkit activity processory
  controller.adapter.processActivity( requestStub, new responseStub, controller.handleTurn.bind( controller ) )
}
//--------------------------------------------

controller.ready( async () => {
  console.log("hi");
  const path = require('path');

  // load developer-created custom feature modules
  controller.loadModules( path.join( __dirname, 'features' ) );

  if ( process.env.WEBSOCKET_EVENTS == 'True' ) {
    console.log("Using web socket mode");

    await controller.adapter._api.memberships.listen();
    controller.adapter._api.memberships.on( 'created', ( event ) => processWebsocketActivity( event ) );
    controller.adapter._api.memberships.on( 'updated', ( event ) => processWebsocketActivity( event ) );
    controller.adapter._api.memberships.on( 'deleted', ( event ) => processWebsocketActivity( event ) );

    await controller.adapter._api.messages.listen();
    controller.adapter._api.messages.on('created', ( event ) => processWebsocketActivity( event ) );
    controller.adapter._api.messages.on('deleted', ( event ) => processWebsocketActivity( event ) );

    await controller.adapter._api.attachmentActions.listen();
    controller.adapter._api.attachmentActions.on('created', ( event ) => processWebsocketActivity( event ) );

    // Remove unnecessary auto-created webhook subscription
    await controller.adapter.resetWebhookSubscriptions();

    console.log( 'Using websockets for incoming messages/events');
  }
  else {
    console.log("Using web hook mode");
    // Register attachmentActions webhook
    controller.adapter.registerAdaptiveCardWebhookSubscription( controller.getConfig( 'webhook_uri' ) );
  }

});

controller.commandHelp = [];

controller.webserver.get('/', (req, res) => {

  res.send(`This app is running Botkit ${ controller.version }.`);

});
