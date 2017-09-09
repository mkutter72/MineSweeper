'use strict';

var gridSizeRow = 6;
var gridSizeCol = 6;
var numMines = 6;
var numMinesToFind = 6;
var board = [];
var playTracker = [];


var rowmoves = [0,  -1, -1, -1,  0, +1, +1, +1];
var colmoves = [-1, -1,  0, +1, +1, +1,  0, -1];

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function countNearByMines(rindex, cindex) {
  var cnt = 0;
  for (var x=0; x<8; x++) {
    var nrindex = rindex + rowmoves[x];
    var ncindex = cindex + colmoves[x];
    if (nrindex >= 0 && nrindex < gridSizeRow && ncindex >= 0 && ncindex < gridSizeCol) {
      if (board[nrindex][ncindex] === "M")
        ++cnt;
    }
  }
  return cnt;
}

function showAllMines(){
  for (var r=0; r<gridSizeRow; r++)
    for (var c=0; c<gridSizeCol; c++)
      if (board[r][c] === "M") {
            var jqStr = '#C-'+r+"-"+c;
            $(jqStr).css("background-image", "url(Mine.png)");
      }
}



function setBoard(row,col,value){
    var jqStr = '#C-'+row+"-"+col;
    var colors = ['blue', 'green', 'red', 'orange', 'purple','yellow', 'blue', 'green'];

    if (playTracker[row][col] !== null) {
      if (!(playTracker[row][col] === "Flag" && value==="Clear"))
        return;
    }

    if (isNaN(value)) {
      if (value === "Flag") {
        playTracker[row][col] = "Flag";
         $(jqStr).css("background-image", "url(Flag.png)");
      } else
      if (value === "Clear") {
          playTracker[row][col] = null;
          $(jqStr).css("background-color", "white");
          $(jqStr).css('background-image', 'none');
          $(jqStr).text("");
      }
    } else {
      playTracker[row][col] = value;
      if (value === 0)
        $(jqStr).css("background-color", "#ccebff");
      else {
        $(jqStr).css("color", colors[value-1]);
        $(jqStr).text(value);
      }
    }



}

function displayBoard() {
  for (var r=0; r<gridSizeRow; r++)
    for (var c=0; c<gridSizeCol; c++)
      if (board[r][c] !== 0)
        setBoard(r,c,board[r][c]);
}

function clearBoard() {
  for (var r=0; r<gridSizeRow; r++)
    for (var c=0; c<gridSizeCol; c++)
        setBoard(r,c,"Clear");
}

function createScreenBoard(boardId){
    $(boardId).html("");
    for (var row = 0; row < gridSizeRow; row++) {
    for (var col = 0; col < gridSizeCol; col++) {
      var outstr = "<div id=\"C-" + row  + "-" + col;
      if (col === 0 && row !== 0)
        outstr += "\" class = \"square newrow\"></div>";
      else
        outstr += "\" class = \"square\"></div>"

      $(boardId).append(outstr);
      }
    }
}

function revealAnyFilled(rindex,cindex){
  for (var x=0; x<8; x++) {
    var nrindex = rindex + rowmoves[x];
    var ncindex = cindex + colmoves[x];
    if (nrindex >= 0 && nrindex < gridSizeRow && ncindex >= 0 && ncindex < gridSizeCol) {
      if (board[nrindex][ncindex] !== 0)
        setBoard(nrindex,ncindex,board[nrindex][ncindex]);
    }
  }
}

function markEmptyAndLookForMore(row,col) {
    setBoard(row,col,0);
    for (var x=0; x<8; x++) {
      var nrindex = row + rowmoves[x];
      var ncindex = col + colmoves[x];
      if (nrindex >= 0 && nrindex < gridSizeRow && ncindex >= 0 && ncindex < gridSizeCol) {
        if (board[nrindex][ncindex] === 0) {
          board[nrindex][ncindex] = "-";
          revealAnyFilled(nrindex,ncindex)
          markEmptyAndLookForMore(nrindex,ncindex);
        }
      }
    }
}

function checkForWin()
{
  var mineCount = 0;
  var allSpacesFilled = true;
  for (var z=0; z<gridSizeRow; z++)
    for (var y=0; y<gridSizeCol; y++)
      if (playTracker[z][y] === null) {
        return false;
      }
      else
        if (playTracker[z][y] === "Flag")
          ++mineCount;

  if (mineCount === numMines)
     return true;
  else
     return false;
}

$(document).ready(function () {
 var ttime;
 var mtime;
 var touchcnt=0;
 var proccessTouchEnd = false;

 var liClickHandler = function liClick(event) {
    var idStr = event.target.id;

    if (idStr[0] === 'C') {
      var row = parseInt(idStr.split("-")[1]);
      var col = parseInt(idStr.split("-")[2]);

      if (board[row][col] === 'M' && playTracker[row][col] === null) {
        setBoard(row,col,'M');
        header.innerHTML = "Oh No!"
        body.innerHTML = "Game Over, you exploded a mine!! Click NewGame to Play again";
        modal.style.display = "block";
        showAllMines();
        turnOffEvents();
      } else if (board[row][col] !== 0)
        setBoard(row,col,board[row][col]);
      else {
        revealAnyFilled(row,col);
        markEmptyAndLookForMore(row,col);
      }
    }
  };

  var handleMineClick = function (event) {
    var idStr = event.target.id;

    if (idStr[0] === 'C') {
      var row = parseInt(idStr.split("-")[1]);
      var col = parseInt(idStr.split("-")[2]);

      var jqStr = '#C'+row+col;

      if(playTracker[row][col] === "Flag") {
        setBoard(row,col,"Clear");
        $("#mineCount").text(++numMinesToFind);
      }
      else {
        if (playTracker[row][col] === null)  {
          setBoard(row,col,"Flag");
          $("#mineCount").text(--numMinesToFind);
        }
      }
    }
  };


  var mouseDownHandler = function (){
    var d = new Date();
    mtime = d.getTime();
    //console.log("mouseDownHandler "+touchcnt++);
  }

 var mouseUpHandler = function (e){
  //  console.log("mouseUpHandler"+touchcnt++);
    var d = new Date();

    if (d.getTime()-mtime < 300)
      liClickHandler(e);
    else
      handleMineClick(e);

    if (checkForWin()) {
      header.innerHTML = "Congratulations!"
      body.innerHTML = "You found all the mines and won the game";
      modal.style.display = "block";
      showAllMines();
      turnOffEvents();
    }
  }

 var touchStartHandler = function (e){
    var d = new Date();
    ttime = d.getTime();
    proccessTouchEnd = true;
  //  console.log("touchStartHandler "+touchcnt++);
  }

 var touchMoveHandler = function (e){
    proccessTouchEnd = false;
   // console.log("touchMoveHandler ");
  }


 var touchEndHandler = function (e){
    e.preventDefault();

    var d = new Date();
    console.log("touchEndHandler "+touchcnt++);

    if (proccessTouchEnd) {
      proccessTouchEnd = false;
      if (d.getTime()-ttime < 300)
        liClickHandler(e);
      else
        handleMineClick(e);

      if (checkForWin()) {
        alert("Congratulations!  You won the game");
        showAllMines();
        turnOffEvents();
      }
    }
  }

  $("#newGame").on('click', function (e){
    newGame();
  });




  var turnOnEvents = function turnOnEvents(){
    $('.square').on('mousedown',mouseDownHandler);
    $('.square').on('mouseup',mouseUpHandler);
    document.getElementById('boardList').ontouchstart = function (e) {touchStartHandler(e)};
    document.getElementById('boardList').ontouchend = function (e) {touchEndHandler(e)};
    document.getElementById('boardList').ontouchmove = function (e) {touchMoveHandler(e)};
    }



  var turnOffEvents = function () {
    $('.square').off('mousedown',mouseDownHandler);
    $('.square').off('mouseup',mouseUpHandler);
    document.getElementById('boardList').removeEventListener("ontouchstart", touchStartHandler);
    document.getElementById('boardList').removeEventListener("ontouchend", touchStartHandler);
    document.getElementById('boardList').removeEventListener("ontouchmove", touchMoveHandler);
  }

  var showBoard = function () {
    for (var cnt=0; cnt < gridSizeRow; cnt++)
      console.log(board[cnt]);
  };

  var setMines = function () {
    var cnt = numMines;
    while (cnt > 0) {
      var row = getRandomIntInclusive(0, gridSizeRow-1);
      var col = getRandomIntInclusive(0, gridSizeCol-1);
      if (board[row][col] !== "M") {
        board[row][col] = "M";
        cnt--;
      };
    };
  };


  createScreenBoard("#boardList");


 for (var cnt=0; cnt < gridSizeRow; cnt++) {
    board[cnt] = new Array(gridSizeCol).fill(null);
    playTracker[cnt] =new Array(gridSizeCol).fill(null);
 }

  var newGame = function () {
    for (var cnt=0; cnt < gridSizeRow; cnt++) {
      board[cnt].fill(null);
      playTracker[cnt].fill(null);
    }

   clearBoard();
    setMines();

    numMinesToFind = numMines;
    $("#mineCount").text(numMinesToFind);


    for (var r=0; r<gridSizeRow; r++)
      for (var c=0; c<gridSizeCol; c++)
        if (board[r][c] === null)
         board[r][c] = countNearByMines(r,c);

      showBoard(board);
      turnOffEvents();
      turnOnEvents();
  }



  newGame()
  $(".Main").show('slow');



// Get the modal
var modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
var span = document.getElementById("closeButton");

var body = document.getElementById("messageText");

var header =  document.getElementById("headerText");

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

 var createNewBoardSize = function () {
    for (var cnt=0; cnt < gridSizeRow; cnt++) {
      board[cnt] = new Array(gridSizeCol).fill(null);
      playTracker[cnt] =new Array(gridSizeCol).fill(null);
      }

    $("#mineCount").text(numMinesToFind);
    createScreenBoard("#boardList");
    newGame();
  };

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */

 $("#selection1").on('click', function (e){
    $("#dropDownText").text("9 x 9");
    gridSizeRow = gridSizeCol = 9;
    numMinesToFind = numMines = 10;
    createNewBoardSize();
  });

  $("#selection2").on('click', function (e){
    $("#dropDownText").text("16 x 16");
    gridSizeRow = gridSizeCol = 16;
    numMinesToFind = numMines = 35;
    createNewBoardSize();
  });

   $("#selection3").on('click', function (e){
    $("#dropDownText").text("30 x 16");
    gridSizeRow =  30;
    gridSizeCol = 16;
    numMinesToFind = numMines = 99;
    createNewBoardSize();
  });

 $("#dropDownText").on('click', function (e){
    document.getElementById("myDropdown").classList.toggle("show");
  });

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}





});


