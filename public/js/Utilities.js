
var Utilities = {
    ByTag: function ByTag(tag) {
        var _tag = tag;
        return function (e) {
            return e.target.tagName === tag.toUpperCase();
        }
    },
    ByDataType: function byDataType(type, not) {
        var _type = type;
        var invert = not === true;
        return function (data) {
            if (invert) {
                return !data.type === _type;
            } else {
                return data.type === _type;
            }
        }
    },
    IsTransportCtrl: function (data) {
        return data.type != undefined && data.type != 'REMOVE';
    }
}
