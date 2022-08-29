(function ($, window, document, undefined) {
	"use strict";
	var defaults = {
		timespans: [
			["0800", "0845"],
			["0850", "0935"],
			["0950", "1035"],
			["1040", "1125"],
			["1130", "1215"],
			["1330", "1415"],
			["1420", "1505"],
			["1520", "1605"],
			["1610", "1655"],
			["1705", "1750"],
			["1755", "1840"],
			["1920", "2005"],
			["2010", "2055"],
			["2100", "2145"],
		],
		timespanDesc: [
			{
				from: 0,
				to: 1,
				text: "第一大节",
			},
			{
				from: 2,
				to: 4,
				text: "第二大节",
			},
			{
				from: 5,
				to: 6,
				text: "第三大节",
			},
			{
				from: 7,
				to: 8,
				text: "第四大节",
			},
			{
				from: 9,
				to: 10,
				text: "第五大节",
			},
			{
				from: 11,
				to: 13,
				text: "第六大节",
			},
		],
		weekdays: 5,
		weekdayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		curriculum: [
			[["0800", "0935", "课表示例1", "Sample Course1"]],
			[["0950", "1125", "课表示例2", "Sample Course2"]],
			[["1330", "1605", "课表示例3", "Sample Course3"]],
			[["1520", "1840", "课表示例4", "Sample Course4"]],
			[["1920", "2145", "课表示例3", "Sample Course3"]],
		],
		interval: 5,
		start: "0800",
		end: "2145",
		breakVisible: false,
		colorPool: [
			"#F4F2F3",
			"#FBE0C3",
			"#C3CBD6",
			"#FFD5AF",
			"#F6F4E8",
			"#F8EFEA",
			"#F2EBE5",
			"#FAE6B1",
			"#F8D4BA",
			"#F7F4EF",
			"#F7F1ED",
			"#F0EFF4",
			"#F2E9EB",
			"#E8ECEB",
		],
	};

	function QuaternaryTimeInterval(timeA, timeB) {
		var h1 = parseInt(timeA.slice(0, 2));
		var m1 = parseInt(timeA.slice(2, 4));
		var h2 = parseInt(timeB.slice(0, 2));
		var m2 = parseInt(timeB.slice(2, 4));
		return h2 * 60 + m2 - h1 * 60 - m1;
	}

	function insertStr(source, start, newStr) {
		return source.slice(0, start) + newStr + source.slice(start);
	}

	function getRandomColor(pool) {
		var index = Math.floor(Math.random() * pool.length);
		return pool[index];
	}

	function PrettySchedule($ele, options) {
		this.$ele = $ele;
		this.options = options = $.extend(defaults, options || {});
		this.courseNametoDesc = {};
		this.options.curriculum.forEach((val, index, arr) => {
			val.forEach((quat) => {
				var [courseStart, courseEnd, courseName, courseDesc] = quat;
				this.courseNametoDesc[courseName] = courseDesc;
			});
		});
		this.timeNametoDesc = {};
		this.cachedColorMap = {};
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
				console.log(
					"Waring: Incompatitable options between weekdays and curriculum"
				);
			}
			if (options.weekdays > options.weekdayNames.length) {
				console.log("Warning: Blank weekdays may display");
			}
			var cols = Math.min(options.weekdays, options.weekdayNames.length);
			var rows =
				QuaternaryTimeInterval(options.start, options.end) / options.interval;
			var rowspans = [];
			var breakspans = [];
			for (var i = 0; i < options.timespans.length; i++) {
				rowspans.push(
					QuaternaryTimeInterval(
						options.timespans[i][0],
						options.timespans[i][1]
					) / options.interval
				);
				if (i != options.timespans.length - 1) {
					var breakspan =
						QuaternaryTimeInterval(
							options.timespans[i][1],
							options.timespans[i + 1][0]
						) / options.interval;
					breakspans.push(breakspan);
					if (!options.breakVisible) {
						rows -= breakspan;
					}
				}
			}
			var mergedRowspans = [],
				mergedBreakspans = [];
			for (var i = 0; i < options.timespanDesc.length; i++) {
				var mergeInfo = options.timespanDesc[i];
				var mergedSpan = 0;
				for (var j = mergeInfo["from"]; j <= mergeInfo["to"]; j++) {
					mergedSpan += rowspans[j];
					if (j < mergeInfo["to"] && options.breakVisible) {
						mergedSpan += breakspans[j];
					}
				}
				mergedRowspans.push({ span: mergedSpan, desc: mergeInfo["text"] });
				if (mergeInfo["to"] < breakspans.length) {
					mergedBreakspans.push(breakspans[mergeInfo["to"]]);
				}

				this.timeNametoDesc[mergeInfo["text"]] =
					insertStr(options.timespans[mergeInfo["from"]][0], 2, ":") +
					"~" +
					insertStr(options.timespans[mergeInfo["to"]][1], 2, ":");
			}

			var html = [];
			html.push(
				'<table class="schedule-table" cellpadding="0" cellspacing="0">'
			);
			html.push("<tr>");
			// left-up corner blank
			html.push('<th class="day-blank has-border-bottom"> </th>');
			// weekdays
			for (var i = 0; i < cols; i++) {
				html.push(
					'<th class="day has-border-bottom has-border-left">' +
						options.weekdayNames[i] +
						"</th>"
				);
			}
			html.push("</tr>");
			// timespans and curriculums
			var timespanEnd = 0,
				weekdayEnd = new Array(options.weekdays).fill(0),
				timeEnd = 0,
				isLastCourse = false;
			for (var curRow = 0; curRow < rows; curRow++) {
				html.push("<tr>");
				if (curRow >= timeEnd) {
					if (!options.breakVisible || isLastCourse == false) {
						if (timespanEnd != mergedRowspans.length - 1)
							html.push(
								`<th rowspan="${mergedRowspans[timespanEnd]["span"]}" class="course-time has-border-up has-border-bottom has-border-right">${mergedRowspans[timespanEnd]["desc"]}</th>`
							);
						else
							html.push(
								`<th rowspan="${mergedRowspans[timespanEnd]["span"]}" class="course-time has-border-right">${mergedRowspans[timespanEnd]["desc"]}</th>`
							);
						timeEnd += mergedRowspans[timespanEnd]["span"];
						isLastCourse = true;
						timespanEnd++;
					} else if (
						timespanEnd - 1 != mergedRowspans.length - 1 &&
						options.breakVisible
					) {
						html.push(
							`<th rowspan="${
								mergedBreakspans[timespanEnd - 1]
							}" class="course-break has-border-top has-border-bottom has-border-right"> </th>`
						);
						timeEnd += mergedBreakspans[timespanEnd - 1];
						isLastCourse = false;
					}
				}

				weekdayEnd.forEach((val, index, arr) => {
					if (val < options.curriculum[index].length) {
						var [courseStart, courseEnd, courseName, courseDesc] =
							options.curriculum[index][val];
						var spansUntil =
							QuaternaryTimeInterval(options.start, courseStart) /
							options.interval;
						if (!options.breakVisible) {
							var be = 0,
								en = options.timespans.length - 1;
							while (
								en >= be &&
								QuaternaryTimeInterval(courseStart, options.timespans[en][0]) >
									0
							) {
								en--;
							}
							if (be < en) {
								for (; be < en; be++) {
									spansUntil -= breakspans[be];
								}
							}
						}
						if (curRow >= spansUntil) {
							var courseSpan =
								QuaternaryTimeInterval(courseStart, courseEnd) /
								options.interval;
							if (!options.breakVisible) {
								var be = 0,
									en = options.timespans.length - 1;
								while (
									be < en &&
									QuaternaryTimeInterval(
										options.timespans[be][0],
										courseStart
									) > 0
								) {
									be++;
								}
								while (
									en >= be &&
									QuaternaryTimeInterval(courseEnd, options.timespans[en][1]) >
										0
								) {
									en--;
								}
								if (be < en) {
									for (; be < en; be++) {
										courseSpan -= breakspans[be];
									}
								}
							}

							var courseColor = this.cachedColorMap[courseName];
							if (courseColor == undefined) {
								courseColor = getRandomColor(options.colorPool);
								this.cachedColorMap[courseName] = courseColor;
							}
							html.push(
								`<td rowspan="${courseSpan}" class="course-name" id="${courseName}" style="background-color: ${courseColor};">${courseName}</td>`
							);
							arr[index]++;
						} else {
							if (curRow == timeEnd - 1 && timespanEnd < mergedRowspans.length)
								html.push(
									`<td class="course-blank has-border-bottom has-border-right"> </td>`
								);
							else if (index == arr.length - 1)
								html.push(`<td class="course-blank"> </td>`);
							else
								html.push(`<td class="course-blank has-border-right"> </td>`);
						}
					} else if (options.curriculum[index].length > 0) {
						var [courseStart, courseEnd, courseName, courseDesc] =
							options.curriculum[index][val - 1];
						var spanCost =
							QuaternaryTimeInterval(options.start, courseEnd) /
							options.interval;
						if (!options.breakVisible) {
							var be = 0,
								en = options.timespans.length - 1;
							while (
								en >= be &&
								QuaternaryTimeInterval(courseEnd, options.timespans[en][1]) > 0
							) {
								en--;
							}
							if (be < en) {
								for (; be < en; be++) {
									spanCost -= breakspans[be];
								}
							}
						}
						if (curRow >= spanCost) {
							if (curRow == timeEnd - 1 && timespanEnd < mergedRowspans.length)
								html.push(
									`<td class="course-blank has-border-bottom has-border-right"> </td>`
								);
							else if (index == arr.length - 1)
								html.push(`<td class="course-blank"> </td>`);
							else
								html.push(`<td class="course-blank has-border-right"> </td>`);
						}
					} else {
						if (curRow == timeEnd - 1 && timespanEnd < mergedRowspans.length)
							html.push(
								`<td class="course-blank has-border-bottom has-border-right"> </td>`
							);
						else if (index == arr.length - 1)
							html.push(`<td class="course-blank"> </td>`);
						else html.push(`<td class="course-blank has-border-right"> </td>`);
					}
				});

				html.push("</tr>");
			}
			html.push("</table>");
			// console.log(html.join(""));
			this.$ele.html(html.join(""));
		},
		bindEvent: function () {
			var that = this;
			that.$ele.on("mouseenter", ".course-time", function () {
				var _this = $(this);
				var full = _this.text() + "\n" + that.timeNametoDesc[_this.text()];
				_this.text(full);
			});
			that.$ele.on("mouseleave", ".course-time", function () {
				var _this = $(this);
				var full = _this.text().split("\n")[0];
				_this.text(full);
			});
			that.$ele.on("mouseenter", ".course-name", function () {
				var _this = $(this);
				var full = _this.text() + "\n" + that.courseNametoDesc[_this.text()];
				_this.text(full);
				var _id = _this.attr("id");
				$(`#${_id}`).each(function () {
					$(this).removeClass("shadow-out");
					$(this).addClass("shadow-in");
				});
			});
			that.$ele.on("mouseleave", ".course-name", function () {
				var _this = $(this);
				var full = _this.text().split("\n")[0];
				_this.text(full);
				var _id = _this.attr("id");
				$(`#${_id}`).each(function () {
					$(this).removeClass("shadow-in");
					$(this).addClass("shadow-out");
				});
			});
		},
	};

	$.fn.prettySchedule = function (options) {
		options = $.extend(defaults, options || {});

		return new PrettySchedule($(this), options);
	};
})(jQuery, window, document);
