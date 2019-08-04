class Action {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
};

let buttons = {
  state: 'initial',

  down: function(button) {

    if (this.state === 'initial') {
      return { type: 'initial', value: 'initial'};
    }

    else if (this.state === 'root') {
      return root[button];
    }

    else if (this.state === 'sources') {
      return sources[button];
    }

    else {
      console.log(`Invalid button option. Current values;\n  State: ${this.state}\n  Button: ${button}`);
    }

  },

  up: function(button) {

    if (this.state === 'initial') {
      this.state = 'root';
      console.log(this.state);
      return {change: true, name: this.state};
    }

    else {
      console.log(this.state);
      return {change: false, name: this.state};
    }
  }
};

let root = [
  new Action('transition', 'Starting Soon'),
  new Action('transition', 'Fullscreen Webcam'),
  new Action('transition', 'Fullscreen Catcam'),
  new Action('transition', 'Be Right Back'),
  new Action('tweet', 'BeatnikAU - LIVE'),
  new Action('transition', 'Main 16:9'),
  new Action('transition', 'Kitteh 16:9'),
  new Action('transition', 'Main Game'),
  new Action('transition', 'Ending'),
  new Action('tweet', 'Beatnik'),
  new Action('none', 'none'),
  new Action('none', 'none'),
  new Action('toggle', 'mic'),
  new Action('none', 'none'),
  new Action('debug', 'GetSourcesList')
];

module.exports = buttons;
