class Infinitegame extends Gamemode
{
	currentStage = 1;
	isNewState = false;
	wantsUpdate = true;
	isPlayerDeath = false;
	stateComponent =
	{
		determineState()
		{
			if (this.owner.isNewState)
				return "removecorpse";
			let chance = Math.random();
			// console.log(chance);
			if (chance <= 0.7500 && !this.owner.isPlayerDeath)
				return "newenemy";
			else if (this.owner.gameInst.pickups.length <= this.owner.maxPickups && !this.owner.isPlayerDeath)
				return "newpck";
			else
			{
				if (this.owner.gameInst.enemies.length <= this.owner.maxEnemies && !this.owner.isPlayerDeath)
					return "newenemy";
				else
					return "wait";
			}
		},
		owner: undefined,
		state: 'newpck',
		transitions:
		{
			newpck:
			{
				update()
				{
					let max = this.owner.currentStage / this.owner.statesCount; 
					max = Math.ceil(max * 20);
					let chance = Math.floor(Math.random() * max), item;
					switch(chance)
					{
						case 0:
							item = new ABonus(10, 10);
							break;
						case 1:
							item = new HBonus(10, 10);
							break;
						case 2:
							item = new Clip(10, 10);
							break;
						case 3:
							item = new ShotgunPick(10, 10);
							break;
						case 4:
							item = new Shells(10, 10);
							break;
						case 5:
							item = new Stimpack(10, 10);
							break;
						case 6:
							item = new GreenJacket(10, 10);
							break;
						case 7:
							item = new ShellBox(10, 10);
							break;
						case 8:
							item = new ChaingunPick(10, 10);
							break;
						case 9:
							item = new AmmoBox(10, 10);
							break;
						case 10:
							item = new ChainsawPick(10, 10);
							break;
						case 11:
							item = new Medicine(10, 10);
							break;
						case 12:
							item = new RocketLauncherPick(10, 10);
							break;
						case 13:
							item = new Rocket(10, 10);
							break;
						case 14:
							item = new RocketBox(10, 10);
							break;
						case 15:
							item = new PlasmaPick(10, 10);
							break;
						case 16:
							item = new Cells(10, 10);
							break;
						case 17:
							item = new Backpack(10, 10);
							break;
						case 18:
							item = new BlueJacket(10, 10);
							break;
						case 19:
							item = new Soul(10, 10);
							break;
						case 20:
							item = new BFGPick(10, 10);
							break;
						case 21:
							item = new CellPack(10, 10);
							break;
						default:
							item = new ABonus(10, 10);
							break;
					}
					//check actors collision
					let noCollisions = false;
					while(!noCollisions)
					{
						item.x = Math.floor(Math.random() * (this.owner.gameInst.fieldW - 10)) + 10;
						item.y = Math.floor(Math.random() * (this.owner.gameInst.fieldH - 10)) + 10;
						for(let wall of this.owner.gameInst.walls)
						{
							noCollisions = !testAABBs(getBoundary(item), getBoundary(wall));
							if (!noCollisions) break;
						}
					}

					playSound("DSITMBK");					
					this.owner.gameInst.pickups.push(item);
					this.owner.gameInst.QT.insert(item);
					this.state = this.determineState();
				}
			},
			newenemy:
			{
				update()
				{
					let max = this.owner.currentStage / this.owner.statesCount; 
					max = Math.ceil(max * 7);
					let chance = Math.floor(Math.random() * max), enemy;
					// console.log("Enemy: chance-max ", chance, max)
					switch(chance)
					{
						case 0:
							enemy = new Soldier(10, 10);
							break;
						case 1:
							enemy = new Imp(10, 10);
							break;
						case 2:
							enemy = new Sergeant(10, 10);
							break;
						case 3:
							enemy = new Demon(10, 10);
							break;
						case 4:
							enemy = new LostSoul(10, 10);
							break;
						case 5:
							enemy = new Caco(10, 10);
							break;
						case 6:
							enemy = new HKnight(10, 10);
							break;
						case 7:
							enemy = new Revenant(10, 10);
							break;
						default:
							enemy = new Soldier(10, 10);
							break;
					}
					//check actors collision
					let noCollisions = false;
					while(!noCollisions)
					{
						enemy.x = Math.floor(Math.random() * this.owner.gameInst.fieldW - 10) + 10;
						enemy.y = Math.floor(Math.random() * this.owner.gameInst.fieldH - 10) + 10;
						for(let wall of this.owner.gameInst.walls)
						{
							noCollisions = !testAABBs(getBoundary(enemy), getBoundary(wall));
							if (!noCollisions) break;
						}
						console.log("CUM");
					}

					//find direction
					let player = this.owner.gameInst.Player;
					if (enemy.y < player.y && (enemy.x-200 < player.x && enemy.x+200 > player.x))
						enemy.predeterminedDir = 0;
					else if (enemy.y < player.y && (enemy.x-500 < player.x && player.x <= enemy.x))
						enemy.predeterminedDir = 1;
					else if (enemy.x > player.x && (enemy.y-200 < player.y && enemy.y+200 > player.y))
						enemy.predeterminedDir = 2;
					else if (enemy.y > player.y && (enemy.x-500 < player.x && player.x <= enemy.x))
						enemy.predeterminedDir = 3;
					else if (enemy.y > player.y && (enemy.x-200 < player.x && enemy.x+200 > player.x))
						enemy.predeterminedDir = 4;
					else if (enemy.y > player.y && (enemy.x+500 > player.x && player.x >= enemy.x))
						enemy.predeterminedDir = 5;
					else if (enemy.x < player.x && (enemy.y-200 < player.y && enemy.y+200 > player.y))
						enemy.predeterminedDir = 6;
					else if (enemy.y < player.y && (enemy.x+500 > player.x && player.x >= enemy.x))
						enemy.predeterminedDir = 7;
					let c = enemy.center();
					let prtcl = new TeleportFog(c.x, c.y);
					playSound("DSTELEPT");					
					this.owner.gameInst.summonParticle(prtcl);					
					this.owner.gameInst.enemies.push(enemy);
					this.owner.gameInst.QT.insert(enemy);
					this.state = this.determineState();
				}
			},
			removecorpse:
			{
				update()
				{
					if (this.owner.gameInst.corpses.length > 0)
					{
						this.owner.gameInst.corpses.pop();
						playSound("DSSLOP");
					}
					else
						this.owner.isNewState = false;
					this.state = this.determineState();
				}
			},
			wait: {update()
				{
					this.state = this.determineState();
				}}
		},
		dispatch(actionName)
		{
			const action = this.transitions[this.state][actionName];

	        if (action)
	        {
	            action.call(this);
	        }
	        else
	        {
	            console.log('invalid action');
	        }
		}
	}
	constructor(game, maxEn, maxPck, states, statesCount = 10, uF = 3500)
	{
		super(game);
		this.updateFreq = uF;
		this.sc = Object.create(this.stateComponent);
		this.sc.owner = this;
		this.maxEnemies = maxEn;
		this.maxPickups = maxPck;
		this.statesCount = statesCount;
		this.states = [];
		if (Array.isArray(states))
		{
			this.statesCount = states.length;
			this.states = states;
		}
		else
		{
			let lastState = 100;
			for(let i = 1; i <= statesCount; i++)
			{
				this.states.push(lastState);
				lastState = lastState+states;
			}
		}
	}
	update(ftime = 1)
	{
		if (this.wantsUpdate)
		{
			this.wantsUpdate = false;
			let freq = this.updateFreq;
			if (this.score >= this.states[this.currentStage-1])
			{
				this.isNewState = true;
				this.currentStage++;
				if (this.currentStage > this.statesCount)
					this.currentStage = 1;
			}
			if (this.isNewState) freq = 1000;
			setTimeout( () =>  this.wantsUpdate = true, freq);	
			this.sc.dispatch('update');
			// console.log("update " + this.score);
		}
		// if (this.isPlayerDeath)
		// {
		// 	alert("GAME OVER");
		// 	this.isPlayerDeath = false;
		// }
	}
	async onDeath()
	{
		this.isPlayerDeath = true;
		await new Promise(resolve => setTimeout(resolve, 5000));
		alert("GAME OVER! Your Score = " + this.score);
		this.newGame();
	}
	newGame()
	{
		//
		console.log(this.gameInst.enemies);
		for (let i = this.gameInst.enemies.length-1; i >= 0; i--)
		{
			this.gameInst.despawnEnemy(this.gameInst.enemies[i]);
		}
		// this.gameInst.enemies = [];
		this.gameInst.corpses = [];
		for (let pickup of this.gameInst.pickups)
		{
			this.gameInst.despawnPickup(pickup);
		}
		this.gameInst.pickups = [];

		let player = this.gameInst.Player;
		player.x = this.gameInst.fieldW / 2;
		player.y = this.gameInst.fieldH / 2;
		player._health = 100;
		player._armor = 0;
		player._armor_type = false;
		player.isDeath = false;
		//set player inventory
		//set ammos
		Game.Player.inventory.setAmmo("shells", 0)
		Game.Player.inventory.setAmmo("rockets", 0)
		Game.Player.inventory.setAmmo("cells", 0)
		Game.Player.inventory.setAmmo("clips", 200)
		//set weapons
		Game.Player.inventory.setWeapon("chainsaw", false)
		Game.Player.inventory.setWeapon("shotgun", false)
		Game.Player.inventory.setWeapon("chaingun", false)
		Game.Player.inventory.setWeapon("rocket", false)
		Game.Player.inventory.setWeapon("plasma", false)
		Game.Player.inventory.setWeapon("bfg", false)
		//update hud
		this.gameInst.hud.displayWeapon();
		this.gameInst.hud.displayArmor();
		this.gameInst.hud.displayHealth(0, Game.Player);

		this.isPlayerDeath = false;
		this.currentStage = 1;
		this.score = 0;
		console.log(this.gameInst.enemies, this.gameInst.corpses, this.gameInst.corpses);
	}
}