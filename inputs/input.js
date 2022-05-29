class BasedInput
{
	Pawn;
	pointerX;
	pointerY;
	pointerUnderActivator = false;
	constructor(actor)
	{
		this.Pawn = actor;
		this.Pawn.input = this;
	}
	update(ftime)
	{
		//
	}
	setPawnVelocity(x, y)
	{
		//
	}
	givePawnWeapon(ind)
	{
		if (this.Pawn.inventory.getWeapon(this.Pawn.availableWeapons[ind]))
		{
			this.Pawn.currentWeapon = this.Pawn.playerWeapons[ind];
			this.Pawn.onWeaponChange();
		}
		else
		{

			console.log("No Weapon");
		}
		// console.log(this.Pawn.currentWeapon.constructor.name);
	}
	activatePawnAttack()
	{
		this.Pawn.wantsFire = true;
	}
	deactivatePawnAttack()
	{
		this.Pawn.wantsFire = false;
	}

	iniciatePawnUse()
	{
		let dist = Math.sqrt( Math.pow(this.Pawn.x - this.Pawn.currentActivator.x, 2)
			+ Math.pow(this.Pawn.y - this.Pawn.currentActivator.y, 2) );
		if (dist <= 100)
			this.Pawn.currentActivator.use();
		else
		{
			Game.hud.showMessage("TOOFAR");
			console.log("YOU ARE TOO FAR AWAY");
		}
		// console.log(this.Pawn.currentActivator);
	}

}
