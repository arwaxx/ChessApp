export enum MessageEventsEnum {
    MOVE_PIECE = 'MOVE_PIECE',
    RESET_GAME = 'RESET_GAME',
    NEW_MOVE = 'NEW_MOVE',
    ENABLE_TILES = 'ENABLE_TILES',
    DISABLE_TILES = 'DISABLE_TILES',
    REVERSE = "REVERSE",
    RESTORE = "RESTORE",
    CHECK_MATE = 'CHECK_MATE',
    STALEMATE = 'STALEMATE',
    DRAW = 'DRAW',
    GAME_OVER = 'GAME_OVER',
    LOAD_GAME ='LOAD_GAME'
  }
  
  export interface NewMovePayload {
    move: string; 
    fromPlayer: string; 
    toPlayer: string; 
  }
  