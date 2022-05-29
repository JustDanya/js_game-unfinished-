class Gamemode
{
	lives = 1;
	gameInst;
	score = 0;
	constructor(game)
	{
		this.gameInst = game;
	}
	update(ftime = 1)
	{
		//
	}
	onDeath() {}
	onRespawn() {}
	newGame() {}
}