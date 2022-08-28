# Pretty Schedule

This simple plugin allows you to create an interactive schedule with custom configurations.

## Getting Start

Download source files and put it in your blog folder.

Then call the method in your html.

```html
<div class="schedule"></div>
<script src="https://cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>
<script src="path/to/pretty-schedule.js"></script>
<script>
    $(".schedule").prettySchedule();
</script>
```

## Configuration

```json
{
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
 }
```
