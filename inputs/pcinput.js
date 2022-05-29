class PCInput extends BasedInput
{
	constructor(actor)
	{
		super(actor);
		let instance = this;
		document.addEventListener('keydown', function(evt) {instance.keyOn(evt);});
		// document.addEventListener('keyup', this.keyOff);
		document.addEventListener('mousedown', function(evt)
			{
				if (instance.pointerUnderActivator)
					instance.iniciatePawnUse();
				else
					instance.activatePawnAttack();
			});
		document.addEventListener('mouseup', function(evt) {instance.deactivatePawnAttack();});
		document.addEventListener('mousemove', function(evt)
		{
			instance.pointerX = evt.clientX;
			instance.pointerY = evt.clientY;
		});
	}
	keyOn(event)
	{
		let key = event.keyCode;
		if (key >= 48 && key <= 57)
		{
			switch(key)
			{
				case 49:
					this.givePawnWeapon(0);
					break;
				case 50:
					this.givePawnWeapon(1);
					break;
				case 51:
					this.givePawnWeapon(2);
					break;
				case 52:
					this.givePawnWeapon(3);
					break;
				case 53:
					this.givePawnWeapon(4);
					break;
				case 54:
					this.givePawnWeapon(5);
					break;
				case 55:
					this.givePawnWeapon(6);
					break;
			}
		}
	}
	keyOff(event)
	{
		//
	}
	mouseDown()
	{
		//
	}
	mouseUp()
	{
		//
	}
}