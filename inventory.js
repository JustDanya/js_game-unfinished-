class Inventory
{
	wasSizedUp = false
	#items =
	{
		weapons :
		{
			"chainsaw" : false,
			"pistol" : false,
			"shotgun" : false,
			"chaingun" : false,
			"rocket" : false,
			"plasma" : false,
			"bfg" : false
		},
		pickableWeapon:
		{
			"chainsaw" : false,
			"pistol" : false,
			"shotgun" : false,
			"chaingun" : false,
			"rocket" : false,
			"plasma" : false,
			"bfg" : false
		},
		ammo :
		{
			"clips" : 0,
			"shells" : 0,
			"rockets" : 0,
			"cells" : 0
		},
		ammoMax :
		{
			"clips" : 200,
			"shells" : 50,
			"rockets" : 50,
			"cells" : 300
		},
		keys :
		{
			"blue" : false,
			"red" : false,
			"yellow" : false
		}
	};
	setPickableWeapon(key, value)
	{
		this.#items.pickableWeapon[key] = value
	}
	getPickableWeapon(key)
	{
		return this.#items.pickableWeapon[key]
	}
	onNewWeapon() {}
	getWeapon(key)
	{
		return this.#items.weapons[key];
	}
	setWeapon(key, value)
	{
		this.#items.weapons[key] = value
		this.onNewWeapon()
	}

	getAmmoMax(key)
	{
		return this.#items.ammoMax[key];
	}
	doubleAmmoMax()
	{
		for (let key in this.#items.ammoMax)
			this.#items.ammoMax[key] = this.#items.ammoMax[key] * 2
	}

	onAmmoChange(key, fromPickup) {}
	getAmmo(key)
	{
		return this.#items.ammo[key];
	}
	setAmmo(key, value)
	{
		this.#items.ammo[key] = value;
		if (this.#items.ammo[key] > this.#items.ammoMax[key])
			this.#items.ammo[key] = this.#items.ammoMax[key]
		// this.onAmmoChange(key)
	}
	addAmmo(key, value)
	{
		let fromPickup = value > 0 ? true : false;
		this.#items.ammo[key] += value;
		if (this.#items.ammo[key] > this.#items.ammoMax[key])
			this.#items.ammo[key] = this.#items.ammoMax[key]
		this.onAmmoChange(key, fromPickup);
	}
	onNewKey() {}
	getKey(key)
	{
		return this.#items.keys[key];
	}
	setKey(key, value)
	{
		this.#items.keys[key] = value
		this.onNewKey()
	}
}