var i2cBus = null;
var driver = null;
var pwm = null;
const fs = require('fs');

const hasSettings = fs.existsSync('settings.json');

const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

if (settings.withServos === true) {
    console.log('run with servos');
    var i2cBus = require('i2c-bus');
    var driver = require('pca9685').Pca9685Driver;

    var options = {
        i2c: i2cBus.openSync(1),
        address: 0x40,
        frequency: 50,
        debug: false
    };

    pwm = new driver(options, function () {
        console.log('init complete');
    });
    //pwm.setPulseRange(0,42,255);
    
    for (var i = 0; i < 16; i += 1) {
	pwm.setPulseLength(i, 1500);
    	pwm.setDutyCycle(i, 0.25);
	} 
} else {
    console.log('local');
}

function MapToServoValue(val) {
    return parseInt(Math.floor(val * 2000) + 500);
}

function moveServo(values) {
    if (pwm !== null) {
        values.forEach(function (item, index) {
            pwm.setPulseLength(item[0], MapToServoValue(item[1])); 
	    console.log(item[0], MapToServoValue(item[1]));
        });
    } else {
        values.forEach(function (item, index) {
            console.log(item[0], MapToServoValue(item[1]));
        });
    }
}

const Rx = require('rxjs/Rx');
const Express = require('express');
const express = Express();
const http = require('http').Server(express);
const io = require('socket.io')(http);


express.use(Express.static('public'));
http.listen(8080);

function run(socket) {
    console.log('connection');

    var move$ = Rx.Observable.fromEvent(socket, 'servo:move');
    move$.filter(x => true).subscribe(moveServo);
}


io.on('connection', run);
