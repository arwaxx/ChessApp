/**import { Component, HostListener } from '@angular/core';
import { MessageEventsEnum, NewMovePayload } from '../shared/message-types';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {
  currentTurn: string = 'PLAYER_ONE'; // Start with Player 1 (White)
  lastMove: string = ''; // Track the last move to prevent duplicates

  @HostListener('window:message', ['$event'])
  handleNewMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case MessageEventsEnum.NEW_MOVE:
        if (this.lastMove !== payload.move) {
          this.lastMove = payload.move;
          this.forwardMove(payload);
          this.toggleTurn();
        }
        break;

      case MessageEventsEnum.CHECK_MATE:
        window.alert(`Checkmate! ${payload.winner} has won the game!`);
        this.resetGame();
        break;

      default:
        console.warn('Unknown message type received:', type);
    }
  }

  forwardMove(payload: NewMovePayload) {
    const targetIframe = payload.fromPlayer === 'PLAYER_ONE' ? 1 : 0;

    // Forward the move to the target iframe
    window.frames[targetIframe].postMessage(
      {
        type: MessageEventsEnum.MOVE_PIECE,
        payload: { move: payload.move },
      },
      '*'
    );

    // Disable the inactive player board
    window.frames[payload.fromPlayer === 'PLAYER_ONE' ? 0 : 1].postMessage(
      { type: MessageEventsEnum.DISABLE_TILES },
      '*'
    );

    // Enable the active player board
    window.frames[targetIframe].postMessage(
      { type: MessageEventsEnum.ENABLE_TILES },
      '*'
    );

    // Restore the second iframe to its original position after Player Two moves
    if (payload.fromPlayer === 'PLAYER_TWO') {
      this.restoreSecondFrame();
    }
  }

  restoreSecondFrame() {
    console.log('Restoring second frame to original position');
    window.frames[1].postMessage({ type: MessageEventsEnum.RESTORE }, '*');
  }

  reverseBoard() {
    if (this.currentTurn === 'PLAYER_TWO') {
      console.log('Reversing board for Player Two');
      window.frames[1].postMessage({ type: MessageEventsEnum.REVERSE }, '*');
    }
  }

  toggleTurn() {
    this.currentTurn =
      this.currentTurn === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE';
    console.log(`Turn toggled. Current Turn: ${this.currentTurn}`);

    // Reverse the second board for Player Two's turn
    if (this.currentTurn === 'PLAYER_TWO') {
      this.reverseBoard();
    }
  }

  resetGame() {
    console.log('Resetting the game');
    window.frames[0].postMessage({ type: MessageEventsEnum.RESET_GAME }, '*');
    window.frames[1].postMessage({ type: MessageEventsEnum.RESET_GAME }, '*');

    this.currentTurn = 'PLAYER_ONE';
    this.lastMove = '';
  }
}**/

import { Component, HostListener, OnInit } from '@angular/core';
import { MessageEventsEnum, NewMovePayload } from '../shared/message-types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  currentTurn: string = 'PLAYER_ONE'; // Start with Player 1
  lastMove: string = ''; // Track the last move to prevent duplicates


  constructor(private router: Router) {}

  navigateToGame() {
    this.router.navigate(['/game']); // Navigate to GameComponent
  }


  ngOnInit() {
    // Load game state from LocalStorage
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const { currentTurn, lastMove } = JSON.parse(savedState);
      this.currentTurn = currentTurn;
      this.lastMove = lastMove;

      // Notify both frames to restore their board states
      window.frames[0].postMessage({ type: MessageEventsEnum.LOAD_GAME }, '*');
      window.frames[1].postMessage({ type: MessageEventsEnum.LOAD_GAME }, '*');
    }
  }

  @HostListener('window:message', ['$event'])
  handleNewMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case MessageEventsEnum.NEW_MOVE:
        if (this.lastMove !== payload.move) {
          this.lastMove = payload.move;
          this.forwardMove(payload);
          this.toggleTurn();
          this.saveGameState(); // Save state after every move
        }
        break;

      case MessageEventsEnum.CHECK_MATE:
        if (confirm(`Checkmate! ${payload.winner} has won the game! Click "OK" to start a new game.`)) {
          this.resetGame();
        }
        break;

      default:
        console.warn('Unknown message type received:', type);
    }
  }

  forwardMove(payload: NewMovePayload) {
    const targetIframe = payload.fromPlayer === 'PLAYER_ONE' ? 1 : 0;

    window.frames[targetIframe].postMessage(
      {
        type: MessageEventsEnum.MOVE_PIECE,
        payload: { move: payload.move },
      },
      '*'
    );

    window.frames[payload.fromPlayer === 'PLAYER_ONE' ? 0 : 1].postMessage(
      { type: MessageEventsEnum.DISABLE_TILES },
      '*'
    );

    window.frames[targetIframe].postMessage(
      { type: MessageEventsEnum.ENABLE_TILES },
      '*'
    );

    if (payload.fromPlayer === 'PLAYER_TWO') {
      this.restoreSecondFrame();
    }
  }

  restoreSecondFrame() {
    window.frames[1].postMessage({ type: MessageEventsEnum.RESTORE }, '*');
  }

  toggleTurn() {
    this.currentTurn =
      this.currentTurn === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE';
    console.log(`Turn toggled. Current Turn: ${this.currentTurn}`);

    if (this.currentTurn === 'PLAYER_TWO') {
      this.reverseBoard();
    }
  }

  reverseBoard() {
    if (this.currentTurn === 'PLAYER_TWO') {
      window.frames[1].postMessage({ type: MessageEventsEnum.REVERSE }, '*');
    }
  }

  resetGame() {
    localStorage.removeItem('gameState'); // Clear saved state
    window.frames[0].postMessage({ type: MessageEventsEnum.RESET_GAME }, '*');
    window.frames[1].postMessage({ type: MessageEventsEnum.RESET_GAME }, '*');
    this.currentTurn = 'PLAYER_ONE';
    this.lastMove = '';
  }

  saveGameState() {
    localStorage.setItem(
      'gameState',
      JSON.stringify({ currentTurn: this.currentTurn, lastMove: this.lastMove })
    );
  }
}
