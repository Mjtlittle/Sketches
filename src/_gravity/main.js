let universe = null;
let camera = null;

let new_body_density = 0.5;
let simulation_paused = true;
let simulation_speed = 1;
let simulation_speed_coef = 1/500;
let simulation_samples = 3;

let new_body = null;

const DragMode = {
    NONE: 0,
    NEW_BODY: 1,
    SET_VELOCITY: 2,
    CAMERA_PAN: 3,
}

let drag = {
    mode: DragMode.NONE,
    start: null,
    delta: null,
    end: null,
    dist: null,
}

function start_drag() {
    drag.start = createVector(mouseX, mouseY);
    update_drag();
}

function update_drag() {
    drag.end = createVector(mouseX, mouseY);
    drag.delta = drag.end.copy().sub(drag.start);
    drag.dist = drag.delta.mag();
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    universe = new Universe();
    camera = new Camera(width, height);

    settings = QuickSettings.create(20,20,'Universe Settings')
        .addRange('Gravitational Constant', 0, 10, universe.G, 0.0001, (v) => {universe.G = v;})
        .addRange('Density', 0, 1, new_body_density, 0.001, (v) => {new_body_density = v;})
        .addBoolean('Paused', simulation_paused, (v) => {simulation_paused = v;})
        .addButton('Step', universe.tick.bind(universe, 0.01))
        .addRange('Simulation Speed', 0, 100, time_scale, 0.001, (v) => {time_scale = v;})

    let pos = createVector(width/2, height/2);
    let vel = createVector(0, 0);
    universe.add_body(new Body(pos, vel, 20, 20));
}

function draw() {

    if (!simulation_paused) {
        for(let s = 0; s < simulation_samples; s++) {
            universe.tick(time_scale * simulation_speed_coef / simulation_samples);
        }
    }
    
    clear();
    camera.draw_grid();
    universe.draw(camera);

    console.log(drag.mode)

    // new body gui
    if (new_body !== null){

        new_body.draw_pending(camera);

        if (drag.mode == DragMode.SET_VELOCITY) {
            stroke(0);
            strokeWeight(2);
            line(drag.start.x, drag.start.y, drag.end.x, drag.end.y);
        }
    }

}

function mousePressed(event) {

    // dont capture if cursor is not over canvas
    if(event.target.tagName !== 'CANVAS')
        return;
        
    // mouse position
    let pos = createVector(mouseX, mouseY);

    // set drag mode if not set
    if (drag.mode === DragMode.NONE) {
        if (mouseButton == CENTER) {
            drag.mode = DragMode.CAMERA_PAN;
        } else if (mouseButton == LEFT) {
            drag.mode = DragMode.NEW_BODY;
        }
    }

    // if drag is enabled
    if (drag.mode !== DragMode.NONE) {

        // update the drag
        drag.start = pos.copy();
        update_drag();
    }

    // create a new body
    if (drag.mode === DragMode.NEW_BODY) {
        
        // create the new body
        new_body = new Body(camera.screen_to_world(drag.start), createVector(0, 0), 0, 0);
    }
}

function mouseMoved() {
    
    // get mouse position
    let pos = createVector(mouseX, mouseY);

    if (drag.mode !== DragMode.NONE) {
        update_drag();
    }
}

function mouseDragged() {

    // get mouse position
    let pos = createVector(mouseX, mouseY);

    // if drag is enabled
    if (drag.mode !== DragMode.NONE) {
        update_drag();
    }

    // pan
    if (drag.mode === DragMode.CAMERA_PAN) {
        camera.offset = drag.delta.copy().mult(-1);
    }

    // if a new body has begun to be created
    if (drag.mode === DragMode.NEW_BODY) {
    
        // update the radius
        new_body.r = drag.dist * camera.zoom;
    }
}

function mouseReleased() {

    // get mouse position
    let pos = createVector(mouseX, mouseY);

    // if click from set velocity
    // finalize the body
    if (drag.mode === DragMode.SET_VELOCITY) {

        new_body.vel = drag.delta.copy();
        universe.add_body(new_body);

        new_body = null;

        drag.mode = DragMode.NONE;
    
    // finalize the camera pan
    } else if (drag.mode == DragMode.CAMERA_PAN){
        
        camera.pos.add(camera.offset);
        camera.offset = createVector(0,0);
        console.log(1)
        drag.mode = DragMode.NONE;

    // if a body has begun to be created
    } else if (drag.mode === DragMode.NEW_BODY) {

        // update the mass
        new_body.mass = new_body_density * new_body.get_volume();

        // reset the started state indicator
        drag.mode = DragMode.SET_VELOCITY;
    }
}

function mouseWheel(event) {

    let pos = createVector(mouseX, mouseY);

    if (event.deltaY > 0)
        camera.zoom_at(-0.05, pos);
    else
        camera.zoom_at(0.05, pos);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    camera.set_size(width, height);
}