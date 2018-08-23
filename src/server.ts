import { Player } from './player';
import { Game } from './game';

export class Server {
	private _players: Array<Player> = [];
	private _games: Array<Game> = [];
	private _freeIds: Array<string> = [];

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

	public removeGame(id: string) {
		for (var i=0; i<this._games.length; i++) {
			if (this._games[i].id == id) {
				this._games.splice(i, 1);
				this._freeIds.push(id);
			}
		}
	}

	public addGame(game : Game) {
		this._games.push(game);
	}

	public createGames(io) {
		var unpaired = [];
		for (var i=0; i<this._players.length; i++) {
			var player = this._players[i];
			if (!player.inGame) {
				unpaired.push(player);
				if (unpaired.length == 2) {
					console.log('Creating game with players ' + unpaired[0].id + ' and ' + unpaired[1].id);
					var gameID = (this._freeIds.length > 0 ? this._freeIds.splice(0, 1)[0] : this._games.length + ""); //takes a free id from the queue, or creates new id
					this.addGame(new Game(unpaired[0], unpaired[1], gameID, io));
 					console.log("Current number of games: " + this._games.length);
				}
			};
		}
	}

	public getRoom(id : string) : string { //gets correct chat room to broadcast a message to
		for (var i=0; i<this._games.length; i++) {
			if (this._games[i].containsPlayer(id)) {
				return this._games[i].id;
			}
		};
		return 'none';
	}

	public nicknameExists(nickname : string): boolean {
		for (var i=0; i<this._players.length; i++) {
			if (this._players[i].nickname == nickname) {
				return true;
			}
		}
		return false;
	}
}