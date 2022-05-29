class BaseParticle extends Actor
{
	animConf = { "play" :  0};
	animDelay = 50;
	constructor(img, x, y)
	{
		super(img, x, y, 0)
		this.played = false;
		this._health = -10;
		this.animState[1] = 8
	}
	// override cordinate getters, bacause i don't know....
	get x()
	{
		return this._x - Game.cOffsetX
	}
	get y()
	{
		return this._y - Game.cOffsetY
	}
	update(ftime)
	{
		this.animComponent.continueAnimation();
		if (!this.played && !this.isAnimPlaying)
		{
			// console.log("Progress " + this.progress)
			this.runAnim(8, "play", false, this.animDelay)
			this.played = true
		}
		else if (this.played && !this.isAnimPlaying)
		{
			// console.log("PARTICLE DESPAWNED")
			Game.despawnParticle(this);
		}
	}
}
class WeaponParticle extends BaseParticle
{
	animConf = { "play" :  4};
	constructor(x, y)
	{
		super("PUFF", x, y)
		this.played = false;
	}
}
class TeleportFog extends BaseParticle
{
	animConf = { "play" :  4};
	constructor(x, y)
	{
		super("TFOG", x, y)
		this.played = false;
		this.animDelay = 120;
	}
}
class TraceParticle extends WeaponParticle
{
	animConf = { "play" :  2};
	constructor(x, y)
	{
		super(x, y)
	}
	getAnimation()
	{
		if (this.animState[0] < 2)
			this.animState[0] += 2;
		return Actor.prototype.getAnimation.call(this);
	}
}
class BFGParticle extends BaseParticle
{
	animConf = { "play" :  4};
	constructor(x, y, progress = -1)
	{
		super("BFE2", x, y, progress)
		this.played = false;
	}
	get x()
	{
		return this._x + Game.cOffsetX
	}
	get y()
	{
		return this._y + Game.cOffsetY
	}
}
class BaseWeapon
{
	static QTree;

	fireSound = "";
	particles = ["PUFFA0", "PUFFB0", "PUFFC0", "PUFFD0"];
	owner;
	ammoType = "";
	ammoUse = 1;
	playingSound;
	constructor(delay, damage)
	{
		this.fireDelay = delay;
		this.canFire = true;
		this.fireDamage = damage;


	}

	checkAmmo()
	{
		return (this.owner.inventory.getAmmo(this.ammoType) > this.ammoUse-1)
	}

	visualiseFire()
	{
		//
	}

	fire(actorLocation, mouseLocation)
	{
		//
	}
}

class BaseImpact extends BaseWeapon
{
	constructor(delay, damage, dist, endParticlesCount, owner, traceON = true, traceParticlesSpace = 50)
	{
		super(delay, damage);
		this.tracers = traceON;
		this.traceParticles = traceParticlesSpace;
		this.maxDistance = dist;
		this.particlesCount = endParticlesCount;
		this.owner = owner;
		this.trace = [];
		this.end = [];
	}

	getDamage(StartLoc, HitLoc)
	{
		return -this.fireDamage;//
	}

	drawEndParticles(hitLocation, progress = 0)
	{
		// if (this.end.length > 0)
		// {
		// 	let i = Game.particles.indexOf(this.end);
		// 	// console.log(i);
		// 	if (i > -1) Game.particles.splice(i, 1);
		// 	this.end = [];
		// }
		// if (progress == 4) return;
		// console.log(hitLocation)
		let hl = {x: hitLocation.x, y: hitLocation.y};
		let curX  = hl.x, curY = hl.y;
		let yOffset;
		for (let i = 0; i < this.particlesCount; i++)
		{
			yOffset = Math.floor( Math.random() * 10 );
			// this.end.push( {particle: this.particles[index], x: curX, y: curY+yOffset} );
			let prtcl = new WeaponParticle(curX+Game.cOffsetX, curY+Game.cOffsetY)
			// let prtcl = new WeaponParticle(curX, curY)
			Game.summonParticle(prtcl)
			curX += 5; //
		}
		// setTimeout( () => window.requestAnimationFrame( () => this.drawEndParticles(hl, progress+1) ), 100 );

	}

	drawTracers(hitLocation, startLocation, progress = 2)
	{
		// console.log("tracers");
		// if (this.trace.length > 0)
		// {
		// 	let i = Game.particles.indexOf(this.trace);
		// 	if (i > -1) Game.particles.splice(i, 1);
		// 	this.trace = [];
		// }
		// if (progress == 4) return;
		// let index = progress;
		let dir = [hitLocation.x - startLocation.x, hitLocation.y - startLocation.y], length = Math.sqrt(Math.pow(dir[0], 2) + Math.pow(dir[1], 2));
		let norm = [dir[0]/length, dir[1]/length];
		let curDist = 0;
		let loc = [];
		let dist = Math.sqrt( Math.pow(hitLocation.x - startLocation.x, 2) + Math.pow(hitLocation.y - startLocation.y, 2) );
		while(dist > 0)
		{
			loc = [hitLocation.x-(curDist*norm[0]), hitLocation.y-(curDist*norm[1])];
			// this.trace.push( {particle: this.particles[index], x: loc[0], y: loc[1]} );
			let prtcl = new TraceParticle(loc[0]+Game.cOffsetX, loc[1]+Game.cOffsetY)
			// let prtcl = new TraceParticle(loc[0], loc[1])
			curDist += this.traceParticles;
			dist -= this.traceParticles;
			Game.particles.push(prtcl)
		}
		// Game.particles.push(this.trace);
		// setTimeout( () => window.requestAnimationFrame( () => this.drawTracers(hitLocation, startLocation, progress+1) ), 150 );
	}
	makeSound() {this.playingSound = playSound(this.fireSound)}
	fire(actorLocation, mouseLocation)
	{
		if (this.canFire && this.checkAmmo()) //
		{
			// this.playingSound = playSound(this.fireSound)
			alertForArea(this.owner.x, this.owner.y, 500)
			this.makeSound();
			let boundary =
			{
				x: (actorLocation.x < mouseLocation.x) ? actorLocation.x : mouseLocation.x,
				y: (actorLocation.y < mouseLocation.y) ? actorLocation.y : mouseLocation.y,
				width: (actorLocation.x < mouseLocation.x) ? (mouseLocation.x - actorLocation.x) : (actorLocation.x - mouseLocation.x),
				height:(actorLocation.y < mouseLocation.y) ? (mouseLocation.y - actorLocation.y) : (actorLocation.y - mouseLocation.y)
			};
			let diagonal = Math.sqrt(Math.pow(boundary.width, 2) + Math.pow(boundary.height, 2));
			let dir = [actorLocation.x - mouseLocation.x, actorLocation.y - mouseLocation.y];
			let length = Math.sqrt(Math.pow(dir[0], 2) + Math.pow(dir[1], 2));
			let dist = this.maxDistance;
			if (diagonal > dist)
			{
				let norm = [dir[0]/length, dir[1]/length];
				let point = [actorLocation.x-(dist*norm[0]), actorLocation.y-(dist*norm[1])];
				boundary.x = point[0] < actorLocation.x ? point[0] : actorLocation.x;
				boundary.y = point[1] < actorLocation.y ? point[1] : actorLocation.y;
				boundary.width = point[0] > actorLocation.x ? point[0] - actorLocation.x :actorLocation.x - point[0];
				boundary.height = point[1] > actorLocation.y ? point[1] - actorLocation.y : actorLocation.y - point[1];
			}

			// console.log(boundary);

			this.owner.inventory.addAmmo(this.ammoType, -this.ammoUse)
			this.canFire = false;
			setTimeout( () =>  this.canFire = true, this.fireDelay);
			//perform fire
			let noActorsHited = true;
			let actors = BaseWeapon.QTree.query(boundary);
			// console.log(actors);
			//count damage
			let minNearTime = 5.0, lastActor, lastCP;
			if (actors.length > 0)
			{
				for (let actor of actors)
				{
					let rayOriginal = [actorLocation.x, actorLocation.y];
					let rayDir = [mouseLocation.x - actorLocation.x, mouseLocation.y - actorLocation.y];
					let contactPoint = [], contactNormal = [], nearTime = {val: 0};

					if ( RayVsAABB(rayOriginal, rayDir, getBoundary(actor), contactPoint, contactNormal, nearTime)
						&& actor !== this.owner && (actor._health === undefined || actor._health > 0) )
					{
						if (minNearTime > nearTime.val)
						{
							minNearTime = nearTime.val; //
							lastActor = actor;
							lastCP = contactPoint;
							noActorsHited = false;
						}
					}
				}
			}
			// console.log(noActorsHited);
			if (noActorsHited)
			{
				//draw particle on end
				let hitLocation = {x: boundary.x+boundary.width, y: boundary.y+boundary.height};
				if (boundary.x == actorLocation.x && boundary.y < actorLocation.y)
				{
					hitLocation.x = boundary.x + boundary.width;
					hitLocation.y = boundary.y;
				}
				else if (boundary.x < actorLocation.x && boundary.y < actorLocation.y)
				{
					hitLocation.x = boundary.x;
					hitLocation.y = boundary.y;
				}
				else if (boundary.x < actorLocation.x && boundary.y == actorLocation.y)
				{
					hitLocation.x = boundary.x;
					hitLocation.y = boundary.y + boundary.height;
				}
				// console.log(hitLocation)
				// console.log(mouseLocation)
				// hitLocation.x -= Game.cOffsetX
				// hitLocation.y -= Game.cOffsetY
				// console.log(hitLocation)
				this.drawEndParticles( hitLocation );
				// this.drawEndParticles( {x: hitLocation.x+Game.cOffsetX, y: hitLocation.y+Game.cOffsetY} );
				// console.log("NONE");
				if (this.tracers)
				{
					//draw traces
					this.drawTracers(hitLocation, actorLocation);
					// this.drawTracers({x: hitLocation.x+Game.cOffsetX, y: hitLocation.y+Game.cOffsetY}, {x: actorLocation.x+Game.cOffsetX, y: actorLocation.y+Game.cOffsetY});
				}
			}
			else
			{
				let hitLocation = {x: lastCP[0], y: lastCP[1]};
				// let hitLocation = {x: lastCP[0]+Game.cOffsetX, y: lastCP[1]+Game.cOffsetY};
				this.drawEndParticles( hitLocation );
				lastActor.onCollision(null);

				// console.log(this.getDamage(actorLocation, hitLocation));

				if (lastActor._health !== undefined)
					lastActor.makeDamage(this.getDamage(actorLocation, {x: lastCP[0], y: lastCP[1]}), this.owner);
				//lastActor.makeDamage(this.fireDamage)
				// console.log(lastActor);
				if (this.tracers)
				{
					//draw traces
					this.drawTracers(hitLocation, actorLocation);
				}
			}
		}
	}
}

class Shotgun extends BaseImpact
{
	constructor(owner)
	{
		super(1000, 80, 300, 5, owner); //
		this.ammoType = "shells"
		this.fireSound = "DSSHOTGN"
	}

	getDamage(StartLoc, HitLoc)
	{
		let distance = Math.sqrt( Math.pow(HitLoc.x - StartLoc.x, 2) + Math.pow(HitLoc.y - StartLoc.y, 2) );
		let multiplier = (this.maxDistance - distance);
		multiplier = multiplier / this.maxDistance;
		// console.log(multiplier)
		return -this.fireDamage * multiplier;
	}
}

class Pistol extends BaseImpact
{
	constructor(owner)
	{
		super(400, 15, 500, 1, owner);
		this.ammoType = "clips"
		this.fireSound = "DSPISTOL"
	}
}
class ChainGun extends BaseImpact
{
	constructor(owner)
	{
		super(100, 7, 350, 1, owner);
		this.ammoType = "clips"
		this.fireSound = "DSPISTOL"
	}
}
class ChainSaw extends BaseImpact
{
	constructor(owner)
	{
		super(150, 5, 70, 2, owner, false);
		this.fireSound = "DSSAWFUL"
	}
	checkAmmo() {return true}
	// makeSound()
	// {
	// 	if (this.playingSound === undefined || this.playingSound.paused)
	// 		// this.playingSound = playingSound(this.fireSound)
	// 		this.playingSound = playSound(this.fireSound)
	// }
	fire(actorLocation, mouseLocation)
	{
		if (this.playingSound !== undefined)
		{
			this.playingSound.pause()
			this.playingSound.currentTime = 0;

		}
		BaseImpact.prototype.fire.call(this, actorLocation, mouseLocation)
	}
}
class FireRocket extends Fireball
{
	animConf =
	{
		"walk" : 1,
		"death" : 3
	};
	constructor(x, y, owner)
	{
		// console.log(x + " ; " + y)
		super(x, y, 0, 0, owner)
		this.idleImg = "MISL"
		this.speed = 4
		this.damage = 100
		this.aoe_dist = 50;
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
		if (!this.isDeath && !this.mustDeath)
		{
			// console.log(this.idleImg + " move")
			this.move();//
		}
	}
	getAnimation()
	{
		let anim = Actor.prototype.getAnimation.call(this);
		if (this.animState[1] >= 1 && this.animState[1] <= 3)
		{
			return anim.substring(0, anim.length-2);
		}
		else if (this.animState[1] >= 5 && this.animState[1] <= 7)
		{
			let end = anim.charAt(anim.length-2) + (10 - (this.animState[1] + 1) );

			return anim.concat(end);
		}
		if (anim == "MISLA0") anim = "MISLD0"
		return anim;
	}
}
class PlasmaBall extends Fireball
{
	animConf =
	{
		"walk" : 2,
		"death" : 5
	};
	constructor(x, y, owner)
	{
		super(x, y, 0, 0, owner)
		this.idleImg = "PLSS"
	}
	getAnimation()
	{
		if (this.playingAnim == "death" ) // && this.animState[0] > 0
		{
			switch(this.animState[0])
			{
				case 2:
					return "PLSEA0"
				case 3:
					return "PLSEB0"
				case 4:
					return "PLSEC0"
				case 5:
					return "PLSED0"
				case 6:
					return "PLSEE0"
				default:
					return "PLSEA0"
			}
		}
		else
		{
			this.animState[1] = 8
			return Actor.prototype.getAnimation.call(this)
		}
	}
}
class BFGProjectile extends Fireball
{
	animConf =
	{
		"walk" : 2,
		"death" : 6
	};
	constructor(x, y, owner)
	{
		super(x, y, 0, 0, owner)
		this.idleImg = "BFS1"
		this.aoe_dist = 500;
		this.damage = 200
	}
	makeAoE()
	{
		let actors = Fireball.prototype.makeAoE.call(this, false);
		// console.log(actors)
		for (let actor of actors)
		{
			let prtcl = new BFGParticle(actor._x, actor._y)
			Game.summonParticle(prtcl)
		}
	}
	getAnimation()
	{
		if (this.playingAnim == "death" ) // && this.animState[0] > 0
		{
			switch(this.animState[0])
			{
				case 2:
					return "BFE1A0"
				case 3:
					return "BFE1B0"
				case 4:
					return "BFE1C0"
				case 5:
					return "BFE1D0"
				case 6:
					return "BFE1E0"
				case 7:
					return "BFE1F0"
				default:
					return "BFE1A0"
			}
		}
		else
		{
			this.animState[1] = 8
			return Actor.prototype.getAnimation.call(this)
		}
	}
}

class BaseProjectile extends BaseWeapon
{
	constructor(delay, projClass, owner)
	{
		super(delay, 1);
		this.projectile = projClass
		this.owner = owner;
	}

	fire(actorLocation, mouseLocation)
	{
		if (this.canFire && this.checkAmmo())
		{
			playSound(this.fireSound)
			this.owner.inventory.addAmmo(this.ammoType, -this.ammoUse)
			this.canFire = false;
			setTimeout( () =>  this.canFire = true, this.fireDelay);

			let fX = actorLocation.x, fY = actorLocation.y;
			let end = [mouseLocation.x, mouseLocation.y], elTime = this.owner.elapsedTime;
			let dir = [ end[0]-fX, end[1]-fY ], vel = [ dir[0]/elTime, dir[1]/elTime ];
			// let proj = new this.projectile(actorLocation.x-Game.cOffsetX, actorLocation.y-Game.cOffsetY)
			let proj = new this.projectile(actorLocation.x, actorLocation.y, this.owner)
			let angle = Math.atan(vel[1]/vel[0]);
			if (mouseLocation.x - actorLocation.x > 0)
			{
				proj.setVelocity( proj.speed * Math.cos(angle), proj.speed * Math.sin(angle) );
			}
			else
			{
				proj.setVelocity( -proj.speed * Math.cos(angle), -proj.speed * Math.sin(angle) );
			}
			Game.summonEnemy(proj);
		}
		else
		{
			// console.log("NO AMMO")
		}
	}
}
class RocketLauncher extends BaseProjectile
{
	constructor(owner)
	{
		super(750, FireRocket, owner); //
		this.ammoType = "rockets"
		this.fireSound = "DSRLAUNC"
	}
}
class PlasmaGun extends BaseProjectile
{
	constructor(owner)
	{
		super(100, PlasmaBall, owner); //
		this.ammoType = "cells"
		this.fireSound = "DSPLASMA"
	}
}
class BigFuckingGun extends BaseProjectile
{
	constructor(owner)
	{
		super(2500, BFGProjectile, owner); //
		this.ammoType = "cells"
		this.fireSound = "DSBFG"
		this.ammoUse = 40;
	}
}