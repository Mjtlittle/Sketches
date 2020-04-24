let camera;
let frame_buffer = [];

let src_width = 320;
let src_height = 240;
let image_comp;
let ratio;

let slices = src_height;

let settings;
let show_preview = true;
let preview_scale = 0.3;
let shutter_fps = 0.5;
let paused = false;
let stop_after_captured = false;

let padding = 100;

let target_width;
let target_height;

function update_viewport() {
    let min_dimension = min(width, height) - padding;

    if (src_width < src_height) {
        target_height = min_dimension;
        target_width = ratio * target_height;
    } else {
        target_width = min_dimension;
        target_height = target_width / ratio;
    }

    if (image_comp != null)
        image_comp.resizeCanvas(target_width, target_height);
    else
        image_comp = createGraphics(target_width, target_height);    
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    camera = createCapture(VIDEO);
    camera.size(src_width, src_height);
    camera.hide();
    ratio = src_width / src_height;

    settings = QuickSettings.create(20,20,'Rolling Shutter')
        .addRange('Frame Rate (fps)', 0.02, 1, shutter_fps, 0.01, v => {shutter_fps = v;})
        .addBoolean('Preview', show_preview, v => {show_preview = v;})
        .addBoolean('Paused', paused, set_pause)
        .addBoolean('Stop After Capture', stop_after_captured, v => {stop_after_captured = v;})
        .addButton('Download Capture', download_capture)
        .addButton('Reset (Spacebar)', reset_capture)

    update_viewport();
    reset_capture();
    add_frame_to_buffer_loop();
}

function reset_capture() {
    frame_buffer = [];
    settings.setValue('Paused', false);
}

function download_capture() {
    
    save(image_comp, 'rolling_shutter_capture')
}

function set_pause(value) {
    
    // toggle the paused state
    paused = value;

    // restart the frame buffer loop
    // if unpaused
    if (paused == false) {
        add_frame_to_buffer_loop();
    }
}

function add_frame_to_buffer() {
    
    // return if the camera has not been loaded yet
    if (!camera.loadedmetadata)
        return;

    // capture a frame from the camera
    frame_buffer.push(camera.get());

    // limit the frame buffer size
    while (frame_buffer.length > slices)
        frame_buffer.shift();

    // pause if the capture filled the buffer
    if (stop_after_captured && (frame_buffer.length >= slices))
        settings.setValue('Paused', true);
}

function add_frame_to_buffer_loop() {
    if (paused == true) 
        return;
    
    add_frame_to_buffer();
    setTimeout(add_frame_to_buffer_loop, (1000 / shutter_fps) / slices);
}

function render_frame_buffer(w, h) {

    let slice_height = h / slices;
    
    image_comp.clear();
    frame_buffer.forEach((frame, i) => {
        image_comp.image(frame, 0, (i * slice_height), w, slice_height, 0, i, src_width, 1);
    });
}

function draw_frame_buffer(x, y, w, h) {
    render_frame_buffer(w, h);
    image(image_comp, x, y);
}

function draw() {
    background(0);
    
    let tx = (width / 2) - (target_width / 2);
    let ty = (height / 2) - (target_height / 2);
    let tw = target_width;
    let th = target_height;

    // draw frame
    fill(50);
    noStroke();
    rect(tx, ty, tw, th);

    // draw to screen
    draw_frame_buffer(tx, ty, tw, th);

    if (show_preview){
        
        tw *= preview_scale;
        th *= preview_scale;
        tx += target_width - tw + 30;
        ty -= 30;

        image(camera, tx, ty, tw, th)

        if (!paused) {
            let oy = th / slices * frame_buffer.length;
            
            stroke(255,0,0);
            strokeWeight(2);
            line(tx, ty + oy, tx + tw, ty + oy);
        }
    }
}

function keyPressed() {
    
    // space bar to rest capture and start again
    if (keyCode == 32) {
        reset_capture();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    update_viewport();
}