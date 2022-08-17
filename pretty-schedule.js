; (function ($, window, document, undefined) {
    "use strict";
    var defaults = {
        timespans: [['0800', '0845'], ['0850', '0935'], ['0950', '1035'], ['1040', '1125'], ['1130', '1215'], ['1330', '1415'], ['1420', '1505'], ['1520', '1605'], ['1610', '1655'], ['1705', '1750'], ['1755', '1840'], ['1920', '2005'], ['2010', '2055'], ['2100', '2145']],
        weekdays: 5,
        weekdayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        curriculum: [[['0800', '0935', '课表示例', 'Sample Course']], [], [], [], []],
        interval: 5,
        start: '0800',
        end: '2145',
        breakVisible: false,
    };

    function QuaternaryTimeInterval(timeA, timeB) {
        var h1 = parseInt(timeA.slice(0, 2));
        var m1 = parseInt(timeA.slice(2, 4));
        var h2 = parseInt(timeB.slice(0, 2));
        var m2 = parseInt(timeB.slice(2, 4));
        return h2 * 60 + m2 - h1 * 60 - m1;
    }

    function PrettySchedule($ele, options) {
        this.$ele = $ele;
        this.options = options = $.extend(defaults, options || {});
        this.courseNametoDesc = {};
        this.options.curriculum.forEach((val, index, arr) => {
            val.forEach(quat => {
                var [courseStart, courseEnd, courseName, courseDesc] = quat;
                this.courseNametoDesc[courseName] = courseDesc;
            })
        });
        this.init();
    }
    PrettySchedule.prototype = {
        constructor: PrettySchedule,
        init: function () {
            this.renderHtml();
            this.bindEvent();
        },
        renderHtml: function () {
            var options = this.options;

            if (options.weekdays != options.curriculum.length) {
                console.log('Waring: Incompatitable options between weekdays and curriculum');
            }
            if (options.weekdays > options.weekdayNames.length) {
                console.log("Warning: Blank weekdays may display")
            }
            var cols = Math.min(options.weekdays, options.weekdayNames.length);
            var rows = QuaternaryTimeInterval(options.start, options.end) / options.interval;
            var rowspans = [];
            var breakspans = [];
            for (var i = 0; i < options.timespans.length; i++) {
                rowspans.push(QuaternaryTimeInterval(options.timespans[i][0], options.timespans[i][1]) / options.interval);
                if (i != options.timespans.length - 1) {
                    var breakspan = QuaternaryTimeInterval(options.timespans[i][1], options.timespans[i + 1][0]) / options.interval;
                    breakspans.push(breakspan);
                    if (!options.breakVisible) {
                        rows -= breakspan;
                    }
                }
            }

            var html = [];
            html.push('<table class="schedule-table">');
            html.push('<tr>');
            // left-up corner blank
            html.push('<th class="day blank"> </th>')
            // weekdays
            for (var i = 0; i < cols; i++) {
                html.push('<th class="day">' + options.weekdayNames[i] + '</th>');
            }
            html.push('</tr>');
            // timespans and curriculums
            var timespanEnd = 0, weekdayEnd = new Array(options.weekdays).fill(0), timeEnd = 0;
            for (var curRow = 0; curRow < rows; curRow++) {
                html.push('<tr>');
                if (curRow >= timeEnd) {
                    html.push(`<th rowspan="${rowspans[timespanEnd]}" class="time">${timespanEnd + 1}</th>`);
                    timeEnd += rowspans[timespanEnd];
                    if (timespanEnd != rowspans.length - 1 && options.breakVisible) {
                        html.push(`<th rowspan="${breakspans[timespanEnd]}" class="time"> </th>`);
                        timeEnd += breakspans[timespanEnd];
                    }
                    timespanEnd++;
                }

                weekdayEnd.forEach((val, index, arr) => {
                    if (val < options.curriculum[index].length) {
                        var [courseStart, courseEnd, courseName, courseDesc] = options.curriculum[index][val];
                        if (curRow >= QuaternaryTimeInterval(options.start, courseStart) / options.interval) {
                            var courseSpan = QuaternaryTimeInterval(courseStart, courseEnd) / options.interval;
                            if (!options.breakVisible) {
                                var be = 0, en = options.timespans.length - 1;
                                while (be < en && QuaternaryTimeInterval(options.timespans[be][0], courseStart) < 0) {
                                    be++;
                                }
                                while (en >= be && QuaternaryTimeInterval(courseEnd, options.timespans[en][1]) > 0) {
                                    en--;
                                }
                                if (be < en) {
                                    for (; be < en; be++) {
                                        courseSpan -= breakspans[be];
                                    }
                                }
                            }

                            html.push(`<td rowspan="${courseSpan}" class="course-name">${courseName}</td>`);
                            arr[index]++;
                        }
                        else {
                            html.push(`<td class="course-blank"> </td>`);
                        }
                    }
                    else if (options.curriculum[index].length > 0) {
                        var [courseStart, courseEnd, courseName, courseDesc] = options.curriculum[index][val - 1];
                        var spanCost = QuaternaryTimeInterval(options.start, courseEnd) / options.interval;
                        if (!options.breakVisible) {
                            var be = 0, en = options.timespans.length - 1;
                            while (en >= be && QuaternaryTimeInterval(courseEnd, options.timespans[en][1]) > 0) {
                                en--;
                            }
                            if (be < en) {
                                for (; be < en; be++) {
                                    spanCost -= breakspans[be];
                                }
                            }
                        }
                        if (curRow >= spanCost) {
                            html.push(`<td class="course-blank"> </td>`);
                        }
                    }
                    else {
                        html.push(`<td class="course-blank"> </td>`);
                    }
                });

                html.push('</tr>');
            }
            html.push('</table>')
            console.log(html.join(""));
            this.$ele.html(html.join(""));
        },
        bindEvent: function () {
            var that = this;
            that.$ele.on("mouseenter", ".course-name", function () {
                var _this = $(this);
                var full = _this.text() + '\n'+that.courseNametoDesc[_this.text()];
                _this.text(full);
            });
            that.$ele.on("mouseleave", ".course-name", function () {
                var _this = $(this);
                var full = _this.text().split('\n')[0];
                _this.text(full);
            })
        }
    };


    $.fn.prettySchedule = function (options) {
        options = $.extend(defaults, options || {});

        return new PrettySchedule($(this), options);
    }

})(jQuery, window, document);