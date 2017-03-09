
var Utilities = {
    Format: function (input, replacements) {
        var regex = /\{(d{1,3})\}/g;
        if (Object.prototype.toString.call(replacements) !== '[object Array]') replacements = [replacements];
        return input.replace(/\{(\d{1,3})\}/g, function (item, value) { return replacements[parseInt(value)].toString(); });
    },
    Bind: function (input, replacements) {
        var regex = /\{\{([A-Za-z]{1,10})\}\}/g;
        return input.replace(regex, function (item, value) { return replacements[value]; });
    }
}
