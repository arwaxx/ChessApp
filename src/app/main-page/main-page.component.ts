

import { Component, HostListener, OnInit } from '@angular/core';
import { MessageEventsEnum, NewMovePayload } from '../shared/message-types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  public currentTurn: string = 'PLAYER_ONE'; // Start with Player 1
  public lastMove: string = ''; // Track the last move to prevent duplicates

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadGameState();
  }

  public navigateToGame() {
    this.router.navigate(['/game']); // Navigate to GameComponent
  }

  public resetGame() {
    localStorage.removeItem('gameState'); // Clear saved state
    window.frames[0].postMessage({ type: MessageEventsEnum.RESET_GAME }, '*');
    window.frames[1].postMessage({ type: MessageEventsEnum.RESET_GAME }, '*');
    this.currentTurn = 'PLAYER_ONE';
    this.lastMove = '';
  }

  private loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const { currentTurn, lastMove } = JSON.parse(savedState);
      this.currentTurn = currentTurn;
      this.lastMove = lastMove;
      
      this.notifyFramesToRestore();
    }
  }

  private notifyFramesToRestore() {
    window.frames[0].postMessage({ type: MessageEventsEnum.LOAD_GAME }, '*');
    window.frames[1].postMessage({ type: MessageEventsEnum.LOAD_GAME }, '*');
  }

  @HostListener('window:message', ['$event'])
  handleNewMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case MessageEventsEnum.NEW_MOVE:
        this.handleNewMove(payload);
        break;

      case MessageEventsEnum.CHECK_MATE:
        this.handleCheckmate(payload);
        break;

      default:
        break;
    }
  }

  private handleNewMove(payload: NewMovePayload) {
    if (this.lastMove !== payload.move) {
      this.lastMove = payload.move;
      this.forwardMove(payload);
      this.toggleTurn();
      this.saveGameState();
    }
  }

  private handleCheckmate(payload: { winner: string }) {
    const confirmReset = confirm(
      `Checkmate! ${payload.winner} has won the game! Click "OK" to start a new game.`
    );
    if (confirmReset) {
      this.resetGame();
    }
  }

  private forwardMove(payload: NewMovePayload) {
    const targetIframe = payload.fromPlayer === 'PLAYER_ONE' ? 1 : 0;

    // Send move to the target iframe
    window.frames[targetIframe].postMessage(
      { type: MessageEventsEnum.MOVE_PIECE, payload: { move: payload.move } },
      '*'
    );

    // Update tile states for both frames
    window.frames[payload.fromPlayer === 'PLAYER_ONE' ? 0 : 1].postMessage(
      { type: MessageEventsEnum.DISABLE_TILES },
      '*'
    );
    window.frames[targetIframe].postMessage(
      { type: MessageEventsEnum.ENABLE_TILES },
      '*'
    );

    // Restore the second frame if Player Two made the move
    if (payload.fromPlayer === 'PLAYER_TWO') {
      this.restoreSecondFrame();
    }
  }

  private restoreSecondFrame() {
    window.frames[1].postMessage({ type: MessageEventsEnum.RESTORE }, '*');
  }

  private toggleTurn() {
    this.currentTurn =
      this.currentTurn === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE';

    if (this.currentTurn === 'PLAYER_TWO') {
      this.reverseBoard();
    }
  }

  private reverseBoard() {
    window.frames[1].postMessage({ type: MessageEventsEnum.REVERSE }, '*');
  }

  private saveGameState() {
    const gameState = {
      currentTurn: this.currentTurn,
      lastMove: this.lastMove,
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }
}
