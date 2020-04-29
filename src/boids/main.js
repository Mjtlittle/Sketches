// referenced: http://www.kfish.org/boids/pseudocode.html

const cohesion_coef = 0.005;
const separation_coef = 0.025;
const alignment_coef = 0.02;

const padding_margin = 25;
const padding_acceleration = 2;

const trail_size = 25;
const trail_segment_length = 10;

const PAUSED_LABEL = 'Paused (space)';

const window_force_coef = 0.1;
const starting_boid_count = 100;

let boids;

let last_window_x;
let last_window_y;
let window_vx = 0;
let window_vy = 0;

let cohesion = 0.5;
let separation = 0.5;
let alignment = 0.5;

let view_distance = 200;
let boid_size = 10;
let max_speed = 10;
let paused = false;
let show_trails = false;
let turn_radius = 10;

let new_boid_color = '#ffffff';
let random_colors = ['#ff7777', '#ff77ff', '#77ffff', '#7777ff', '#ffff77', '#77ff77'];

class Boid {
    constructor(x, y, c) {
        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;

        this.nvx = this.vx;
        this.nvy = this.vy;

        this.color = color(c);

        this.trail = [];
        this.add_trail();
    }

    add_force(fx, fy) {
        this.nvx += fx;
        this.nvy += fy;
    }

    tick() {
        
        // set apparent velocity
        this.vx = this.nvx;
        this.vy = this.nvy;

        // update position
        this.x += this.vx;
        this.y += this.vy;

        this.add_trail();
    }

    distance_from(other) {
        return abs(sqrt(
            pow(other.x - this.x, 2) + 
            pow(other.y - this.y, 2)
        ))
    }

    add_trail() {
        
        // if there are no parts of the trail yet
        if (this.trail.length == 0) {

            // add the current position
            this.trail.push([this.x, this.y]);
            
            return;
        }
        
        // if the current position is far enough away
        // from the previous trail marker
        const last_marker = this.trail[this.trail.length - 1];
        const dist_from_last = abs(sqrt(pow(last_marker[0] - this.x, 2) + pow(last_marker[1] - this.y, 2)))
        if (dist_from_last >= trail_segment_length) {
            
            // add the current position
            this.trail.push([this.x, this.y]);

        }

        // reduce the size of the trail if it is to long
        while (this.trail.length > trail_size)
            this.trail.shift();
    }

    speed() {
        return abs(sqrt(
            pow(this.vx, 2) + 
            pow(this.vy, 2)
        ));
    }

    draw() {
        
        // draw the trail
        if (show_trails){
            stroke(this.color);
            strokeWeight(1)
            for (let i = 0; i < this.trail.length - 1; i++) {
                line(this.trail[i][0],this.trail[i][1],this.trail[i+1][0],this.trail[i+1][1])
            }
        }
        
        // draw boid
        angleMode(DEGREES);
        let angle = atan2(this.vy, this.vx);
        const delta = 135;

        fill(this.color);
        noStroke();
        beginShape();
        vertex(this.x + cos(angle) * boid_size,
                this.y + sin(angle) * boid_size);
        vertex(this.x + cos(angle + delta) * boid_size,
                this.y + sin(angle + delta) * boid_size);
        vertex(this.x + cos(angle - delta) * boid_size,
                this.y + sin(angle - delta) * boid_size);
        endShape();
    }
}

class Attractor {
    constructor() {

    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20, 20, 'Boids')
        .addRange('Cohesion', 0, 1, cohesion, 0.01, v => {cohesion = v;})
        .addRange('Separation', 0, 1, separation, 0.01, v => {separation = v;})
        .addRange('Alignment', 0, 1, alignment, 0.01, v => {alignment = v;})
        
        .addBoolean(PAUSED_LABEL, paused, v => {paused = v;})
        .addBoolean('Show Trails', show_trails, v => {show_trails = v;})

        .addRange('Size', 5, 20, boid_size, 0.01, v => {boid_size = v;})
        .addRange('Max Speed', 0, 20, max_speed, 0.01, v => {max_speed = v;})
        .addRange('View Distance', 0, 500, view_distance, 0.01, v => {view_distance = v;})
        .addColor('New Color', new_boid_color, v => {new_boid_color = v;})

        .addRange('Turn Radius', 0, 360, turn_radius, 0.01, v => {turn_radius = v;})

        .addButton('Add 25 Random Boids', () => {random_boids(25)})
        .addButton('Clear', clear_boids)
    
    boids = [];

    random_colors.forEach(c => {
        random_boids(floor(starting_boid_count / random_colors.length), c);
    });
}

function update_window_velocity() {
    
    // get current position
    let curr_x = window.screenLeft;
    let curr_y = window.screenTop;

    // if there is a last position
    if (last_window_x != null && last_window_y != null) {

        // calculate the new velocity
        window_vx = (curr_x - last_window_x) * -1;
        window_vy = (curr_y - last_window_y) * -1;
    }

    // progress last
    last_window_x = curr_x;
    last_window_y = curr_y;
}

function clear_boids() {
    boids = [];
}

function random_boids(n, c) {

    // choose a random color if not provided
    if (c == undefined) 
        c = random(random_colors);

    for (let i = 0; i < n; i++) {
        boids.push(new Boid(random(0,width), random(0,height), c));
    }
}

function rule_cohesion(boid) {

    let ax = 0;
    let ay = 0;
    let N = 0;

    // iterate over all boids
    boids.forEach((other) => {
        
        // skip the same boid
        if (other == boid)
            return;

        if (boid.distance_from(other) < view_distance) {
            // add the other position
            ax += other.x;
            ay += other.y;
            N++;
        }
    })

    // skip if no other boids within influence
    if (N == 0)
        return

    // calculate the average
    ax /= N;
    ay /= N;

    // make distance to boids pos
    ax -= boid.x;
    ay -= boid.y;

    // scale
    ax *= cohesion * cohesion_coef;
    ay *= cohesion * cohesion_coef;

    // add new velocity
    boid.add_force(ax, ay);
}

function rule_separation(boid) {

    // skip if no other boids
    if (boids.length == 1)
        return;

    let ax = 0;
    let ay = 0;

    // iterate over all boids
    boids.forEach((other) => {

        // skip the same boid
        if (other == boid)
            return;

        // if boid is too close to another
        if (boid.distance_from(other) < boid_size + (separation * boid_size * 2)) {
            ax -= other.x - boid.x;
            ay -= other.y - boid.y;
        }
    })

    // scale
    ax *= separation * separation_coef;
    ay *= separation * separation_coef;

    // add new velocity
    boid.add_force(ax, ay);
}

function rule_alignment(boid) {

    let ax = 0;
    let ay = 0;
    let N = 0;

    // iterate over all boids
    boids.forEach((other) => {

        // skip the same boid
        if (other == boid)
            return;
    
        if (boid.distance_from(other) < view_distance) {

            // add the other position
            ax += other.vx;
            ay += other.vy;
            N++;
        }
    })

    // skip if no other boids within influence
    if (N == 0)
        return

    // calculate the average
    ax /= N;
    ay /= N;

    // scale
    ax *= alignment * alignment_coef;
    ay *= alignment * alignment_coef;

    // add new velocity
    boid.add_force(ax, ay);
}

function limit_velocity(boid) {

    if (boid.speed() > max_speed) {
        boid.nvx *= max_speed / boid.speed();
        boid.nvy *= max_speed / boid.speed();
    }
}

function apply_padding(boid) {

    // horizontal
    if (boid.x < padding_margin) {
        boid.add_force(padding_acceleration, 0);
    } else if (boid.x > (width - padding_margin)) {
        boid.add_force(-padding_acceleration, 0);
    }

    // vertical
    if (boid.y < padding_margin) {
        boid.add_force(0, padding_acceleration);
    } else if (boid.y > (height - padding_margin)) {
        boid.add_force(0, -padding_acceleration);
    }

}

function apply_window_velocity(boid) {
    boid.add_force(window_vx * window_force_coef, window_vy * window_force_coef);
}

function mouseClicked(event) {

    // dont capture if cursor is not over canvas
    if(event.target.tagName !== 'CANVAS')
        return;

    boids.push(new Boid(mouseX, mouseY, new_boid_color));
}

function keyPressed() {
    
    // space to toggle the paused state
    if (keyCode == 32)
        panel.setValue(PAUSED_LABEL, !paused)
}

function draw() {
    background(20);
    
    if (!paused)
    boids.forEach((b) => {
        rule_cohesion(b);
        rule_separation(b);
        rule_alignment(b);
        limit_velocity(b);
        apply_padding(b);
        apply_window_velocity(b);
    });

    update_window_velocity();
    boids.forEach((b) => {
        if (!paused)
            b.tick();
        b.draw();
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}