let angle = 0;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    panel = QuickSettings.create(20,20,'3D Testing')
        .addRange('angle', 0, 360, angle, 1, v => {angle = v;})
    
    createEasyCam();

    // suppress right-click context menu
    document.oncontextmenu = function() { return false; }
}

function draw() {
    background(64);
    lights();
    rotateX(45)
    box(50);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}