class Player extends Actor
{
	audioConf = {
		"hited" : "DSPLPAIN",
		"death" : ["DSPLDTH", "DSPDIEHI"],
		"megadeath" : "DSSLOP"
	};
	pickConf =
	{
		med : true,
		armor : true,
		ammo : true
	};
	isDeath = false;
	input;
	currentActivator;
	wantsFire = false;
	availableWeapons = ["chainsaw", "pistol", "shotgun", "chaingun", "rocket", "plasma", "bfg"];
	playerWeapons = [new ChainSaw(this), new Pistol(this), new Shotgun(this), new ChainGun(this),
		new RocketLauncher(this), new PlasmaGun(this), new BigFuckingGun(this)];
	MaxArmor = 200;
	_armor_type = false; // f - green armor (1/3 def), t - blue armor (1/2 def)
	onArmorTypeChange()
	{
		//
	}
	set ArmorType(value)
	{
		this._armor_type = value
		this.onArmorTypeChange()
	}
	_armor = 0;
	onArmorChange()
	{
		//
	}
	onWeaponChange() {/* */};
	set Armor(value)
	{
		this._armor = value;
		if (this._armor > this.MaxArmor)
			this._armor = this.MaxArmor
		if (this._armor >= 0)
			this.onArmorChange()
	}
	update(ftime)
	{
		if (this._health <= 0) this.isDeath = true;
		Actor.prototype.update.call(this, ftime);
		if (this.wantsFire && this.currentWeapon.canFire && this.currentWeapon.checkAmmo() && !this.isDeath)
		{
			let shotLoc = {x: this.input.pointerX, y: this.input.pointerY};
			if (shotLoc.x <= this.x && shotLoc.y < this.y)
				this.runAnim(3, "attack", false, 225);//UL
			else if (shotLoc.x <= this.x && shotLoc.y > this.y+40)
				this.runAnim(1, "attack", false, 225);//DL
			else if (shotLoc.x <= this.x && shotLoc.y < this.y+40 && shotLoc.y >= this.y)
				this.runAnim(2, "attack", false, 225);//L
			else if (shotLoc.x > this.x+40 && shotLoc.y < this.y)
				this.runAnim(5, "attack", false, 225);//UR
			else if (shotLoc.x > this.x+40 && shotLoc.y > this.y+40)
				this.runAnim(7, "attack", false, 225);//DR
			else if (shotLoc.x > this.x+40 && shotLoc.y < this.y+40 && shotLoc.y >= this.y)
				this.runAnim(6, "attack", false, 225);//R
			else
			{
				if (shotLoc.y < this.y)
					this.runAnim(4, "attack", false, 225);//U
				else
					this.runAnim(0, "attack", false, 225);//D
			}
			let bound = getBoundary(this);
			this.currentWeapon.fire({x: bound.x + bound.width/2, y: bound.y + bound.height/2}, shotLoc);
		}
		if (!this.isAnimPlaying) this.runAnim(this.determineDirection(), "walk", false);

	}
	makeDamage(value, attacker)
	{
		if (!this.canTakeDamage) return;
		if (value < 0)
		{
			let lastVal = value;
			if (this._armor_type)
			{
				value = Math.floor(value * 0.5) + (value % 2)
			}
			else
			{
				value = ( Math.floor(value / 3) * 2 ) + (value % 3)
			}
			this.Armor = this._armor + lastVal - value
			if (this._armor < 0)
			{
				value += this._armor
				this.Armor = 0;
			}
		}
		// console.log("Base: " + lastVal + "; Fixed: " + value + "; Armor: " + this._armor)
		Actor.prototype.makeDamage.call(this, value, attacker)

	}
	constructor(x = 10, y = 10)
	{
		super('PLAY', x, y, 2)
		this.inventory.setPickableWeapon("chainsaw", true)
		this.inventory.setPickableWeapon("pistol", true)
		this.inventory.setPickableWeapon("shotgun", true)
		this.inventory.setPickableWeapon("chaingun", true)
		this.inventory.setPickableWeapon("rocket", true)
		this.inventory.setPickableWeapon("plasma", true)
		this.inventory.setPickableWeapon("bfg", true)

		this.inventory.setWeapon("pistol", true)
		this.inventory.setAmmo("clips", 50)

		this.currentWeapon = this.playerWeapons[1];

		//-- fun
		// this.speed = 40;
	}
	move(elapsed = 1)
	{
		if (this.isDeath) return;

		elapsed = Game.elapsedTime * 0.05;
		this._x += this.velocity[0] * elapsed;
		this._y += this.velocity[1] * elapsed;

		// if (this._x > Game.SightW || this._x < Game.SightZX || this._y > Game.SightH || this._y < Game.SightZY )
		// 	this.onCollision(null);

		if ( this._x > Game.SightW - 10) 
		{
			Game.cOffsetX -= 1;

			this.x = Game.SightW - 10;
		}
		else if ( this._x < Game.SightZX + 10)
		{
			Game.cOffsetX += 1;

			this.x = Game.SightZX + 10;
		}

		if ( this._y > Game.SightH - 10) 
		{
			Game.cOffsetY -= 1;

			this._y = Game.SightH - 10;
		}
		else if ( this._y < Game.SightZY + 10)
		{
			Game.cOffsetY += 1;

			this._y = Game.SightZY + 10;
		}

		if (Game.cOffsetX < -Game.levelW) Game.cOffsetX = -Game.levelW;
		else if (Game.cOffsetX > 0) Game.cOffsetX = 0;

		if (Game.cOffsetY < -Game.levelH) Game.cOffsetY = -Game.levelH;
		else if (Game.cOffsetY > 0) Game.cOffsetY = 0;

		// console.log("Abs", this.x, this.y)
		// console.log("Rel", this._x, this._y)
	}
}