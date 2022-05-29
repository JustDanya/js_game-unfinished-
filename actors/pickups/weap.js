class ShotgunPick extends Pickup
{
	constructor(x, y)
	{
		super("SHOT", x, y)
		this.targetWeapon = "shotgun"
		this.ammoType = "shells"
		this.pickValue = 5
		this.message = "MSGSHTG";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.ammo && other._health > 0
			&& other.inventory.getPickableWeapon(this.targetWeapon)
			&& (other.inventory.getAmmo(this.ammoType) < other.inventory.getAmmoMax(this.ammoType) || !other.inventory.getWeapon(this.targetWeapon))
			)
		{
			other.inventory.addAmmo(this.ammoType, this.pickValue)
			other.inventory.setWeapon(this.targetWeapon, true)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}
	}
}
class ChaingunPick extends ShotgunPick
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "MGUN"
		this.targetWeapon = "chaingun"
		this.ammoType = "clips"
		this.pickValue = 20
		this.message = "MSGCHAING";
	}
}
class ChainsawPick extends ShotgunPick
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "CSAW"
		this.targetWeapon = "chainsaw"
		this.ammoType = "clips"
		this.pickValue = 0
		this.message = "MSGCHAINS";
	}
}
class RocketLauncherPick extends ShotgunPick
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "LAUN"
		this.targetWeapon = "rocket"
		this.ammoType = "rockets"
		this.pickValue = 5
		this.message = "MSGRCKLAUN";
	}
}
class PlasmaPick extends ShotgunPick
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "PLAS"
		this.targetWeapon = "plasma"
		this.ammoType = "cells"
		this.pickValue = 30
		this.message = "MSGPLASR";
	}
}
class BFGPick extends ShotgunPick
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "BFUG"
		this.targetWeapon = "bfg"
		this.ammoType = "cells"
		this.pickValue = 50
		this.message = "MSGBFG";
	}
}
