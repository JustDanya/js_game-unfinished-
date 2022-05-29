const Melee = 100;
function alertForArea(x, y, r)
{
	let circle =
	{
		x: x,
		y: y,
		r: r
	};

	let alertedActors = Game.QT.circleQuery(circle);
	for (let actor of alertedActors)
	{
		if (actor.isActivated !== undefined)
			actor.isActivated = true;
	}
}
function AoEDamage(range, damage, instigator, frendlyFire = true)
{
	let actors = Game.QT.circleQuery(range), hited = [];
	if (actors.length > 0)
	{
		for (let actor of actors)
		{
			if ( actor !== instigator && (frendlyFire || (instigator.owner === undefined || instigator.owner !== actor) )
					&& !(actor._health === undefined || actor._health <= 0) )
			{
				hited.push(actor)
			}
		}
	}
	instigator = instigator.owner === undefined ? instigator : instigator.owner;
	for (let ht of hited)
		ht.makeDamage(-damage, instigator)
	// console.log(damage + " ; "+ instigator)
	return hited;
}
function playSound(snd)
	{
		if (Game.isPlayerInteract && snd !== undefined)
		{
			let src = "";
			if (snd.constructor === Array)
			{
				let ind = Math.floor( Math.random() * snd.length );
				// console.log(ind + " IS ARRAY " + snd[ind])
				if (Sounds[snd[ind]] !== undefined)
					src = Sounds[snd[ind]]
					// Sounds[snd[ind]].play();
			}
			else if (Sounds[snd] !== undefined)
				src = Sounds[snd]
				// Sounds[snd].play();
			// console.log(src)
			if (src !== "")
			{

				let sound = new Audio(src);
				sound.play();
				return sound;
			}
		}
	}
class AnimManager
{
	currentAnimation = "none";
	progress = -1;
	owner;
	delay = 125;
	canDraw = true;
	direction = 0;
	saveOffset = false;
	constructor(owner)
	{
		this.owner = owner;
	}
	startAnimation(dir, name, safeOffset = false, freeze = 250, prg = -1)
	{
		this.direction = dir;
		this.currentAnimation = name;
		this.saveOffset = safeOffset;
		this.delay = freeze;
		this.progress = prg;
		this.owner.isAnimPlaying = true;
		// this.canDraw = true;
		// if (this.owner.idleImg.includes("PUF")) console.log("PARTICLE START PLAY " + this.progress)
	}

	makeAnimation()
	{
		// if (this.owner.idleImg.includes("PUF")) console.log(this.owner.animConf)
		let conf = this.owner.animConf;
		if (conf[this.currentAnimation] != undefined)
		{
			if (!this.owner.isAnimPlaying) this.owner.AnimPlaying = true;

			let genLen = 0;
			for (const [key, value] of Object.entries(conf)) {
	  			genLen += value;
			}
			this.owner.animState[1] = this.direction;
			if (this.progress == -1)
			this.progress = conf[this.currentAnimation];
			let unusedFrames = 0, bComputeUnused = false;
			for (const [key, value] of Object.entries(conf)) {
	  			if (key != this.currentAnimation && bComputeUnused) unusedFrames += value;
	  			else if (key == this.currentAnimation) bComputeUnused = true;
			}
			this.owner.animState[0] = genLen - this.progress - unusedFrames;
			this.progress -= 1;
		}
		// if (this.owner.getAnimation() == "BAL7A0") console.log("SUCK SOME DICK!!");
	}
	continueAnimation()
	{
		// if (this.owner.idleImg.includes("PUF")) console.log("PARTICLE START PLAY, Progress " + this.progress)
		if (this.canDraw)
		{
			if (this.progress == 0)
			{
				this.owner.isAnimPlaying = false;
				if (!this.saveOffset)
					this.owner.animState = [0,this.direction];
				return;
			}
			else
			{

				this.canDraw = false;
				setTimeout( () =>  this.canDraw = true, this.delay);
				this.makeAnimation();
			}
		}
	}

}

class Actor
{
	static fieldW;
	static fieldH;
	pickConf =
	{
		med : false,
		armor : false,
		ammo : false
	};
	inventory = new Inventory();
	collisionable = true;
	Node;
	canTakeDamage = true;
	MaxHealth = 100;
	_health = 100;
	onHealthChange(value, attacker) {	}
	audioConf = {};
	onPickupPicked(pick) {}
	center()
	{
		let b = getBoundary(this);
		return {x: b.x + b.width/2, y: b.y + b.height/2}; 
	}
	makeDamage(value, attacker)
	{
		if (!this.canTakeDamage || this._health <= 0) return;
		this._health += value;
		if (this._health > 0)
		{
			if (value < 0)
			{
				if (this.animConf["hited"] !== undefined && this.animConf["hited"] > 0 && Math.random() < 0.25)
				this.runAnim(this.determineDirection(), "hited", false, 400);
				playSound(this.audioConf["hited"])
			}
			else
			{
				if (value >= 100 || value == 1)
				{
					if (this._health > this.MaxHealth*2)
						this._health = this.MaxHealth*2;
				}
				else
				{
					if (this._health > this.MaxHealth)
						this._health = this.MaxHealth;
				}
			}
		}
		else
		{
			this.onDeath();
			if (this._health > (this.MaxHealth / 5 * -1) )
			{
				this.runAnim(8, "death", true);
				// console.log(this.audioConf["death"])
				let dth = this.audioConf["death"];
				playSound(dth)
			}
			else
			{
				if (this.audioConf["megadeath"] !== undefined)
					playSound(this.audioConf["megadeath"])
				else
				{
					let dth = this.audioConf["death"];
					playSound(this.audioConf["death"])
				}
				if (this.animConf["megadeath"] > 0)
					this.runAnim(8, "megadeath", true);
				else
					this.runAnim(8, "death", true);
			}
		}
		this._health = Math.floor(this._health);
		this.onHealthChange(value, attacker);
	}
	isAnimPlaying = false;
	isDeath = false;
	idleImg;
	_x;
	get x()
	{
		return this._x + Game.cOffsetX;
	}
	set x(value)
	{
		this._x = value
	}
	_y;
	get y()
	{
		return this._y + Game.cOffsetY;
	}
	set y(value)
	{
		this._y = value
	}
	animConf = {
		"walk" : 4,
		"attack" : 2,
		"hited" : 1,
		"death" : 7,
		"megadeath" : 9
	};
	animState = [0,0];
	speed;
	direction;
	constructor(img, x, y, spd)
	{
		this.idleImg = img;
		this._x = x;
		this._y = y;
		this.speed = spd;
		this.velocity = [];
		this.velocity.push(0);
		this.velocity.push(0);
		this.animComponent = new AnimManager(this);
	}
	onDeath()
	{
		//
	}
	get playingAnim()
	{
		return this.animComponent.currentAnimation;
	}
	move(elapsed = 1)
	{
		elapsed = Game.elapsedTime * 0.05;
		this._x += this.velocity[0] * elapsed;
		this._y += this.velocity[1] * elapsed;

		if (this._x > Game.SightW || this._x < Game.SightZX || this._y > Game.SightH || this._y < Game.SightZY )
			this.onCollision(null);

		if ( this._x > Game.SightW )
			this._x = Game.SightW;
		else if ( this._x < Game.SightZX )
			this._x = Game.SightZX;

		if ( this._y > Game.SightH )
			this._y = Game.SightH;
		else if ( this._y < Game.SightZY )
			this._y = Game.SightZY;

	}
	setVelocity(x = 0, y = 0)
	{
		if (x == 1) this.velocity[0] = this.speed;
		else if (x == -1) this.velocity[0] = this.speed * -1;
		else this.velocity[0] = 0;

		if (y == 1) this.velocity[1] = this.speed;
		else if (y == -1) this.velocity[1] = this.speed * -1;
		else this.velocity[1] = 0
	}
	getAnimation()
	{
		return this.idleImg+animMatrix[this.animState[0]][this.animState[1]];  // animState[1] - dir, animState[0] - progress
	}
	set AnimPlaying(value)
	{
	    this.isAnimPlaying = value;
  	}
  	onCollision(other)
  	{
  		//
  	}
  	runAnim(dir, name, safeOffset = false, freeze = 100, prg = -1)
  	{
  		this.animComponent.startAnimation(dir, name, safeOffset, freeze, prg);
  	}
  	update(ftime)
  	{
  		this.elapsedTime = ftime;
  		if (this._health <= 0)
  		{
  			let an = this.playingAnim;
  			if (an != "death" && an != "megadeath")
  			{
  				let isMega = false;
  				if (this.animConf["megadeath"] !== undefined && (this._health < (this.MaxHealth / 5 * -1)) ) isMega = true;
  				Game.placeCorpse(this, isMega)
  				Game.despawnEnemy(this);
  				return;
  			}
  		}
  		this.animComponent.continueAnimation();//
  	}
	determineDirection()
	{
		let vel = [];
		if (this.velocity[0] > 0) vel[0] = 1;
		else if (this.velocity[0] < 0) vel[0] = -1;
		else vel[0] = 0;
		if (this.velocity[1] > 0) vel[1] = 1;
		else if (this.velocity[1] < 0) vel[1] = -1;
		else vel[1] = 0;

		if (vel[0] != 0 && vel[1] != 0)
		{
			if (vel[0] == 1 && vel[1] == 1) //DR
				return 7;
			else if (vel[0] == 1 && vel[1] == -1) //UR
				return 5;
			else if (vel[0] == -1 && vel[1] == -1) //UL
				return 3;
			else if (vel[0] == -1 && vel[1] == 1) //DL
				return 1;

		}
		else if (vel[0] != 0)
		{
			switch(vel[0])
			{
				case 1: //R
					return 6;
				break;
				case -1: //L
					return 2;
				break;
			}
		}
		else if (vel[1] != 0)
		{
			switch(vel[1])
			{
				case 1: //D
					return 0;
				break;
				case -1: //U
					return 4;
				break;
			}
		}
		else
		{
			return 0;
		}
	}
}

class Wall
{
	_x;
	get x()
	{
		return this._x + Game.cOffsetX;
	}
	set x(value)
	{
		this._x = value
	}
	_y;
	get y()
	{
		return this._y + Game.cOffsetY;
	}
	set y(value)
	{
		this._y = value
	}
	collisionable = true
	Node;
	constructor(wall, floor, x, y, z, w, h)
	{
		this.wall = wall;
		this.floor = floor;
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		this.h = h;

	}
	onCollision(other)
  	{
  		//
  	}
}

class Enemy extends Actor
{
	static Player;
	givenScore = 0;
	elapsedTime;
	sightArea = 50;
	isActivated = false;
	target = Enemy.Player;
	lastDamage = 0;
	predeterminedDir = 0;

	constructor(img, x, y, spd, pd = 0)
	{
		super(img, x, y, spd);
		this.direction = "D";
		this.predeterminedDir = pd;
		// if (this.idleImg.includes("MISL"))
		// console.log("Rocket:" + x + " ; " + y)
	}

	onDeath() {Game.gamemode.score += this.givenScore;}

	move(elapsed = 1)
	{
		Actor.prototype.move.call(this, elapsed);
		// playSound(this.audioConf["walk"])
	}
	makeDamage(value, attacker)
	{
		Actor.prototype.makeDamage.call(this, value, attacker);
		this.target = attacker
	}
	getDistanceToPlayer()
	{
		if (Enemy.Player != undefined)
			return Math.sqrt( Math.pow(Enemy.Player.x - this.x, 2) + Math.pow(Enemy.Player.y - this.y, 2) );
		else
		{
			console.log(Enemy.Player);
			return 0;
		}
	}
	getDistanceToTarget()
	{
		if (Enemy.Player != undefined)
			return Math.sqrt( Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2) );
		else
		{
			console.log(this.target);
			return 0;
		}
	}
	isTargetInSight()
	{
		let bnd = getBoundary(this)
		let sightAreaCircle =
		{
			x: this.x,
			y: this.y,
			r: this.sightArea
		};

		let targetBoundary = getBoundary(this.target);
		if (circleIntersect(targetBoundary, sightAreaCircle))
			return true;

		let canSeeTarget = false;
		switch(this.predeterminedDir)
		{
			case 0:
				canSeeTarget = this.y < this.target.y && (this.x-200 < this.target.x && this.x+200 > this.target.x); //D
				break;
			case 1:
				canSeeTarget = this.y < this.target.y && (this.x-500 < this.target.x && this.target.x <= this.x); //DL // fixed
				break;
			case 2:
				canSeeTarget = this.x > this.target.x && (this.y-200 < this.target.y && this.y+200 > this.target.y); //L
				break;
			case 3:
				canSeeTarget = this.y > this.target.y && (this.x-500 < this.target.x && this.target.x <= this.x); //UL //fixed
				break;
			case 4:
				canSeeTarget = this.y > this.target.y && (this.x-200 < this.target.x && this.x+200 > this.target.x); //U
				break;
			case 5:
				canSeeTarget = this.y > this.target.y && (this.x+500 > this.target.x && this.target.x >= this.x); //UR //fixed
				break;
			case 6:
				canSeeTarget = this.x < this.target.x && (this.y-200 < this.target.y && this.y+200 > this.target.y); //R
				break;
			case 7:
				canSeeTarget = this.y < this.target.y && (this.x+500 > this.target.x && this.target.x >= this.x); //DR //fixed
				break;
		}

		if ( canSeeTarget )
		{
			let start = [this.x, this.y], end = [this.target.x + targetBoundary.width/2, this.target.y + targetBoundary.height/2];
			let dir = [end[0] - start[0], end[1] - start[1]];
			let cp = [], cn = [], tNear = {val: 0};
			for (let wall of Game.walls)
			{
				if ( RayVsAABB(start, dir, getBoundary(wall), cp, cn, tNear) && (tNear.val > 0.0 && tNear.val < 1.0))
				{
					return false; //
				}
			}

			if ( RayVsAABB(start, dir, targetBoundary, cp, cn, tNear) && (tNear.val >= 0.0 && tNear.val <= 1.0))
			{
				return true;
			}
		}

		return false;
	}
	set AnimPlaying(value)
	{
	    this.isAnimPlaying = value;
  	}
  	verifyTarget()
  	{
  		return this === this.target || this.target === undefined || this.target._health <= 0 || this.target == 0
  	}
  	update(ftime)
	{
		Actor.prototype.update.call(this, ftime);
		// this.elapsedTime = ftime;
		if (!this.isAnimPlaying && this.ai )
			this.ai.dispatch('update');
		else
			this.move();
		this.target = this.verifyTarget() ? Enemy.Player : this.target;
	}
}

class Fireball extends Enemy	//Imp Fireball
{
	customAnimMatrix = ['A0', 'B0', 'C0', 'D0', 'E0'];
	audioConf =
	{
		"death" : "DSFIRXPL"
	};
	constructor(x, y, velX, velY, owner)
	{
		// console.log(x + " ; " + y)
		super('BAL1', x-Game.cOffsetX, y-Game.cOffsetY, 2.5);
		this.setVelocity(velX, velY);
		this.animConf["walk"] = 2;
		this.animConf["death"] = 3;
		this.animConf["megadeath"] = 0;
		this.animConf["hited"] = 0;
		this.animConf["attack"] = 0;
		this.mustDeath = false;
		this.owner = owner;
		this.canTakeDamage = false;
		this.damage = 24;
		this.collisionable = false;
		this.aoe_dist = 0;
	}
	makeDamage(value, attacker)
	{
		//do nothing
	}
	setVelocity(x, y)
	{
		this.velocity[0] = x;
		this.velocity[1] = y;
	}
	getAnimation()
	{
		return this.idleImg+this.customAnimMatrix[this.animState[0]];
	}
	update(ftime)
	{
		this.elapsedTime = ftime;
		Actor.prototype.update.call(this, this.elapsedTime)
		if (!this.isAnimPlaying && this.isDeath)
		{
			Game.despawnEnemy(this);
			return;
		}
		if (!this.isAnimPlaying && this.mustDeath)
		{
			this.runAnim(0, "death");//playAnimation(0, "death", this, false, -1, 300);//
			this.isDeath = true;
		}
		if (!this.isAnimPlaying) this.runAnim(0, "walk");//playAnimation(0, "walk", this);
		if (!this.isDeath && !this.mustDeath)
		{
			// console.log(this.idleImg + " move")
			this.move();//
		}
	}
	onCollision(other)
	{
		if (other !== this.owner && !this.mustDeath && (other == null || other._health === undefined || other._health > 0) && (other == null || this.constructor.name !== other.constructor.name))
		{
			this.mustDeath = true;
			if (other !== null && other._health !== undefined)
			{
				other.makeDamage(-this.damage, this.owner)
			}
			if (this.aoe_dist > 0) this.makeAoE();
			alertForArea(this.x, this.y, 500)
			playSound(this.audioConf["death"])
		}
	}
	makeAoE(frendlyFire = true)
	{
		let range =
		{
			x: this.x,
			y: this.y,
			r: this.aoe_dist
		}
		return AoEDamage(range, this.damage*0.5, this, frendlyFire);
	}
}
//HOMING_MISSILE
//
class HomingMissile extends Fireball
{
	animConf = {
		"walk" : 2,
		"death" : 3
	};
	constructor(x, y, owner)
	{
		super(x, y, 0, 0, owner)
		this.idleImg = "FATB"
		this.damage = 70;
		this.target = this.owner.target
		this.speed = 1.5;
		this.aoe_dist = 40;
	}
	update(ftime)
	{
		if (this.target._health <= 0 ) this.mustDeath = true;
		let x, y;
		if ( this.x < this.target.x )
		{
			x = 1;
		}
		else if ( this.x > this.target.x )
		{
			x = -1;
		}
		else
		{
			x = 0;
		}

		if ( this.y < this.target.y )
		{
			y = 1;
		}
		else if ( this.y > this.target.y )
		{
			y = -1;
		}
		else
		{
			y = 0;
		}
		this.setVelocity(x*this.speed, y*this.speed)
		this.elapsedTime = ftime;
		if (!this.isAnimPlaying && this.isDeath)
		{
			Game.despawnEnemy(this);
			return;
		}
		if (!this.isAnimPlaying && this.mustDeath)
		{
			this.runAnim(8, "death");
			alertForArea(this.x, this.y, 500)
			playSound(this.audioConf["death"])
				this.makeAoE();
			this.isDeath = true;
		}
		if (!this.isAnimPlaying) this.runAnim(this.determineDirection(), "walk");//playAnimation(0, "walk", this);
		if (!this.isDeath && !this.mustDeath)
		{
			this.move();//
		}
		Actor.prototype.update.call(this, this.elapsedTime)
	}
	getAnimation()
	{
		if (this.animState[1] == 8 ) // && this.animState[0] > 0
		{
			switch(this.animState[0])
			{
				case 2:
					return "FBXPA0"
				case 3:
					return "FBXPB0"
				case 4:
					return "FBXPC0"
				default:
					return "FBXPC0"
			}
		}
		else
			return Actor.prototype.getAnimation.call(this)
	}
	onCollision(other)
	{
		if (other !== this.owner && (other == null || other._health === undefined || other._health > 0) && !this.mustDeath)
		{
			this.mustDeath = true;
			if (other !== null && other._health !== undefined)
			{
				alertForArea(this.x, this.y, 500)
				other.makeDamage(-this.damage, this.owner)
				this.makeAoE();
			}
		}
	}
}
//END HM
//
class CacoBall extends Fireball
{
	constructor(x, y, owner)
	{
		super(x, y, 0, 0, owner)
		this.idleImg = "BAL2"
		this.damage = 40;
		this.aoe_dist = 25;
	}
}
class BaronBall extends Fireball
{
	constructor(x, y, owner)
	{
		super(x, y, 0, 0, owner)
		this.idleImg = "BAL7"
		this.damage = 54;
		this.owner = owner
		this.aoe_dist = 40;
	}
	update(ftime)
	{
		this.elapsedTime = ftime;
		Actor.prototype.update.call(this, this.elapsedTime)
		if (!this.isAnimPlaying && this.isDeath)
		{
			Game.despawnEnemy(this);
			return;
		}
		if (!this.isAnimPlaying && this.mustDeath)
		{
			this.runAnim(8, "death");//playAnimation(0, "death", this, false, -1, 300);//
			this.isDeath = true;
		}
		if (!this.isAnimPlaying) this.runAnim(this.determineDirection(), "walk");//playAnimation(0, "walk", this);
		if (!this.isDeath && !this.mustDeath) this.move();//
	}
	getAnimation()
	{
		let anim = Actor.prototype.getAnimation.call(this)
		if (anim == "BAL7A0")
			{
				this.animState[0] = 2
				anim = Actor.prototype.getAnimation.call(this)
			}
		if (this.animState[1] == 0)
		{
			if (this.animState[0] == 0)
				return anim.concat("A5")
			else if (this.animState[0] == 1)
				return anim.concat("B5")
			else
				return anim;
		}
		else
			return anim;
	}
}
class Imp extends Enemy
{
	audioConf = {
		"sight" : ["DSBGSIT1", "DSBGSIT2"],
		"walk" : "DSBGACT",
		"attack" : "DSFIRSHT",
		"melee" : "DSCLAW",
		"hited" : "DSPOPAIN",
		"death" : ["DSBGDTH1", "DSBGDTH2"],
		"megadeath" : "DSSLOP"
	};
	AIComponent =
	{
		determineState()
		{
			if (!this.owner.isActivated) return 'spawned';

			if (this.owner.canAttack == true && this.owner._health > 0)
				return 'attack';

			let retreatArea = getBoundary(this.owner.target);
			retreatArea.x -= this.owner.distToPlayer;
			retreatArea.y -= this.owner.distToPlayer;
			retreatArea.width = this.owner.distToPlayer*2;
			retreatArea.height = this.owner.distToPlayer*2;

			let idleArea = getBoundary(this.owner.target);
			idleArea.x -= this.owner.chaseDist;
			idleArea.y -= this.owner.chaseDist;
			idleArea.width = this.owner.chaseDist*2;
			idleArea.height = this.owner.chaseDist*2;

			if ( testAABBs(idleArea, getBoundary(this.owner)) && !testAABBs(retreatArea, getBoundary(this.owner)) )
				return 'idle';
			else if (testAABBs(retreatArea, getBoundary(this.owner)))
				return 'retreat';
			else
				return 'chase';

		},
		owner: undefined,
		state: 'spawned',
		transitions:
		{
			spawned:
			{
				update()
				{
					this.owner.isActivated = this.owner.isTargetInSight() || this.owner.isActivated

					if (this.owner.isActivated) playSound(this.owner.audioConf["sight"])

					this.owner.runAnim(this.owner.predeterminedDir, "walk");
					this.state = this.determineState();
				}
			},
			idle:
			{
				update()
				{
					this.state = this.determineState();
					this.owner.setVelocity(0, 0)
					this.owner.runAnim(0, "walk");//playAnimation(0, "walk", this.owner, true);
				}
			},
			chase:
			{
				update()
				{
					// console.log(this.owner.getDistanceToPlayer());
					let x, y;
					if ( this.owner.x < this.owner.target.x )
					{
						x = 1;
					}
					else if ( this.owner.x > this.owner.target.x )
					{
						x = -1;
					}
					else
					{
						x = 0;
					}

					if ( this.owner.y < this.owner.target.y )
					{
						y = 1;
					}
					else if ( this.owner.y > this.owner.target.y )
					{
						y = -1;
					}
					else
					{
						y = 0;
					}
					this.state = this.determineState();
					this.owner.setVelocity(x,y)
					this.owner.runAnim(this.owner.determineDirection(), "walk");//playAnimation(this.owner.determineDirection(), "walk", this.owner, true);
				}
			},
			retreat:
			{
				update()
				{
					// console.log(this.owner.getDistanceToPlayer());
					let x, y;
					if ( this.owner.x < this.owner.target.x)
					{
						x = -1;
					}
					else if ( this.owner.x > this.owner.target.x)
					{
						x = 1;
					}
					else
					{
						x = 0;
					}

					if ( this.owner.y < this.owner.target.y)
					{
						y = -1;
					}
					else if ( this.owner.y > this.owner.target.y)
					{
						y = 1;
					}
					else
					{
						y = 0;
					}
					this.state = this.determineState();
					this.owner.setVelocity(x,y);
					this.owner.runAnim(this.owner.determineDirection(), "walk");//playAnimation(this.owner.determineDirection(), "walk", this.owner, true);
				}
			},
			attack:
			{
				update()
				{
					// console.log(this.owner.getDistanceToPlayer());
					let x, y;
					if ( this.owner.x < this.owner.target.x)
					{
						x = 1;
					}
					else if ( this.owner.x > this.owner.target.x )
					{
						x = -1;
					}
					else
					{
						x = 0;
					}

					if ( this.owner.y < this.owner.target.y)
					{
						y = 1;
					}
					else if ( this.owner.y > this.owner.target.y )
					{
						y = -1;
					}
					else
					{
						y = 0;
					}
					this.owner.setVelocity(x,y);
					if ( this.owner.canAttack )
					{
						if ( this.owner.getDistanceToTarget() > Melee )
						{
							let fX = this.owner.x, fY = this.owner.y; //+getBoundary(this.owner).width/2
							let end = [this.owner.target.x, this.owner.target.y], elTime = this.owner.elapsedTime;
							let dir = [ end[0]-fX, end[1]-fY ], vel = [ dir[0]/elTime, dir[1]/elTime ]; //elTime
							// console.log(vel[0], vel[1]);
							let fb = new this.owner.projectile(fX, fY, 0, 0, this.owner);
							let angle = Math.atan(vel[1]/vel[0]);
							// console.log(Enemy.Player.x + " ; " + (this.owner.x-this.owner.velocity[0]*this.owner.speed) );
							// console.log(Enemy.Player.x - this.owner.x );
							if (this.owner.target.x - this.owner.x > 0)
							{
								fb.setVelocity( fb.speed * Math.cos(angle), fb.speed * Math.sin(angle) );
							}
							else
							{
								fb.setVelocity( -fb.speed * Math.cos(angle), -fb.speed * Math.sin(angle) );
							}

							playSound(this.owner.audioConf["attack"])
							Game.summonEnemy(fb);
						}
						else
						{
							playSound(this.owner.audioConf["melee"])
							this.owner.target.makeDamage(-this.owner.meleeDm, this.owner);
						}

						this.owner.canAttack = false;
						setTimeout( () =>  this.owner.canAttack = true, this.owner.attackDelay);
						this.owner.runAnim(this.owner.determineDirection(), "attack");//playAnimation(this.owner.determineDirection(), "attack", this.owner, true);
					}
					this.owner.setVelocity(0,0);
					this.state = this.determineState();//
				}
			}
		},
		dispatch(actionName)
		{
			// console.log(this.state);
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

	constructor(x, y)
	{
		super('TROO', x, y, 1);
		this.animConf["walk"] = 4;
		this.animConf["attack"] = 3;
		this.animConf["death"] = 5;
		this.animConf["megadeath"] = 8;
		this.attackDelay = 2500;
		this.canAttack = true;
		this.distToPlayer = 400; //retreat dist
		this.chaseDist = 450; //chase dist
		this.projectile = Fireball;
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
		this.meleeDm = 14;
		this._health = 60;
		this.speed = 1.25;
		this.givenScore = 75;
	}
}