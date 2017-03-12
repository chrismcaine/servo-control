(function () {
    var socket = io.connect(window.location.origin);

    function Round(sigFig) {
        const _c = Math.pow(10, isNaN(sigFig) ? 1 : parseInt(sigFig));
        return val => Math.round(val * _c) / _c;
    }
    function ForEach(task) {
        var _task = task;
        return function (obj) {
            for (var key in obj) {
                obj[key] = _task(obj[key]);
            }
            return obj;
        }
    }

    function ToServoPositions(obj) {
        var result = [];
        if (obj.x !== undefined) result.push([0, obj.x]);
        if (obj.y !== undefined) result.push([1, obj.y]);
        return result;
    }

    function ToNormalizedValues(obj) { obj.x = obj.x / window.innerWidth; obj.y = obj.y / window.innerHeight; return obj; }

    var elOutput = document.getElementById('output');

    var touch$ = Rx.Observable.fromEvent(document, 'touchmove').map(evt => { return { x: evt.changedTouches[0].pageX, y: evt.changedTouches[0].pageY }; });
    var mouse$ = Rx.Observable.fromEvent(document, 'mousemove').map(evt => { return { x: evt.clientX, y: evt.clientY }; });

    var coords$ = Rx.Observable.merge(touch$, mouse$).map(ToNormalizedValues);

    coords$.map(ForEach(Round(3))).subscribe(function (obj) {
        elOutput.innerHTML = JSON.stringify(obj);
    });

    var elBall = document.getElementById('ball');

    var mouseClick$ = Rx.Observable.merge(Rx.Observable.fromEvent(document, 'mousedown').map(true), Rx.Observable.fromEvent(document, 'mouseup').map(false));

    var ball$ = Rx.Observable.fromEvent(document, 'mousemove').withLatestFrom(mouseClick$).filter(arr => arr[1]).map(arr => arr[0])
        .map(evt => { return { x: evt.clientX, y: evt.clientY, t: evt.timeStamp }; })
        .scan(function (obj, item) {
            if (obj.startTime == null) {
                obj.startTime = item.t;
            }
            item._t = item.t - obj.startTime;
            obj.keyFrames.push(item);
            obj.startTime = item.t;
            return obj;
        }, { startTime: null, keyFrames: [] });
    mouseClick$.subscribe(x => console.log(x));

   // ball$.subscribe(x => console.log(x));

    var replay$ = mouseClick$.filter(x => !x).withLatestFrom(ball$).map(x => x[1].keyFrames);

    var keyFrames$ = replay$.flatMap(function (keyFrames) {
        var _keyFrames = keyFrames.reverse();
        var _keyFrames$ = new Rx.Subject();

        function createNext() {
            var next = _keyFrames.pop();
            if (next !== undefined) {
                setTimeout(function () {
                    _keyFrames$.onNext(next);
                    createNext();
                }, next._t);
            }
        }
        createNext();
        return _keyFrames$;
    });


    keyFrames$.map(ToNormalizedValues)
        .map(ForEach(Round(3)))
        .map(ToServoPositions)
        //.do(x => console.log(x))
        .subscribe(x => socket.emit('servo:move', x));

})();