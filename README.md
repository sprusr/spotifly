# 🎶🎸 Spotifly

Uses beacons to decide which Spotify device music should be playing from. The music follows you from room to room!

NB: relies on beacon proximity to work out distance - **is very inaccurate, so please use with caution!**

## Getting started

You're going to need Node.js and npm installed, as well as hardware support for Bluetooth Low Energy. You also need some beacons which you know (or can find out) the hardware address of.

First up, clone this repo and do an `npm install`. Then copy `config.js.dist` to `config.js` and change the values to suit you.

```javascript
spotify: {
  clientId : 'CLIENT_ID',
  clientSecret : 'CLIENT_SECRET',
  redirectUri : 'REDIRECT_URI'
},
assocs: {
  'BEACON_ID': {
    spotify: 'SPOTIFY_DEVICE_ID'
  }
}
```

You'll need to set the redirect URL to something which can reach your computer over the Internet and end up at `http://localhost:8000/cb`. If you're running locally (probably) and you don't want to go through the hassle of port forwarding, I recommend [ngrok](https://ngrok.com/) for this purpose. You'll also need to set it as a valid redirect URI for your Spotify app.

If all is well, you can run `node app.js` and visit [`localhost:8000`](http://localhost:8000) to set it off scanning. Now walk around between your beacons, and watch your music magically switch between speakers!

## Contributing

This was made as a quick hack, but definitely has potential to be expanded into a more usable bit of software. If you'd like to add features or fix bugs, please do submit a pull request!

I'm specifically interested in adding support for mobile devices as the controller (walk around with a phone instead of a laptop). This was the original plan with the WebBluetooth API, but browsers don't yet support the features required for this. You could maybe use [Cordova](https://cordova.apache.org/) or similar for this purpose. Happy hacking!
