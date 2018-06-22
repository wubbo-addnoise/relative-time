(function(){

    var Translate = {
        en: {
            "ago": "ago",
            "in": "In",
            "within": "Within",
            "before": "Before",
            "months": [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
            "few_seconds": 'A few seconds',
            "less_than_a_minute": 'Less than a minute',
            "n_minutes": function (vars) {
                return vars.minutes + (vars.minutes == 1 ? ' minute' : ' minutes');
            },
            "n_hours": '{hours} hour',
            "yesterday_at": 'Yesterday at {hour}:{minute}',
            "tomorrow_at": 'Tomorrow at {hour}:{minute}',
            "this_year_at": '{day} {month} at {hour}:{minute}',
            "absolute_date": '{day} {month} {year} at {hour}:{minute}'
        },
        nl: {
            "ago": "geleden",
            "in": "Over",
            "within": "Binnen",
            "before": "Voor",
            "months": [ 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december' ],
            "few_seconds": 'Een paar seconden',
            "less_than_a_minute": 'Minder dan een minuut',
            "n_minutes": function (vars) {
                return vars.minutes + (vars.minutes == 1 ? ' minuut' : ' minuten');
            },
            "n_hours": '{hours} uur',
            "yesterday_at": 'Gisteren om {hour}:{minute}',
            "tomorrow_at": 'Morgen om {hour}:{minute}',
            "this_year_at": '{day} {month} om {hour}:{minute}',
            "absolute_date": '{day} {month} {year} om {hour}:{minute}'
        }
    };


    $.fn.relativeTime = function (options) {
        var tzOffset, times, interval, index, time, m, date, tz;

        options = options||{};
        if (!('lowerCase' in options)) options.lowerCase = false;
        if (!('within' in options)) options.within = false;

        function translateMessage(messageKey, vars) {
            var message, key;

            vars = vars||{};

            if (!(messageKey in Translate.current)) {
                return messageKey;
            }

            if (Translate.current[messageKey] instanceof Function) {
                return Translate.current[messageKey](vars);
            }

            message = Translate.current[messageKey];
            for (key in vars) {
                if ((key == 'hour' || key == 'minute') && vars[key] < 10) {
                    vars[key] = '0' + vars[key];
                }
                message = message.replace(new RegExp('\\{' + key + '\\}', 'g'), vars[key]);
            }

            return message;
        }

        times = [];
        this.each(function () {
            times.push(this);
        });
        tzOffset = (new Date()).getTimezoneOffset();

        for (index = 0; index < times.length; index++) {
            time = times[index];

            m = time.getAttribute('datetime').match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\+|-)(\d{2})(\d{2})/);
            date = new Date(parseInt(m[1]), parseInt(m[2])-1, parseInt(m[3]), parseInt(m[4]), parseInt(m[5]), parseInt(m[6]));
            tz = parseInt(m[8]) * 60 + parseInt(m[9]);
            if (m[7] == '+') tz = -tz;
            tz -= tzOffset;

            // Fix timezone
            time.timestamp = date.getTime() + tz * 60000;
            time.date = new Date(time.timestamp);
        }

        function updateTimes() {
            var now, purge, index, time, dt, lmIn, absPrefix, html, secondsLeft;

            purge = [];
            now = new Date();

            for (index = 0; index < times.length; index++) {
                time = times[index];

                if (!time.parentElement) {
                    purge.push(time);
                } else {
                    dt = now.getTime() - time.timestamp;

                    // Past
                    if (dt < 0) {
                        dt = -dt;
                        lmIn = options.within ? 'within' : 'in';
                        absPrefix = options.within ? Translate.current.before + ' ' : '';
                        secondsLeft = 86400000 - (now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000);

                        if (dt < 15000) {
                            html = Translate.current[lmIn] + ' ' + translateMessage('few_seconds');
                        } else if (dt < 60000) {
                            html = Translate.current[lmIn] + ' ' + translateMessage('less_than_a_minute');
                        } else if (dt < 3600000) {
                            html = Translate.current[lmIn] + ' ' + translateMessage('n_minutes', { minutes: Math.round(dt / 60000) });
                        } else if (dt < 86400000) {
                            if (dt < secondsLeft) {
                                html = Translate.current[lmIn] + ' ' + translateMessage('n_hours', { hours: Math.round(dt / 3600000) });
                            } else {
                                html = absPrefix + translateMessage('tomorrow_at', { hour: time.date.getHours(), minute: time.date.getMinutes() });
                            }
                        } else if (dt < 172800000) {
                            if (dt < secondsLeft + 86400000) {
                                html = absPrefix + translateMessage('tomorrow_at', { hour: time.date.getHours(), minute: time.date.getMinutes() });
                            } else {
                                html = absPrefix + translateMessage('this_year_at', { day: time.date.getDate(), month: Translate.current.months[time.date.getMonth()], hour: time.date.getHours(), minute: time.date.getMinutes() });
                            }
                        } else if (dt < 30758400000) {
                            html = absPrefix + translateMessage('this_year_at', { day: time.date.getDate(), month: Translate.current.months[time.date.getMonth()], hour: time.date.getHours(), minute: time.date.getMinutes() });
                        } else {
                            html = absPrefix + translateMessage('absolute_date', { day: time.date.getDate(), month: Translate.current.months[time.date.getMonth()], year: time.date.getFullYear(), hour: time.date.getHours(), minute: time.date.getMinutes() });
                        }
                    } else {
                        secondsLeft = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;

                        if (dt < 15000) {
                            html = translateMessage('few_seconds') + ' ' + Translate.current.ago;
                        } else if (dt < 60000) {
                            html = translateMessage('less_than_a_minute') + ' ' + Translate.current.ago;
                        } else if (dt < 3600000) {
                            html = translateMessage('n_minutes', { minutes: Math.round(dt / 60000) }) + ' ' + Translate.current.ago;
                        } else if (dt < 86400000) {
                            if (dt < secondsLeft) {
                                html = translateMessage('n_hours', { hours: Math.round(dt / 3600000) }) + ' ' + Translate.current.ago;
                            } else {
                                html = translateMessage('yesterday_at', { hour: time.date.getHours(), minute: time.date.getMinutes() });
                            }
                        } else if (dt < 172800000) {
                            if (dt < secondsLeft + 86400000) {
                                html = translateMessage('yesterday_at', { hour: time.date.getHours(), minute: time.date.getMinutes() });
                            } else {
                                html = translateMessage('this_year_at', { day: time.date.getDate(), month: Translate.current.months[time.date.getMonth()], hour: time.date.getHours(), minute: time.date.getMinutes() });
                            }
                        } else if (dt < 30758400000) {
                            html = translateMessage('this_year_at', { day: time.date.getDate(), month: Translate.current.months[time.date.getMonth()], hour: time.date.getHours(), minute: time.date.getMinutes() });
                        } else {
                            html = translateMessage('absolute_date', { day: time.date.getDate(), month: Translate.current.months[time.date.getMonth()], year: time.date.getFullYear(), hour: time.date.getHours(), minute: time.date.getMinutes() });
                        }
                    }

                    if (options.lowerCase) {
                        html = html.toLowerCase();
                    }

                    time.innerHTML = html;
                }
            }

            for (index = 0; index < purge.length; index++) {
                times.splice(times.indexOf(purge[index]), 1);
            }

            if (times.length == 0) {
                clearInterval(interval);
            }
        }

        updateTimes();

        interval = setInterval(updateTimes, 10000);
    };

    (function(){
        var locale = document.documentElement.getAttribute('lang');

        if (!locale) {
            locale = navigator.language || navigator.userLanguage || navigator.browserLanguage;
        }

        var lang = locale.replace(/-[^$]*$/, '').toLowerCase();
        if (!(lang in Translate)) {
            lang = 'en';
        }

        Translate.current = Translate[lang];
    })();

})();
