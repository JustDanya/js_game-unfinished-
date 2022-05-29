class LostSoul extends Enemy
{
	audioConf =
	{
		"attack" : "DSSKLATK",
		"hited" : "DSDMPAIN",
		"death" : "DSFIRXPL"
	};
	AIComponent =
	{
		determineState()
		{

			if (this.owner.charged)
				return 'charged'
			else
				if (this.owner.canAttack == true && this.owner._health > 0)
				return 'attack';
			else
				return 'chase';

		},
		owner: undefined,
		state: 'chase',
		transitions:
		{
			chase:
			{
				update()
				{
					let x, y;
					if ( this.owner.x < this.owner.target.x - 50)
					{
						x = 1;
					}
					else if ( this.owner.x > this.owner.target.x + 50 )
					{
						x = -1;
					}
					else
					{
						x = 0;
					}

					if ( this.owner.y < this.owner.target.y - 50 )
					{
						y = 1;
					}
					else if ( this.owner.y > this.owner.target.y + 50 )
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
					this.owner.runAnim(this.owner.determineDirection(), "attack", true);//playAnimation(this.owner.determineDirection(), "attack", this.owner, true);

					let fX = this.owner.x, fY = this.owner.y;
					let end = [this.owner.target.x, this.owner.target.y], elTime = this.owner.elapsedTime;
					let dir = [ end[0]-fX, end[1]-fY ], vel = [ dir[0]/elTime, dir[1]/elTime ];
					let angle = Math.atan(vel[1]/vel[0]);
					if (this.owner.target.x - this.owner.x > 0)
					{
						this.owner.velocity[0] = this.owner.speed*2 * Math.cos(angle)
						this.owner.velocity[1] = this.owner.speed*2 * Math.sin(angle)
					}
					else
					{
						this.owner.velocity[0] = -this.owner.speed*2* Math.cos(angle)
						this.owner.velocity[1] = -this.owner.speed*2 * Math.sin(angle)
					}
					playSound(this.owner.audioConf["attack"])
					this.owner.charged = true
					this.state = this.determineState() //
				}
			},
			charged:
			{
				update()
				{
					// this.owner.move();
					if (!this.owner.isAnimPlaying)
						this.owner.runAnim(this.owner.determineDirection(), "attack", true);
					this.state = this.determineState() //
				}
			}
		},
		dispatch(actionName)
		{
			// console.log(this.state)
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
		super('SKUL', x, y, 1);
		this.animConf["walk"] = 2;
		this.animConf["attack"] = 2;
		this.animConf["death"] = 6;
		this.animConf["megadeath"] = 0;
		this.animConf["hited"] = 1;
		this.attackDelay = 3000;
		this.canAttack = true;
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
		this.meleeDm = 20;
		this._health = 100;
		this.charged = false;
		this.givenScore = 50;
	}
	// update(ftime)
	// {
	// 	if (!this.charged)
	// 		Enemy.prototype.update.call(this, ftime);
	// 	else
	// 		this.move()

	// }
	onCollision(other)
	{
		if (this.canAttack)
		{
			this.canAttack = false;
			setTimeout( () =>  this.canAttack = true, this.attackDelay);

			if (other != null && other._health != undefined)
				other.makeDamage(-this.meleeDm, this);
			this.charged = false;
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
		return anim;
	}
}