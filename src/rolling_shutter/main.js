let camera;
let image_comp;

let frame_buffer = [];
let shutter_fps = 0.3;
let slices;

let src_width = 640;
let src_height = 480;
let ratio;
let target_width;
let target_height;

let padding = 0;

let settings;
let paused = false;
let stop_after_captured = false;
const PAUSE_LABEL = 'Paused (toggle with enter)';

let show_preview = true;
let preview_scale = 0.3;

function update_viewport() {
    src_width = camera.width;
    src_height = camera.height;

    slices = src_height;
    ratio = src_width / src_height;

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
    createCanvas(windowWidth, windowHeight, WEBGL);

    camera = createCapture({
        video: {
          mandatory: {
            minWidth: 320,
            minHeight: 240
          },
          optional: [{ maxFrameRate: 60 }]
        },
        audio: false
    }, () => {
        update_viewport();
    });
    camera.hide();

    settings = QuickSettings.create(20,20,'Rolling Shutter')
        .addRange('Frame Rate [fps]', 0.02, 1, shutter_fps, 0.01, v => {shutter_fps = v;})
        .addBoolean('Preview', show_preview, v => {show_preview = v;})
        .addBoolean(PAUSE_LABEL, paused, set_pause)
        .addBoolean('Stop After Capture', stop_after_captured, v => {stop_after_captured = v;})
        .addButton('Download Capture (shift)', download_capture)
        .addButton('Reset (spacebar)', reset_capture)

    update_viewport();
    reset_capture();
    add_frame_to_buffer_loop();
}

function reset_capture() {
    frame_buffer = [];
    settings.setValue(PAUSE_LABEL, false);
}

function toggle_pause() {
    settings.setValue(PAUSE_LABEL, !paused);
}

function download_capture() {
    let now = new Date();

    save(image_comp, 'rolling_shutter_'+now.getDate())
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
        settings.setValue(PAUSE_LABEL, true);
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

function draw_frame_rect(x, y, w, h) {
    fill(50);
    // stroke(150);
    // strokeJoin(ROUND);
    // strokeCap(ROUND);
    // strokeWeight(7);
    noStroke();
    rect(x,y,w,h);
}

function draw() {
    background(0);
    translate(-width/2, -height/2, 0);

    let tx = (width / 2) - (target_width / 2);
    let ty = (height / 2) - (target_height / 2);
    let tw = target_width;
    let th = target_height;

    // draw frame
    draw_frame_rect(tx, ty, tw, th);

    // draw rolling shutter render
    draw_frame_buffer(tx, ty, tw, th);

    if (show_preview){

        tw *= preview_scale;
        th *= preview_scale;
        tx += target_width - tw + 30;
        ty -= 30;

        // draw preview frame
        draw_frame_rect(tx,ty,tw,th)

        // draw camera preview
        image(camera, tx, ty, tw, th)

        // draw preview scan line
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
    
    // toggle pause with enter
    } else if (keyCode == 13) {
        toggle_pause();

    // shift to download current capture
    } else if (keyCode == 16) {
        download_capture();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    update_viewport();
}