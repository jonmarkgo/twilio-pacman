/*jslint unparam: true, node: true, sloppy: true, nomen: true, maxerr: 50, indent: 2 */
var sys = require('sys'), express = require('express'), app = express.createServer(), TwilioClient = require('twilio').Client, Twiml = require('twilio').Twiml, sys = require('sys');
var client = new TwilioClient(process.env.account_sid, process.env.auth_token, process.env.twilio_hostname); //Enter your credentials and hostname here
var phone = client.getPhoneNumber(process.env.phone_number); //Enter your outgoing phone # here
app.use(express['static'](__dirname + '/public'));

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  function getDigits() {
    var getDigit = new Twiml.Gather(null, {numDigits: 1});
    getDigit.on('gathered', function (reqParams, resp) {
      if (reqParams.Digits === '1') {
        socket.emit('phone answered', 1);
      } else {
        socket.emit('digit entered', reqParams.Digits);
      }
      resp.append(getDigits());
      resp.send();
    });
    return getDigit;
  }
  socket.on('init phone', function (phonenumber) {
    phone.setup(function () {
      phone.makeCall(phonenumber, null, function (call) {
        call.on('answered', function (reqParams, res) {
          var intro = new Twiml.Say('Press 1 to start the game!');
          res.append(getDigits().append(intro));
          res.send();
        });
        call.on('ended', function (reqParams) {
          console.log('Call ended');
        });
      });
    });
  });
});