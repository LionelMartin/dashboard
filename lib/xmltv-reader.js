var xmltv = require('node-xmltv');
var testFilter = function(filters, programme) {
    if (filters["channels"]) {
        var channelOk = false;
        for(var i = 0, max = filters.length; i < max; i++) {
            if (programme.channel = filters.channels[i]) {
                channelOk = true;
                break;
            }
        }
        if (!channelOk) {
            return false;
        }
    }
    if (filters['start']) {
        if (filters.start >= programme.end) {
            return false;
        }
    }
    if (filters['end']) {
        if (filters.end <= programme.start) {
            return false;
        }
    }
    return true;
}

var groupByChannel = function(programmes, groupSameProgrammes) {
    var channels = {}, programme, previous = false;
    for (var i = 0, max = programmes.length; i < max; i++) {
        programme = programmes[i];
        if (!channels[programme.channel]) {
            channels[programme.channel] = [];
        }
        if (!previous || (programme.title != previous.title)) {
            if (programme.length > 20) {
                channels[programme.channel].push(programme);
            }
        }
        previous = programme;
    }
    return channels;
}

exports.getXmlTv = function(filename, cb) {
    var parser = new xmltv(),
        now = new Date(),
        filters = {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21),
            end : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23)
        },
        programmes = [];

    parser.on("programme", function(programme) {
        if (testFilter(filters, programme)) {
            programmes.push(programme);
        }
    });

    parser.on("end", function() {
        var channels = ["TF1", "FRANCE 2", "FRANCE 3", "FRANCE 4", "FRANCE 5", "M6", "ARTE", "TMC", "W9", "RTL9", "NT1", "NRJ 12", "D17"];
        var sortProgrammes = function(a, b) {
            if (a.channel != b.channel) {
                return channels.indexOf(a.channel) - channels.indexOf(b.channel);
            }
            return a.start - b.start;
        };

        programmes.sort(sortProgrammes);
        programmes = groupByChannel(programmes);
        cb(programmes);
    });

    parser.parseFile(filename);
}
