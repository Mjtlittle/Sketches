let camera;
let image_comp;

let frame_buffer = [];
let shutter_fps = 0.3;

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

const CAPTURE_MODE_LABEL = 'Capture Direction';
const CaptureMode = {
    TopToBottom: 'Top to Bottom',
    BottomToTop: 'Bottom to Top',
    LeftToRight: 'Left to Right',
    RightToLeft: 'Right to Left',
}
let all_capture_modes = [
    CaptureMode.TopToBottom,
    CaptureMode.BottomToTop,
    CaptureMode.LeftToRight,
    CaptureMode.RightToLeft,
];
let capture_mode;
let slices;

let show_preview = true;
let preview_scale = 0.3;

function update_viewport() {
    src_width = camera.width;
    src_height = camera.height;

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
        .addDropDown(CAPTURE_MODE_LABEL, all_capture_modes, v => {set_capture_mode(v.value);})
        .addRange('Frame Rate [fps]', 0.02, 1, shutter_fps, 0.01, v => {shutter_fps = v;})
        .addBoolean('Preview', show_preview, v => {show_preview = v;})
        .addBoolean(PAUSE_LABEL, paused, set_pause)
        .addBoolean('Stop After Capture', stop_after_captured, v => {stop_after_captured = v;})
        .addButton('Download Capture (shift)', download_capture)
        .addButton('Reset (spacebar)', reset_capture)

    set_capture_mode(all_capture_modes[0]);

    update_viewport();
    reset_capture();
    add_frame_to_buffer_loop();
}

function is_capture_vertical() {
    return (capture_mode == CaptureMode.TopToBottom || 
        capture_mode == CaptureMode.BottomToTop)
}

function set_capture_mode(mode) {
    capture_mode = mode;
    if (is_capture_vertical()) {
        slices = src_height;
    } else {
        slices = src_width;
    }
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

    let len = frame_buffer.length;
    image_comp.clear();
    
    // vertical rendering
    if (is_capture_vertical()) {
        
        let slice_height = h / slices;
        
        // function to help with drawing slices
        function render_horizontal_slice(frame, index) {
            image_comp.image(frame, 0, (index * slice_height), w, slice_height, 0, index, src_width, 1);
        }
        
        // draw each slice
        frame_buffer.forEach((frame, i) => {
            if (capture_mode == CaptureMode.TopToBottom) {
                render_horizontal_slice(frame, i);
            } else {
                render_horizontal_slice(frame, (slices - i - 1));
            }
        });
        
    // horizontal rendering
    } else {
    
        let slice_width = w / slices;

        // function to help with drawing slices
        function render_vertical_slice(frame, index) {
            image_comp.image(frame, (index * slice_width), 0, slice_width, h, index, 0, 1, src_height);
        }
        
        // draw each slice
        frame_buffer.forEach((frame, i) => {
            if (capture_mode == CaptureMode.LeftToRight) {
                render_vertical_slice(frame, i);
            } else {
                render_vertical_slice(frame, (slices - i - 1));
            }
        });
    }

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
            
            stroke(255,0,0);
            strokeWeight(2);
            if (is_capture_vertical()) {
                
                let oy;
                if (capture_mode == CaptureMode.TopToBottom)
                    oy = th / slices * frame_buffer.length;
                else
                    oy = th - (th / slices * frame_buffer.length);
                
                line(tx, ty + oy, tx + tw, ty + oy);
            } else {
                
                let ox;
                if (capture_mode == CaptureMode.LeftToRight)
                    ox = tw / slices * frame_buffer.length;
                else
                    ox = tw - (tw / slices * frame_buffer.length);

                line(tx + ox, ty, tx + ox, ty + th);

            }
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