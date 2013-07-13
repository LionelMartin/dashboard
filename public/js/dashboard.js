var UpdatedModel = Backbone.Model.extend({
    updateInterval: 15000,
    initialize: function(options) {
        if (options) {
          this.set(options);
        }
        var cache;
        if (cache = this.getCache()) {
            this.set(cache);
        } else {
            this.update();
        }
        setInterval(this.update.bind(this), this.updateInterval);
    },
    getCacheKey: function() {
        return "default";
    },
    getCache: function() {
        var data = localStorage.getItem(this.getCacheKey());
        var cached = data && JSON.parse(data);
        if (cached) {
            var time = cached.timestamp + this.updateInterval
            if (time > Date.now()) {
                return cached.data;
            }
        }
        return false;
    },
    saveCache: function(data) {
        localStorage.setItem(this.getCacheKey(), JSON.stringify({timestamp: Date.now(), data: data}));
    }
});

var Clock = UpdatedModel.extend({
    updateInterval: 1000 * 60,
    update: function() {
        var time = new Date();
        this.set({
            "timeStr": this.getTime(time),
            "dateStr": moment(time).format("dddd LL")
        });
    },
    getTime: function(date) {
        return {
            hour: date.getHours(),
            minute: moment(date).format('mm')
        };
    }
});

var DefaultView = Backbone.View.extend({
    initialize: function(options) {
        this.model = options.model,
        this.el = options.el;
        this.template = Handlebars.compile(options.template.html());
        this.listenTo(this.model, "change", this.render);
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
    }
})
var ClockView = DefaultView.extend({});
var Weather = UpdatedModel.extend({
    position: null,
    currentConditionsResponse: null,
    forecastResponse: null,
    updateInterval: 30 * 60 * 1000,
    language: "FR",
    apikey: 'c0e8d71b8b531341',
    position: {
        coords: {
            latitude: 43.598193,
            longitude: 3.900333
        }
    },
    getCacheKey: function() {
        return "weather";
    },
    update: function() {
        conditionsUrl = 'https://api.wunderground.com/api/' +
              this.apikey + '/conditions/' +
              'lang:' + this.language + '/q/' +
              this.position.coords.latitude + ',' +
              this.position.coords.longitude + '.json?callback=?';

        $.getJSON(conditionsUrl, this.onConditionsChanged.bind(this));
        forecastUrl = 'https://api.wunderground.com/api/' +
              this.apikey + '/forecast/' +
              'lang:' + this.language + '/q/' +
              this.position.coords.latitude + ',' +
              this.position.coords.longitude + '.json?callback=?';
        $.getJSON(forecastUrl, this.onForecastChanged.bind(this));
    },
    onForecastChanged: function(data) {
        this.set("forecast", data.forecast.simpleforecast);
        var cache;
        if (!(cache = this.getCache())) {
            cache = {};
        }

        cache.forecast = data.forecast.simpleforecast;
        this.saveCache(cache);
    },
    onConditionsChanged: function(data) {
        this.set("condition", data.current_observation);
        var cache;
        if (!(cache = this.getCache())) {
            cache = {};
        }
        cache.condition = data.current_observation;
        this.saveCache(cache);
    },
    updatePosition: function() {
        // Get the current location.
        navigator.geolocation.getCurrentPosition(
            this.getCurrentPositionSuccess.bind(this),
            this.getCurrentPositionError.bind(this), {timeout: 10000}
        );
    },
    getCurrentPositionSuccess: function(position) {
        this.position = position;
    },
    getCurrentPositionError: function(error) {
        console.log('PositionError', error);
    }
});
var Email = UpdatedModel.extend({
    updateInterval: 5 * 60 * 1000,
    update: function() {
        $.getJSON(
            "/emails",
            this.get("emailOptions"),
            this.onEmailResponse.bind(this)
        );
    },
    getCacheKey: function() {
        return "email-"+this.get("emailOptions").email;
    },
    onEmailResponse: function(data) {
      this.set("emails", data);
      this.saveCache({emails: data});
    }
});
var Calendar = UpdatedModel.extend({
    updateInterval: 30*60*1000,
    update: function() {
        $.getJSON(
            "/calendar?cal="+encodeURIComponent(this.get("cal")),
            this.onCalendarResponse.bind(this)
        );
    },
    getCacheKey: function() {
        return "calendar-"+this.get("cal");
    },
    onCalendarResponse: function(data) {
        var d;
        for (var i=0, max = data.length; i<max; i++) {
            d = new Date(Date.parse(data[i].start));
            data[i].startStr = moment(d).calendar();
        }
        this.set("events", data);
        this.saveCache({events:data});
    }
})
var Tv = UpdatedModel.extend({
    updateInterval: 5 * 60 * 60 * 1000,
    update: function() {
      $.getJSON(
          "/tv",
          this.onTvResponse.bind(this)
      );
    },
    onTvResponse: function(data) {
        this.set("programmes", data);
        this.saveCache({programmes: data});
    },
    getCacheKey: function() {
      return 'tv';
    }
})

var WeatherView = DefaultView.extend({});
var EmailView = DefaultView.extend({});
var CalendarView = DefaultView.extend({});
var TvView = DefaultView.extend({});

Handlebars.registerHelper("time", function(date) {
    return moment(Date.parse(date)).format("H:mm");
});
