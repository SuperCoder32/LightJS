'use strict'

//Generic geometry functions and classes

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
    set(v) {
        this.x = v.x;
        this.y = v.y;
    }
    add(v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }
    mul(s) {
        return new Vector(s*this.x, s*this.y);
    }
    sub(v) {
        return this.add( v.mul(-1) );
    }
}

class Segment {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
    length() {
        var x1 = this.start.x, y1 = this.start.y;
        var x2 = this.end.x, y2 = this.end.y;
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
	draw() {
		context.beginPath();
		context.moveTo(this.start.x, this.start.y);
		context.lineTo(this.end.x, this.end.y);
		context.stroke();
		context.closePath();
	}
}

function area_determinant(p1, p2, p3) {
    return (p2.x-p1.x)*(p3.y-p2.y)-(p3.x-p2.x)*(p2.y-p1.y);
}

function clockwise(p1, p2, p3) {
    return area_determinant(p1, p2, p3) < 0;
}

function areColliding(Ax, Ay, Awidth, Aheight, Bx, By, Bwidth, Bheight) {
	if (Bx <= Ax + Awidth) 
		if (Ax <= Bx + Bwidth) 
			if (By <= Ay + Aheight) 
				if (Ay <= By + Bheight) 
					return true;
	return false;
}

function quadrant(origin, vec) {
	if (vec.x <= origin.x && vec.y >= origin.y) {
		return 1;
	} if (vec.x <= origin.x && vec.y <= origin.y) {
		return 2;
	} if (vec.x >= origin.x && vec.y <= origin.y) {
		return 3;
	} if (vec.x >= origin.x && vec.y >= origin.y) {
		return 4;
	}
}

function canvasIntersectionPoint(seg) {
    var k = (seg.end.y - seg.start.y) / (seg.end.x - seg.start.x);
    var offset = seg.start.y - k * seg.start.x;

    var vec1, vec2, vec3, vec4;
    vec1 = new Vector(0, offset);
    vec2 = new Vector(- offset / k, 0);
    vec3 = new Vector(canvas.width, k * canvas.width + offset);
    vec4 = new Vector((canvas.height - offset) / k, canvas.height);

    var quad = quadrant(seg.start, seg.end);

    if (seg.start.x === seg.end.x) {
        if (seg.end.y < seg.start.y) {
            return new Vector(seg.start.x, 0);
        } else {
            return new Vector(seg.start.x, canvas.height);
        }
    } if (seg.start.y === seg.end.y) {
        if (seg.end.x > seg.start.x) {
            return new Vector(canvas.width, seg.start.y);
        } else {
            return new Vector(0, seg.start.y);
        }
    }
    if (quad === 1) {
        if (vec1.y < vec4.y) {
            return vec1;
        } else {
            return vec4;
        }
    } if (quad === 2) {
        if (vec2.y > vec1.y) {
            return vec2;
        } else {
            return vec1;
        }
    } if (quad === 3) {
        if (vec3.x < vec2.x) {
            return vec3;
        } else {
            return vec2;
        }
    } if (quad === 4) {
        if (vec4.x < vec3.x) {
            return vec4;
        } else {
            return vec3;
        }
    }	
}

class LightEngine {
    constructor(lr, lc, bg, lv, sc, sw) {
        this.segments = [];
        this.shadows = [];

        this.lred = lc[0];
        this.lgreen = lc[1];
        this.lblue = lc[2];

        this.sred = sc[0];
        this.sgreen = sc[1];
        this.sblue = sc[2];

        this.bgStyle = bg;
        this.lightRadius = lr;
        this.segmentWidth = sw;
        this.lightSource = lv;
    }

    update() {
        this.shadows = [];

        for (var i=0; i<this.segments.length; i++) {
            var start = this.segments[i].start, end = this.segments[i].end;

            if (clockwise(this.lightSource, start, end)) {
                start = this.segments[i].end;
                end = this.segments[i].start;
            }

            this.shadows.push([]);
            var intersection1 = canvasIntersectionPoint( new Segment(this.lightSource, start) );
            var intersection2 = canvasIntersectionPoint( new Segment(this.lightSource, end) );

            if ((intersection1.x === intersection2.x && (intersection1.x === 0 || intersection1.x === canvas.width))
             || (intersection1.y === intersection2.y && (intersection1.y === 0 || intersection1.y === canvas.height))) {

                this.shadows[i].push(intersection1);
                this.shadows[i].push(start);
                this.shadows[i].push(end);
                this.shadows[i].push(intersection2);

            } else {
                var additionals = [];
                if (intersection1.y === 0 && intersection2.x === canvas.width) {
                    additionals = [new Vector(canvas.width, 0)];
                } else if (intersection1.x === canvas.width && intersection2.y === canvas.height) {
                    additionals = [new Vector(canvas.width, canvas.height)];
                } else if (intersection1.y === canvas.height && intersection2.x === 0) {
                    additionals = [new Vector(0, canvas.height)];
                } else if (intersection1.x === 0 && intersection2.y === 0) {
                    additionals = [new Vector(0, 0)];
                } else if (intersection1.x === 0 && intersection2.x === canvas.width) {
                    additionals.push(new Vector(0, 0));
                    additionals.push(new Vector(canvas.width, 0));
                } else if (intersection1.y === 0 && intersection2.y === canvas.height) {
                    additionals.push(new Vector(canvas.width, 0));
                    additionals.push(new Vector(canvas.width, canvas.height));
                } else if (intersection1.x === canvas.width && intersection2.x === 0) {
                    additionals.push(new Vector(canvas.width, canvas.height));
                    additionals.push(new Vector(0, canvas.height));
                } else if (intersection1.y === canvas.height && intersection2.y === 0) {
                    additionals.push(new Vector(0, canvas.height));
                    additionals.push(new Vector(0, 0));
                } else if (intersection1.x === 0 && intersection2.y === canvas.height) {
                    additionals.push(new Vector(0, 0));
                    additionals.push(new Vector(canvas.width, 0));
                    additionals.push(new Vector(canvas.width, canvas.height));
                } else if (intersection1.y === 0 && intersection2.x === 0) {
                    additionals.push(new Vector(canvas.width, 0));
                    additionals.push(new Vector(canvas.width, canvas.height));
                    additionals.push(new Vector(0, canvas.height));
                } else if (intersection1.x === canvas.width && intersection2.y === 0) {
                    additionals.push(new Vector(canvas.width, canvas.height));
                    additionals.push(new Vector(0, canvas.height));
                    additionals.push(new Vector(0, 0));
                } else if (intersection1.y === canvas.height && intersection2.x === canvas.width) {
                    additionals.push(new Vector(0, canvas.height));
                    additionals.push(new Vector(0, 0));
                    additionals.push(new Vector(canvas.width, 0));
                }

                this.shadows[i].push(intersection1);
                for (var j=0; j<additionals.length; j++) {
                    this.shadows[i].push(additionals[j]);
                }
                this.shadows[i].push(intersection2);
                this.shadows[i].push(end);
                this.shadows[i].push(start);
            }
        }
    }

    drawPolygon(poly, fill, stroke) {
        context.beginPath();
        context.moveTo(poly[0].x, poly[0].y);
        for (var j=1; j<poly.length; j++) {
            context.lineTo(poly[j].x, poly[j].y);
        }
        context.closePath();
        if (stroke)
            context.stroke();
        if (fill)
            context.fill();
    }

    drawShadows() {
        if (this.segments.length >= 1) {
            for (var i=0; i<this.shadows.length; i++) {
                this.drawPolygon(this.shadows[i], true, false);
            }
        }
    }

    draw() {
        //background
        context.fillStyle = this.bgStyle;
        context.fillRect(0, 0, canvas.width, canvas.height);

        //light
        var r = this.lred, g = this.lgreen, b = this.lblue;
        var lx = this.lightSource.x, ly = this.lightSource.y;
        var lr = this.lightRadius;

        var grd = context.createRadialGradient(lx, ly, lr, lx, ly, 0);
        grd.addColorStop(0, 'rgba('+r+','+g+','+b+',0)');
        grd.addColorStop(1, 'rgba('+r+','+g+','+b+',1)');
        context.fillStyle = grd;
        context.fillRect(0, 0, canvas.width, canvas.height);

        //segments
        for (var i = 0; i < this.segments.length; i++) {
            var seg = this.segments[i];

            r = this.sred, g = this.sgreen, b = this.sblue;
            grd = context.createRadialGradient(lx, ly, lr, lx, ly, 0);
            grd.addColorStop(0, 'rgba('+r+','+g+','+b+',0)');
            grd.addColorStop(1, 'rgba('+r+','+g+','+b+',1)');

            context.strokeStyle = grd;
            context.lineWidth = this.segmentWidth;
            seg.draw();
        };

        //shadows
        context.fillStyle = this.bgStyle;
        context.strokeStyle = this.bgStyle;
        this.drawShadows();
    }
}
