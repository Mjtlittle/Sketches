let angle = 0;

let buffer = null;
let scale = 0.9;
let draw_color = '#4455bb';

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20,20,'Infinte Tunnel')
        .addRange('Scale', 0.01, 1, scale, 0.001, v => {scale = v;})
        .addColor('Scale', draw_color, v => {draw_color = v;})

    reset_buffer();
}

function reset_buffer() {
    buffer = createGraphics(width, height);
    buffer.background(255);
}

function draw_buffer() {
    let w = width * scale;
    let h = height * scale;
    let x = width / 2 - (w / 2);
    let y = height / 2 - (h / 2);
    buffer.image(buffer, x, y, w, h);
    
    image(buffer, 0, 0, width, height);
}

function draw() {
    clear();
    draw_buffer();

    let w = width * scale;
    let h = height * scale;
    let x = width / 2 - (w / 2);
    let y = height / 2 - (h / 2);
    stroke(0);
    strokeWeight(2);
    noFill();
    rect(x, y, w, h);
}


function mouseDragged(event) {

    // dont capture if cursor is not over canvas
    if(event.target.tagName !== 'CANVAS')
        return;

    // add a circle when the mouse is dragged
    buffer.fill(draw_color);
    buffer.noStroke();
    buffer.circle(mouseX, mouseY, 20);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset_buffer();
}