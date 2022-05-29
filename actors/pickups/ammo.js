class Clip extends Pickup
{
	constructor(x, y)
	{
		super("CLIP", x, y)
		this.ammoType = "clips"
		this.targetWeapon = "pistol"
		this.pickValue = 10
		this.message = "MSGCLIP";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.ammo && other._health > 0
			&& other.inventory.getAmmo(this.ammoType) < other.inventory.getAmmoMax(this.ammoType) && other.inventory.getPickableWeapon(this.targetWeapon))
		{
			other.inventory.addAmmo(this.ammoType, this.pickValue)
			// other.onPickupPicked(this)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}

	}
}
class AmmoBox extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "AMMO"
		this.ammoType = "clips"
		this.pickValue = 50
		this.message = "MSGBULBOX";
	}
}
class Shells extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "SHEL"
		this.ammoType = "shells"
		this.targetWeapon = "shotgun"
		this.pickValue = 4
		this.message = "MSGSHELLS";
	}
}
class ShellBox extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "SBOX"
		this.ammoType = "shells"
		this.targetWeapon = "shotgun"
		this.pickValue = 20
		this.message = "MSGSHELLBOX";
	}
}
class Rocket extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "ROCK"
		this.ammoType = "rockets"
		this.targetWeapon = "rocket"
		this.pickValue = 1
		this.message = "MSGROCK";
	}
}
class RocketBox extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "BROK"
		this.ammoType = "rockets"
		this.targetWeapon = "rocket"
		this.pickValue = 5
		this.message = "MSGROCKBOX";
	}
}
class Cells extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "CELL"
		this.ammoType = "cells"
		this.targetWeapon = "plasma"
		this.pickValue = 20
		this.message = "MSGCELL";
	}
}
class CellPack extends Clip
{
	constructor(x, y)
	{
		super(x, y)
		this.idleImg = "CELP"
		this.ammoType = "cells"
		this.targetWeapon = "plasma"
		this.pickValue = 100
		this.message = "MSGCELLBOX";
	}
}
class Backpack extends Pickup
{
	constructor(x, y)
	{
		super("BPAK", x, y)
		this.message = "MSGBCKP";
	}
	onCollision(other)
	{
		if (other != null && other.pickConf.ammo && other._health > 0)
		{
			if (!other.inventory.wasSizedUp)
			{
				other.inventory.doubleAmmoMax()
				other.inventory.wasSizedUp = true
			}
			let ammos = ["clips", "shells", "rockets", "cells"]
			ammos.forEach(function(exp)
				{
					switch(exp)
					{
						case "clips":
							other.inventory.addAmmo(exp, 10)
							break;
						case "shells":
							other.inventory.addAmmo(exp, 4)
							break;
						case "rockets":
							other.inventory.addAmmo(exp, 1)
							break;
						case "cells":
							other.inventory.addAmmo(exp, 20)
							break;
					}
				});
			// other.onPickupPicked(this)
			Game.despawnPickup(this)
			playSound("DSITEMUP")
			Game.hud.showMessage(this.message);
		}
	}
}