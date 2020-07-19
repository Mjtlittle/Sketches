let angle = 0;

let test_building;

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20,20,'Random Town')
        //.addRange('angle', 0, 360, v, 1, v => {angle = v;})

    test_building = new Building();
}

function draw() {
    clear();
    scale(1,-1);
    translate(0, -height);
    test_building.draw(width/2, 0);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}