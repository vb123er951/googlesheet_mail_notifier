function sendEmail(message){
  console.log("sendEmail: " + message);
  MailApp.sendEmail({to: '<mail address>', subject: "新滋味練球比賽出席 was edited recently", htmlBody: message, noReply: true} );
}

function myEdit(e){
  var sheet_name = SpreadsheetApp.getActiveSheet().getName();
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var col = e.range.getColumn();
  var a1 = e.range.getA1Notation();
  var cur_range = sheet.getRange(1, 1, row, col);
  var line_head = cur_range.getCell(row, 1).getValue();
  var date = cur_range.getCell(1, col).getValue();
  var cell = cur_range.getCell(row, col).getValue();
  var number_people = cur_range.getCell(5, col).getValue();
  var m = '';
  var d = '';
  if (date) {
    m = date.getMonth()+1
    d = date.getDate();
  } else {
    m = a1;
    d = a1;
  }
  var message = sheet_name + " - " + m + "/" + d + " has change content: " + line_head + ", " + cell;
  if (typeof cell === 'boolean'){ // don't send email if the change is money checking
    console.log("money check");
  } else {
    if (cell.length == 0) {
      message = message + "<br> change to empty";
    }
    message += "<br> 人數: " + number_people;
    console.log(message);
    if (sheet_name.includes("練球")){ // only send email if specific sheet changed
      sendEmail(message);
    }
    stand_in_line(line_head, m, d, cell);
  }
}

function nothing(){
  ;
}

function test(){
  var sheet_name = SpreadsheetApp.getActiveSheet().getName();
  console.log(sheet_name);
  if (sheet_name.includes("練球")){
    console.log(1);
  }
}

function stand_in_line(name, m, d, value){
  /* test data
  var name = "Lisa"; var m = "7"; var d = "15"; var value = "O";
  */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log(m+"-in-line");
  var sheet = ss.getSheetByName(m+"-in-line");
  if (sheet == null) {
    console.log('sheet' + m + '-in-line not found');
    return;
  }
  var cur_range = sheet.getDataRange();
  var data = cur_range.getValues();
  var cur_col = -1;
  var col_data = [];
  var date_is_found = false;
  // find current date
  for (var i = 0 ; i < data[0].length ; i++) {
    m_ = data[0][i].getMonth()+1;
    d_ = data[0][i].getDate();
    if ((m_ == m) && (d_ == d)) {
      console.log("this date: " + m + "/" + d);
      date_is_found = true;
      cur_col = i+1;
      for (var j = 1 ; j < data.length ; j++) {
        /* if any column has data, other empty column will be '', also count as 1 row */
        if (data[j][i].length > 0){
          col_data.push(data[j][i]);
        }
      }
      console.log("last data position: " + col_data.length + "," + cur_col);
      break;
    }
  }
  if (!date_is_found){
    return;
  }
  
  // in-line logic
  var row_offset = 2;
  var row_id = col_data.indexOf(name);  // find name in the list
  if (row_id == -1) {
    row_id = col_data.indexOf("(" + name + ")");  // find (name) in the list
  }
  var l = col_data.length;
  //console.log(l, col_data);
  console.log("find " + name + " at: " + row_id);
  if (value == "O") {
    if (row_id != -1) {
      col_data.splice(row_id, 1, name);
    } else {
      col_data.push(name);
    }
  } else if (value == "X") {
    if (row_id != -1) {
      col_data.splice(row_id, 1);
    }
  } else if (value == "△") {
    if (row_id != -1) {
      col_data.splice(row_id, 1, "(" + name + ")");
    }
  } else {
    console.log("empty fill value");
  }
  console.log("after: " + col_data);
  
  // re-fill column
  var new_data = [];
  for (var i = 0 ; i < col_data.length ; i++) {
    new_data[i] = [col_data[i]];
  }
  if (l > 0){
    var cls_range = sheet.getRange(row_offset, cur_col, l);
    cls_range.clear();
  }
  if (new_data.length > 0){
    var fill_range = sheet.getRange(row_offset, cur_col, new_data.length);
    fill_range.setValues(new_data);
  }
}
