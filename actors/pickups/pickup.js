class Pickup extends Actor
{
	constructor(img, x, y)
	{
		super(img, x, y, 0)
		this.collisionable = false
		this._health = 0
		// this.animState[0] = 0
		this.animState[1] = 8
	}
	getAnimation()
	{
		return this.idleImg + animMatrix[this.animState[0]][8]
	}

	update(ftime)
  	{
  		this.animComponent.continueAnimation();//
  	}
}
