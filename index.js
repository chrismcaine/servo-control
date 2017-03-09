var i2cBus = null;
var driver = null;
var pwm = null;
const fs = require('fs');

const hasSettings = fs.existsSync('settings.json');

if (!hasSettings) {
    console.log('hasSettings');
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
    pwm.setPulseLength(0, 1500);
    pwm.setDutyCycle(0, 0.25);
} else {
    console.log('local');
}

function moveServo(val) {
    // where val is 0 => 1
    //	val = val + 1;
    // val is 0 => 2
    
    //console.log(val);
    if (pwm !== null) {
        val = Math.round(val * 2000) + 500;
        pwm.setPulseLength(0, parseInt(val));
    } else {
        console.log(val)
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
