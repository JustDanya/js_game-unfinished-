class Revenant extends Enemy
{
	audioConf =
	{
		"sight" : "DSSKESIT",
		"attack" : "DSSKEATK",
		"melee" : "DSSKEPCH",
		"hited" : "DSPOPAIN",
		"death" : "DSSKEDTH"
	};
	AIComponent =
	{
		determineState()
		{
			if (!this.owner.isActivated) return 'spawned';

			if (this.owner.canAttack == true && this.owner._health > 0)
				return 'attack';
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
					this.owner.runAnim(this.owner.determineDirection(), "walk", false, 180);
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


					// Enemy.Player.makeDamage(-this.owner.meleeDm, this.owner);
					if (this.owner.getDistanceToTarget() <= Melee)
					{
						this.owner.runAnim(this.owner.determineDirection(), "attack", false, 150);//playAnimation(this.owner.determineDirection(), "attack", this.owner, true);
						playSound(this.owner.audioConf["melee"])
						this.owner.target.makeDamage(-this.owner.meleeDm, this.owner);
					}
					else
					{
						let hm = new this.owner.projectile(this.owner.x, this.owner.y, this.owner)
						playSound(this.owner.audioConf["attack"])
						Game.summonEnemy(hm)
						this.owner.runAnim(this.owner.determineDirection(), "alternative", false, 500)
					}

					this.owner.canAttack = false;
					setTimeout( () =>  this.owner.canAttack = true, this.owner.attackDelay);

					this.owner.setVelocity(0,0);
					this.state = this.determineState();//
				}
			}
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
	customAnimMatrix = [];
	constructor(x, y)
	{
		super('SKEL', x, y, 1);
		this.customAnimMatrix = setRevenantAnimMatrix()
		this.animConf =
		{
			"walk" : 6,
			"attack" : 3,
			"alternative" : 2,
			"hited" : 1,
			"death" : 5,
			"megadeath" : 0
		}
		// this.animConf["walk"] = 3;
		// this.animConf["attack"] = 3;
		// this.animConf["attack1"] = 1;
		// this.animConf["death"] = 5;
		// this.animConf["megadeath"] = 0;
		// this.animConf["hited"] = 1;
		this.attackDelay = 750;
		this.canAttack = true;
		this.distToPlayer = 400; //retreat dist
		this.chaseDist = 450; //chase dist
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
		this.projectile = HomingMissile;
		this.meleeDm = 50;
		this._health = 300;
		this.givenScore = 300;
	}
	getAnimation()
	{
		return this.idleImg + this.customAnimMatrix[this.animState[0]][this.animState[1]]
	}
}