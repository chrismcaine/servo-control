var View = function (template) {
    var template = $('#' + template).html();
    Mustache.parse(template);   // optional, speeds up future uses
    this.Render = function (model) {
        return Mustache.render(template, model);
    }
}

var trackItemView = new View('track');

var socket = io.connect('http://192.168.1.11:8080/');

var playlist = new Playlist($('#playlist'), trackItemView);
var tracks = new Tracks(trackItemView);

var syncRequest$ = new Rx.Subject();
syncRequest$.throttle(2000).subscribe(playlist.Sync);

var searchRequest$ = Rx.Observable.fromEvent($('#txtSearch'), 'input')
        .map(function (e) { return e.target.value; })
        .filter(function (e) { return e.length > 2; })
        .debounce(800);


var allClickEvents$ = Rx.Observable.fromEvent(document.body, 'click').filter(Utilities.ByTag('button')).map(function (e) { return e.target.dataset; });

var transport$ = allClickEvents$.filter(Utilities.IsTransportCtrl);
transport$.subscribe(function (data) {  socket.emit('transport', data); });

var removeItemClick$ = allClickEvents$.filter(Utilities.ByDataType(CTRLS.REMOVE));
removeItemClick$.subscribe(function (data) {
    playlist.Remove(data.id);
    playlist.Draw(tracks.Items);
    playlist.Sync();
});


var sortables = [];
$('ul.tracks').each(function (index, item) {
    var sortable = new Sortable(item, {
        group: {
            name: 'sortable',
            pull: 'clone',
            put: false,
	    handle : '.drag'
        }
    });
    sortables.push(sortable);
});

$('ul.playlist').each(function (index, item) {
    var sortable = new Sortable(item, {
        group: 'sortable',
        handle: '.drag',
        onAdd: function (evt) {
            var _playlist = [];
            $('ul.playlist li').each(function (index, item) {
                _playlist.push(item.dataset.id);
            });

            playlist.Fill(_playlist);
            syncRequest$.onNext(true);
        },
        onUpdate: function () {
            var _playlist = [];
            $('ul.playlist li').each(function (index, item) {
                _playlist.push(item.dataset.id);
            });

            playlist.Fill(_playlist);
            syncRequest$.onNext(true);
        }
    });
    sortables.push(sortable);
});

searchRequest$.subscribe(function (value) {
    console.log(value);
    socket.emit('search:query', value);// ['title', value]);
});

socket.on('transport:now-playing', function (track) {
    if (track) {
        $('#now-playing-track').text(track.title + ' by ' + track.artist[0]);
        playlist.NowPlaying(track.id);
    }
});

socket.on('playlist:load', function (data) {
    console.log('pl:load', data);
    tracks.Fill(data.Tracks);
    playlist.Fill(data.Playlist);
    playlist.Draw(tracks.Items);
});

socket.on('search:result', function (data) {
    console.log('Result: ', data);
    tracks.Draw($('#tracks'), data.result);
    tracks.FillFromArray(data.result);
});

socket.on('sync:message', function (message) {
    $('#message').text(message);
});
var timeEl = $('#time');
socket.on('progress', function(data) {
	timeEl.text(data.timemark.substring(3,8));
	console.log(data);
});