function update() {
    player.x += vx;
    player.y += vy;
    lightEngine.update();
}

function draw() {
    lightEngine.draw();
}

function keydown(key) {
    switch(key) {
        case 'w':
            vy = -5;
            break;
        case 's':
            vy = +5;
            break;
        case 'a':
            vx = -5;
            break;
        case 'd':
            vx = +5;
            break;
    }
}

function keyup(key) {
    switch(key) {
        case 'w':
        case 's':
            vy = 0;
        case 'a':
        case 'd':
            vx = 0;
    }
}

init({
    fullScreen: true,
    clear: false,
    updateDelay: 10,
});

let x = canvas.width/2;
let y = canvas.height/2;
let vx = 0, vy = 0;
let player = new Vector(x, y);

let lightEngine = new LightEngine(500, [0,255,0], 'grey', player, [255,0,0], 5);

function randPoint() {
    return new Vector( parseInt(Math.random()*canvas.width), parseInt(Math.random()*canvas.height) );
}

for (let i = 0; i < 8; i++) {
    let randSeg = new Segment( randPoint(), randPoint() );
    lightEngine.segments.push( randSeg );
}

