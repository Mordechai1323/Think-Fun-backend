exports.ticTacToeHelp = (board, sign) => {
  AImove(board, sign.toUpperCase());

  var winList = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let checkIfWin = (board, sign) => {
    const isWin = winList.some((winCombination) => {
      return winCombination.every((index) => {
        return board[index] === sign;
      });
    });
    if (isWin) return true;
    if (!board.includes(' ')) return 'tie';
    return false;
  };

  let countSign = (board, sign) => {
    return board.filter((board) => board === sign).length;
  };

  function checkEachOption(board, sign) {
    let res;
    winList.forEach((winCombination) => {
      let temp = winCombination.filter((index) => board[index] === sign);
      if (res === undefined && temp.length === 2) {
        res = checkIfEmptyPlace(board, winCombination);
      }
    });
    return res;
  }

  function checkIfEmptyPlace(board, options) {
    let res;
    options.forEach((i) => {
      if (board[i] === ' ') {
        // why not options[i]
        res = i;
      }
    });
    return res;
  }

  function AImove(board, sign) {
    return manualMoves4FirstTurn(board, sign) ?? buildGameTree(board, sign);
  }

  function manualMoves4FirstTurn(board, sign) {
    if (countSign(board, sign) === 0) {
      if (board[4] === ' ') {
        return 4;
      }
      return [0, 2, 6, 8][Math.floor(Math.random() * 4)];
    }
  }

  function buildGameTree(board, sign) {
    /* Checking all the possible moves and assigning a score to each move. */
    let avialbleOptions = {};
    for (let place = 0; place < 9; place++) {
      let tempArr = [...board];
      if (board[place] === ' ') {
        tempArr[place] = sign;
        avialbleOptions[place] = checkBranch(tempArr, sign === 'O' ? 'X' : 'O');
      }
    }
    /* Choosing the best move. */
    let max = Math.max(...Object.values(avialbleOptions));
    let chooseRandom = Object.keys(avialbleOptions).filter((key) => {
      return avialbleOptions[key] === max;
    });
    return chooseRandom[Math.floor(Math.random() * chooseRandom.length)] * 1;
  }

  function checkBranch(board, sign) {
    let res = checkIfWin(board, sign === 'X' ? 'O' : 'X');
    if (res) {
      if (res === 'tie') {
        return 0;
      }
      return sign === 'O' ? -1 : 1;
    }

    /* Checking if there is a winning move for the AI or the player. If there is, it returns the score
        of that move. */
    let goodOption, tempArr;
    if (sign === 'X') {
      goodOption = checkEachOption(board, 'X') ?? checkEachOption(board, 'O');
    } else {
      goodOption = checkEachOption(board, 'O') ?? checkEachOption(board, 'X');
    }
    if (goodOption) {
      tempArr = [...board];
      tempArr[goodOption] = sign;
      return checkBranch(tempArr, sign === 'X' ? 'O' : 'X');
    }

    /* Checking all the possible moves and assigning a score to each move. */
    let avialbleOptions = {};
    for (let place = 0; place < 9; place++) {
      tempArr = [...board];
      if (board[place] === ' ') {
        tempArr[place] = sign;
        avialbleOptions[place] = checkBranch(tempArr, sign === 'X' ? 'O' : 'X');
      }
    }

    return sign === 'X' ? Math.min(...Object.values(avialbleOptions)) : Math.max(...Object.values(avialbleOptions));
  }
};
