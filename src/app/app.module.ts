/**import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PlayerBoardComponent } from './player-board/player-board.component';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from './firebaseConfig';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'player1', component: PlayerBoardComponent, data: { playerName: 'PLAYER_ONE' } },
  { path: 'player2', component: PlayerBoardComponent, data: { playerName: 'PLAYER_TWO' } },
  { path: 'game', component: GameComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    PlayerBoardComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    NgxChessBoardModule.forRoot(), // Import the chess board module
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  bootstrap: [AppComponent],
})
export class AppModule {}
**/

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PlayerBoardComponent } from './player-board/player-board.component';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from './firebaseConfig';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: '', component: MainPageComponent }, // Default route
  { path: 'player1', component: PlayerBoardComponent, data: { playerName: 'PLAYER_ONE' } },
  { path: 'player2', component: PlayerBoardComponent, data: { playerName: 'PLAYER_TWO' } },
  { path: 'game', component: GameComponent }, // Route for the GameComponent
];



@NgModule({
  declarations: [AppComponent, MainPageComponent, PlayerBoardComponent, GameComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    NgxChessBoardModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
