const StopDepth = 2//2;

class Node
{
	corner = [];
	width;
	objects = [];
	level;
	game;
	constructor(x, y, w, game, cap = 8, lvl = 0)
	{
		this.corner[0] = x;
		this.corner[1] = y;
		this.width = w;
		this.capacity = cap;
		this.divided = false;
		this.level = lvl;
		this.game = game;
		// console.log("New Node Level ", this.level)
	}

	divide()
	{
		this.nw = new Node(this.corner[0], this.corner[1], this.width / 2, this.game, this.capacity, this.level+1);
		this.ne = new Node(this.corner[0] + this.width / 2, this.corner[1], this.width / 2, 
			this.game, this.capacity, this.level+1);
		this.sw = new Node(this.corner[0], this.corner[1] + this.width / 2, this.width / 2, 
			this.game, this.capacity, this.level+1);
		this.se = new Node(this.corner[0] + this.width / 2, this.corner[1] + this.width / 2, 
			this.width / 2, this.game, this.capacity, this.level+1);
		this.divided = true;
	}

	insert(actor)
	{
		//check if actor can be in this tree
		if ( !(actor.x >= this.corner[0] &&
			actor.x <= this.corner[0]+this.width &&
			actor.y >= this.corner[1] &&
			actor.y <= this.corner[1]+this.width) )
			return;

		if (this.divided)
		{
			this.sw.insert(actor)
			this.nw.insert(actor)
			this.ne.insert(actor)
			this.se.insert(actor)
			return;
		}

		this.objects.push(actor);
		actor.Node = this;

		if (!this.divided && this.objects.length > this.capacity && this.level < StopDepth)
		{
			this.divide();
			for (let obj of this.objects)
			{
				this.sw.insert(obj)
				this.nw.insert(obj)
				this.ne.insert(obj)
				this.se.insert(obj)
			}
			this.objects = [];
		}
	}

	remove(actor)
	{
		let QN = actor.Node;
		// console.log(QN);
		if (QN === undefined)
		{
			// if (actor.idleImg == "POSS") console.log("ULTRASUPERMEGANASRAL");
			return
		}
		let i = QN.objects.indexOf(actor);
		// console.log(i)
		if (i > -1) QN.objects.splice(i, 1);
		// else console.log("CRINGE");
		 // console.log(QN);
	}

	getChilds()
	{
		let res = [];
		if (!this.divided) return res;
		res.push(this.nw);
		res.push(this.ne);
		res.push(this.sw);
		res.push(this.se);
		return res;
	}

	query(range, found)
	{
	    if (found === undefined) {
	      found = [];
	    }

	    let boundary =
	    {
	    	x: this.corner[0],
	    	y: this.corner[1],
	    	width: this.width,
	    	height: this.width,
	    	velocity: [0, 0]
	    };

	    if (!testAABBs( range, boundary ) ) {
	    	// console.log(range);
	      return found;
	    }
	//PointVsAABB
	    for (let actor of this.objects) {
	    	// console.log(actor)
	      if (testAABBs(getBoundary(actor), range)) {
	        found.push(actor);
	      }
	    }
	    if (this.divided) {
	      this.nw.query(range, found);
	      this.ne.query(range, found);
	      this.sw.query(range, found);
	      this.se.query(range, found);
	    }

	    return found;
  }

circleQuery(circle, found)
{
	if (found === undefined) {
	      found = [];
    }

    let boundary =
    {
    	x: this.corner[0],
    	y: this.corner[1],
    	width: this.width,
    	height: this.width
    };

    if (!circleIntersect( boundary, circle ) ) {
      return found;
    }
//CircleVsAABB
    for (let actor of this.objects) {
    	// console.log(actor)
      if (circleIntersect(getBoundary(actor), circle)) {
        found.push(actor);
      }
    }
    if (this.divided) {
      this.nw.circleQuery(circle, found);
      this.ne.circleQuery(circle, found);
      this.sw.circleQuery(circle, found);
      this.se.circleQuery(circle, found);
    }

 //    Game.ctx.strokeStyle = "red";
 //    Game.ctx.beginPath();
	// Game.ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
	// Game.ctx.stroke();
	// Game.ctx.strokeRect(boundary.x, boundary.y, boundary.width, boundary.height);

    return found;
}

	getAllObject()
	{
		let all_objects = [];
		all_objects = all_objects.concat(this.game.enemies, this.game.pickups, 
			this.game.walls, this.game.doors, this.game.activators);
		all_objects.push(this.game.Player);
		return all_objects;
	}

	rebuild()
	{
	    // console.log("START REBUILD");
		let all_objects = this.getAllObject();
		// console.log("ALL_OBJECTS LENGTH ", all_objects.length);
		this.nw = undefined;
	    this.ne = undefined;
	    this.sw = undefined;
	    this.se = undefined;
	    this.divided = false
	    this.objects = [];
	    for (let obj of all_objects)
	    	this.insert(obj);
	    // console.log("END REBUILD");
	}

  visualize(context)
  {
  	if (this.level == 1)
  		context.strokeStyle = "red";
  	else
  		context.strokeStyle = "white";
    context.strokeRect(this.corner[0], this.corner[1], this.width, this.width);
    if (this.divided)
    {
    	this.nw.visualize(context);
	    this.ne.visualize(context);
	    this.sw.visualize(context);
	    this.se.visualize(context);
    }
  }
}