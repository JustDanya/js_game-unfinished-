class HBonus extends Pickup
{
	animConf = { "idle" : 4 };
	constructor(x, y)
	{
		super("BON1", x, y)
		this.pickValue = 1
		this.message = "MSGHLTBON";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.med && other._health > 0)
		{
			other.makeDamage(this.pickValue, this)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}

	}
	update(ftime)
	{
		this.animComponent.continueAnimation();
		if (!this.isAnimPlaying)
			this.runAnim(8, "idle");
	}
}
class Stimpack extends Pickup
{
	constructor(x, y)
	{
		super("STIM", x, y)
		this.pickValue = 10
		this.message = "MSGSTEAM";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.med && other._health > 0 && other._health < other.MaxHealth)
		{
			other.makeDamage(this.pickValue, this)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}
	}
}
class Medicine extends Pickup
{
	constructor(x, y)
	{
		super("MEDI", x, y)
		this.pickValue = 25
		this.message = "MSGMED";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.med && other._health > 0 && other._health < other.MaxHealth)
		{
			other.makeDamage(this.pickValue, this)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}
	}
}
class Soul extends Pickup
{
	animConf = { "idle" : 4 };
	constructor(x, y)
	{
		super("SOUL", x, y)
		this.pickValue = 100
		this.message = "MSGSUPCHARGE";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.med && other._health > 0)
		{
			other.makeDamage(this.pickValue, this)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}

	}
	update(ftime)
	{
		this.animComponent.continueAnimation();
		if (!this.isAnimPlaying)
			this.runAnim(8, "idle");
	}
}