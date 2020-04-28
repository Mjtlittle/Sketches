//todo Window.screenX" add window drag to add velocity

const cohesion_coef = 0.005;
const separation_coef = 0.025;
const alignment_coef = 0.02;

const padding_margin = 25;
const padding_acceleration = 2;

const trail_size = 25;
const trail_segment_length = 10;

let boids;

let cohesion = 0.5;
let separation = 0.5;
let alignment = 0.5;

let view_distance = 200;
let boid_size = 10;
let max_speed = 10;
let paused = false;
let show_trails = false;

let new_boid_color = '#7777ff';

class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;

        this.nvx = this.vx;
        this.nvy = this.vy;

        this.color = color(new_boid_color);

        this.trail = [];
        this.add_trail();
    }

    tick() {        
        this.vx = this.nvx;
        this.vy = this.nvy;
        
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
        
        .addBoolean('Paused', paused, v => {paused = v;})
        .addBoolean('Show Trails', show_trails, v => {show_trails = v;})

        .addRange('Size', 5, 20, boid_size, 0.01, v => {boid_size = v;})
        .addRange('Max Speed', 0, 20, max_speed, 0.01, v => {max_speed = v;})
        .addRange('View Distance', 0, 500, view_distance, 0.01, v => {view_distance = v;})
        .addColor('New Color', new_boid_color, v => {new_boid_color = v;})

        .addButton('Add 25 Random Boids', random_boids)
        .addButton('Clear', clear_boids)
    
    boids = [];

    for (let i = 0; i < 5; i++)
        random_boids();

}

function clear_boids() {
    boids = [];
}

function random_boids() {
    for (let i = 0; i < 25; i++) {
        boids.push(new Boid(random(0,width), random(0,height)));
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
    boid.nvx += ax;
    boid.nvy += ay;
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
    boid.nvx += ax;
    boid.nvy += ay;

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
    boid.nvx += ax;
    boid.nvy += ay;
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
        boid.nvx += padding_acceleration;
    } else if (boid.x > (width - padding_margin)) {
        boid.nvx -= padding_acceleration;
    }

    // vertical
    if (boid.y < padding_margin) {
        boid.nvy += padding_acceleration;
    } else if (boid.y > (height - padding_margin)) {
        boid.nvy -= padding_acceleration;
    }

}

function mouseClicked(event) {

    // dont capture if cursor is not over canvas
    if(event.target.tagName !== 'CANVAS')
        return;

    boids.push(new Boid(mouseX, mouseY));
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
    });

    boids.forEach((b) => {
        if (!paused)
            b.tick();
        b.draw();
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}