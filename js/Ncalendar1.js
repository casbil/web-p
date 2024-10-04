var NUM_CENTYEAR = 30;
// is time input control required by default
var BUL_TIMECOMPONENT = false;
// are year scrolling buttons required by default
var BUL_YEARSCROLL = true;
var calendars = [];
var RE_NUM = /^\-?\d+$/;
var posTop;
var posLeft;
//Global variable (string) added for storing path before it is set to null
var storePath;
//Global variable (boolean)added as a flag to know 
//if it is loaded for the first time or subsequent times
var firstTime = true;
//Variable array to store valid separators, new separators can be added directly to this list
var validSeparators = new Array('/', ',', '-',' ');
var SECOND_ELEMENT = 1;
var THIRD_ELEMENT = SECOND_ELEMENT + 1;

//Start - Origin from Calendar.html

// months as they appear in the calendar's title
var ARR_MONTHS = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];

var ARR_WEEKDAYNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
		"Friday", "Saturday"];

// week day titles as they appear on the calendar
var ARR_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// day week starts From (normally 0-Su or 1-Mo)
var NUM_WEEKSTART = 0;
// path to the directory where calendar images are stored. trailing slash req.
var STR_ICONPATH = '../images/';
var re_url = new RegExp('datetime=(\\-?\\d+)');
var dt_current = (re_url.exec(String(window.location))
	? new Date(new Number(RegExp.$1)) : new Date());
var re_id = new RegExp('id=(\\d+)');
var num_id = (re_id.exec(String(window.location))
	? new Number(RegExp.$1) : 0);
var obj_caller = (window.opener ? window.opener.calendars[num_id] : null);
var targetObject;

var dt_prev_year, dt_next_year, dt_prev_month, dt_next_month, dt_firstday;


/* This function does basic initialization like current date,
** previous year, next year, previous month, next month and 
** first day for current month 
**/
function initializeDateVars(dateTime){
	if (obj_caller && obj_caller.year_scroll) {
		// get same date in the previous year
		dt_current = dateTime;
		dt_prev_year = new Date(dt_current);
		dt_prev_year.setFullYear(dt_prev_year.getFullYear() - 1);
		if (dt_prev_year.getDate() != dt_current.getDate())
			dt_prev_year.setDate(0);

		// get same date in the next year
		dt_next_year = new Date(dt_current);
		dt_next_year.setFullYear(dt_next_year.getFullYear() + 1);
		if (dt_next_year.getDate() != dt_current.getDate())
		dt_next_year.setDate(0);
	}

	// get same date in the previous month
	dt_prev_month = new Date(dt_current);
	dt_prev_month.setMonth(dt_prev_month.getMonth() - 1);
	if (dt_prev_month.getDate() != dt_current.getDate())
		dt_prev_month.setDate(0);

	// get same date in the next month
	dt_next_month = new Date(dt_current);

	dt_next_month.setMonth(dt_next_month.getMonth() + 1);
	if (dt_next_month.getDate() != dt_current.getDate())
		dt_next_month.setDate(0);

	// get first day to display in the grid for current month
	dt_firstday = new Date(dt_current);
	dt_firstday.setDate(1);
	dt_firstday.setDate(1 - (7 + dt_firstday.getDay() - NUM_WEEKSTART) % 7);
}

//function added by Robina
var x;
var y;
var z;
var dropdownIndex = 0;

function SetCurrentMonth(){


	dropdownIndex = document.getElementById('txtMonth').selectedIndex;
	var dropdownValue = document.getElementById('txtMonth')[dropdownIndex].value;
	var dt_next_month = new Date(dt_current);

	dt_next_month.setMonth(dropdownIndex);

	set_datetime(dt_next_month.valueOf(), false);


}
//function added by Robina for year
function SetCurrentYear(){
	document.getElementById('txtYear').maxLength;

	var dropdownIndex1 = document.getElementById('txtYear').selectedIndex;
	var dropdownValue1 = document.getElementById('txtYear')[dropdownIndex1].innerHTML;
	//var rob1 = document.getElementById('txtYear')[dropdownIndex1].innerHTML;
	var dt_next_year = new Date(dt_current);
	var currentyear=dt_current.getFullYear();

	var index1 = document.getElementById('txtYear')[0].value;
	var index2=currentyear-index1;

	dt_next_year.setYear(dropdownValue1);

	set_datetime(dt_next_year, false);
}



// function passing selected date to calling window
function set_datetime(n_datetime, b_close) {
	var yes=true;
	//if (!obj_caller) return;
	
	var dt_datetime = cal_prs_time1(
		(document.cal ? document.cal.time.value : ''),
		new Date(n_datetime)
	);

	if (!dt_datetime) return;
	if (b_close) {
		closeCal();
		jQuery(targetObject.target).css({'color' : '#000000'});
		targetObject.target.value = (document.cal
			? obj_caller.gen_tsmp(dt_datetime)
			: obj_caller.gen_date(dt_datetime)
		);
	}
	else obj_caller.popup(dt_datetime.valueOf(),yes,b_close);
}

function clearTextField()
{
	obj_caller.target.value = '';
}

function closeCal()
{
	//jQuery('#calendarOverlay').hide();
	jQuery("#calendarOverlay").slideUp('slow');
}

//function added by Rafi

function yearList(startYear, endYear){
	if(startYear==''){
		startYear=1920;
	}
	if(endYear==''){
		endYear=2099;
	}
	var years="";

	var curYear=dt_current.getFullYear();
	for (startYear;startYear<=endYear;startYear++){
		if(startYear==curYear){
			years=years+'<option selected>'+startYear+'</option>';
		}else{
			years=years+'<option>'+startYear+'</option>';
		}
	}
	return years;
}

//function added by Rafi for months

function monthList(){
	var Months="";

	var curMonth=dt_current.getMonth();
	for (i=0;i<=11;i++){
		if(i==curMonth){
			Months=Months+'<option selected>'+ARR_MONTHS[i]+'</option>';
		}else{
			Months=Months+'<option>'+ARR_MONTHS[i]+'</option>';
		}
	}
	return Months;
}

/** This function paints the date picker html
**/
function paintCalendar(element, dateTime){
	initializeDateVars(dateTime);
	var divElement = feba.domManipulator.getElementById('calendarOverlay');
	var divExists = false;
	//default zIndex is 100
	var zIndex = 100;
	//search for modaldialog div
	var modalDialogParent = feba.domManipulator.getElement(element).parents("div[id='modalDialog']");
	//if inside modalDialog we need to find the zindex of parent div element so the calendar div will be one level above that
	if(modalDialogParent.length>=1){
		zIndex = feba.domManipulator.getCss(modalDialogParent.parent(),"z-index") + 1;
		feba.domManipulator.remove(divElement);
	}
	divElement = feba.domManipulator.getElementById('calendarOverlay');
	if(divElement.length > 0){
		divExists = true;
	}

	var calendarHtml="";
	//to check if that calendarOverlay div already exist or 
	//is this the first time calendar is opened  
	if(!divExists){
		calendarHtml = '<div id="calendarOverlay" style="position: absolute; z-index:'+zIndex+'; bgcolor:#FFFFFF; marginheight:0; marginwidth=0; topmargin=0; leftmargin:0; rightmargin:0;">';
	}

	calendarHtml = calendarHtml + '<table class="width100percent">';
	calendarHtml = calendarHtml + '<tr><td bgcolor="#ffffff">';
	calendarHtml = calendarHtml + '<table cellspacing="1" cellpadding="3" border="0">';
	calendarHtml = calendarHtml + '<tr><td colspan="7" style="border:1px solid gray;"><table cellspacing="0" cellpadding="0" border="0" class="tableWidthMargin">';

	calendarHtml = calendarHtml + '<tr class="dropdownexpandalbe1">';
	//Corrected image paths
	calendarHtml = calendarHtml + '<td class="tdStyleWithoutBorder">'+(obj_caller&&obj_caller.year_scroll?'<a href="javascript:void(0);" onclick="set_datetime('+dt_prev_year.valueOf()+',false)"><img src="'+storePath+STR_ICONPATH+'cal_prev_year.gif"  border="0" alt="previous year"></a>&nbsp;':'')+'<a href="javascript:void(0);" onclick="set_datetime('+dt_prev_month.valueOf()+',false)"><img src="'+storePath+STR_ICONPATH+'cal_prev.gif"  border="0"  alt="previous month"></a></td>'+
	'<td align="center" class="tdStyleWithoutBorder"><font color="#ffffff"><b><select name="month" size="1"  onchange="SetCurrentMonth()"  style="width: 100%;font-size:12px;" id="txtMonth">'+monthList()+'</select></font></td>'+
	'<td align="center" class="tdStyleWithoutBorder"><font color="#ffffff"><b><select name="year" size="1" onChange="SetCurrentYear()" id="txtYear" style="width: 100%;font-size:12px;">'+yearList('1920','2099')+'</select></font></td>'+
	'<td class="tdStyleWithoutBorder"><a href="javascript:void(0);" onclick="set_datetime('+dt_next_month.valueOf()+',false)"><img src="'+storePath+STR_ICONPATH+'cal_next.gif"  border="0" alt="next month"></a>'+(obj_caller && obj_caller.year_scroll?'&nbsp;<a href="javascript:void(0);" onclick="set_datetime('+dt_next_year.valueOf()+',false)"><img src="'+storePath+STR_ICONPATH+'cal_next_year.gif"  border="0" alt="next year"></a>':'')+'</td>';


	calendarHtml = calendarHtml + '</tr>';
	calendarHtml = calendarHtml + '</table ></td></tr>';
	calendarHtml = calendarHtml + '<tr>';


	// print weekdays titles
	for (var n=0; n<7; n++)
		calendarHtml = calendarHtml +'<td align="center" class="tdStyleWithBorderWeekHeaders" style="font-weight:bold;"><font color="#000000"><a title="' + ARR_WEEKDAYNAMES[(NUM_WEEKSTART+n)%7] + '" style="color:#000000;font-family: Arial;font-size: 12px;font-style: normal;">' + ARR_WEEKDAYS[(NUM_WEEKSTART+n)%7] + '</a></font></td>';
	calendarHtml = calendarHtml + '</tr>';

	// print calendar table
	var dt_current_day = new Date(dt_firstday);
	while (dt_current_day.getMonth() == dt_current.getMonth() ||
		dt_current_day.getMonth() == dt_firstday.getMonth()) {
		// print row heder
		calendarHtml = calendarHtml + '<tr>';
		for (var n_current_wday=0; n_current_wday<7; n_current_wday++) {
			if (dt_current_day.getDate() == dt_current.getDate() &&
				dt_current_day.getMonth() == dt_current.getMonth())
				// print current date
				
					calendarHtml = calendarHtml + '<td align="center" width="14%" class="tdStyleWithBorderToday" style="font-weight:bold;">';
			else if (dt_current_day.getDay() == 0 || dt_current_day.getDay() == 6)
				// weekend days
				if (dt_current_day.getMonth() == this.dt_current.getMonth()){
						calendarHtml = calendarHtml + '<td bgcolor="#ffffff" align="center" width="14%" class="tdStyleWithBorder">';
					}
					else{
						calendarHtml = calendarHtml + '<td bgcolor="#e5e5e5" align="center" width="14%" class="tdStyleWithBorder">';
					}			
			else
				// print working days of current month
						if (dt_current_day.getMonth() == this.dt_current.getMonth()){					
							calendarHtml = calendarHtml + '<td bgcolor="#ffffff" align="center" width="14%" class="tdStyleWithBorder">';			
						}
						else{
							calendarHtml = calendarHtml + '<td bgcolor="#e5e5e5" align="center" width="14%" class="tdStyleWithBorder">';			
						
						}		
			if (dt_current_day.getMonth() == this.dt_current.getMonth()){
				// print days of current month
				
					calendarHtml = calendarHtml + '<a href="javascript:void(0);" onclick="set_datetime('+dt_current_day.valueOf() +', true);">';
				
				
				if (dt_current_day.getDate() == dt_current.getDate() &&
				dt_current_day.getMonth() == dt_current.getMonth()){
					calendarHtml = calendarHtml + '<font color="#ffffff">';
				}
				else{
					calendarHtml = calendarHtml + '<font color="#000000">';
				}
				
				
				calendarHtml = calendarHtml + dt_current_day.getDate()+'</font></a></td>';
			}
			else {
				// print days of other months

				calendarHtml = calendarHtml + '<font color="red"> ';
				calendarHtml = calendarHtml + '</font></td>';
			}
			dt_current_day.setDate(dt_current_day.getDate()+1);
		}
		// print row footer
		calendarHtml = calendarHtml + '</tr>';
	}

	if (obj_caller && obj_caller.time_comp)
		calendarHtml = calendarHtml + '<form onsubmit="javascript:set_datetime('+dt_current.valueOf()+', true)" name="cal"><tr><td colspan="7" bgcolor="#87CEFA" class="tdStyleWithBorder"><font color="White" face="tahoma, verdana" size="2">Time: <input type="text" name="time" value="'+obj_caller.gen_time(this.dt_current)+'" size="8" maxlength="8"></font></td></tr></form>';
	
	calendarHtml = calendarHtml + '<tr bgcolor="#ffffff" height="15">';
	calendarHtml = calendarHtml + '<td colspan="7" align="center" valign="middle" class="tdStyleWithBorder">';
	calendarHtml = calendarHtml + '<a href="javascript:void(0);" onclick="closeCal();" class="txtBold">Close</a>';
	calendarHtml = calendarHtml + '</td>';
	calendarHtml = calendarHtml + '</tr>';
	calendarHtml = calendarHtml + '</table></tr>';
	calendarHtml = calendarHtml + '</td>';
	calendarHtml = calendarHtml + '</table>';
	
	if(!divExists){
		calendarHtml = calendarHtml + '</div>';
		jQuery(element).after(calendarHtml);
	}

	if(divExists){
		feba.domManipulator.getElementById('calendarOverlay').html(calendarHtml);
	}
	var elems = jQuery(element).parentsUntil("p");
	var nLevelSpan = elems[elems.length-1];
	var position = jQuery(nLevelSpan).offset();
	//var scrollTop = jQuery(window).scrollTop();
	//var parentWidth = jQuery(element).parent().outerWidth(true);
	var tPosX,tPosY;
	if(position != null){
        position.left = (position.left) + 'px';
//		position.left = (position.left + parentWidth) + 'px';
        var elemHeight = jQuery(nLevelSpan).outerHeight(true);    
        position.top = (position.top) + elemHeight + 200 + 'px';
	}	
	if(!(jQuery("#calendarOverlay").is(':visible'))){
		jQuery("#calendarOverlay").slideDown('slow');
	}
	jQuery("#calendarOverlay").offset(position);
}

//End - Origin from Calendar.html
invokePopup = function(){
	this.popup();
};

function calendar1(link_id,obj_target, dt_format, path, p_year_scroll, p_time_comp) {
    obj_caller = this;
    this.dt_format = dt_format;
    this.gen_date = cal_gen_date1;
    this.gen_time = cal_gen_time1;
    this.gen_tsmp = cal_gen_tsmp1;
    this.prs_date = cal_prs_date1;
    this.prs_time = cal_prs_time1;
    this.prs_tsmp = cal_prs_tsmp1;
    this.popup = cal_popup1;
    this.path = path;
	// validate input parameters
    if (!obj_target) {
        var msg = getMessage("ErrCallingCalendar");
		//return cal_error("Error calling the calendar: no target control specified");
        return msg;
    }
    if (obj_target.value == null) {
        var msg = getMessage("errCallCalInvTar");
		//return cal_error("Error calling the calendar: parameter specified is not valid tardet control");
        return msg;
    }
    this.target = obj_target;
    this.time_comp = BUL_TIMECOMPONENT;
    this.year_scroll = BUL_YEARSCROLL;
    
    if(p_year_scroll){
    	this.year_scroll = p_year_scroll;
    }
    
    if(p_time_comp){
    	this.time_comp = p_time_comp;
    }
    var link = feba.domManipulator.getElementById(link_id);
    var calendarObj=this;
    /**
     * when we call invokePopup method, the 'this' keyword should refer
     * to the current calendar object, inorder to achieve this,
     * we call invokePopup in the below manner
     */
    if(link){
    	link.on('click',function(){
    			invokePopup.apply(calendarObj);
    		}
    	);
    }
    this.id = calendars.length;
    calendars[this.id] = this;
}

function posCal() {
    if ((event.x > 824) && (event.y > 500)) {
        posLeft = event.x - 220;
        posTop = event.y - 90;
    } else if (event.y > 500) {
        posLeft = event.x + 10;
        posTop = event.y - 90;
    } else if (event.x > 824) {
        posLeft = event.x - 220;
        posTop = event.y + 100;
    } else {
        posLeft = event.x + 10;
        posTop = event.y + 110;
    }
}
var element;

function cal_popup1(str_datetime, Flag, objectFlag) {
	if(objectFlag == undefined){
		element = this.target;
		targetObject = this;
	}
	var isTopbarhw=false;
	isTopbarhw=Get_Cookie("isTopbarhw");
	
	var position = jQuery(element).offset();
	var scrollTop = jQuery(window).scrollTop();
	var parentWidth = jQuery(element).parent().outerWidth(true);
	var tPosX,tPosY;
	if(position != null){
        tPosX = (position.left + parentWidth) + 'px';
        tPosY = (position.top - scrollTop) + 'px';
	}
//if Flag is not defined in call then define it to false
    if (Flag == undefined) {
        var Flag = false;
    }
    // Watermark - Fix to keep the date text box blank
    var actualTargetValue = null;
    if(this.target.value != this.target.title){
        actualTargetValue=this.target.value;
    }
//if the calendar is loading for the first time
    if (firstTime) {
			//alert(Flag+' if  '+firstTime);
			//set firstTime to false for subsequent loads
        firstTime = false;
			//store the value of path in global variable declared
        storePath = this.path;
        this.dt_current = this.prs_tsmp(str_datetime ? str_datetime : actualTargetValue);
        if (!this.dt_current) return;
		if(isTopbarhw == "true"){
        	paintCalendar(element,this.dt_current);
        }
        else{
        	var obj_calwindow = window.open(' ' + this.path + 'calendar.html?datetime=' + this.dt_current.valueOf() + '&id=' + this.id, 'Calendar', 'width=250,cellpadding=0,cellspacing=0,height=' + (this.time_comp ? 212 : 210) + 'status=0,location=0,resizable=no,left='+tPosX+',top='+tPosY+',dependent=1,alwaysRaised=1,title=0');
        	obj_calwindow.opener = window;
        	obj_calwindow.focus();
			//nullify the path
        	this.path = '';
        }
		//for second and onwards loads
    } else {
		//if Flag is true (Call from function set_datetime)
        if (Flag) {
		//path is not nullified earlier so no need to reapply it
		//alert(Flag+' else if '+firstTime);
            this.dt_current = obj_caller.prs_tsmp(str_datetime ? str_datetime : actualTargetValue);
            if (!this.dt_current) return;
            if(isTopbarhw == "true"){
            	paintCalendar(element,this.dt_current);
            }
            else{
            	var obj_calwindow = window.open(' ' + this.path + 'calendar.html?datetime=' + this.dt_current.valueOf() + '&id=' + this.id, 'Calendar', 'width=250,cellpadding=0,cellspacing=0,height=' + (this.time_comp ? 212 : 210) + 'status=0,location=0,resizable=no,left='+tPosX+',top='+tPosY+',dependent=1,alwaysRaised=1,title=0');
				//nullify the path
            	this.path = '';
            	obj_calwindow.opener = window;
            	obj_calwindow.focus();
            }
        } else {
		//if Flag is false (Call from functions other than function set_datetime)
		//restore the path from storePath
            this.path = storePath;
            this.dt_current = this.prs_tsmp(str_datetime ? str_datetime : actualTargetValue);
            if (!this.dt_current) return;
            if(isTopbarhw == "true"){
            	paintCalendar(element,this.dt_current);
            }
            else{	
            	var obj_calwindow = window.open(' ' + this.path + 'calendar.html?datetime=' + this.dt_current.valueOf() + '&id=' + this.id, 'Calendar', 'width=250,cellpadding=0,cellspacing=0,height=' + (this.time_comp ? 212 : 210) + 'status=0,location=0,resizable=no,left='+tPosX+',top='+tPosY+',dependent=1,alwaysRaised=1,title=0');
            	obj_calwindow.opener = window;
            	obj_calwindow.focus();
				//nullify the path
            	this.path = '';
            }
        }
    }
}

// timestamp generating function
function cal_gen_tsmp1(dt_datetime) {
    return (this.gen_date(dt_datetime) + ' ' + this.gen_time(dt_datetime));
}

function trimLastTwoCharacters(fullyear) {
    fullyear = fullyear + "";
    return fullyear.substring(2, 4);
}

function trimFirstXCharacters(fullyear, x) {
    fullyear = fullyear + "";
    return fullyear.substring(0, x);
}
// date generating function
function cal_gen_date1(dt_datetime) {
//get the separator from the date format
    var separator = getSeparator(this.dt_format);
    if (separator == -1) {
//alert("Invalid Separators used");
        return -1;
    }
//split the date format using '/'
    var date_frmt = this.dt_format.split(separator);
	//clear datefrmt
    datefrmt = "";
    var iCounter = 0;
	//loop for getting elements
    for (iCounter = 0; iCounter < 3; iCounter++) {
        if (elementIsDate(date_frmt, iCounter)) {
            datefrmt = appendDateComponent(datefrmt, dt_datetime);
        } else if (elementIsMonthInMM(date_frmt, iCounter)) {
            datefrmt = appendMonthComponent(datefrmt, dt_datetime);
        } else if (elementIsFullYear(date_frmt, iCounter)) {
            datefrmt = appendFullYear(datefrmt, dt_datetime);
        } else if (elementIsYearYY(date_frmt, iCounter)) {
            if (dt_datetime.getFullYear() < 2000) {
	  			//alert("The minimum year input for this format is above 2000 only. To enter a lower value, please change the preferred date format to one containing yyyy");
                var msg = getMessage("MinYearInputAbove");
                alert(msg);
                dt_datetime.setFullYear("2000");
            }
            datefrmt = appendYearYY(datefrmt, dt_datetime);
        } else if (elementIsMonthMMM(date_frmt, iCounter)) {
            var MMMmonth = getMonthMMM(dt_datetime.getMonth());
            datefrmt = datefrmt + MMMmonth;
        }
		//append separator 
        if (iCounter != 2) {
            datefrmt = datefrmt + separator;
        }
    }
    return (datefrmt);
}
// time generating function
function cal_gen_time1(dt_datetime) {
    return ((dt_datetime.getHours() < 10 ? '0' : '') + dt_datetime.getHours() + ":" + (dt_datetime.getMinutes() < 10 ? '0' : '') + (dt_datetime.getMinutes()) + ":" + (dt_datetime.getSeconds() < 10 ? '0' : '') + (dt_datetime.getSeconds()));
}

// timestamp parsing function
function cal_prs_tsmp1(str_datetime) {
    if (!str_datetime) return (new Date());
    if (RE_NUM.exec(str_datetime)) return new Date(str_datetime);
	// else treat as date in string format
    var string_datetime = str_datetime + "";
    var arr_datetime = string_datetime.split(' ');
    var datef = this.prs_date(arr_datetime[0]);
    if (datef == -1) {
        return true;
		//alert("Invalid Date "+str_datetime);
		//return false;
    } else {
        return this.prs_time(arr_datetime[1], datef);
    }
}

// date parsing function
function cal_prs_date1(str_date) {
    var separator = getSeparator(this.dt_format);
    if ('-1' == separator) {
		//var msg=" Please check the seperator in the user's date format. The Valid ones are "+validSeparators;
		//alert(msg);
        return -1;
    }
	//split the date with '/'
    var arr_date = str_date.split(separator);
    if (arr_date[0].length == str_date.length) {
		//var msg=" Please check the seperator in the user's date format. The Valid ones are "+validSeparators;
		//alert(msg);
        return -1;
    }
		//create a new date
    var dt_date = new Date();
    dt_date.setDate(1);
    var date_frmt = this.dt_format.split(separator);
    var month = deriveMonth(arr_date, date_frmt);
    if (month == -1) {
			//alert("Invalid month entered");
        return -1;
    }
    dt_date.setMonth(month);
    var year = deriveYear(arr_date, date_frmt);
    if (year == -1) {
			//alert("Invalid year entered");
        return -1;
    }
    dt_date.setFullYear(year);
    var dayOfMonth = deriveDate(arr_date, date_frmt, year, month);
    if (dayOfMonth == -1) {
			//alert("Invalid date entered");
        return -1;
    }
    dt_date.setDate(dayOfMonth);
	//return the date to calendar
	//alert(dt_date);
    return (dt_date);
}

// time parsing function
function cal_prs_time1(str_time, dt_date) {
    if (!dt_date) return null;
    var arr_time = String(str_time ? str_time : '').split(':');
    if (!arr_time[0]) dt_date.setHours(0);
    else if (RE_NUM.exec(arr_time[0])) if (arr_time[0] < 24) dt_date.setHours(arr_time[0]);
    else {
        var msg = getMessage("InvalidHrsVal");
        msg = msg + arr_time[0];
        msg = msg + getMessage("AllowedHrsRng");
			//return cal_error ("Invalid hours value: '" + arr_time[0] + "'.\nAllowed range is 00-23.");
        return msg;
    } else {
        var msg = getMessage("InvalidHrsVal");
        msg = msg + arr_time[0];
        msg = msg + getMessage("OnlyUnsignIntAllowed");
		//return cal_error ("Invalid hours value: '" + arr_time[0] + "'.\nAllowed values are unsigned integers.");
        return msg;
    }
    if (!arr_time[1]) dt_date.setMinutes(0);
    else if (RE_NUM.exec(arr_time[1])) if (arr_time[1] < 60) dt_date.setMinutes(arr_time[1]);
    else {
        var msg = getMessage("InvalidMinutesVal");
        msg = msg + arr_time[1];
        msg = msg + getMessage("AllowedMinutesRng");
			//return cal_error ("Invalid minutes value: '" + arr_time[1] + "'.\nAllowed range is 00-59.");
        return msg;
    } else {
        var msg = getMessage("InvalidMinutesVal");
        msg = msg + arr_time[0];
        msg = msg + getMessage("OnlyUnsignIntAllowed");
		//return cal_error ("Invalid minutes value: '" + arr_time[1] + "'.\nAllowed values are unsigned integers.");
        return msg;
    }
    if (!arr_time[2]) dt_date.setSeconds(0);
    else if (RE_NUM.exec(arr_time[2])) if (arr_time[2] < 60) dt_date.setSeconds(arr_time[2]);
    else {
        var msg = getMessage("InvalidSecondsVal");
        msg = msg + arr_time[1];
        msg = msg + getMessage("AllowedMinutesRng");
			//return cal_error ("Invalid seconds value: '" + arr_time[2] + "'.\nAllowed range is 00-59.");
        return msg;
    } else {
        var msg = getMessage("InvalidSecondsVal");
        msg = msg + arr_time[0];
        msg = msg + getMessage("OnlyUnsignIntAllowed");
		//return cal_error ("Invalid seconds value: '" + arr_time[2] + "'.\nAllowed values are unsigned integers.");
        return msg;
    }
    dt_date.setMilliseconds(0);
    return dt_date;
}

function cal_error(str_message) {
//	alert (str_message);	
    this.target = "";
    return null;
}

function calCalendar(formName, eltName) {
    var calendar = new calendar1(document.forms[formName].elements[eltName]);
    calendar.year_scroll = true;
    calendar.time_comp = false;
    calendar.popup();
}
// function to get separator from the string passed
function getSeparator(testString) {
    var countOfSeparator = 0;
    var i = 0;
    var separator;
	//declare a variable to store the separator
    for (i = 0; i < validSeparators.length; i++) {
        separator = validSeparators[i];
        var date_frmt = testString.split(separator);
        if (date_frmt.length == 3) {
            break;
        }
        if (countOfSeparator == validSeparators.length - 1) {
            return '-1';
        }
        countOfSeparator++;
    }
    return separator;
}

function elementIsDate(date_frmt, index) {
    return date_frmt[index] == 'dd';
}

function elementIsMonthInMM(date_frmt, index) {
    return (date_frmt[index] == 'MM');
}

function elementIsMonthMMM(date_frmt, index) {
    return (date_frmt[index] == 'MMM');
}

function elementIsFullYear(date_frmt, index) {
    return (date_frmt[index].indexOf('yyyy') != -1);
}

function elementIsYearYY(date_frmt, index) {
    return (date_frmt[index].indexOf('yy') != -1);
}

function getMonthMMM(month) {
    var MMMmonth = 'Jan';
    if (month == 1) {
        MMMmonth = 'Feb';
    } else if (month == 2) {
        MMMmonth = 'Mar';
    } else if (month == 3) {
        MMMmonth = 'Apr';
    } else if (month == 4) {
        MMMmonth = 'May';
    } else if (month == 5) {
        MMMmonth = 'Jun';
    } else if (month == 6) {
        MMMmonth = 'Jul';
    } else if (month == 7) {
        MMMmonth = 'Aug';
    } else if (month == 8) {
        MMMmonth = 'Sep';
    } else if (month == 9) {
        MMMmonth = 'Oct';
    } else if (month == 10) {
        MMMmonth = 'Nov';
    } else if (month == 11) {
        MMMmonth = 'Dec';
    }
    return MMMmonth;
}

function appendDateComponent(datefrmt, dt_datetime) {
    return (datefrmt + eval("(dt_datetime.getDate() < 10 ? '0' : '') +  dt_datetime.getDate()  "));
}

function appendMonthComponent(datefrmt, dt_datetime) {
    return (datefrmt + eval(" (dt_datetime.getMonth() < 9 ? '0' : '') + (dt_datetime.getMonth() + 1)  "));
}

function appendFullYear(datefrmt, dt_datetime) {
    return (datefrmt + eval(" dt_datetime.getFullYear() "));
}

function appendYearYY(datefrmt, dt_datetime) {
    return (datefrmt + eval(" trimLastTwoCharacters(dt_datetime.getFullYear()) "));
}

function deriveMonth(arr_date, date_frmt) {
    var index = 0;
    var i = 0;
    for (i = 0; i < 3; i++) {
        if (elementIsMonthMMM(date_frmt, i) || elementIsMonthInMM(date_frmt, i)) {
            index = i;
            break;
        }
    }
	//change the month to upper case
    var monthText = arr_date[index].toUpperCase();
	//declare a variable to hold month value (JAN=0,FEB=index and so on)
    var month = -1;
    if (elementIsMonthMMM(date_frmt, index)) {
        if (!(isNaN(monthText))) {
            return -1;
        }
        var monthTextLastIndex = monthText.length;
		//assigning the variable a value according to month entered by the user
        if (monthText == getComparableMonth("JANUARY", monthTextLastIndex)) {
            month = 0;
        } else if (monthText == getComparableMonth("FEBRUARY", monthTextLastIndex)) {
            month = 1;
        } else if (monthText == getComparableMonth("MARCH", monthTextLastIndex)) {
            month = 2;
        } else if (monthText == getComparableMonth("APRIL", monthTextLastIndex)) {
            month = 3;
        } else if (monthText == "MAY") {
            month = 4;
        } else if (monthText == getComparableMonth("JUNE", monthTextLastIndex)) {
            month = 5;
        } else if (monthText == getComparableMonth("JULY", monthTextLastIndex)) {
            month = 6;
        } else if (monthText == getComparableMonth("AUGUST", monthTextLastIndex)) {
            month = 7;
        } else if (monthText == getComparableMonth("SEPTEMBER", monthTextLastIndex)) {
            month = 8;
        } else if (monthText == getComparableMonth("OCTOBER", monthTextLastIndex)) {
            month = 9;
        } else if (monthText == getComparableMonth("NOVEMBER", monthTextLastIndex)) {
            month = 10;
        } else if (monthText == getComparableMonth("DECEMBER", monthTextLastIndex)) {
            month = 11;;
        }
    } else if (isNaN(monthText)) {
        return -1;
    } else {
        month = monthText - 1;
    }
    return month;
}

function getComparableMonth(monthName, length) {
    if (length < 1) {
        return 0;
    }
    var valueBeingCompared = monthName.substring(0, length);
    return valueBeingCompared;
}

function deriveYear(arr_date, date_frmt) {
    var index;
    var i = 0;
    for (i = 0; i < 3; i++) {
        if (elementIsFullYear(date_frmt, i) || elementIsYearYY(date_frmt, i)) {
            index = i;
            break;
        }
    }
    var year = arr_date[index];
    var yearLength = year.length;
    var fullYearLength = 4;
    if ((isNaN(year)) || (yearLength == 0)) {
        return -1;
    }
		//MOHIT: changed from if(yearLength==fullYearLength){ to:-
    if (yearLength >= fullYearLength) {
        return year;
	 } //MOHIT: changed from else if(yearLength<fullYearLength){ to
	 else {
        var currentDate = new Date();
        var trimLength = fullYearLength - yearLength;
        var milleniumAndDecade = trimFirstXCharacters(currentDate.getFullYear(), trimLength);
        return milleniumAndDecade + '' + year;
    }
}

function deriveDate(arr_date, date_frmt, year, month) {
    var index;
    var i;
    for (i = 0; i < 3; i++) {
        if (elementIsDate(date_frmt, i)) {
            index = i;
            break;
        }
    }
    var dayOfMonth = arr_date[index];
    if (isNaN(dayOfMonth)) {
        return -1;
    }
	//if day of the month entered is greater than 31
    if (dayOfMonth <= 0 || dayOfMonth > 31) {
        return -1;
	}
	//if day is 31 but month is feb/apr/jun/sep/nov
	else if((dayOfMonth==31)&&((month==1)||(month==3)||(month==5)||(month==8)||(month==10))){
        return -1;
	//if day is 30  but month is feb
    } else if ((dayOfMonth == 30) && (month == 1)) {
        return -1;
	//if day is 29 and month is feb then check for leap year
    } else if ((dayOfMonth == 29) && (month == 1)) {
        var leap = year % 4;
		//if the year is not leap year
        if (leap != 0) {
            return -1;
        } else {
            return dayOfMonth;
        }
    } else return dayOfMonth;
}
function fnform26AS(){document.FormTwentySixASFG.target="_blank";document.FormTwentySixASFG.action="https://onlineservices.tin.nsdl.com/TIN/LoginSubmit.do";}
