/**import {
  Component,
  Input,
  OnInit,
  HostListener,
  ViewChild,
} from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { ActivatedRoute } from '@angular/router';
import { MessageEventsEnum } from '../shared/message-types';

@Component({
  selector: 'app-player-board',
  templateUrl: './player-board.component.html',
  styleUrls: ['./player-board.component.css'],
})
export class PlayerBoardComponent implements OnInit {
  @Input() currentTurn: string = ''; // Current turn: "PLAYER_ONE" or "PLAYER_TWO"
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;
  playerName: string = ''; // Player name: "PLAYER_ONE" or "PLAYER_TWO"
  savedStateKey!: string; // Key for saving game state in LocalStorage
  isDisabled: boolean = false; // Whether the board interaction is disabled
  isReversed: boolean = false; // Track if the board is reversed

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Determine player name from route data
    this.playerName = this.route.snapshot.data['playerName'];
    this.savedStateKey = `${this.playerName}_game_state`;

    // Load the saved state if available
    try {
      const savedState = localStorage.getItem(this.savedStateKey);
      if (savedState) {
        this.board.setFEN(savedState);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }

    // Reverse the board for Player Two
    if (this.playerName === 'PLAYER_TWO') {
      this.reverseBoard();
    }
  }

  @HostListener('window:message', ['$event'])
  handleNewMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case MessageEventsEnum.MOVE_PIECE:
        this.board.move(payload.move);
        this.checkForCheckmate();
        break;

      case MessageEventsEnum.RESET_GAME:
        this.board.reset();
        localStorage.removeItem(this.savedStateKey);
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

  reverseBoard() {
    this.board.reverse();
    this.isReversed = true; // Mark board as reversed
    console.log(`Board reversed for ${this.playerName}`);
  }

  restoreBoard() {
    if (this.isReversed) {
      this.board.reverse(); // Restore original position
      this.isReversed = false; // Mark board as not reversed
      console.log(`Board restored for ${this.playerName}`);
    }
  }

  @HostListener('window:beforeunload')
  saveGameState() {
    try {
      const state = this.board.getFEN();
      localStorage.setItem(this.savedStateKey, state);
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  onMoveChange(event: any) {
    const move = event.move;

    // Notify the parent about the move
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

    this.checkForCheckmate();
  }

  checkForCheckmate() {
    const moveHistory = this.board.getMoveHistory();

    if (moveHistory.some((move: any) => move.endsWith('#'))) {
      window.parent.postMessage(
        {
          type: MessageEventsEnum.CHECK_MATE,
          payload: { winner: this.playerName },
        },
        '*'
      );
    }
  }
}**/

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
  isDisabled: boolean = false;
  isReversed: boolean = false;

  constructor(private route: ActivatedRoute, private ngZone: NgZone) {}

ngOnInit() {
  this.playerName = this.route.snapshot.data['playerName'];
  this.savedStateKey = `${this.playerName}_game_state`;

  this.ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      const savedState = localStorage.getItem(this.savedStateKey);
      if (savedState ) {
        console.log(`Restoring board state for ${this.playerName}:`, savedState);
        this.board.setFEN(savedState); // Restore the board to the saved position


      } 

      if (this.playerName === 'PLAYER_TWO') {
        this.reverseBoard
      }


    }, 0);
  });
}



  @HostListener('window:message', ['$event'])
  handleNewMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case MessageEventsEnum.MOVE_PIECE:
        this.board.move(payload.move);
        this.saveGameState();
        this.checkForCheckmate();
        break;

      case MessageEventsEnum.RESET_GAME:
        this.board.reset();
        localStorage.removeItem(this.savedStateKey);
        break;

      case MessageEventsEnum.LOAD_GAME:
        const savedState = localStorage.getItem(this.savedStateKey);
        if (savedState) {
          this.board.setFEN(savedState);
        }
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

  checkForCheckmate() {
    const moveHistory = this.board.getMoveHistory();

    if (moveHistory.some((move: any) => move.endsWith('#'))) {
      window.parent.postMessage(
        {
          type: MessageEventsEnum.CHECK_MATE,
          payload: { winner: this.playerName },
        },
        '*'
      );
    }
  }
}
