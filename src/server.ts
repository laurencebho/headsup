import { Player } from './player';
import { Game } from './game';

export class Server {
	private _players: Array<Player> = [];
	private _games: Array<Game> = [];

	get players() { 
		return this._players;
	}

	get games() {
		return this._games;
	}

	public addPlayer(player : Player) {
		this._players.push(player);
	}

	public removePlayer(id: string) {
		for (var i=0; i<this._players.length; i++) {
			if (this._players[i].id == id) {
				this._players.splice(i, 1);
			}
		}
	}

	public addGame(game : Game) {
		this._games.push(game);
	}

	public createGames(io) {
		var unpaired = [];
		this._players.forEach(function(player) {
			if (!player.inGame) {
				unpaired.push(player);
				if (unpaired.length == 2) {
					console.log('Creating game with players ' + unpaired[0].id + ' and ' + unpaired[1].id);
					var gameID = this._games.length + "";
					this.addGame(new Game(unpaired[0], unpaired[1], gameID, io));//length of players array (converted to string) used as id, may or may not work
 					console.log("Current number of games: " + this._games.length);
				}
			};
		}, this); //sets the 'this' of the forEach loop to Server
	}

	public getRoom(id : string) : string { //gets correct chat room to broadcast a message to
		for (var i=0; i<this._games.length; i++) {
			if (this._games[i].containsPlayer(id)) {
				return this._games[i].id;
			}
		};
		return 'none';
	}
}