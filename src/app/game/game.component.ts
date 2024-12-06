import { Component, ViewChild } from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { Database, ref, push, update, onValue } from '@angular/fire/database';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent {
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  gameId: string | null = null; // Game Code
  playerId: string = ''; // Unique player ID
  isOpponentTurn: boolean = false; // Determines if the opponent is playing

  constructor(private db: Database) {}

  // Create a new game
  createGame() {
    this.playerId = `player_${Date.now()}`; // Unique player ID
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
    } else {
      console.error('Failed to generate Game ID');
    }

    // Listen for game updates
    this.listenForGameUpdates();
  }

  // Join an existing game
  joinGame() {
    const gameCode = prompt('Enter Game Code:');
    if (!gameCode) return;

    this.gameId = gameCode; // Assign the entered Game Code
    this.playerId = `player_${Date.now()}`; // Unique player ID
    update(ref(this.db, `games/${gameCode}`), { playerTwo: this.playerId });

    console.log('Joined Game:', this.gameId); // Debugging: Confirm Game ID
    this.listenForGameUpdates();
  }

  // Handle move change on the chessboard
  onMoveChange(event: any) {
    if (this.isOpponentTurn || !this.gameId) return;

    const newBoardState = this.board.getFEN();
    const nextTurn = this.playerId === 'playerOne' ? 'playerTwo' : 'playerOne';

    update(ref(this.db, `games/${this.gameId}`), {
      boardState: newBoardState,
      currentTurn: nextTurn,
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
        this.isOpponentTurn = game.currentTurn !== this.playerId;

        // Update board state if it has changed
        if (this.board.getFEN() !== game.boardState) {
          this.board.setFEN(game.boardState);
        }

        // Handle game completion
        if (game.gameStatus === 'COMPLETED') {
          alert('Game Over!');
          this.gameId = null;
        }
      }
    });
  }
}
