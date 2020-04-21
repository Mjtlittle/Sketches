let params = {
    angle: 0,
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    panel = QuickSettings.create(20,20,'template')
        .bindRange('angle', 0, 360*2, 0, 1, params)
}

function draw() {
    clear();
    rotate(radians(params.angle));
    rect(-100,-100,200,200);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}