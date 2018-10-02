var Calendar = {  
    data: {
        html: ""
    },
    drawCalendar: function(initialDate, daysToRender, countryCode, htmlString) {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthDays = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            limitForRows = [7, 14, 21, 28, 35, 42],
            rowBreak = [8, 15, 22, 29, 36, 43],
            paint = true;
        
        var getFirstDay = function(date) {
            let day = -1,
                realDate = date.toString();
            day = realDate.split(" ")[2].replace(/(^|-)0+/g, "$1");
            return day;
        }
        
        var getDaysOfTheMonth = function(month, year) {
            let daysToRender = -1;
            if (month === 1) {
                daysToRender = (((year % 100 != 0) &&
                        (year % 4 == 0)) ||
                    (year % 400 == 0)) ? 29 : 28;
            } else {
                daysToRender = monthDays[month];
            }
            return daysToRender;
        };

        // Consumes REST api
        var getHolidays = function (year, month) {
            var url = "https://holidayapi.com/v1/holidays?key=184143e0-a679-4f20-af41-7afd666ef867&country=" + countryCode + "&year=" + year + "&month=" + month;
            var httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', url, false);
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState == 4) {
                    if (httpRequest.status == 200) {
                        try {
                            data = JSON.parse(httpRequest.response);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    } else {
                        console.log("Error", httpRequest.statusText);
                    }
                }
            }
            httpRequest.onerror = function (e) {
                console.error(httpRequest.statusText);
            }
            httpRequest.send();
        }

        var month = initialDate.getMonth(),
            year = initialDate.getFullYear(),
            startDate = initialDate.getDay(),
            initialDay = getFirstDay(initialDate),
            style = "weekday",
            title = "",
            value, htmlString;

        getHolidays(year, month + 1);

        htmlString += '<div><table cols="7" cellpadding="0" cellspacing="0" class="month-container"><tr align="center" class="days">';

        // Days of the week title
        if(paint){
            for (let s = 0; s < 7; s++) {
                htmlString += '<td class="day-title">' + "SMTWTFS".substr(s, 1) + '</td>';
            }
            paint = false;
        }   

        htmlString += '</tr><tr align="center">';
        htmlString += '<td colspan="7" align="center" class="month-title">' + months[month] + ' - ' + year + '</td></tr><tr align="center"> </tr><tr align="center">';

        //Render the calendar, 42  possible individual cells
        for (let i = 1; i <= 42; i++) {

            //This row will be added to specify when no more rows should be added and should break out of the for loop
            if (value === '&nbsp;' && (i > startDate) && rowBreak.indexOf(i) != -1) {
                break;
            }

            if ((i >= startDate) && (initialDay <= getDaysOfTheMonth(month, year)) && (daysToRender > 0)) {
                value = initialDay;
                daysToRender--;
                initialDay++;
            } else {
                //Invalid date should be color gray
                value = '&nbsp;';
                style = "invalid-date";
            }

            htmlString += '<td class="' + style + '"' + title + '">' + value + '</td>';

            //Limit the number of days per row
            if(limitForRows.indexOf(i) != -1 ) {
                htmlString += '</tr><tr align="center">';
            }  
        }
        htmlString += '</tr></table></div>';

        //Call drawCalendar to render every month needed
        if (daysToRender > 0) {
            var nextMonth = month === 11 ? 0 : month + 1,
                year = nextMonth === 1 ? year + 1 : year,
                date = new Date(year, nextMonth, 01);

            this.drawCalendar(date, daysToRender, countryCode, htmlString);
        } else {
            this.data.html = htmlString;
        }
    },
    getHtmlString: function() {
        return this.data.html;
    }
};