let tree;

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20,20,'Quad Tree')
        //.addRange('angle', 0, 360, v, 1, v => {angle = v;})
    
    reset_tree();
}

function reset_tree() {
    tree = new QuadTree(0, 0, width, height);
}

function draw() {
    clear();
    tree.draw();
}

function mouseClicked() {
    tree.add(mouseX, mouseY, 1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset_tree();
}