
let src_width = 640;
let src_height = 480;
let target_width;
let target_height;

const viewport_scale = 0.9;

let image_comp;
let temp_frame;

let diff = null;

let current_frame = null;
let last_frame = null;

let paused = false;

function update_viewport() {
    src_width = camera.width;
    src_height = camera.height;

    let ratio = min(width / src_width, height / src_height) * viewport_scale;

    target_width = src_width * ratio;
    target_height = src_height * ratio;

    // remake diff array
    diff = Array(src_width * src_height * 4);

    if (image_comp != null) {
        image_comp.resizeCanvas(src_width, src_height);
    } else {
        image_comp = createGraphics(src_width, src_height);
    }
}

function setup() {
    let c = createCanvas(windowWidth, windowHeight);
    c.drop(on_drop);
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

    panel = QuickSettings.create(20,20,'Live Blend')
    
    update_viewport();

}

function on_drop(file) {
    let img = createImg(file.data, '').hide();
    image_comp.background(0);
    image_comp.image(img, 0, 0, src_width, src_height);
}

function draw() {
    background(127);
    
    // take difference of frames
    let tx = (width / 2) - (target_width / 2);
    let ty = (height / 2) - (target_height / 2);
    let tw = target_width;
    let th = target_height;

    // get current frame
    current_frame = camera.get();

    // if there is a last frame
    if (last_frame != null) {

        // load frame pixels
        current_frame.loadPixels();
        image_comp.loadPixels();
        last_frame.loadPixels();

        // iterate over all pixels
        for (let i = 0; i < (src_width * src_height * 4); i++) {

            // calculate the difference between the current and last frame
            diff[i] = current_frame.pixels[i] - last_frame.pixels[i];

            // apply the difference to the current composite frame
            image_comp.pixels[i] += diff[i];
        }

        image_comp.updatePixels();
    
    };

    image(image_comp, tx, ty, tw, th);

    // save previous frame
    last_frame = current_frame;
}

function keyPressed() {
    
    image_comp.image(camera, 0, 0, src_width, src_height);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}