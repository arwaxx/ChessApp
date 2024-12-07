import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { Database, ref, push, update, onValue } from '@angular/fire/database';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  gameId: string | null = null; // Game Code
  playerId: string = ''; // Unique player ID
  isOpponentTurn: boolean = false; // Determines if the opponent is playing
  isBoardReversed: boolean = false; // To reverse the board for Player Two
  isDisabled: boolean = false; // To disable board interactions for non-turn players
  gameStatusMessage: string = ''; // Display messages for turns or endgame

  constructor(private db: Database) {}

  ngOnInit() {
    this.gameId = null; // Reset gameId
    console.log('Game ID reset:', this.gameId); // Debugging
  }

  // Create a new game
  createGame() {
    this.playerId = 'playerOne'; // Assign Player One
    const gameData = {
      playerOne: this.playerId,
      playerTwo: null,
      boardState: this.board?.getFEN() || 'startpos',
      currentTurn: 'playerOne',
      gameStatus: 'IN_PROGRESS',
    };

    const gameRef = push(ref(this.db, 'games'), gameData);

    if (gameRef.key) {
      this.gameId = gameRef.key; // Assign the Firebase-generated Game ID
      console.log('Game ID Created:', this.gameId); // Debugging: Log the generated Game ID
      this.listenForGameUpdates(); // Start listening for updates
    } else {
      console.error('Failed to generate Game ID');
    }
  }

  // Join an existing game
  joinGame() {
    const gameCode = prompt('Enter Game Code:');
    if (!gameCode) return;

    this.gameId = gameCode; // Assign the entered Game Code
    this.playerId = 'playerTwo'; // Assign Player Two
    this.isBoardReversed = true; // Reverse board for Player Two
    update(ref(this.db, `games/${gameCode}`), { playerTwo: this.playerId });

    this.listenForGameUpdates(); // Start listening for updates
  }

  // Handle move change on the chessboard
  onMoveChange(event: any) {
    if (this.isDisabled || !this.gameId) {
      // Exit if the board is disabled or no game is active
      return;
    }

    const newBoardState = this.board.getFEN();
    const nextTurn = this.playerId === 'playerOne' ? 'playerTwo' : 'playerOne';

    update(ref(this.db, `games/${this.gameId}`), {
      boardState: newBoardState,
      currentTurn: nextTurn,
    }).then(() => {
      console.log(`Move recorded. Next turn: ${nextTurn}`);
    }).catch((error) => {
      console.error('Error updating move:', error);
    });
  }

  // Listen for real-time game updates
  listenForGameUpdates() {
    if (!this.gameId) return;

    const gameRef = ref(this.db, `games/${this.gameId}`);
    onValue(gameRef, (snapshot) => {
      const game = snapshot.val();
      if (game) {
        console.log('Game Updated:', game); // Debugging: Log game updates

        this.isOpponentTurn = game.currentTurn !== this.playerId; // Update turn
        this.isDisabled = this.isOpponentTurn; // Disable board if it's the opponent's turn

        // Update board state if it has changed
        if (this.board.getFEN() !== game.boardState) {
          this.board.setFEN(game.boardState);
        }

        // Reverse board for Player Two
        if (this.isBoardReversed) {
          this.board.reverse();
        }

        // Update the game status message
        this.gameStatusMessage = this.isOpponentTurn
          ? "Opponent's Turn"
          : 'Your Turn';

        // Handle game completion
        if (game.gameStatus === 'COMPLETED') {
          alert('Game Over!');
          this.gameId = null;
          this.gameStatusMessage = 'Game Over!';
        }
      } else {
        console.error('Game data not found!');
      }
    });
  }

  @HostListener('window:beforeunload')
  saveGameState() {
    if (!this.gameId) return;

    const state = this.board.getFEN();
    localStorage.setItem(`${this.gameId}_state`, state);
  }
}
