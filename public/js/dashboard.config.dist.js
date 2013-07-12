$(function() {
    var icalUrl1 = "",
        icalUrl2 = "",
        emailConfig1 = {
        username: "",
        email: "",
        password:"",
        host: "",
        port: 993,
        secure: true
    };
    var emailConfig2 = {
        username:"",
        email: "",
        password:"",
        host: "",
        port: 993,
        secure: true
    };
    var language = "fr";
    moment.lang(language);
    new ClockView({model: new Clock(), el:$('#clock'), template: $("#clock-template")});
    new WeatherView({model: new Weather(), el: $('#weather'), template: $("#weather-template")})
    new EmailView({model:new Email({emailOptions: emailConfig1}), el: $("#email-1"), template: $("#email-template")});
    new EmailView({model:new Email({emailOptions :emailConfig2}), el: $("#email-2"), template: $("#email-template")});
    new CalendarView({
        model: new Calendar({cal:icalUrl1}),
        el:$("#calendar-1"),
        template: $("#calendar-template")
    });
    new CalendarView({
        model: new Calendar({cal:icalUrl2}),
        el:$("#calendar-2"),
        template: $("#calendar-template")
    });
    //change theme every half hour
    setInterval(function() {
        var nbThemes = 7;
        var curTheme = $("#theme").attr("href");
        $("#theme").attr('href', curTheme.replace(/(\d+)/, function(fullMatch, n) { return (Number(n)%7)+1;}));
    }, 1000*60*30);
});
