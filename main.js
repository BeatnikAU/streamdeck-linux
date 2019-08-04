const path = require('path');
const { openStreamDeck } = require('elgato-stream-deck');
const myStreamDeck = openStreamDeck();
const sharp = require('sharp');
const webSocket = require('obs-websocket-js');
const obs = new webSocket();
const twitter = require('twitter');
const CONFIG = require('./config.json');
const buttons = require('./buttons.js');

let client = new twitter({
  consumer_key: CONFIG.twitter.consumer_key,
  consumer_secret: CONFIG.twitter.consumer_secret,
  access_token_key: CONFIG.twitter.access_token_key,
  access_token_secret: CONFIG.twitter.access_token_secret
});

obs.connect({
  address: 'localhost:4444'
})
.then(() => {
  console.log(`Success! We're connected & authenticated.`);
  return obs.send('GetSceneList');
  })
.then(data => {
  console.log(`${data.scenes.length} Available Scenes!`);
  data.scenes.forEach(scene => {
    console.log(scene.name);
  });
})
.catch(err => { // Promise convention dicates you have a catch on every chain.
  console.log(err);
});

// 72px button size
// Initial panel fill
let setImage = function(image) {
  sharp(path.resolve(__dirname + '/img', image))
    .flatten()
    .resize(myStreamDeck.ICON_SIZE * myStreamDeck.KEY_COLUMNS, myStreamDeck.ICON_SIZE * myStreamDeck.KEY_ROWS)
    .raw()
    .toBuffer()
    .then(buffer => {
      myStreamDeck.fillPanel(buffer)
    })
    .catch(err => {
      console.error(err)
    });
};

setImage('plainBG.jpg');


// Button Events
myStreamDeck.on('down', keyIndex => {
  console.log('pressed key index ' + keyIndex);
  let action = buttons.down(keyIndex);

  if (action.type === 'transition') {
    obs.send('SetCurrentScene', {'scene-name': action.value});
  }

  else if (action.type === 'tweet') {
    client.post('account/update_profile', {name: action.value}, function(error, response) {
      if (error) throw error;
      console.log("set name: ", response.name);
    });
    obs.send('StartStopStreaming')
      .catch(err => {
        console.log('OBS error: ', err);
      });
  }

  else if (action.type === 'toggle') {
    obs.send('ToggleMute', {'source': 'Mic/Aux'})
      .catch(err => {
        console.log('OBS error: ', err);
      });
  }

  else if (action.type === 'debug') {
    obs.send(action.value)
    .then(sources => {console.log(sources)})
    .catch(err => {console.log(err)})
  }

  else if (action.type === 'folder') {
    return;
  }

  else {
    console.log(`Invalid action;\n  Type: ${action.type}\n  Value: ${action.value}`)
  }
});

myStreamDeck.on('up', keyIndex => {
  console.log('released key index ' + keyIndex);
  let state = buttons.up(keyIndex);

  if (state.change) {
    setImage(state.name + '.jpg');
  }
});

myStreamDeck.on('error', err => {
  console.error('streamdeck error: ', err)
});

obs.on('error', err => {
  console.error('socket error: ', err);
});
