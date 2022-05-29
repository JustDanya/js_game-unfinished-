class ABonus extends Pickup
{
	animConf = { "idle" : 4 };
	constructor(x, y)
	{
		super("BON2", x, y)
		this.pickValue = 1
		this.message = "MSGARMRBON";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.armor && other._health > 0)
		{
			other.Armor = this.pickValue + other._armor
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
class GreenJacket extends Pickup
{
	animConf = { "idle" : 2 };
	constructor(x, y)
	{
		super("ARM1", x, y)
		this.pickValue = 100
		this.message = "MSGGRARMR";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.armor && other._health > 0 && other._armor < 100)
		{
			other.ArmorType = false
			other.Armor = this.pickValue
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
class BlueJacket extends Pickup
{
	animConf = { "idle" : 2 };
	constructor(x, y)
	{
		super("ARM2", x, y)
		this.pickValue = 200
		this.message = "MSGMGARMR";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.armor && other._health > 0 && other._armor < 200)
		{
			other.ArmorType = true
			other.Armor = this.pickValue
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