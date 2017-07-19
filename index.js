'use strict';

var gridSize = 9;
var numMines = 10;
var board = [];
var playTracker = [];
var mineCount = 0;

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
    if (nrindex >= 0 && nrindex < gridSize && ncindex >= 0 && ncindex < gridSize) {
      if (board[nrindex][ncindex] === "M")
        ++cnt;
    }
  }
  return cnt;
}


function setBoard(row,col,value){
    var jqStr = '#C'+row+col;

    if (value === '-')
       $(jqStr).css("background-color", "#ccebff");
     else
      $(jqStr).text(value);

    if (value === "") {
      playTracker[row][col] = false;
      $(jqStr).css("background-color", "white");
    }
    else
      playTracker[row][col] = true;
}

function displayBoard() {
  for (var r=0; r<gridSize; r++)
    for (var c=0; c<gridSize; c++)
      if (board[r][c] !== 0)
        setBoard(r,c,board[r][c]);
}

function clearBoard() {
  for (var r=0; r<gridSize; r++)
    for (var c=0; c<gridSize; c++)
        setBoard(r,c,"");
}

function createScreenBoard(boardId){
    for (var row = 0; row < gridSize; row++) {
    for (var col = 0; col < gridSize; col++) {
      var outstr = "<div id=\"C" + row + col;
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
    if (nrindex >= 0 && nrindex < gridSize && ncindex >= 0 && ncindex < gridSize) {
      if (board[nrindex][ncindex] !== 0)
        setBoard(nrindex,ncindex,board[nrindex][ncindex]);
    }
  }
}

function markEmptyAndLookForMore(row,col) {
    setBoard(row,col,"-");
    for (var x=0; x<8; x++) {
      var nrindex = row + rowmoves[x];
      var ncindex = col + colmoves[x];
      if (nrindex >= 0 && nrindex < gridSize && ncindex >= 0 && ncindex < gridSize) {
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
  for (var z=0; z<gridSize; z++)
    for (var y=0; y<gridSize; y++)
      if (playTracker[z][y] === false)
        return false;

  if (mineCount === numMines)
     return true;
  else
     return false;
}

$(document).ready(function () {

 var liClickHandler = function liClick(event) {
    var idStr = event.target.id;

    if (idStr[0] === 'C') {
      var row = parseInt(idStr[1]);
      var col = parseInt(idStr[2]);

      if (board[row][col] === 'M') {
        setBoard(row,col,'M');
        alert("Game Over, you exploded a mine!! Click NewGame to Play again");
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
      var row = parseInt(idStr[1]);
      var col = parseInt(idStr[2]);

      var jqStr = '#C'+row+col;

      if($(jqStr).text() === 'X') {
        setBoard(row,col,"");
        --mineCount;
        console.log(mineCount);
      }
      else {
        if ($(jqStr).text() === "")  {
          setBoard(row,col,"X");
          ++mineCount;
             console.log(mineCount);
        }
      }
    }
  };


  var mtime;
  var mouseDownHandler = function (){
    var d = new Date();
    mtime = d.getTime();
    console.log("mouseDownHandler "+touchcnt++);
  }

 var ttime;
 var touchcnt=0;
 var touchStartHandler = function (e){
    var d = new Date();
    ttime = d.getTime();
    console.log("touchStartHandler "+touchcnt++);
  }

 var mouseUpHandler = function (e){
    console.log("mouseUpHandler"+touchcnt++);
    var d = new Date();

    if (d.getTime()-mtime < 300)
      liClickHandler(e);
    else
      handleMineClick(e);

    if (checkForWin()) {
      alert("Congratulations!  You won the game");
      turnOffEvents();
    }
  }

 var touchEndHandler = function (e){
    e.preventDefault();

    var d = new Date();
    console.log("touchEndHandler "+touchcnt++);

    if (d.getTime()-ttime < 300)
      liClickHandler(e);
    else
      handleMineClick(e);

    if (checkForWin()) {
      alert("Congratulations!  You won the game");
      turnOffEvents();
    }
  }

  $("#newGame").on('click', function (e){
    console.log("Got here");
    clearBoard();
    newGame();

  });




  var turnOnEvents = function turnOnEvents(){
    $('.square').on('mousedown',mouseDownHandler);
    $('.square').on('mouseup',mouseUpHandler);
    document.getElementById('boardList').ontouchstart = function (e) {touchStartHandler(e)};
    document.getElementById('boardList').ontouchend = function (e) {touchEndHandler(e)};
    }


  var turnOffEvents = function () {
    $('.square').off('mousedown',mouseDownHandler);
    $('.square').off('mouseup',mouseUpHandler);
    document.getElementById('boardList').removeEventListener("ontouchstart", touchStartHandler);
    document.getElementById('boardList').removeEventListener("ontouchend", touchStartHandler);
  }

  var showBoard = function () {
    for (var cnt=0; cnt < gridSize; cnt++)
      console.log(board[cnt]);
  };

  var setMines = function () {
    var cnt = numMines;
    while (cnt > 0) {
      var row = getRandomIntInclusive(0, gridSize-1);
      var col = getRandomIntInclusive(0, gridSize-1);
      if (board[row][col] !== "M") {
        board[row][col] = "M";
        cnt--;
      };
    };
  };


  createScreenBoard("#boardList");


 for (var cnt=0; cnt < gridSize; cnt++) {
    board[cnt] = new Array(gridSize).fill(null);
    playTracker[cnt] =new Array(gridSize).fill(false);
 }

  var newGame = function () {
    for (var cnt=0; cnt < gridSize; cnt++) {
      board[cnt].fill(null);
      playTracker[cnt].fill(false);
    }

  setMines();


    for (var r=0; r<gridSize; r++)
      for (var c=0; c<gridSize; c++)
        if (board[r][c] === null)
         board[r][c] = countNearByMines(r,c);

    showBoard(board);
    turnOffEvents();
    turnOnEvents();
    mineCount=0;
  }



  newGame()
  $(".Main").show('slow');



});


