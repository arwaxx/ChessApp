
import {
  Component,
  Input,
  OnInit,
  HostListener,
  ViewChild,
} from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { ActivatedRoute } from '@angular/router';
import { MessageEventsEnum } from '../shared/message-types';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-player-board',
  templateUrl: './player-board.component.html',
  styleUrls: ['./player-board.component.css'],
})
export class PlayerBoardComponent implements OnInit {
  @Input() currentTurn: string = '';
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  playerName: string = '';
  savedStateKey!: string; // LocalStorage key
  isDisabled: boolean = false; // To disable moves when the game is over
  isReversed: boolean = false;
  gameOver: boolean = false; // To track if the game is over

  constructor(private route: ActivatedRoute, private ngZone: NgZone) {}

  ngOnInit() {
    this.initializePlayer();
    this.restoreSavedState();
  }

  private initializePlayer() {
    this.playerName = this.route.snapshot.data['playerName'];
    this.savedStateKey = `${this.playerName}_game_state`;
  }

  private restoreSavedState() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const savedState = localStorage.getItem(this.savedStateKey);
        if (savedState) {
          this.board.setFEN(savedState); // Restore the board to the saved position

          if (this.playerName === 'PLAYER_TWO') {
            this.reverseBoard();
          } else if (this.playerName === 'PLAYER_ONE') {
            this.restoreBoard();
          }
        }
      }, 0);
    });
  }

  @HostListener('window:message', ['$event'])
  handleNewMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case MessageEventsEnum.MOVE_PIECE:
        this.handleMovePiece(payload.move);
        break;

      case MessageEventsEnum.RESET_GAME:
        this.resetGame();
        break;

      case MessageEventsEnum.LOAD_GAME:
        this.loadGame();
        break;

      case MessageEventsEnum.DISABLE_TILES:
        this.isDisabled = true;
        break;

      case MessageEventsEnum.ENABLE_TILES:
        this.isDisabled = false;
        break;

      case MessageEventsEnum.REVERSE:
        this.reverseBoard();
        break;

      case MessageEventsEnum.RESTORE:
        this.restoreBoard();
        break;

      default:
        console.warn('Unknown message type received:', type);
    }
  }

  private handleMovePiece(move: string) {
    if (this.gameOver) {
      return; // Skip the move if the game is over
    }

    this.board.move(move);
    this.saveGameState();
    this.checkForCheckmate();
  }

  private resetGame() {
    this.board.reset();
    localStorage.removeItem(this.savedStateKey);
    this.gameOver = false; // Reset the game over flag
    this.isDisabled = false; // Enable moves again
  }

  private loadGame() {
    const savedState = localStorage.getItem(this.savedStateKey);
    if (savedState) {
      this.board.setFEN(savedState);
    }
  }

  @HostListener('window:beforeunload')
  saveGameState() {
    const state = this.board.getFEN();
    localStorage.setItem(this.savedStateKey, state);
  }

  reverseBoard() {
    this.board.reverse();
    this.isReversed = true;
  }

  restoreBoard() {
    if (this.isReversed) {
      this.board.reverse();
      this.isReversed = false;
    }
  }

  

  onMoveChange(event: any) {
    if (this.gameOver) {
      return; // Skip move if the game is over
    }

    const move = event.move;

    window.parent.postMessage(
      {
        type: MessageEventsEnum.NEW_MOVE,
        payload: {
          move,
          fromPlayer: this.playerName,
          toPlayer:
            this.playerName === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE',
        },
      },
      '*'
    );

    this.saveGameState();
    this.checkForCheckmate();
  }

  private checkForCheckmate() {
    const moveHistory = this.board.getMoveHistory();

    // Check if the last move ends with '#', which means checkmate
    if (moveHistory.some((move: any) => move.endsWith('#'))) {
      // When checkmate is detected, show the alert
      this.gameOver = true; // Set game over state
      this.isDisabled = true; // Disable further moves
      window.parent.postMessage(
        {
          type: MessageEventsEnum.CHECK_MATE,
          payload: { winner: this.playerName },
        },
        '*'
      );
      alert(`Checkmate! ${this.playerName} wins!`);
    }
  }

  // Method to handle the "Create New Game" action
  createNewGame() {
    this.board.reset(); // Reset the board
    this.gameOver = false; // Reset game-over state
    this.isDisabled = false; // Enable moves again
    this.saveGameState(); // Save the new game state
    alert("A new game has started!");
  }
}
