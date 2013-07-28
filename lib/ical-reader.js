var ical = require('ical');

exports.getEvents = function(icalUrl, dateTo, callback) {
    var results = {events: [], tasks: []}, currentDate = new Date(), recurDate;
    ical.fromURL(icalUrl, {}, function(err, data) {
        for (var k in data){
            if (data.hasOwnProperty(k)) {
                var ev = data[k];
                if ( ev.type == "VEVENT" ) {
                    if (ev.start.getTime() < dateTo.getTime() && ev.end.getTime() > currentDate.getTime()) {
                        results.events.push(ev);
                    } else if (ev.rrule) {
                        //ical module doesn't set dtstart while parsing the calendar so we need to fix it
                        ev.rrule.origOptions.dtstart = ev.start;
                        ev.rrule = ev.rrule.clone();
                        recurDate = ev.rrule.between(currentDate, dateTo);
                        if (recurDate.length) {
                            ev.start = recurDate[0];
                            results.events.push(ev);
                        }
                    }
                }
                if (ev.type == "VTODO") {
                  results.tasks.push(ev);
                }
            }
        }
        results.events.sort(function(a,b) {
            return a.start > b.start;
        })
        callback(results);
    });
};
