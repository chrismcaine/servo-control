var i2cBus = require('i2c-bus');
var driver = require('pca9685').Pca9685Driver;

var options  = {
	i2c : i2cBus.openSync(1),
	address: 0x40,
	frequency: 50,
	debug : false
};


pwm = new driver(options, function() {
	console.log('init complete');
});


//pwm.setPulseRange(0,42,255);

pwm.setPulseLength(0, 1500);

pwm.setDutyCycle(0, 0.25);

function moveServo(val) {
	// where val is 0 => 1
	//	val = val + 1;
	// val is 0 => 2
	val = Math.round(val * 2000) + 500;
	//console.log(val);
	pwm.setPulseLength(0, parseInt(val));
}

const Rx = require('rxjs/Rx');
const Express = require('express');
const express = Express();
const http = require('http').Server(express);
const io = require('socket.io')(http);


express.use(Express.static('public'));
http.listen(8080);


io.on('connection', function (socket) {
    console.log('connection');

    var move$ = Rx.Observable.fromEvent(socket, 'servo:move');
   
    move$.subscribe(function (val) {
        if(val) {
		moveServo(val);
	}
    }); 
});
