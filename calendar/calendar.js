(function () {
  var calendarElements = document.querySelectorAll('input.one-dateBox');
  if (calendarElements.length = 0) return false;
  var timeObject = {};
  var timeValue = {};
  var yearRangeStart = 0;
  var displayLayer = 0;
  var animationFlag = 0;
  var activeInputEle = '';
  var div = document.createElement('div');
  div.id = 'oneCalendar';
  div.className = 'one-calendar';
  div.innerHTML = `
    <div class="one-calendar-toolbar">
      <span id="oneCalendarClear" class="iconfont  icon-backspace" title="清除"></span>
      <span id="oneCalendarTips" class="tips"></span>
      <span id="oneCalendarClose" class="iconfont  icon-close" title="关闭"></span>
    </div>  
    <div id="oneMoveCircle" class="one-move-circle"></div>
    <div class="one-calendar-nav">
      <div id="oneCalendarYearAndMonth" class="one-calendar-nav-time able show"></div>
      <div id="oneCalendarYear" class="one-calendar-nav-time able"></div>
      <div id="oneCalendarYearRange" class="one-calendar-nav-time"></div>
      <div class="one-calendar-location">
        <span id="oneCalendarSetToday" class="iconfont icon-dingwei" title="今天"></span>
      </div>
      <div class="one-calendar-nav-menu">
        <span id="oneCalendarLast" class="iconfont icon-thin-up"></span>
        <span id="oneCalendarNext" class="iconfont icon-thin-down"></span>
      </div>
    </div>
    <div class="table-container">
      <div id="oneCalendarAnimation" class="table-layer">
        <table id="oneCalendarMain"></table>
      </div>
    </div>
  `;
  document.querySelector('body').appendChild(div);
  [...calendarElements].forEach(ele => ele.onclick = function (e) {
    calendar(e.target);
  })

  function calendar(ele) {
    activeInputEle = ele;
    oneCalendar.style = 'display:block;top:' + (ele.offsetTop + ele.offsetHeight) + 'px;left:' + ele.offsetLeft + 'px';
    var reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/g;
    var value = ele.value;
    displayLayer = 0;
    if (reg.test(value)) {
      document.getElementById('oneCalendarTips').innerHTML = '';
      timeObject = convertToTimeObject(value);
      timeValue = convertToTimeObject(value);
      render(timeValue);
    } else {
      document.getElementById('oneCalendarTips').innerHTML = value ? '日期不存在' : '' ;
      init();
    }
  }

  function convertToTimeObject(timeString) {
    var arr = timeString.split('-');
    return {
      year: parseFloat(arr[0]),
      month: parseFloat(arr[1]) - 1,
      date: parseFloat(arr[2])
    }
  }


  var oneCalendar = document.getElementById('oneCalendar');
  var oneMoveCircle = document.getElementById('oneMoveCircle');
  var oneCalendarLast = document.getElementById('oneCalendarLast');
  var oneCalendarNext = document.getElementById('oneCalendarNext');
  var oneCalendarClear = document.getElementById('oneCalendarClear');
  var oneCalendarClose = document.getElementById('oneCalendarClose');
  var oneCalendarMain = document.getElementById('oneCalendarMain');
  var oneCalendarSetToday = document.getElementById('oneCalendarSetToday');
  var oneCalendarAnimation = document.getElementById('oneCalendarAnimation');
  var oneCalendarYear = document.getElementById('oneCalendarYear');
  var oneCalendarYearRange = document.getElementById('oneCalendarYearRange');
  var oneCalendarYearAndMonth = document.getElementById('oneCalendarYearAndMonth');



  function init() {
    var now = timeObject = getCurrentTime();
    displayLayer = 0;
    setYearRangeStart(now);
    setToToday(now);
  }

  function setToToday(now) {
    timeValue = {};
    render(now);
  }

  function setYearRangeStart(now) {
    var year = now.year;
    yearRangeStart = year - year % 20;
  }

  function render(time) {
    oneMoveCircle.setAttribute('style', 'display: none');
    if (displayLayer != animationFlag) {
      oneCalendarAnimation.className = displayLayer > animationFlag ? 'out-in' : 'in-out';
      setTimeout(function () {
        oneCalendarAnimation.className = '';
        animationFlag = displayLayer;
      }, 300);
    }

    fillTimeToNav(time);
    displayLayer === 0 && renderDate(time);
    displayLayer === 1 && renderMonth(time);
    displayLayer === 2 && renderYear(time);
  }

  function renderDate(time) {
    var dateList = displayDate(time);
    var html = '';
    for (var i = 0; i < 42; i++) {
      if (i % 7 === 0) {
        html += `<tr>` + dateList[i];
      } else if (i % 7 === 6) {
        html += dateList[i] + `</tr>`;
      } else {
        html += dateList[i];
      }
    }
    var header = ['日', '一', '二', '三', '四', '五', '六'].map(i => `<th><div class="one-calendar-header"><span class="week-cell">${i}</span></div></th>`).join('');
    renderHtml(
      `<thead><tr>${header}</tr></thead>
      <tbody>${html}</tbody>`
    );
  }

  function displayDate(time) {
    var {
      year,
      month,
      date
    } = time;
    var actualTime = timeValue.year ? timeValue : getCurrentTime();
    var leapYearAllMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var commonYearAllMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var willDisplayMonthList = isLeapYear(year) ? leapYearAllMonth : commonYearAllMonth;
    var willDisplayDateObj = new Date(year, month);
    var day = willDisplayDateObj.getDay(); //得知该月1号星期几，dateList追加前一个月的天数
    var dateList = [...getLastMonthDates(year, month, day)];
    for (var i = 1, l = willDisplayMonthList[month]; i <= l; i++) {
      // if (i === date) {
      if (year === actualTime.year && actualTime.month === month && i === date) {
        dateList.push(dateCell(i, 'active today'));
      } else {
        dateList.push(dateCell(i, ''));
      }
    }
    for (var j = 1, l = 42 - dateList.length; j <= l; j++) {
      if ((year === actualTime.year && actualTime.month - month === 1 && j === date) ||
        (actualTime.year - year === 1 && actualTime.month === 0 && month === 11 && j === date)) {
        dateList.push(dateCell(j, 'next-month active today'));
      } else {
        dateList.push(dateCell(j, 'next-month'));
      }
    }
    return dateList;

    function getLastMonthDates(year, month, day) {
      var lastMonth = 0;
      var lastYear = 0;
      if (month > 0) {
        lastMonth = month - 1;
        lastYear = year;
      } else {
        lastMonth = 11;
        lastYear = year - 1;
      }

      var lastMonthDateList = [];
      var lastMonthList = isLeapYear(lastYear) ? leapYearAllMonth : commonYearAllMonth;
      for (var i = lastMonthList[lastMonth]; day > 0; day--, i--) {
        if (lastYear === actualTime.year && actualTime.month === lastMonth && i === date) {
          lastMonthDateList.unshift(dateCell(i, 'last-month active today'));
        } else {
          lastMonthDateList.unshift(dateCell(i, 'last-month'));
        }
      }
      return lastMonthDateList;
    }

    function dateCell(num, className) {
      return `<td><div class="one-calendar-cell ${className}"><span class="date-cell">${num}</span></div></td>`;
    }
  }

  function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }

  function getCurrentTime() {
    var ct = currentTime = new Date();
    var curYear = ct.getFullYear();
    var curMonth = ct.getMonth();
    var curDate = ct.getDate();
    return {
      year: curYear,
      month: curMonth,
      date: curDate
    }
  }

  function fillTimeToNav(time) {
    var {
      year,
      month,
      date
    } = time;
    yearRangeStart = year - year % 20;
    oneCalendarYearAndMonth.innerHTML = year + '年' + (month + 1) + '月';
    oneCalendarYear.innerHTML = year + '年';
    oneCalendarYearRange.innerHTML = yearRangeStart + '~' + (yearRangeStart + 19);

    if (displayLayer === 0) {
      oneCalendarYearAndMonth.className = 'one-calendar-nav-time able show';
      oneCalendarYear.className = 'one-calendar-nav-time';
      oneCalendarYearRange.className = 'one-calendar-nav-time';
    } else if (displayLayer === 1) {
      oneCalendarYearAndMonth.className = 'one-calendar-nav-time';
      oneCalendarYear.className = 'one-calendar-nav-time able show';
      oneCalendarYearRange.className = 'one-calendar-nav-time';
    } else {
      oneCalendarYearAndMonth.className = 'one-calendar-nav-time';
      oneCalendarYear.className = 'one-calendar-nav-time';
      oneCalendarYearRange.className = 'one-calendar-nav-time show';
    }

  }

  function renderMonth(time) {
    var arr = new Array(12).fill(1);
    var {
      year,
      month,
      date
    } = time;
    var now = timeValue.year ? timeValue : getCurrentTime();
    var monthList = arr.map((item, index) => `<td><div class="one-calendar-cell"><span class="month-cell">${index + 1}月</span></div></td>`);
    year === now.year && (monthList[month] = monthList[month].replace(/one-calendar-cell/g, 'one-calendar-cell today'));
    var monthHtml = '';
    monthList.forEach((item, index) => {
      if (index % 4 === 0) {
        monthHtml += `<tr>` + item;
      } else if (index % 4 === 3) {
        monthHtml += item + `</tr>`;
      } else {
        monthHtml += item;
      }
    });
    // oneCalendarMain.innerHTML = monthHtml;
    renderHtml(monthHtml)
  }

  function renderYear(time) {
    var now = timeValue.year ? timeValue : getCurrentTime();
    var yearList = [];
    for (var year = yearRangeStart, i = 0; i < 20; i++, year++) {
      if (year === now.year) {
        yearList.push(`<td><div class="one-calendar-cell today"><span class="year-cell">${year}</span></div></td>`);
      } else {
        yearList.push(`<td><div class="one-calendar-cell"><span class="year-cell">${year}</span></div></td>`);
      }
    }
    var yearHtml = '';
    yearList.forEach((item, index) => {
      if (index % 4 === 0) {
        yearHtml += `<tr>` + item;
      } else if (index % 4 === 3) {
        yearHtml += item + `</tr>`;
      } else {
        yearHtml += item;
      }
    });
    // oneCalendarMain.innerHTML = yearHtml;
    renderHtml(yearHtml);
  }

  function renderHtml(html) {
    setTimeout(function () {
      oneCalendarMain.innerHTML = html;
    }, 150); //延迟时间为动画的一半
  }

  /*背景光晕跟随--开始*/
  oneCalendar.addEventListener('mousemove', function (e) {
    var me = e;
    var x = me.layerX;
    var y = me.layerY;
    //已设置one-move-circle的宽高均为120px
    displayLayer === animationFlag && (oneMoveCircle.style = 'display: block;top:' + (y - 40) + 'px; left:' + (x - 80) + 'px');
  });
  oneCalendar.addEventListener('mouseleave', function () {
    oneMoveCircle.setAttribute('style', 'display: none');
  });
  /*背景光晕跟随--结束*/

  /*监听日历点击事件--开始*/
  oneCalendar.addEventListener('click', function (e) {
    var list = [];
    var className = '';
    var curCell = e.target;
    if (curCell.className === 'date-cell') {
      list = document.getElementsByClassName('one-calendar-cell');
      [...list].forEach(function (item) {
        item.className = item.className.replace(/active/g, '');
      });
      className = curCell.parentNode.getAttribute('class') + ' active';
      curCell.parentNode.setAttribute('class', className);
    } else if (curCell.className === 'month-cell') {
      timeObject.month = parseFloat(curCell.innerHTML) - 1;
      displayLayer = 0;
      render(timeObject);
    } else if (curCell.className === 'year-cell') {
      timeObject.year = parseFloat(curCell.innerHTML);
      displayLayer = 1;
      render(timeObject);
    }
  });

  oneCalendar.addEventListener('dblclick', function (e) {
    var ele = e.target;
    var parent = ele.parentNode;
    if (ele.className !== 'date-cell') return false;
    var t = timeObject;
    var y = t.year;
    var m = t.month; //(t.month + 1).toString().padStart(2, '0');
    var d = ele.innerText.padStart(2, '0');
    if (parent.className.includes('last-month')) {
      m > 0 ? m-- : (y-- && (m = 11));
    }
    if (parent.className.includes('next-month')) {
      m === 11 ? (y++ && (m = 0)) : m++;
    }

    activeInputEle.value = y + '-' + (m + 1).toString().padStart(2, '0') + '-' + d;
    oneCalendar.style = 'display: none';
  });

  /*监听日历点击事件--开始*/

  oneCalendarLast.addEventListener('click', function () {
    if (displayLayer === 0) {
      timeObject.month--;
      timeObject.month < 0 && (timeObject.year--, timeObject.month = 11);
    } else if (displayLayer === 1) {
      timeObject.year--;
    } else {
      timeObject.year -= 20;
    }
    render(timeObject);
  });

  oneCalendarNext.addEventListener('click', function () {
    if (displayLayer === 0) {
      timeObject.month++;
      timeObject.month > 11 && (timeObject.year++, timeObject.month = 0);
    } else if (displayLayer === 1) {
      timeObject.year++;
    } else {
      timeObject.year += 20;
    }
    render(timeObject);
  });

  oneCalendarClose.addEventListener('click', function () {
    oneCalendar.style.display = 'none';
  });

  oneCalendarClear.addEventListener('click', function () {
    activeInputEle.value = '';
  });

  oneCalendarYearAndMonth.addEventListener('click', function () {
    displayLayer = 1;
    // timeObject = getCurrentTime();
    render(timeObject);
  });

  oneCalendarYear.addEventListener('click', function () {
    displayLayer = 2;
    // timeObject = getCurrentTime();
    render(timeObject);
  });

  oneCalendarSetToday.addEventListener('click', init);
  // init();

})();