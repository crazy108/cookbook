var displayData = [];
document.onLoad = main();
var hideIndex = 6;

function formatVal(val, format) {
	if( !format ) return val;
	switch ( format ) {
		case "sign" : 
			return val > 0 ? "+" + val : val ;
			break;
		case "aztext" : 
			return val.toLowerCase().replace(/[^a-z]/g, "");
			break;
		case "d2pr" : // "percents" 0.54321 > 54.32%
			return Math.round(val*10000)/100 + "%";
			break;
		case "d2pp" : // "plain percents" 0.54321 > 54.3
			return Math.round(val*1000)/10;
			break;
		case "d2sd" :
			return Math.round(val*100)/100;
			break;
		case "d2fd" :
			var res = Math.round(val*10)/10;
			if( res-Math.round(res) === 0) res += ".0";
			return res + " ";
			break;
		case "h2hm" :
			var hrs = (val/60 < 10 ? "0" : "") + Math.floor(val/60);
			var mns = (val%60 < 10 ? "0" : "") + Math.round(val%60);
			return hrs + ":" + mns;
			break;
		default :
			return val;
	}	
}

function azContains(a, b){
	return formatVal(a, "aztext").indexOf( formatVal(b, "aztext") ) !== -1;
}

function eventShortName(key) {
	var result = null;
	for( var k1 in evSName ) {
		if( key == k1 ) {
			result = evSName[key];
			break;
		}
	}
	return result;
}

function eventColor(key) {
	var result = "silver";
	for( var k1 in evColor ) {
		if( key == k1 ) {
			result = evColor[key];
			break;
		}
	}
	return result;
}

function sumFEP(objFEP) {
	var result = 0;
	for(var k in objFEP) {
		result += objFEP[k];
	}
	return result;
}

function calcP(objFEP, targetFEP) {
	var maxF = targetFEP;
	var maxV = 0;
	var totalV = 0;

	if (maxF == "") {  //search for max fep when attribute is undefined
		for(var k in objFEP) {
			if (objFEP[k] > maxV) {
					maxF = k.slice(0, 3);
					maxV = objFEP[k];
			}
		}
	}

	//sum points of +1 and +2 events
	for(var k in objFEP) {
		if (k.indexOf(maxF) !== -1) {
				totalV += objFEP[k];
		}
	}
	return totalV/sumFEP(objFEP);
}

function parseFEP(objFEP) {
	var result = document.createElement("div");
	result.className = "fep-list";
	for( var k1 in objFEP ) {
		var spnEn = document.createElement("span");
		spnEn.className = "fep-name";
		spnEn.innerHTML = eventShortName(k1) + " ";

		var spnEv = document.createElement("span");
		spnEv.className = "fep-value";
		spnEv.innerHTML = formatVal(objFEP[k1], "d2fd");

		var dvE = document.createElement("div");
		dvE.classList.add("fep-single");
		dvE.appendChild(spnEn);
		dvE.appendChild(spnEv);
		dvE.classList.add(k1);
		result.appendChild(dvE);
	}
	return result;
}

function parseIng(arrIng) {
	var result = document.createElement("div");
	result.className = "ing-list";
	for( var k1 = 0; k1 < arrIng.length; k1++) {

		var tnIng = document.createTextNode(arrIng[k1] + (k1 < arrIng.length-1 ? ", " : "") );

		var dvI = document.createElement("div");
		dvI.classList.add(formatVal(arrIng[k1], "aztext"));
		dvI.classList.add("ing-single");
		dvI.appendChild(tnIng);
		result.appendChild(dvI);
		/*
		if(  k1 < arrIng.length-1 ) {
			var spr = document.createTextNode(", ");
			dvI.appendChild(spr);
		}
		*/
	}
	return result;
}

function resetSorted() {
	var headers = document.getElementById('data-headers');
	var headrow = headers.getElementsByTagName("div");
	for( var i = 0; i < headrow.length; i++) {
		headrow[i].className = headrow[i].className.replace("sorttable_sorted_reverse", "").replace("sorttable_sorted", "");
	}
}

function filterData(array) {
	// var hideIndex = array[0].length-1;
	var filterFood	= document.getElementById("filterFood").value;
	var filterIng	= document.getElementById("filterIng").value;
	var filterFEP	= document.getElementById("filterFEP").value;
	var filterChanceMin	= document.getElementById("filterChanceMin").value;
	var filterChanceMax	= document.getElementById("filterChanceMax").value;

	if( !isNaN(parseFloat(filterChanceMin)) ) {
		var fFilterChanceMin = parseFloat(filterChanceMin);
	}
	if( !isNaN(parseFloat(filterChanceMax)) ) {
		var fFilterChanceMax = parseFloat(filterChanceMax);
	}

	var enableFEPSearch = false;
	var eMax = "";
	if( filterFEP.lastIndexOf(" ") !== -1 )
	{
		var filterFEPAtr = filterFEP.slice(0, filterFEP.lastIndexOf(" "));
		var filterFEPMod = parseFloat(filterFEP.slice(filterFEP.lastIndexOf(" ")));
		if( filterFEPAtr.length > 2 && !isNaN(filterFEPMod) ) {
			filterFEPAtr = trimFE(filterFEPAtr);
			enableFEPSearch = true;
			eMax = filterFEPAtr.slice(0, 3);
		}
	}

	for( var i = 0; i < array.length; i++) {
		array[i][hideIndex] = false; //unhide every single row
		
		//filter by name
		if( filterFood.length > 0 ) {
			var itemName = array[i][0];
			if( !azContains(itemName, filterFood) ) {
				array[i][hideIndex] = true;
				continue;
			}
		}

		//filter by ing
		if( filterIng.length > 0 ) {
			var itemIngArray = array[i][1];
			var noIngFound = true;
			for( var j = 0; j < itemIngArray.length; j++) {
				if( azContains(itemIngArray[j], filterIng) ) {
					noIngFound = false;
					break;
				}
			}
			if( noIngFound ){
				array[i][hideIndex] = true;
				continue;
			}
		}

		//filter by FEP
		if( enableFEPSearch ) {
			var itemFEPObject = array[i][2];
			var noFEPFound = true;
			for(var j in itemFEPObject)
			{
				if( j.indexOf(filterFEPAtr) !== -1 ) {
					if( filterFEPMod <= itemFEPObject[j] ) { 
						noFEPFound = false;
						break;
					}
				}
			}

			if( noFEPFound ) {
				array[i][hideIndex] = true;
			}
		}

		//filter by chance
		var itemChance = calcP(array[i][2], eMax);
		if( ((fFilterChanceMin != undefined) && (itemChance < fFilterChanceMin/100)) 
			|| ((fFilterChanceMax != undefined) && (itemChance > fFilterChanceMax/100)) ) {
			array[i][hideIndex] = true;	
		}
	}
}

function trimFE(input) {
	return result = input.toLowerCase().replace(/\ /g, "").replace(/\+/g, "");
}

function resetFields() {
	var filters = document.getElementById("filters").childNodes;
	for(var i = 0; i < filters.length; i++)
		if( filters[i].nodeName = "#text" ) filters[i].value = "";
	refreshView();
}

function renderTable(array) {
	var tbody = table.getElementsByTagName("tbody")[0];
	while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
	var renderedRowCount = 0;

	var eMax = "";
	var filterFEP	= document.getElementById("filterFEP").value;
	var filterFEPAtr = filterFEP.slice(0, filterFEP.indexOf(" "));
	if( filterFEPAtr.length == 3 ) {
		eMax = filterFEPAtr;
	}

	for( var i = 0; i < array.length; i++) {
		if( array[i][hideIndex] == true ) continue;
		var row = document.createElement("tr");
		var cells = [];

		for( var j = 0; j <= 6; j++) {
			cells[j] = document.createElement("td");
		}
		var totalFEPs = sumFEP(array[i][2]);
		cells[0].innerHTML = array[i][0];
		cells[1].appendChild(parseIng(array[i][1]));
		cells[2].appendChild(parseFEP(array[i][2]));
		for( var j = 0; j < cells.length; j++) {
			row.appendChild(cells[j]);
		}
		cells[3].innerHTML = array[i][4] == 0 ? "???" : formatVal(totalFEPs, "d2fd");
		cells[4].innerHTML = array[i][4];
		cells[5].innerHTML = array[i][4] == 0 ? "???" : formatVal(totalFEPs / array[i][4], "d2fd");


		cells[6].innerHTML = formatVal(calcP(array[i][2], eMax), "d2pp");

		var divHdrChance = document.getElementById("hdr-chance");
		var divHdrChanceSub = document.createElement("span");
		divHdrChanceSub.innerHTML = "" + (eMax == "" ? "max" : eMax) + "";
		divHdrChanceSub.classList.add("sublabel");
		divHdrChance.innerHTML = "%";
		divHdrChance.appendChild(divHdrChanceSub);
		// row.addE	ventListener("mouseover", highlight);
		row.id = i;
		tbody.appendChild(row);
		renderedRowCount++;
		if ( renderedRowCount>=opts["limit"] ) break;
	}
}

function refreshView() {
	resetSorted();
	filterData(displayData);
	renderTable(displayData);
}

function applyTheme() {
	if( opts.debug ) {
		var debugStyle = document.createElement("link");
		debugStyle.rel = "stylesheet";
		debugStyle.href = "debug.css";
		document.head.appendChild(debugStyle);
	}

	if( !opts.textmode ) {
		var iconStyle = document.createElement("link");
		iconStyle.rel = "stylesheet";
		iconStyle.href = "gfx/ingredient.css";
		document.head.appendChild(iconStyle);
	}

	var themeStyle = document.createElement("link");
	themeStyle.rel = "stylesheet";
	themeStyle.href = "theme_" + opts.theme + ".css";
	document.head.appendChild(themeStyle);
}

function processQuery() {
	var querystring = window.location.href.split("?")[1];
	if( !querystring ) return;
	if( querystring.length == 0 ) return;

	var optionlist = {};
	var pairs = querystring.split("&");
	for( var i = 0; i < pairs.length; i++) optionlist[pairs[i].split("=")[0]] = pairs[i].split("=")[1];

	if( optionlist.debug == "true" ) {
		opts.debug = true;
	} else {
		opts.debug = false;
	}

	if( optionlist.textmode == "true" ) {
		opts.textmode = true;
	} else {
		opts.textmode = false;
	}

	if( optionlist.theme == "dark" ) opts.theme = "dark";   

	if( optionlist.limit ) {
		var limitNum = parseInt(optionlist.limit);
		if (!isNaN(limitNum)) opts.limit = limitNum;
	} 
}

function addDropdownToInput(inputField, list) {
	var currentWidth = inputField.clientWidth;
	var fieldParent = inputField.parentNode;
	
	//adding dropdown button before target input
	var divReferenceButton = document.createElement("div");
	divReferenceButton.className = "dropdownButton";
	divReferenceButton.innerHTML = "+";
	inputField.style.width = currentWidth - 20 + "px";
	inputField.style.paddingLeft = 20 + "px";
	divReferenceButton.addEventListener("click", function () {toggleList(divReferenceList, divReferenceButton);} );
	fieldParent.insertBefore(divReferenceButton, inputField);

	//adding dropdown list to target input
	var divReferenceList = document.createElement("div");
	divReferenceList.div = "listReference";
	divReferenceList.className = "dropdownList";
	divReferenceList.style.display = "none";

	var listsize = 0;
	for( var i in list ) {
		var line = document.createElement("div");
		var text = document.createTextNode(i);
		line.appendChild(text);
		line.addEventListener("click", function() {
			inputField.value = this.innerHTML + " ";
			toggleList(divReferenceList, divReferenceButton);
			inputField.focus();
		})
		divReferenceList.appendChild(line);
		listsize += 1;
	}

	divReferenceList.style.height = listsize*17 + "px";
	fieldParent.insertBefore(divReferenceList, divReferenceButton);
}

function toggleList(list, button) {
	if( list.style.display == "block" ) {
		button.innerHTML = "+";
		list.style.display = "none";
	}
	else {
		list.style.display = "block";
		button.innerHTML = "-";
	}
	return;
}

function main() {
	processQuery();
	applyTheme();
	window.addEventListener("keydown", function(event) {
		if (event)
			switch (event.keyCode) {
				case 27 : //ESC
					event.preventDefault();
					resetFields();
					break;
				case 13 : //Enter
					event.preventDefault();
					refreshView();
					break;
				default : return;
			}
		});
	document.getElementById("btnReset").addEventListener("click", resetFields);
	document.getElementById("btnSearch").addEventListener("click", refreshView);
	addDropdownToInput(document.getElementById("filterFEP"), evBaseName);
	loadDataFromTables();
	refreshView();
}

function loadDataFromTables() { //displayData generation
	for( var food_index = 0; food_index < gl_food.length; food_index++) {
		if( gl_food[food_index][1].length > 0 ) {
			for (var j = 0; j < gl_fepmod.length; j++) {
				if ( gl_fepmod[j][0] == gl_food[food_index][0] ) {
					displayData.push([gl_fepmod[j][0], gl_fepmod[j][1], gl_fepmod[j][2], gl_food[food_index][3], gl_food[food_index][4], false]);
				}
			}
		} else {
			displayData.push([gl_food[food_index][0], gl_food[food_index][1], gl_food[food_index][2], gl_food[food_index][3], gl_food[food_index][4], false]);
		}
	}
}