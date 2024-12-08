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
    this.resetGameId(); // Ensure the game ID is reset on initialization
  }

  private resetGameId() {
    this.gameId = null;
  }

  // Create a new game
  public createGame() {
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
      this.listenForGameUpdates(); // Start listening for updates
    } else {
      throw new Error('Failed to generate Game ID');
    }
  }

  // Join an existing game
  public joinGame() {
    const gameCode = prompt('Enter Game Code:');
    if (!gameCode) return;

    this.gameId = gameCode; // Assign the entered Game Code
    this.playerId = 'playerTwo'; // Assign Player Two
    this.isBoardReversed = true; // Reverse board for Player Two

    update(ref(this.db, `games/${gameCode}`), { playerTwo: this.playerId });

    this.listenForGameUpdates(); // Start listening for updates
  }

  // Handle move change on the chessboard
  public onMoveChange(event: any) {
    if (this.isDisabled || !this.gameId) return; // Exit if the board is disabled or no game is active

    const newBoardState = this.board.getFEN();
    const nextTurn = this.playerId === 'playerOne' ? 'playerTwo' : 'playerOne';

    update(ref(this.db, `games/${this.gameId}`), {
      boardState: newBoardState,
      currentTurn: nextTurn,
    }).catch((error) => {
      throw new Error(`Error updating move: ${error.message}`);
    });
  }

  // Listen for real-time game updates
  private listenForGameUpdates() {
    if (!this.gameId) return;

    const gameRef = ref(this.db, `games/${this.gameId}`);
    onValue(gameRef, (snapshot) => {
      const game = snapshot.val();
      if (!game) throw new Error('Game data not found!');

      this.updateGameState(game);
    });
  }

  private updateGameState(game: any) {
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
      this.handleGameCompletion();
    }
  }

  private handleGameCompletion() {
    alert('Game Over!');
    this.gameId = null;
    this.gameStatusMessage = 'Game Over!';
  }

  @HostListener('window:beforeunload')
  private saveGameState() {
    if (!this.gameId) return;

    const state = this.board.getFEN();
    localStorage.setItem(`${this.gameId}_state`, state);
  }
}
