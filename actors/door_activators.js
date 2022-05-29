class OneOffSwitch extends Actor
{
	audioConf =
	{
		"on" : "DSSWTCHN",
		"off" : "DSSWTCHX"
	};
	LinkedDoor;
	isOn = false;
	constructor(x, y, img, door)
	{
		super(img, x, y, 0);
		this.LinkedDoor = door;
		// this.LinkedDoor.closeDelay = 0;
		this.canTakeDamage = false;
	}
	onActivate() {}
	onDeactivate() {}
	update(ftime)
	{
		//DO NOTHING
	}
	getAnimation()
	{
		if (!this.isOn)
			return this.idleImg;
		else
		{
			let anim = this.idleImg,
			lastNum = parseInt(anim.substring(anim.length, anim.length-1)) + 1,
			withoutLastNum = anim.substring(0, anim.length-1);
			// console.log(lastNum + " ; " + withoutLastNum);
			return withoutLastNum + lastNum;
		}
	}
	use()
	{
		if (!this.isOn)
			this.turnOn();
	}
	turnOn()
	{
		if (!this.isOn)
		{

			this.isOn = true;
			this.LinkedDoor.open();
			playSound(this.audioConf["on"]);
			this.onActivate();
		}
	}
	turnOff()
	{
		this.isOn = false;
		this.LinkedDoor.close();
		playSound(this.audioConf["off"]);
		this.onDeactivate();
	}
}

class SelfDeactivatedSwitch extends OneOffSwitch
{
	mustDeactivate = false;
	constructor(x, y, img, door)
	{
		super(x, y, img, door);
		this.deactivateDelay = this.LinkedDoor.closeDelay == 0 ? 2500 : this.LinkedDoor.closeDelay;
		this.LinkedDoor.closeDelay = this.deactivateDelay;
	}
	update(ftime)
	{
		if (this.mustDeactivate)
		{
			this.mustDeactivate = false;
			this.turnOff();
		}
	}
	onActivate()
	{
		setTimeout( () => this.mustDeactivate = true, this.deactivateDelay);
	}

}

class ManuallyDeactivatedSwitch extends OneOffSwitch
{
	constructor(x, y, img, door)
	{
		super(x, y, img, door);
		this.deactivateDelay = this.LinkedDoor.closeDelay = 0;
	}
	use()
	{
		if (!this.isOn)
			this.turnOn();
		else
			this.turnOff();
	}
}


//ТЕМА УП: программа учета часов работников компании