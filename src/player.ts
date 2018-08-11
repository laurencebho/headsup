export class Player {
	private _hasNickname : boolean = false;
	private _nickname : string = "";
	private _socket : any;
	private _inGame : boolean = false;
	private _gameNumber : number = -1;
	private _holeCards : Array<number>;
	private _stack : number; //total value of chips
	private _bet : number;

	public constructor(nickname : string, socket : any) {
		this._nickname = nickname;
		this._socket = socket;
		this._stack = 1000;
	}

	get hasNickname() {
		return this._hasNickname;
	}

	get nickname() {
		return this._nickname;
	}

	get socket() {
		return this._socket;
	}

	get id() {
		return this._socket.id;
	}

	get inGame() {
		return this._inGame;
	}

	get gameNumber() {
		return this._gameNumber;
	}
	
	set hasNickname(hasNickname : boolean) {
		this._hasNickname = hasNickname;
	}

	set nickname(nickname : string) {
		this._nickname = nickname;
	}

	set inGame(inGame : boolean) {
		this._inGame = inGame;
	}

	set gameNumber(gameNumber : number) {
		this._gameNumber = gameNumber;
	}

	set holeCards(holeCards : Array<number>) {
		this._holeCards = holeCards;
	}

	get holeCards() {
		return this._holeCards;
	}

	get bet() : number {
		return this._bet;
	}

	set bet(bet : number) {
		this._bet = bet;
	}

	get stack() {
		return this._stack;
	}

	public changeStack(amount : number ){
		this._stack += amount;
	}
}
