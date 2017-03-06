var Tracks = function (view) {
    var _view = view;
    this.Items = {};
    this.Fill = function (data) {
        for (var key in data) {
            this.Items[key] = data[key];
        }
    }
    this.FillFromArray = function (arr) {
        var max = arr.length;
        for (var i = 0; i < max; i += 1) {
            this.Items[arr[i].id] = arr[i];
        }
    }
    this.GetElement = function (track) {
        return $('<li />', { 'data-id': track.id, 'class': 'sortable list-group-item' }).text(track.title);
    }
    this.Draw = function (element, result) {
        var max = result.length;
        element.empty();
        for (var i = 0; i < max; i += 1) {
            element.append(_view.Render(result[i]));
        }
    }
};