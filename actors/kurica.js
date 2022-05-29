class fftKurica extends Enemy
{
	audioConf =
	{
		"spawned" : "DSSGTSIT",
		"attack" : "DSSGTATK",
		"hited" : "DSDMPAIN",
		"death" : "DSSGTDTH"
	};
	AIComponent =
	{
		determineState()
		{
			if (!this.owner.isActivated) return 'spawned';

			if (this.owner.canAttack == true && this.owner.getDistanceToTarget() <= Melee && this.owner._health > 0)
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

					// if (this.owner.isActivated) playSound(this.owner.audioConf["sight"])

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
					this.owner.runAnim(this.owner.determineDirection(), "walk");
				}
			},
			attack:
			{
				update()
				{
					if (this.owner.getDistanceToTarget() > Melee)
					{
						this.state = this.determineState();
						return;
					}
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

					// playSound(this.owner.audioConf["attack"])
					// Enemy.Player.makeDamage(-this.owner.meleeDm, this.owner);
					// this.owner.target.makeDamage(-this.owner.meleeDm, this.owner);
					// this.owner.canAttack = false;
					// setTimeout( () =>  this.owner.canAttack = true, this.owner.attackDelay);
					// this.owner.runAnim(this.owner.determineDirection(), "attack");//playAnimation(this.owner.determineDirection(), "attack", this.owner, true);

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
	constructor(x, y)
	{
		super('KUR', x, y, 1);
		this.animConf["walk"] = 12;
		this.animConf["attack"] = 0;
		this.animConf["death"] = 0;
		this.animConf["megadeath"] = 0;
		this.animConf["hited"] = 0;
		this.attackDelay = 2500;
		this.canAttack = true;
		this.distToPlayer = 400; //retreat dist
		this.chaseDist = 450; //chase dist
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
		this.meleeDm = 30;
		this._health = 150;
		this.speed = 1.25;
	}

	makeDamage(value, attacker) {}

	getAnimation()
	{
		this.animState[1] = 0;
		let anim = Actor.prototype.getAnimation.call(this);
		return anim;
	}
}