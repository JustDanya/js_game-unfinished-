class Soldier extends Enemy
{
	audioConf =
	{
		"sight" : ["DSPOSIT1", "DSPOSIT2", "DSPOSIT3"],
		"hited" : "DSPOPAIN",
		"death" : ["DSPODTH1", "DSPODTH2", "DSPODTH3"],
		"megadeath" : "DSSLOP"
	};
	AIComponent =
	{
		determineState()
		{
			if (!this.owner.isActivated) return 'spawned';

			if (!this.owner.weapon.checkAmmo() && !this.owner.noAmmoAvailable && Soldier.pickableAmmo[this.owner.name].length > 0)
				return 'loot';

			if (this.owner.getDistanceToTarget() > this.owner.weapon.maxDistance)
				return 'chase';
			else if (this.owner.weapon.canFire && this.owner._health > 0 && this.owner.weapon.checkAmmo())
				return 'attack';
			else
				return 'idle'

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
			loot:
			{
				update()
				{
					this.owner.target = Soldier.pickableAmmo[this.owner.name][0]
					if (this.owner.target === undefined) this.owner.target = Enemy.Player
					this.state = 'chase'
				}
			},
			idle:
			{
				update()
				{
					this.state = this.determineState();
					this.owner.setVelocity(0, 0)
					this.owner.runAnim(0, "walk");
				}
			},
			chase:
			{
				update()
				{
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
					this.owner.runAnim(this.owner.determineDirection(), "walk");
				}
			},
			attack:
			{
				update()
				{
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

					let targetPoint = {x: this.owner.target.x + Math.random() * this.owner.accuracy, y: this.owner.target.y + Math.random() * this.owner.accuracy};
					this.owner.weapon.fire(this.owner, targetPoint);

					this.owner.runAnim(this.owner.determineDirection(), "attack");//playAnimation(this.owner.determineDirection(), "attack", this.owner, true);

					this.owner.setVelocity(0,0);
					this.state = this.determineState();//
				}
			}
		},
		dispatch(actionName)
		{
			// console.log(this.state + " ; " + this.owner.weapon.canFire);
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
	onPickupPicked(pick)
	{
		let i = this.pickableAmmo.indexOf(pick);
		if (i > -1)
		{
			this.pickableAmmo.splice(i, 1);
			this.target = Game.Player
		}

	}
	static getPickableAmmo()
	{
		let amm = [];
		Game.pickups.forEach(function(exp) {
			if (exp.ammoType == "clips")
				amm.push(exp)
		})
		return amm
	}
	static pickableAmmo = { "soldier" : [], "sergeant" : [] }
		// static noAmmoAvailable = false
	constructor(x, y)
	{
		super('POSS', x, y, 1);
		this.animConf["walk"] = 4;
		this.animConf["attack"] = 2;
		this.animConf["death"] = 5;
		this.animConf["megadeath"] = 9;
		this.animConf["hited"] = 1;
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
		this._health = 20;
		this.accuracy = 100;
		this.weapon = new Pistol(this);
		this.weapon.fireDamage = 10;
		this.weapon.fireDelay = 1000;
		this.inventory.setAmmo("clips", 25)
		this.pickConf.ammo = true
		this.name = "soldier"
		this.inventory.setPickableWeapon("pistol", true)
		this.givenScore = 25;
	}
	verifyTarget()
	{
		if (!this.weapon.checkAmmo() && !this.noAmmoAvailable)
		{
			return false
		}
		else
		{
			return Enemy.prototype.verifyTarget.call(this)
		}
	}

}

class Sergeant extends Soldier
{
	static getPickableAmmo()
	{
		let amm = [];
		Game.pickups.forEach(function(exp) {
			if (exp.ammoType == "shells")
				amm.push(exp)
		})
		return amm
	}
	constructor(x, y)
	{
		super(x, y);
		this.idleImg = 'SPOS'
		this._health = 30;
		this.accuracy = 75;
		this.weapon = new Shotgun(this);
		this.weapon.fireDamage = 45;
		this.name = "sergeant"
		this.inventory.setAmmo("shells", 15)
		this.inventory.setPickableWeapon("shotgun", true)
		this.inventory.setPickableWeapon("pistol", false)
		this.givenScore = 100;

	}
}