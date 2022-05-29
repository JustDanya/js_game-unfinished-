const N_PREFIX = "STTNUM";
const N_WIDTH = 14, N_HEIGHT = 16;
const FACE_WIDTH = 26, FACE_HEIGHT = 31;
class hudFace
{
	healthState = 0; // from 0 to 4
	STProgress = 1; //from 0 to 2
	mustUpdateFace = false;
	updateDelay = 2000;
	lastFaceUpdatedTime = 0;
	currentTime = 0;
	state = "GOD";
	constructor()
	{
		this.baseImg = "STF";
	}
	setState(state)
	{
		this.state = state;
		if (this.state === "DEAD" || this.state === "GOD") this.healthState = 0;
		this.lastFaceUpdatedTime = this.currentTime;
	}
	update(currentTime)
	{
		this.currentTime = currentTime;
		if (currentTime - this.lastFaceUpdatedTime >= this.updateDelay)
		{
			if (this.state === "ST")
			{
				if (this.STProgress == 1)
				{
					this.STProgress++;
					this.lastFaceUpdatedTime = currentTime;
				}
				else if (this.STProgress == 2)
				{
					this.STProgress = 0;
					this.lastFaceUpdatedTime = currentTime;
				}
				else
				{
					this.STProgress = 1;
					this.lastFaceUpdatedTime = currentTime;
				}
			}
			else
			{
				this.setState("ST");
			}
		}
		//
	}
	getAnimation()
	{
		let anim = this.baseImg + this.state + this.healthState;
		if (this.state === "ST") anim += this.STProgress;
		else if (this.state === "TR" || this.state === "TL") anim += 0;
		return anim;
	}
}
class hudArea
{
	constructor(x, y, width, height)
	{
		this.x = x; this.y = y;
		this.width = width; this.height = height;
	}
}
class HUD
{
	linkedPlayer;
	faceStart;
	faceScale;
	weaponPercentage = 15;
	ammoPercentage = 10;
	healthPercentage = 10;
	armorPercentage = 10;
	messages = [];
	messagesTime = [];
	maxMessagesCount = 4;
	messageDelay = 2500;
	maxMsgWidth = 0;
	maxMsgHeight = 0;
	currentTime = 0;
	constructor(player)
	{
		this.Face = new hudFace();
		this.canv = document.getElementById('hud');
		this.ctx = this.canv.getContext('2d');
		this.canv.width = window.innerWidth;
		this.canv.height = window.innerHeight;
		this.ammoArea = new hudArea(
			this.canv.width - this.canv.width / 2,
			this.canv.height - (this.canv.height/100*this.ammoPercentage),
			this.canv.width/2,
			this.canv.height/100*this.ammoPercentage
			);
		this.weaponArea = new hudArea(
			this.canv.width - this.canv.width / 2,
			this.canv.height - (this.canv.height/100*this.weaponPercentage) - this.ammoArea.height,
			this.canv.width/2,
			this.canv.height/100*this.weaponPercentage
			);
		this.armorArea = new hudArea(
			0,
			this.canv.height - (this.canv.height/100*this.armorPercentage),
			this.canv.width/2,
			this.canv.height/100*this.ammoPercentage
			);
		this.healthArea = new hudArea(
			0,
			this.canv.height - (this.canv.height/100*this.healthPercentage) - this.armorArea.height,
			this.canv.width/2,
			this.canv.height/100*this.ammoPercentage
			);
		this.faceScale = this.healthArea.height / FACE_HEIGHT;
		this.linkedPlayer = player;
		let inst = this;
		player.inventory.onAmmoChange = function(key, fromPickup) {inst.displayAmmo(key, fromPickup);};
		player.onWeaponChange = function() {inst.displayWeapon()};
		player.onHealthChange = function(value, attacker) {inst.displayHealth(value, attacker)}
		player.onArmorChange = function() {inst.displayArmor()}
		player.inventory.onNewWeapon = function() {inst.NewWeapon()}
		// player.onArmorTypeChange = function() {inst.displayArmor()}
		// this.ctx.fillRect(this.weaponArea.x, this.weaponArea.y, this.weaponArea.width, this.weaponArea.height);
	}
	update(currentTime)
	{
		this.currentTime = currentTime;
		this.Face.update(currentTime);
		this.ctx.clearRect(this.healthArea.x, this.healthArea.y, FACE_WIDTH*this.faceScale, FACE_HEIGHT*this.faceScale);
		let fimg = Textures[this.Face.getAnimation()];
		this.ctx.drawImage(fimg, this.healthArea.x, this.healthArea.y, fimg.width*this.faceScale, fimg.height*this.faceScale);

		this.ctx.clearRect(0, 0, this.maxMsgWidth, this.maxMsgHeight);
		for (let i = 0; i < this.messagesTime.length; i++)
		{
			if (currentTime - this.messagesTime[i] >= this.messageDelay)
			{
				// console.log("REMOVAL");
				this.messages.splice(i, 1);
				this.messagesTime.splice(i, 1);
			}
		}
		// console.log(this.messages);
		let yOf = 0, xOf = 0;
		for(let i = 0; i < this.messages.length; i++)
		{
			let curMsg = Textures[this.messages[i]];
			this.ctx.drawImage(curMsg, 0, yOf);
			yOf += curMsg.height;
			if (xOf < curMsg.width) xOf = curMsg.width;
		}
		this.maxMsgWidth = xOf;
		this.maxMsgHeight = yOf;
	}
	showMessage(msg)
	{
		if (Textures[msg] === undefined) return;
		//
		if (this.messages.length <= this.maxMessagesCount)
		{
			this.messages.push(msg);
			this.messagesTime.push(this.currentTime);
		}
		else
		{
			this.messages.splice(0, 1);
			this.messagesTime.splice(0, 1);
			this.messages.push(msg);
			this.messagesTime.push(this.currentTime);
		}
	}
	NewWeapon() {this.Face.setState("EVL");}
	getNums(a)
	{
		let nums = [];
		while(a > 0)
		{
			nums.push(a%10);
			a = Math.floor(a / 10);
		}
		return nums;
	}
	getArmorByFlag(flag)
	{
		if (flag)
		{
			return "ARM2A0";
		}
		else
		{
			return "ARM1A0";
		}
	}
	getAmmoByKey(key)
	{
		let ammoImg;
		switch(key)
		{
			case "clips":
				ammoImg = "AMMO";
			break;
			case "shells":
				ammoImg = "SHEL";
			break;
			case "rockets":
				ammoImg = "ROCK";
			break;
			case "cells":
				ammoImg = "CELL";
			break;
			default:
				ammoImg = "none";
			break;
		}

		return ammoImg + "A0";
	}
	getWeaponByName(name)
	{
		let weap = "2PISE0";
		switch(name)
		{
			case "ChainSaw":
				weap = "CSAWA0";
			break;
			case "Shotgun":
				weap = "SHOTA0";
			break;
			case "ChainGun":
				weap = "MGUNA0";
			break;
			case "RocketLauncher":
				weap = "LAUNA0";
			break;
			case "PlasmaGun":
				weap = "PLASA0";
			break;
			case "BigFuckingGun":
				weap = "BFUGA0";
			break;
		}
		return weap;
	}
	getElementStart(area, width, height, horizontal, vertical, numsCount = 0, numScale = 1)
	{
		let elementStartPosition = {x: area.x, y: area.y};
		switch(horizontal)
		{
			case "RIGHT":
				let numWidth = N_WIDTH * numScale;
				elementStartPosition.x = area.x + (area.width - width - (numWidth*numsCount));
			break;
			case "LEFT":
				//default
			break;
		}
		switch(vertical)
		{
			case "BOTTOM":
				elementStartPosition.y = area.y + (area.height - height);
			break;
			case "TOP":
				//default
			break;
		}
		return elementStartPosition;
	}
	displayAmmo(key, fromPickup)
	{
		if (fromPickup)
		{
			if (key !== this.linkedPlayer.currentWeapon.ammoType) return;
		}
		this.ctx.clearRect(this.ammoArea.x, this.ammoArea.y, this.ammoArea.width, this.ammoArea.height);
		// this.ctx.fillRect(this.ammoArea.x, this.ammoArea.y, this.ammoArea.width, this.ammoArea.height);
		let ammoImage = this.getAmmoByKey(key);
		if (ammoImage !== "noneA0")
		{
			let aimg = Textures[ammoImage];
			let nums = this.getNums(this.linkedPlayer.inventory.getAmmo(key));
			nums = nums.length == 0 ? [0] : nums;
			let ascale = this.ammoArea.height / aimg.height / 1.25;
			let numScale = this.ammoArea.height / N_HEIGHT / 1.25;
			let ammoStart = this.getElementStart(
				this.ammoArea, aimg.width*ascale, aimg.height*ascale,
				"RIGHT", "BOTTOM", nums.length, numScale);
			//
			let numStart = ammoStart.x + aimg.width*ascale;
			this.ctx.drawImage(aimg, ammoStart.x, ammoStart.y, aimg.width*ascale, aimg.height*ascale);
			for (let i = nums.length-1; i >= 0; i--)
			{
				let nimg = Textures[N_PREFIX+nums[i]];
				this.ctx.drawImage(nimg, numStart, ammoStart.y, nimg.width*numScale, nimg.height*numScale);
				numStart += nimg.width*numScale;
			}
			console.log(key + ": " + this.linkedPlayer.inventory.getAmmo(key));
		}
	}
	displayWeapon()
	{
		this.ctx.clearRect(this.weaponArea.x, this.weaponArea.y, this.weaponArea.width, this.weaponArea.height);
		// this.ctx.fillRect(this.weaponArea.x, this.weaponArea.y, this.weaponArea.width, this.weaponArea.height);
		let weapon = this.getWeaponByName(this.linkedPlayer.currentWeapon.constructor.name);
		let wimg = Textures[weapon];
		let scale = this.weaponArea.height / wimg.height / 2;
		if (weapon === "BFUGA0") scale *= 2;
		let start = this.getElementStart(
				this.weaponArea, wimg.width*scale, wimg.height*scale,
				"RIGHT", "BOTTOM");
		this.ctx.drawImage(wimg, start.x, start.y, wimg.width*scale, wimg.height*scale);
		this.displayAmmo(this.linkedPlayer.currentWeapon.ammoType, false)
		console.log(this.linkedPlayer.currentWeapon.constructor.name);
		// console.log(this.linkedPlayer.currentWeapon);
	}
	setFace(value, attacker)
	{
		let faceState = "STF";
		if (value < 0)
		{
			if (value <= -20)
			{
				this.Face.setState("OUCH");
			}
			else
			{
				if (attacker.x > this.linkedPlayer.x + 150) // RIGHT
				{
					this.Face.setState("TR");
				}
				else if (attacker.x < this.linkedPlayer.x - 150) // LEFT
				{
					this.Face.setState("TL");
				}
				else // STRAIGHT
				{
					this.Face.setState("KILL");
				}
			}
		}
		if (this.linkedPlayer._health >= 80)
			this.Face.healthState = 0;
		else if (this.linkedPlayer._health >= 60 && this.linkedPlayer._health <= 79)
			this.Face.healthState = 1;
		else if (this.linkedPlayer._health >= 40 && this.linkedPlayer._health <= 59)
			this.Face.healthState = 2;
		else if (this.linkedPlayer._health >= 20 && this.linkedPlayer._health <= 39)
			this.Face.healthState = 3;
		else
			this.Face.healthState = 4;

	}
	displayHealth(value, attacker)
	{
		// this.ctx.fillRect(this.healthArea.x, this.healthArea.y, this.healthArea.width, this.healthArea.height);
		this.setFace(value, attacker);
		let fimg = Textures[this.Face.getAnimation()];
		let numScale = this.healthArea.height / N_HEIGHT / 1.25;
		let scale = this.healthArea.height / fimg.height;
		let nums = this.getNums(this.linkedPlayer._health);
		nums = nums.length == 0 ? [0] : nums;
		let faceStart = this.getElementStart(
				this.healthArea, fimg.width*scale, fimg.height*scale,
				"LEFT", "TOP", nums.length, numScale);
		this.faceStart = faceStart;
		let numStart = faceStart.x + fimg.width*scale;
		this.ctx.clearRect(this.healthArea.x+FACE_WIDTH*this.faceScale, this.healthArea.y, this.healthArea.width, this.healthArea.height);
		// this.ctx.drawImage(fimg, faceStart.x, faceStart.y, fimg.width*scale, fimg.height*scale);
		for (let i = nums.length-1; i >= 0; i--)
		{
			let nimg = Textures[N_PREFIX+nums[i]];
			this.ctx.drawImage(nimg, numStart, faceStart.y, nimg.width*numScale, nimg.height*numScale);
			numStart += nimg.width*numScale;
		}
	}
	displayArmor()
	{
		this.ctx.clearRect(this.armorArea.x, this.armorArea.y, this.armorArea.width, this.armorArea.height);
		let armorImg = this.getArmorByFlag(this.linkedPlayer._armor_type);
		let aimg = Textures[armorImg];
		let nums = this.getNums(this.linkedPlayer._armor);
		nums = nums.length == 0 ? [0] : nums;
		let ascale = this.armorArea.height / aimg.height / 1.25;
		let numScale = this.armorArea.height / N_HEIGHT / 1.25;
		let armorStart = this.getElementStart(
				this.armorArea, aimg.width*ascale, aimg.height*ascale,
				"LEFT", "BOTTOM", nums.length, numScale);
		let numStart = armorStart.x + aimg.width*ascale;
		this.ctx.drawImage(aimg, armorStart.x, armorStart.y, aimg.width*ascale, aimg.height*ascale);
		for (let i = nums.length-1; i >= 0; i--)
		{
			let nimg = Textures[N_PREFIX+nums[i]];
			this.ctx.drawImage(nimg, numStart, armorStart.y, nimg.width*numScale, nimg.height*numScale);
			numStart += nimg.width*numScale;
		}
	}
}