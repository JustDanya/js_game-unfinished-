function PointVsAABB(point, actor)
{
	let left = actor.x,
	right = actor.x + actor.width,
	top = actor.y,
	bottom = actor.y + actor.height;
	return (
      left <= point.x && point.x <= right &&
      top <= point.y && point.y <= bottom
    );
}

function testAABBs(actor1, actor2)
{
	let t;
	if ((t = actor1.x - actor2.x) > actor2.width || -t > actor1.width) return false;
	if ((t = actor1.y - actor2.y) > actor2.height || -t > actor1.height) return false;
	return true;
}

function circleIntersect(range, circle)
{
    let sqDist = 0.0;

    let dot = [circle.x, circle.y];
    let min = [range.x, range.y], max = [range.x + range.width, range.y + range.height];

    for (let i = 0; i < 2; i++)
    {
    	if (dot[i] < min[i]) sqDist += (min[i] - dot[i]) * (min[i] - dot[i]);
    	if (dot[i] > max[i]) sqDist += (dot[i] - max[i]) * (dot[i] - max[i]);
    }

    return sqDist <= (circle.r * circle.r);
}

function RayVsAABB(rayOrig, rayDir, boundary,
	con_point, con_norm, t_hitN)
{
	let t_near = [], t_far = [], temp;
	t_near[0] = (boundary.x - rayOrig[0]) / rayDir[0];
	t_near[1] = (boundary.y - rayOrig[1]) / rayDir[1];
	t_far[0] = (boundary.x + boundary.width - rayOrig[0]) / rayDir[0];
	t_far[1] = (boundary.y + boundary.height - rayOrig[1]) / rayDir[1];


	if (t_near[0] > t_far[0]) {temp = t_near[0]; t_near[0] = t_far[0]; t_far[0] = temp;}
	if (t_near[1] > t_far[1]) {temp = t_near[1]; t_near[1] = t_far[1]; t_far[1] = temp;}

	if (t_near[0] > t_far[1] || t_near[1] > t_far[0]) return false;

	t_hitN.val = t_near[0] > t_near[1] ? t_near[0] : t_near[1];
	let t_hitF = t_far[0] < t_far[1] ? t_far[0] : t_far[1];

	if (t_hitF < 0) return false;

	con_point[0] = rayOrig[0] + t_hitN.val * rayDir[0];
	con_point[1] = rayOrig[1] + t_hitN.val * rayDir[1];

	con_norm[0] = 0;
	con_norm[1] = 0;

	if (t_near[0] > t_near[1])
	{
		if (rayDir[0] < 0)
		{
			con_norm[0] = 1;
			con_norm[1] = 0;
		}
		else
		{
			con_norm[0] = -1;
			con_norm[1] = 0;
		}
	}
	else if (t_near[0] < t_near[1])
	{
		if (rayDir[1] < 0)
		{
			con_norm[0] = 0;
			con_norm[1] = 1;
		}
		else
		{
			con_norm[0] = 0;
			con_norm[1] = -1;
		}
	}

	// Game.ctx.fillRect(boundary.x, boundary.y, boundary.width, boundary.height);

	// console.log("tNear: " + t_near[0] + " ; " + t_near[1] + " tFar: " + t_far[0] + " ; " + t_far[1]);

	return true;
}

function DynamicAABBs(dynamic, static, con_point, con_norm, t_hitN, elapsedTime)
{
	if (dynamic.velocity[0] == 0 && dynamic.velocity[1] == 0)
		return false;
	//expanding target
	static.x = static.x - dynamic.width / 2;
	static.y = static.y - dynamic.height / 2;
	static.width = static.width + dynamic.width;
	static.height = static.height + dynamic.height;


	let start = [dynamic.x + dynamic.width / 2, dynamic.y + dynamic.height / 2];
	let dir = [dynamic.velocity[0] * elapsedTime, dynamic.velocity[1] * elapsedTime];
	if (RayVsAABB(start, dir, static, con_point, con_norm, t_hitN) )
	{
		// console.log(t_hitN.val);
		return (t_hitN.val > 0.0 && t_hitN.val < 1.0);
	}
	else
		return false;
}

function SolveCollision(actor1, actor2, orig, elapsedTime)
{
	//outs
	let cp = [], cn = [], tNear = {val: 0};
	if (DynamicAABBs(actor1, actor2, cp, cn, tNear, elapsedTime * 0.25)) // * 0.25
	{
		if (cn[1] == 0 && cn[0] == 0) // diagonal collision
		{
			orig.velocity[0] = 0; //+= cn[0] * Math.abs(orig.velocity[0]) * (1 - tNear.val); // = 0;
			orig.velocity[1] = 0; //+= cn[0] * Math.abs(orig.velocity[0]) * (1 - tNear.val); // = 0;
		}
		else
		{
			if (cn[0] != 0)
				orig.velocity[0] = 0; //+= cn[0] * Math.abs(orig.velocity[0]) * (1 - tNear.val); // = 0;
			if (cn[1] != 0)
				orig.velocity[1] = 0; //+= cn[1] * Math.abs(orig.velocity[1]) * (1 - tNear.val);
		}
		return true;
	}
	return false;
}