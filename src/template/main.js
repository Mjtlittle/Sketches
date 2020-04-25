let angle = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20,20,'TEMPLATE_NAME')
        .addRange('angle', 0, 360, v, 1, v => {angle = v;})
}

function draw() {
    clear();
    rotate(radians(params.angle));
    rect(width/2 - 100, height/2 - 100, 200, 200);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}