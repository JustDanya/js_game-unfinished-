class Door extends Wall
{
	audioConf =
	{
		"open" : "DSDOROPN",
		"close" : "DSDORCLS"
	};
	AIComponent =
	{
		determineState()
		{
			// possible states: closed, closing, opened, opening;
		},
		owner: undefined,
		state: 'closed',
		transitions:
		{
			closed:
			{
			update() {/* DO NOTHING */}
			},
			closing:
			{
				update()
				{
					this.owner.h += this.owner.step;
					if (this.owner.h >= this.owner.maxH)
					{
						this.state = 'closed';
						this.owner.h = this.owner.maxH;
						this.owner.onClose();
					}
					this.owner.z = this.owner.h - this.owner.deltaZ;

				}
			},
			opened:
			{
				update() {/* DO NOTHING */}
			},
			opening:
			{
				update()
				{
					this.owner.h -= this.owner.step;
					if (this.owner.h <= this.owner.deltaZ)
					{
						this.state = 'opened';
						this.owner.h = this.owner.deltaZ;
						this.owner.collisionable = false;
						this.owner.onOpen();
					}
					this.owner.z = this.owner.h - this.owner.deltaZ;
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
	constructor(wall, floor, x, y, z, w, h, step  = 5)
	{
		super(wall, floor, x, y, z, w, h);
		this.step = step;
		this.maxH = h;
		this.deltaZ = h - z;
		this.ai = Object.create(this.AIComponent);
		this.ai.owner = this;
	}
	update(ftime)
	{
		this.ai.dispatch('update');
	}
	open()
	{
		if (this.ai.state == 'closed')
		{
			playSound(this.audioConf['open']);
			this.ai.state = 'opening';
		}
	}
	close()
	{
		if (this.ai.state == 'opened')
		{
			playSound(this.audioConf['close']);
			this.collisionable = true;
			this.ai.state = 'closing';
		}
	}
	onOpen()
	{
		//
	}
	onClose()
	{
		//
	}
}

class DefaultDoor extends Door
{
	constructor(wall, floor, x, y, z, w, h, closeDelay = 0, collisionOpen = true, step  = 1)
	{
		super(wall, floor, x, y, z, w, h, step);
		this.closeDelay = closeDelay;
		this.collisionOpen = collisionOpen;
	}

	update(ftime)
	{
		Door.prototype.update.call(this, ftime);
	}

	onCollision(other)
  	{
  		if (this.collisionOpen)
  			this.open();
  	}

  	onOpen()
  	{
  		if (this.closeDelay > 0)
  			setTimeout( () => this.close(), this.closeDelay);
  	}
}