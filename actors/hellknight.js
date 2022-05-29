class HKnight extends Enemy
{
	audioConf =
	{
		"sight" : "DSBRSSIT",
		"attack" : "DSFIRSHT",
		"melee" : "DSCLAW",
		"hited" : "DSDMPAIN",
		"death" : "DSBRSDTH"
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

					if ( this.owner.getDistanceToTarget() > Melee )
					{
						let fX = this.owner.x, fY = this.owner.y; //+getBoundary(this.owner).width/2
						let end = [this.owner.target.x, this.owner.target.y], elTime = this.owner.elapsedTime;
						let dir = [ end[0]-fX, end[1]-fY ], vel = [ dir[0]/elTime, dir[1]/elTime ]; //elTime
						// console.log(vel[0], vel[1]);
						let fb = new this.owner.projectile(fX, fY, this.owner);
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
					else if (this.owner.target !== undefined && this.owner.target !== 0)
					{
						playSound(this.owner.audioConf["melee"])
						this.owner.target.makeDamage(-this.owner.meleeDm, this.owner);
					}

					this.owner.canAttack = false;
					setTimeout( () =>  this.owner.canAttack = true, this.owner.attackDelay);
					this.owner.runAnim(this.owner.determineDirection(), "attack");//playAnimation(this.owner.determineDirection(), "attack", this.owner, true);

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
		super('BOSS', x, y, 0.75);
		this.animConf["walk"] = 4;
		this.animConf["attack"] = 3;
		this.animConf["death"] = 7;
		this.animConf["megadeath"] = 0;
		this.animConf["hited"] = 1;
		this.attackDelay = 2500;
		this.canAttack = true;
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
		this.meleeDm = 60;
		this._health = 500;
		this.projectile = BaronBall;
		this.givenScore = 200;
	}

	getAnimation()
	{
		let anim = Actor.prototype.getAnimation.call(this);
		if ( (anim.match(/E/g) || []).length >= 2 || (anim.match(/F/g) || []).length >= 2 || (anim.match(/G/g) || []).length >= 2 ||
			(anim.match(/H/g) || []).length >= 2)
		{
			return anim.substring(0, anim.length-2);
		}
		return anim;
	}
}