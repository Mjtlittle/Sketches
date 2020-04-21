let back_lines = 100;
let circle_lines = 20;
let line_angle = 45;
let line_speed = 5;
let line_weight = 7;

let circle_radius = 200;

let background_color = '#ffffff';
let line_color = '#000000';

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20,20,'Striped Circle')
        .addRange('Line Angle', 0, 360, line_angle, 15, (v) => {line_angle = v;})
        .addRange('Line Speed', 0, 25, line_speed, 0.01, (v) => {line_speed = v;})
        .addRange('Line Thickness', 1, 25, line_weight, 0.01, (v) => {line_weight = v;})
        .addRange('Background Lines', 0, 500, back_lines, 1, (v) => {back_lines = v;})
        .addRange('Circle Lines', 0, 50, circle_lines, 1, (v) => {circle_lines = v;})
        .addRange('Circle Radius', 30, 400, circle_radius, 1, (v) => {circle_radius = v;})
        .addColor('Background Color', background_color, (v) => {background_color = v;})
        .addColor('Line Color', line_color, (v) => {line_color = v;})
}

function draw_striped_circle(x, y, r, angle, progress, line_count, weight) {

    // calculate angle and distance between stripes
    let theta = radians(angle);
    let dd = (2 * r) / line_count

    // offset for the progress
    // (so 0 shows all lines good)
    progress += dd / 2

    // draw the lines
    for (let i = 0; i < line_count; i++) {
        
        let d = i * dd + (progress % dd + dd) % dd;
        let h = r - d;
        let psi = Math.acos(h / r);
        
        // calculate right point of chord
        let ax = x + Math.cos(theta - psi) * r;
        let ay = y + Math.sin(theta - psi) * r;

        // calculate left point of chord
        let bx = x + Math.cos(theta + psi) * r;
        let by = y + Math.sin(theta + psi) * r;

        // draw line
        stroke(line_color);
        strokeWeight(weight);
        line(ax, ay, bx, by);
    }
}

function draw() {

    // fill the background
    background(background_color);

    // calculate progress (t)
    let t;
    if (line_speed !== 0)
        t = millis() / 100 * line_speed;
    else
        t = 0;

    // draw background
    let diag = Math.sqrt((width * width) + (height * height));
    draw_striped_circle(width/2, height/2, diag/2, line_angle, t, back_lines, line_weight);

    // draw border
    fill(background_color);
    stroke(line_color);
    strokeWeight(line_weight);
    circle(width/2, height/2, circle_radius * 2);

    // draw circle stripes
    draw_striped_circle(width/2, height/2, circle_radius, line_angle + 90, t, circle_lines, line_weight);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}