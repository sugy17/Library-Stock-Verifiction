var tid=null;
function mySubmit(){
	var rack_inp=document.getElementById("rackID");
	var	book_inp=document.getElementById("bookID");
	if(tid!== null) clearTimeout(tid);
	if(rack_inp.value.length == 0 ){
		alert("PLEASE FILL RACK NUMBER!!!");
		book_inp.value="";
		rack_inp.focus();
		return;
	}
	else if(book_inp.value.length != 0 )
		tid=setTimeout(function() {
			document.getElementById("success_msg").style.display="none";
			document.getElementById("danger_msg").style.display="none";
			book_inp.oninput=null;
			book_inp.blur();
			sendData(book_inp,rack_inp);
			//document.getElementById("js_submit").submit();
		},600);
}


function sendData(book_inp,rack_inp) {
	var bookID=book_inp.value;
	var rackID=rack_inp.value;
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var data = JSON.parse(this.responseText);
			for(var i in data) {
				try{
					//alert_div.style.display="none";
					var alert_div = document.getElementById(i);
					if(i=="danger_msg")
						alert("STOP!!"+data[i]);
					else{
						alert_div.innerHTML=data[i];
						alert_div.style.display="";
					}
				}catch(err){
					alert("STOP!! something went wrong for book ID "+book_inp.value);
					alert_div = document.getElementById("danger_msg");
					alert_div.innerHTML="Ops something went wrong.";
				}
			}
			book_inp.value="";
			book_inp.focus();
			book_inp.value="";
			book_inp.oninput=mySubmit;
		}
	};
	xhttp.open("GET", "/user/publisher/check?bookID="+bookID+"&rackID="+rackID, true);
	xhttp.send();
}

document.onkeydown = function (e) {
    e = e || window.event;
    // use e.keyCode
    if (e.keyCode== 13 || e.keyCode == 40 || document.querySelector(":focus")==null)
    	document.getElementById("bookID").focus();
    else if (e.keyCode== 38)
    	document.getElementById("rackID").focus();
};


/*$(document).scannerDetection({
  //https://github.com/kabachello/jQuery-Scanner-Detection
	timeBeforeScanTest: 200, // wait for the next character for upto 200ms
	avgTimeByChar: 40, // it's not a barcode if a character takes longer than 100ms
	preventDefault: true,
	endChar: [1],
		onComplete: function(barcode, qty){
   validScan = true;
    	$('#bookID').val (barcode);
    } // main callback function	,
	,
	onError: function(string, qty) {
	$('#rackID').val ($('#rackID').val()  + string);
	}
});*/

