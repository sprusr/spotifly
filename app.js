// ----
// -- Setup
// ----

var express = require('express');
var noble = require('noble');
var SpotifyWebApi = require('spotify-web-api-node');
var config = require('./config');

var app = express();

var spotifyApi = new SpotifyWebApi(config.spotify);
var assocs = config.assocs;
var current = config.default;

// ----
// -- Routes
// ----

app.get('/cb', function(req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code).then(function(data) {
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
    noble.startScanning([], true);
    res.redirect('/');
  }, function(err) {
    console.log('Token error', err);
  });
});

app.use(function(req, res, next) {
  if(spotifyApi.getRefreshToken()) {
    spotifyApi.refreshAccessToken().then(function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      next();
    }, function(err) {
      console.log('Could not refresh access token', err);
      next();
    });
  } else {
    res.redirect(spotifyApi.createAuthorizeURL(['user-read-playback-state', 'user-modify-playback-state'], 'the-state'));
  }
});

app.get('/', function(req, res) {
  res.send('home');
});

// ----
// -- Functions
// ----

// Returns the rough distance in meters from the beacon
var calculateDistance = function(rssi) {
  var txPower = -59; //hard coded power value. Usually ranges between -59 to -65

  if (rssi == 0) {
    return -1.0;
  }

  var ratio = rssi * 1.0 / txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio, 10);
  }
  else {
    var distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    return distance;
  }
}

var calculateNearest = function() {
  var newHigh = null;

  for(var uuid in assocs) {
    console.log(uuid);
    if(assocs[uuid].proximity < assocs[current].proximity) {
      newHigh = uuid;
    }
  }

  if(newHigh && newHigh != current) {
    current = newHigh;
    spotifyApi.transferMyPlayback({
      deviceIds: [assocs[newHigh].spotify],
      play: true
    }, function(err) {
      console.log('transferred', err);
    })
  }
};

// Logs info about the beacons
var handleDiscover = function(peripheral) {
  var macAddress = peripheral.uuid;
  var rssi = peripheral.rssi;
  var localName = peripheral.localName;

  /*if(peripheral.advertisement.serviceData.length) {
    console.log('found device: ', macAddress, ' ', localName, ' ', rssi, ' ', calculateDistance(rssi), ' ', peripheral.advertisement.serviceData[0].data.toString());
    console.log(peripheral.advertisement.serviceData[0].data.toString());
  }*/

  //console.log('found device: ', macAddress, ' ', localName, ' ', rssi, ' ', calculateDistance(rssi));

  if(Object.keys(assocs).indexOf(macAddress) > -1) {
    console.log(macAddress, ' ', localName, ' ', rssi, ' ', calculateDistance(rssi));
    assocs[macAddress].proximity = calculateDistance(rssi);

    calculateNearest();
  }
};

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    //noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', handleDiscover);

app.listen(8000);
