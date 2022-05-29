var Textures = {}, Sounds = {};
var resCount, curLoadedCount = 0;
var alphabet = ["A", "B", "C", "D", "E","F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W"];
var animMatrix = [];
function setAnimMatrix() {
	for (let i = 0; i < alphabet.length; i++)
	{
		let k = 8;
		animMatrix[i] = [];
		for (let j = 0; j < 9; j++)
		{
			if (j == 0 || (j >= 4 && j < 8) )
				animMatrix[i][j] = alphabet[i] + (j+1);
			else if (j == 8)
				animMatrix[i][j] = alphabet[i] + 0;
			else
			{
				animMatrix[i][j] = alphabet[i] + (j+1) + alphabet[i] + k;
				k--;
			}
		}
	}
}
function setRevenantAnimMatrix(argument) {
	let am = [];
	for (let i = 0; i < alphabet.length; i++)
	{
		let k = 8;
		am[i] = [];
		for (let j = 0; j < 9; j++)
		{
			if (j == 8)
				am[i][j] = alphabet[i] + 0;
			else
			{
				if (i >= 0 && i <= 2)
				{
					if (j == 0)
					{
						am[i][j] = alphabet[i] + (j+1) + alphabet[i+3] + 1
					}
					else
					{
						am[i][j] = alphabet[i] + (j+1) + alphabet[i+3] + k
						k--;
					}
				}
				else
				{
					am[i][j] = alphabet[i] + (j+1)
				}
			}
		}
	}
	return am;
}

var Game = new class
{
	cOffsetX = 0; cOffsetY = 0;
	lastOffsetX = 0; lastOffsetY = 0;
	levelW; levelH;
	enemies = [];
	pickups = [];
	walls = [];
	activators = [];
	doors = [];
	corpses = [];
	lastCorpsesCount = 0;
	chainsawIdleSound;
	collidedActors = 0;
	collideAbleActors = 0;
	// availableWeapons = ["chainsaw", "pistol", "shotgun", "chaingun", "rocket", "plasma", "bfg"];
	isResourcesLoaded = false;
	isPlayerInteract = false;
	onWeaponChange() {}
	get load() {
    return Game.isResourcesLoaded;
  }
  get SightW()
  {
  	return Game.fieldW - Game.cOffsetX;
  }
  get SightH()
  {
  	return Game.fieldH - Game.cOffsetY;
  }
  get SightZX()
  {
  	return 0 - Game.cOffsetX
  }
  get SightZY()
  {
  	return 0 - Game.cOffsetY
  }
  set load(value) {
    Game.isResourcesLoaded = value;
    if (Game.isResourcesLoaded)
    Game.run();
  }
	Player = new Player()//Actor('PLAY', 10, 10, 2);
	// playerWeapons = [new ChainSaw(this.Player), new Pistol(this.Player), new Shotgun(this.Player), new ChainGun(this.Player),
	// 	new RocketLauncher(this.Player), new PlasmaGun(this.Player), new BigFuckingGun(this.Player)];
	constructor()
	{
		this.input = new PCInput(this.Player);
		this.hud = new HUD(this.Player);
		// console.log(this.input);
		this.canv = document.getElementById('field');
		this.ctx = this.canv.getContext('2d');
		this.canv.width = window.innerWidth;
		this.canv.height = window.innerHeight;
		this.fieldW = this.canv.width - 50;
		this.fieldH = this.canv.height - 60;
		this.static = document.getElementById('static');
		this.static.width = window.innerWidth;
		this.static.height = window.innerHeight;
		this.staticContext = this.static.getContext('2d');

		this.gamemode = new Infinitegame(this, 60, 15, 350);

		this.levelW = 0;
		this.levelH = 0;

	}
	pressedKeys = [false, false, false, false];
	inputOn(event)
	{
		Game.isPlayerInteract = true;
		let key = event.keyCode;
		if (key >= 48 && key <= 57)
		{
			// switch(key)
			// {
			// 	case 49:
			// 		Game.takeWeapon(0)
			// 		break;
			// 	case 50:
			// 		Game.takeWeapon(1)
			// 		break;
			// 	case 51:
			// 		Game.takeWeapon(2)
			// 		break;
			// 	case 52:
			// 		Game.takeWeapon(3)
			// 		break;
			// 	case 53:
			// 		Game.takeWeapon(4)
			// 		break;
			// 	case 54:
			// 		Game.takeWeapon(5)
			// 		break;
			// 	case 55:
			// 		Game.takeWeapon(6)
			// 		break;
			// }
		}
		else
		{
			if (key === 87)
				Game.pressedKeys[0] = true;
			else if (key === 68)
				Game.pressedKeys[1] = true;
			else if (key === 83)
				Game.pressedKeys[2] = true;
			else if (key === 65)
				Game.pressedKeys[3] = true;
			Game.determineDirection();
		}
	}
	inputOff(event)
	{
		let key = event.keyCode;
		if (key === 87)
			Game.pressedKeys[0] = false;
		else if (key === 68)
			Game.pressedKeys[1] = false;
		else if (key === 83)
			Game.pressedKeys[2] = false;
		else  if (key === 65)
			Game.pressedKeys[3] = false;
		Game.determineDirection();
	}
	takeWeapon(index)
	{
		// console.log("take")
		if (Game.Player.inventory.getWeapon(Game.givenWeapons[index]))
			Game.currentWeapon = Game.playerWeapons[index]
		else
			console.log("No Weapon")
		console.log(Game.currentWeapon.constructor.name)
	}
	determineDirection()
	{
		if (Game.pressedKeys[0] && Game.pressedKeys[1])
			Game.Player.direction = "UR";
		else if (Game.pressedKeys[0] && Game.pressedKeys[3])
			Game.Player.direction = "UL";
		else if (Game.pressedKeys[2] && Game.pressedKeys[1])
			Game.Player.direction = "DR";
		else if (Game.pressedKeys[2] && Game.pressedKeys[3])
			Game.Player.direction = "DL";
		else if (Game.pressedKeys[0])
			Game.Player.direction = "U";
		else if (Game.pressedKeys[1])
			Game.Player.direction = "R";
		else if (Game.pressedKeys[2])
			Game.Player.direction = "D";
		else if (Game.pressedKeys[3])
			Game.Player.direction = "L";
		else
			Game.Player.direction = "I";
	}
	update(currentTime)
	{
		Game.QT.rebuild()
		if (Game.Player.isDeath && !Game.gamemode.isPlayerDeath) 
			{
				// console.log("Mode-Player = ", Game.gamemode.isPlayerDeath, Game.Player.isDeath)
				Game.gamemode.onDeath();
			}
		if ( Game.Player.currentWeapon.constructor.name == "ChainSaw")
		{
			if ( Game.chainsawIdleSound === undefined || Game.chainsawIdleSound.paused )
			{
				Game.chainsawIdleSound = playSound("DSSAWIDL");
			}
		}

		if (Game.cOffsetX != Game.lastOffsetX || Game.cOffsetY != Game.lastOffsetY || 
			Game.lastCorpsesCount != Game.corpses.length )
		{
			// console.log(Game.cOffsetX, Game.cOffsetY)
			Game.lastOffsetX = Game.cOffsetX;
			Game.lastOffsetY = Game.cOffsetY;
			Game.staticContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
			Game.walls.forEach(function(wall) {
				DrawWall(wall);
			});
			Game.corpses.forEach(function(item) {
				Game.staticContext.drawImage(Textures[item.texture], item.x +Game.cOffsetX, item.y +Game.cOffsetY)
			});
			Game.lastCorpsesCount = Game.corpses.length;
		}

		if (Game.lastTime == 0) Game.lastTime = currentTime
		Game.elapsedTime = currentTime - Game.lastTime;
		Game.lastTime = currentTime;
		//#####INPUT//#####
		switch(Game.Player.direction)
		{
			case "U":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
				// Game.Player.runAnim(4, "walk", false);
				Game.Player.setVelocity(0, -1);
			break;
			case "R":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
				// Game.Player.runAnim(6, "walk", false);
				Game.Player.setVelocity(1);
			break;
			case "D":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
				// Game.Player.runAnim(0, "walk", false);
				Game.Player.setVelocity(0, 1);
			break;
			case "L":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
				// Game.Player.runAnim(2, "walk", false);
				Game.Player.setVelocity(-1);
			break;
			case "UL":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
				// Game.Player.runAnim(3, "walk", false);
				Game.Player.setVelocity(-1, -1);
			break;
			case "DL":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
				// Game.Player.runAnim(1, "walk", false);
				Game.Player.setVelocity(-1, 1);
			break;
			case "UR":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
			// 	Game.Player.runAnim(5, "walk", false);
				Game.Player.setVelocity(1, -1);
			break;
			case "DR":
				if (!Game.wantsFire || !Game.Player.currentWeapon.canFire)
			// 	Game.Player.runAnim(7, "walk", false);
				Game.Player.setVelocity(1, 1);
			break;
			default:
				Game.Player.setVelocity();
			break;
		}

		Game.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		CheckAllCollisions(Game.QT, Game.elapsedTime);
		// CheckAllCollisionsAsync(Game.elapsedTime);
		// console.log("update after collision check")
		if (0 != Game.Player.velocity[1] || Game.Player.velocity[0] != 0)
			Game.Player.move();
		//#####END INPUT//#####
		//#####DRAW&&UPDATE//#####
		Game.Player.update(Game.elapsedTime);
		Game.ctx.drawImage(Textures[Game.Player.getAnimation()], Game.Player.x, Game.Player.y);

		Game.enemies.forEach(function(actor) {
			// if (actor.idleImg.includes("BOSS") ) console.log(actor.target);
			// CheckCollisionForActor(Game.QT, Game.elapsedTime, actor)
			actor.update(Game.elapsedTime);
			// Game.QT.insert(actor)
			// if (actor.getAnimation().includes("MISL")) console.log(actor.getAnimation())
			Game.ctx.drawImage(Textures[actor.getAnimation()], actor.x, actor.y);
		});

		Game.pickups.forEach(function(actor) {
			// console.log("actor: " + actor.getAnimation())
			// CheckCollisionForActor(Game.QT, Game.elapsedTime, actor)
			actor.update(Game.elapsedTime);
			// Game.QT.insert(actor)
			Game.ctx.drawImage(Textures[actor.getAnimation()], actor.x, actor.y);
		});

		Game.particles.forEach(function(actor) {
			actor.update(Game.elapsedTime)
			Game.ctx.drawImage(Textures[actor.getAnimation()], actor.x, actor.y);
		});
		Game.doors.forEach(function(actor) {
			actor.update(Game.elapsedTime);
			Game.staticContext.clearRect(actor.x, actor.y, actor.w, actor.maxH);
			DrawWall(actor, Game.ctx);
		});

		Game.hud.update(currentTime);

		let pua = false; // is pointer under activator
		Game.activators.forEach(function(actor) {
			actor.update(Game.elapsedTime);
			Game.ctx.drawImage(Textures[actor.getAnimation()], actor.x, actor.y);
			if (!pua)
			{
				pua = PointVsAABB({x: Game.input.pointerX, y: Game.input.pointerY}, getBoundary(actor));
				if (pua) Game.Player.currentActivator = actor;
			}
		});
		Game.input.pointerUnderActivator = pua;
		if (pua)
			Game.ctx.drawImage(Textures['USE'], Game.input.pointerX-11, Game.input.pointerY-11, 32, 32);
		else
			Game.ctx.drawImage(Textures['CROSSH'], Game.input.pointerX-11, Game.input.pointerY-11, 22, 22);
		// BaseWeapon.QTree = Game.QT;
		// CheckCollisionForActor(Game.QT, Game.elapsedTime, Game.Player)
		// Game.QT.insert(Game.Player)
		//#####END UPDATE&DRAW//#####

		// let retreatArea = getBoundary(Enemy.Player);
		// 	retreatArea.x -= Game.enemies[0].distToPlayer;
		// 	retreatArea.y -= Game.enemies[0].distToPlayer;
		// 	retreatArea.width = Game.enemies[0].distToPlayer*2;
		// 	retreatArea.height = Game.enemies[0].distToPlayer*2;

		// 	let idleArea = getBoundary(Enemy.Player);
		// 	idleArea.x -= Game.enemies[0].chaseDist;
		// 	idleArea.y -= Game.enemies[0].chaseDist;
		// 	idleArea.width = Game.enemies[0].chaseDist*2;
		// 	idleArea.height = Game.enemies[0].chaseDist*2;

		// Game.ctx.strokeStyle = "black";
		// Game.ctx.strokeRect(retreatArea.x, retreatArea.y, retreatArea.width, retreatArea.height);

		// Game.ctx.strokeStyle = "red";
		// Game.ctx.strokeRect(idleArea.x, idleArea.y, idleArea.width, idleArea.height);

		// let boundary =
		// {
		// 	x: (Game.Player.x < Game.Mx) ? Game.Player.x : Game.Mx,
		// 	y: (Game.Player.y < Game.My) ? Game.Player.y : Game.My,
		// 	width: (Game.Player.x < Game.Mx) ? (Game.Mx - Game.Player.x) : (Game.Player.x - Game.Mx),
		// 	height:(Game.Player.y < Game.My) ? (Game.My - Game.Player.y) : (Game.Player.y - Game.My)
		// };
		// let diagonal = Math.sqrt(Math.pow(boundary.width, 2) + Math.pow(boundary.height, 2));
		// let dir = [Game.Player.x - Game.Mx, Game.Player.y - Game.My]; //[boundary.x+boundary.width - boundary.x, boundary.y+boundary.height - boundary.y];
		// let length = Math.sqrt(Math.pow(dir[0], 2) + Math.pow(dir[1], 2));
		// let dist = 500;
		// if (diagonal > dist)
		// {
		// 	let norm = [dir[0]/length, dir[1]/length];
		// 	let point = [Game.Player.x-(dist*norm[0]), Game.Player.y-(dist*norm[1])];
		// 	boundary.x = point[0] < Game.Player.x ? point[0] : Game.Player.x;
		// 	boundary.y = point[1] < Game.Player.y ? point[1] : Game.Player.y;
		// 	boundary.width = point[0] > Game.Player.x ? point[0] - Game.Player.x : Game.Player.x - point[0];
		// 	boundary.height = point[1] > Game.Player.y ? point[1] - Game.Player.y : Game.Player.y - point[1];
		// }

		// Game.QT.visualize(Game.ctx);

		// console.log(Game.QT)
		// Game.ctx.strokeStyle = "black"
		// Game.ctx.strokeRect(boundary.x, boundary.y, boundary.width, boundary.height);

		// let bnd = getBoundary(Game.Player);
		// let diagonal = Math.sqrt(Math.pow(bnd.width, 2) + Math.pow(bnd.height, 2));
		// let range =
		// {
		// 	x: bnd.x - diagonal,
		// 	y: bnd.y - diagonal,
		// 	width: bnd.width*5,
		// 	height: bnd.height*3
		// }
		// Game.ctx.strokeRect(range.x, range.y, range.width, range.height);

		// let circleBoundary =
		// {
		// 	x: Game.Mx, //Game.fieldW/2,
		// 	y: Game.My,
		// 	r: 100
		// }

		// if (circleIntersect(getBoundary(Game.Player), circleBoundary)) Game.ctx.strokeStyle = "red";
		// else Game.ctx.strokeStyle = "black";

		// Game.ctx.beginPath();
		// Game.ctx.arc(circleBoundary.x, circleBoundary.y, circleBoundary.r, 0, 2 * Math.PI);
		// Game.ctx.stroke();
		// let actorsInRange = Game.QT.circleQuery(circleBoundary)
		// // let actorsInRange = Game.QT.query(boundary)
		// actorsInRange.forEach(function(actor) {
		// 	Game.ctx.strokeStyle = "red"
		// 	Game.ctx.strokeRect(actor.x, actor.y, 50, 50);
		// });


		//#####LOOP//#####
		Game.gamemode.update(Game.elapsedTime);
		window.requestAnimationFrame(Game.update);

	}

	summonEnemy(enemy)
	{
		Game.enemies.push(enemy); //
		Game.QT.insert(enemy);
	}
	summonParticle(particle) { Game.particles.push(particle); }

	despawnEnemy(enemy)
	{
		if (enemy === Game.Player) return;
		let i = Game.enemies.indexOf(enemy);
		if (i > -1) Game.enemies.splice(i, 1);
		Game.QT.remove(enemy);

	}
	despawnCorpse(corpse)
	{
		let i = Game.corpses.indexOf(corpse);
		if (i > -1) Game.corpses.splice(i, 1);

	}
	despawnPickup(pick)
	{
		let i = Game.pickups.indexOf(pick);
		if (i > -1)
		{
			Game.pickups.splice(i, 1);
			Soldier.pickableAmmo["soldier"] = Soldier.getPickableAmmo()
			Soldier.pickableAmmo["sergeant"] = Sergeant.getPickableAmmo()
		}
		Game.QT.remove(pick);
	}
	despawnParticle(particle)
	{
		let i = Game.particles.indexOf(particle);
		if (i > -1)
			Game.particles.splice(i, 1);
	}

	placeCorpse(actor, isMega = false)
	{
		if (actor.idleImg == "SKUL") return;
		let crp = isMega ? "megadeath" : "death";
		let conf = actor.animConf;
		let genLen = 0;
		for (const [key, value] of Object.entries(conf)) {
  			genLen += value;
		}
		actor.animState[1] = 8;
		let unusedFrames = 0, bComputeUnused = false;
		for (const [key, value] of Object.entries(conf)) {
  			if (key != crp && bComputeUnused) unusedFrames += value;
  			else if (key == crp) bComputeUnused = true;
		}
		actor.animState[0] = genLen - unusedFrames - 1;

		let corpse = {x: actor._x, y: actor._y, texture: actor.getAnimation()};
		Game.corpses.push(corpse);

		Game.staticContext.drawImage(Textures[actor.getAnimation()], actor.x, actor.y);
		Game.lastCorpsesCount = Game.corpses.length;
	}

	newLevel(level)
	{
		console.log(level);
		Game.levelW = level.level.width;
		Game.levelH = level.level.height;
		Game.Player._x = level.level.playerStartX
		Game.Player._y = level.level.playerStartY
		console.log(Game.Player.x, Game.Player.y)
		for (let i = 1; i <= 3; i++)
		{
			let wall = new Wall("W28_5", "CEIL5_1", 100*i, 0, 30, 100, 76*i); // deltaZ = 50, z -/+= newH - deltaZ
			Game.walls.push(wall);
			console.log(wall.x, wall.y);
			this.QT.insert(wall);
		}
		Game.cOffsetX = level.level.startOffsetX;
		Game.cOffsetY = level.level.startOffsetY;
	}

	run()
	{
		Enemy.Player = Game.Player;
		Actor.fieldW = Game.fieldW;
		Actor.fieldH = Game.fieldH;

		// Game.Player.canTakeDamage = false;
		Game.Player.inventory.setAmmo("shells", 0)
		Game.Player.inventory.setAmmo("rockets", 0)
		Game.Player.inventory.setAmmo("clips", 200)
		Game.Player.inventory.setAmmo("cells", 0)
		// Game.Player.inventory.setWeapon("rocket", true)
		Game.Player.x = Game.fieldW / 2;
		Game.Player.y = Game.fieldH / 2;
		// Game.Player.canTakeDamage = false;
		this.hud.displayWeapon();
		this.hud.displayArmor();
		this.hud.displayHealth(0, Game.Player);

		BaseWeapon.DrawComponent = Game.ctx;

		this.lastTime = 0;
		this.elapsedTime = 0;
		this.wantsFire = false;
		this.Mx = 0;
		this.My = 0;
		this.particles = [];
		// for (const [key, value] of Object.entries(Sounds)) {
		//  			console.log(Sounds[key])
		// 	}
		// let am = animMatrix;
		// am.forEach(function(exp) {
		// 	var str = "";
		// 	exp.forEach(function(a) {
		// 		str = str + " " + a;
		// 	});
		// 	console.log(str);
		// 	str = "";
		// });

		let maxSide = Game.fieldW > Game.fieldH ? Game.fieldW : Game.fieldH;
		this.QT = new Node(0, 0, maxSide, Game, 10);
		this.QT.insert(Game.Player);
		// console.log(this.QT);

		Soldier.pickableAmmo["soldier"] = Soldier.getPickableAmmo()
		Soldier.pickableAmmo["sergeant"] = Sergeant.getPickableAmmo()

		BaseWeapon.QTree = Game.QT;

		document.addEventListener('keydown', Game.inputOn);
		document.addEventListener('keyup', Game.inputOff);
		// this.canv.addEventListener('mousemove', function(evt) {
        // Game.Mx = evt.clientX; Game.My = evt.clientY;
        // }, false);
        this.canv.addEventListener('mousedown', function(e) {
        	Game.isPlayerInteract = true;
        	Game.wantsFire = true;
        });
        this.canv.addEventListener('mouseup', function(e) {
        	Game.wantsFire = false;
        });


		Game.walls.forEach(function(wall) {
			DrawWall(wall);
		});

		window.requestAnimationFrame(Game.update);

		// Game.newLevel(EOneMOne);

		// for(let i = 1; i < 0; i++)
		// {
		// 	let imp = new Imp(i*250, i*250)
		// 	Game.enemies.push(imp);
		// 	this.QT.insert(imp);
		// }
		for (let i = 1; i <= 6; i++)
		{
			let wall = new Wall("W28_5", "CEIL5_1", 100, 200, 30, 100, 100); // deltaZ = 50, z -/+= newH - deltaZ
			switch(i)
			{
				case 1:
				wall.x = 100; wall.y = 100; wall.h = 200;
				break;
				case 2:
				wall.x = 200; wall.y = 100;

				break;
				case 3:
				wall.x = Game.fieldW-300; wall.y = Game.fieldH-100; 

				break;
				case 4:
				wall.x = Game.fieldW-200; wall.y = Game.fieldH-200; wall.h = 200;

				break;
				case 5:
				wall.x = Game.fieldW/2 - 250; wall.y = Game.fieldH/2 - 150; wall.w = 200;

				break;
				case 6:
				wall.x = Game.fieldW/2 + 100; wall.y = Game.fieldH/2 + 50; wall.w = 200;

				break;
			}
			Game.walls.push(wall);
			this.QT.insert(wall);
		}
		Game.walls.forEach(function(wall) {
				DrawWall(wall);
			});
	}
};

function DrawWall(wall, context = Game.staticContext)
{
	let edgeY = wall.y + wall.h - wall.z, edgeH = wall.h - (wall.h - wall.z), ind, newW, newH;
	//draw floor
	let floorW = Textures[wall.floor].width, floorH = Textures[wall.floor].height;
	for (let j = 0; j <= Math.floor( (wall.h - wall.z) / floorH ) ; j++) //Math.floor( (wall.h -  wall.z) / floorH )
	{
		for (let i = 0; i < Math.floor(wall.w / floorW); i++)
		{
			if (j != Math.floor((wall.h - wall.z) / floorH)	)
			{
				context.drawImage(Textures[wall.floor], wall.x + (floorW * i), wall.y + (floorH * j));
			}
			else
			{
				context.drawImage(Textures[wall.floor], wall.x + (floorW * i), wall.y + (floorH * j),
				 Textures[wall.floor].width, (wall.h - wall.z) - (floorH * j) );

			}
			ind = i + 1;
		}
		newW = (wall.x + wall.w) - (wall.x + (floorW * ind));
		if (j != Math.floor(wall.h / floorH))
			context.drawImage(Textures[wall.floor], wall.x + (floorW * ind), wall.y + (floorH * j), newW, Textures[wall.floor].height);
		else
		{
			context.drawImage(Textures[wall.floor], wall.x + (floorW * ind), wall.y + (floorH * j),
				newW, (wall.h - wall.z) - (floorH * j));
		}
	}
	//draw edge
	let edgeW = Textures[wall.wall].width, edgeRH = Textures[wall.wall].height;
	for (let j = 0; j <= Math.floor(edgeH / edgeRH); j++) //Math.floor(edgeH / edgeRH)
	{
		for (let i = 0; i < Math.floor(wall.w / edgeW); i++)
		{
			if (j != Math.floor(edgeH / edgeRH) )
				context.drawImage(Textures[wall.wall], wall.x + (edgeW * i), edgeY + (edgeRH*j), edgeW, edgeRH);
			else
				context.drawImage(Textures[wall.wall], wall.x + (edgeW * i), edgeY + (edgeRH*j), edgeW, edgeH - (edgeRH * j) );
			ind = i + 1;
		}
		newW = (wall.x + wall.w) - (wall.x + (edgeW * ind));
		if (j != Math.floor(edgeH / edgeRH) )
			context.drawImage(Textures[wall.wall], wall.x + (edgeW * ind), edgeY + (edgeRH*j), newW, edgeRH);
		else
			context.drawImage(Textures[wall.wall], wall.x + (edgeW * ind), edgeY + (edgeRH*j), newW, edgeH - (edgeRH * j) );
	}
	// Game.staticContext.strokeStyle = "black";
	// Game.staticContext.strokeRect(wall.x, edgeY, wall.w, edgeH);
}


function notifyLoading()
{
	curLoadedCount++;
	if (curLoadedCount >= resCount)
	{
		Game.load = true;
	}
	// console.log(curLoadedCount)
}
function loadResources()
{
	let mydata = JSON.parse(data);
	resCount = mydata.sprites.length;
	console.log("loading... " + resCount);
	let key, temp;
	mydata.sounds.forEach(function(exp)
	{
		temp = exp.split("/");
		key =  temp[temp.length-1].substring(0, temp[temp.length-1].indexOf('.'));
		Sounds[key] = exp;
		// Sounds[key].onloadeddata = function() {
			// notifyLoading()
		// }
	});
	mydata.sprites.forEach(function(exp)
	{
		temp = exp.split("/");
		key =  temp[temp.length-1].substring(0, temp[temp.length-1].indexOf('.'));
		Textures[key] = new Image();
		Textures[key].src = exp;
		Textures[key].onload = function(a) {
			notifyLoading();
		}
	});
	setAnimMatrix();
}

function CheckAllCollisionsAsync(elapsedTime = 0)
{
	let actors = Game.enemies.concat(Game.pickups, Game.walls, Game.doors, Game.activators);
	actors.push(Game.Player);
	Game.collidedActors = 0;
	Game.collideAbleActors = actors.length;
	// console.log(Game.collideAbleActors);
	for(let other of actors)
		CheckAllCollisionsForActor(other, actors, elapsedTime);
	while(Game.collidedActors < Game.collideAbleActors)
	{
		//do nothig.. wait...
	}
}

async function CheckAllCollisionsForActor(other, actors, elapsedTime)
{
	for(let actor of actors)
	{
		if ( actor === other ) continue;
		else if (!actor.collisionable || !other.collisionable)
		{
			let cp = [], cn = [], tNear = {val: 0};
			if (DynamicAABBs(getBoundary(actor), getBoundary(other), cp, cn, tNear, elapsedTime * 0.25))
			{
				other.onCollision(actor);
				actor.onCollision(other);
			}
		}
		else if ( SolveCollision(getBoundary(actor), getBoundary(other), actor, elapsedTime) )
		{
			other.onCollision(actor);
			actor.onCollision(other);
		}
		// else
		// {console.log("fuck you! " + elapsedTime)}
	}
	// console.log(Game.collidedActors);
	Game.collidedActors++;

}

function CheckAllCollisions(Tree, elapsedTime)
{
	// console.log("Start tree traversing");
	if (Tree.objects.length > 0)
	for (let actor of Tree.objects)
	{
		for (let other of Tree.objects)
		{
			// if (actor === Game.Player)
			// {
			// }
			// Game.ctx.strokeRect(actor.x, actor.y, 50, 50)
			if ( actor === other ) continue;
			else if (!actor.collisionable || !other.collisionable)
			{
				let cp = [], cn = [], tNear = {val: 0};
				if (DynamicAABBs(getBoundary(actor), getBoundary(other), cp, cn, tNear, elapsedTime * 0.25))
				{
					other.onCollision(actor);
					actor.onCollision(other);
				}
			}
			else if ( SolveCollision(getBoundary(actor), getBoundary(other), actor, elapsedTime) )
			{

				other.onCollision(actor);
				actor.onCollision(other);
			}
		}
	}
	if (Tree.divided)
	{
		let nodes = Tree.getChilds();
		for (let node of nodes)
		{
			// console.log("Start checking child nodes, FOR level -" + Tree.level)
			CheckAllCollisions(node, elapsedTime);
		}
	}
	// console.log("End tree traversing.");
}

function getBoundary(actor)
{
	let anim = ""
	if (actor.z == undefined)
	{
		anim = actor.getAnimation();
	}
	let bound =
	{
		x: actor.x,
		y: actor.y,
		width: actor.z == undefined ? Textures[anim].width : actor.w,
		height: actor.z == undefined ? Textures[anim].height : actor.h,
		velocity: actor.velocity != undefined ? actor.velocity : [0, 0]
	};
	return bound;
}

loadResources();
