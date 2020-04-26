let angle = 0;
let delta_angle = 0;
let N = 2;
let depth = 7;
let style = 'Translucent';
let recur_center = false;
let show_lines = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);

    panel = QuickSettings.create(20,20,'Recursive Circles')
        .addRange('Angle', 0, 360, angle, 0.1, v => {angle = v;})
        .addRange('Delta Angle', 0, 360, delta_angle, 0.1, v => {delta_angle = v;})
        .addRange('Nested Circles', 2, 10, N, 1, v => {N = v;})
        .addRange('Recursion Depth', 0, 10, depth, 1, v => {depth = v;})
        .addBoolean('Add Center Circle', recur_center, v => {recur_center = v;})
        .addBoolean('Draw Lines', show_lines, v => {show_lines = v;})
        .addDropDown('Style', [
            'Translucent',
            'Invert',
        ], v => {style = v.value;})
}

function draw() {
    background(255);
    draw_circle(width / 2, height / 2, min(width, height) - 100, angle, N, depth);
}

function draw_circle(x, y, R, angle, n, depth) {

    // escape if next count is 1
    if (n <= 1)
        return;
    
    if (depth <= 0)
        return;

    // escape if r too small
    if (R < 5 || R > 7000)
        return;

    // draw circle

    if (style == 'Invert')
        if (depth % 2 == 0)
            fill(255); 
        else 
            fill(0);
    else if (style == 'Translucent')
        fill(0,0,0,50);
    noStroke();
    circle(x, y, R);

    // recur
    let theta = 360 / n;
    let r = R * (sin(90) / (sin(90) + sin(theta / 2)));
    let d = r * sin(theta / 2) / sin(90);

    for(let i = 0; i < n; i++){

        if (show_lines) {
            stroke(0);
            strokeWeight(2)
            line(x,y,x + cos(360 * (i / n) + angle) * (r / 2),y + sin(360 * (i / n) + angle) * (r / 2))
        }

        draw_circle(
            x + cos(360 * (i / n) + angle) * (r / 2),
            y + sin(360 * (i / n) + angle) * (r / 2),
            d, angle + delta_angle, n, depth -1);
    }

    // add a center circle if theres a center
    if (recur_center && n > 2)
        draw_circle(x, y, r - d, angle - delta_angle, n, depth-1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}