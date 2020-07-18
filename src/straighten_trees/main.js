let src_image = null

let src_width = 64
let src_height = 48
let target_width
let target_height
let target_x
let target_y
let preview_size = 100
let preview_scale = 60

let node_radius = 10

const viewport_scale = 0.9

let trunk_path = []

let show_preview = true

let comp_image = null
let selected_path_index = null

const EDIT_MODE = 0
const LOAD_MODE = 2
const VIEW_MODE = 1
let mode = LOAD_MODE

function update_viewport() {
    if (src_image) {
        src_width = src_image.width
        src_height = src_image.height
    }
    let ratio = min(width / src_width, height / src_height) * viewport_scale

    target_width = src_width * ratio
    target_height = src_height * ratio

    target_x = width / 2 - target_width / 2
    target_y = height / 2 - target_height / 2
}

function load_source_image(file) {
    reader = new FileReader()
    reader.onloadend = (e) => {
        src_image = loadImage(e.target.result, () => update_viewport())
        clear_trunk()
        change_mode(EDIT_MODE)
    }
    reader.readAsDataURL(file)
}

function draw_frame_rect(x, y, w, h) {
    fill(50)
    // stroke(150);
    // strokeJoin(ROUND);
    // strokeCap(ROUND);
    // strokeWeight(7);
    noStroke()
    rect(x, y, w, h)
}

function load_example() {
    src_image = loadImage('./example.jpg', () => update_viewport())
    change_mode(EDIT_MODE)
    trunk_path = [
        createVector(172.41358024691357, 916.5432098765432),
        createVector(202.43827160493828, 810.6666666666666),
        createVector(215.08024691358023, 786.9629629629629),
        createVector(234.04320987654322, 714.2716049382716),
        createVector(254.58641975308643, 665.283950617284),
        createVector(259.3271604938272, 643.1604938271605),
        createVector(253.00617283950615, 616.2962962962963),
        createVector(268.8086419753086, 583.1111111111111),
    ]
}

function clear_trunk() {
    trunk_path = []
    comp_image = null
    change_mode(EDIT_MODE)
}

function straighten_image() {
    change_mode(VIEW_MODE)
}

function un_straighten_image() {
    change_mode(EDIT_MODE)
}

function change_mode(new_mode) {
    switch (new_mode) {
        case LOAD_MODE:
            panel.hideControl('Clear')
            panel.hideControl('Straighten')
            panel.hideControl('Unstraighten')
            panel.hideControl('Download')
            break
        case EDIT_MODE:
            panel.showControl('Straighten')
            panel.hideControl('Unstraighten')
            panel.showControl('Clear')
            panel.showControl('Download')
            break
        case VIEW_MODE:
            if (trunk_path.length < 2) return
            render_distortion()
            panel.hideControl('Straighten')
            panel.showControl('Unstraighten')
            panel.showControl('Download')
            break
    }
    mode = new_mode
}

function download_image() {
    let now = new Date()
    if (mode == EDIT_MODE) {
        save(src_image, 'unstraitened_' + now.getTime())
    } else if (mode == VIEW_MODE) {
        save(comp_image, 'straitened_' + now.getTime())
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight)

    panel = QuickSettings.create(20, 20, 'Straighten Trees')
        .addFileChooser('image', 'Image', '*', load_source_image)
        .addButton('Load Example', load_example)
        .addButton('Clear', clear_trunk)
        .addButton('Straighten', straighten_image)
        .addButton('Unstraighten', un_straighten_image)
        .addButton('Download', download_image)

    change_mode(LOAD_MODE)
    update_viewport()
}

function render_distortion() {
    let start_x = trunk_path[0].x
    let last_x = trunk_path[trunk_path.length - 1].x

    comp_image = createGraphics(src_width, src_height)

    let delta = last_x - start_x
    for (let yi = 0; yi < src_height; yi++) {
        tx = get_trunk_tx(yi + 0.5)

        // if there is no trunk information
        if (tx != null) delta = tx - start_x

        blit_shifted_row(yi, delta)
    }
}

function blit_shifted_row(y, delta) {
    if (delta == 0) return
    ;[1, 0, -1].forEach((m) => {
        comp_image.image(
            src_image,

            -delta + src_width * m,
            y,

            src_width,
            1,

            0,
            y,

            src_width,
            1
        )
    })
}

function find_closest_point_index(pt, points, radius) {
    if (points.length == 0) return null

    let index = 0
    let first = points[index]
    let short_dist = dist(first.x, first.y, pt.x, pt.y)

    for (let i = 1; i < points.length; i++) {
        temp = points[i]
        d = dist(temp.x, temp.y, pt.x, pt.y)
        if (d < short_dist) {
            short_dist = d
            index = i
        }
    }

    if (short_dist < (src_width / target_width) * radius) {
        return index
    } else {
        return null
    }
}

function get_trunk_tx(ty) {
    let tp = trunk_path
    for (let i = 0; i < tp.length - 1; i++) {
        let a = tp[i]
        let b = tp[i + 1]

        // skip the segment if the target y is not in range
        if (a.y <= ty || b.y > ty) continue

        // if the segment always has the same x value
        if (a.x == b.x) return a.x

        // if the segment is flat return the first part of segment
        // probably wont occur because of trunk sampling method
        if (a.y == b.y) return a.x

        // get the x at that y
        let m = (b.y - a.y) / (b.x - a.x)
        let yint = a.y - m * a.x

        let x = (ty - yint) / m

        return x
    }
    return null
}

function src_to_screen(pt) {
    let tx = (pt.x / src_width) * target_width + target_x
    let ty = (pt.y / src_height) * target_height + target_y
    return createVector(tx, ty)
}

function draw_trunk_path() {
    let tp = trunk_path
    stroke(250, 100, 0)
    strokeJoin(ROUND)
    strokeCap(ROUND)
    strokeWeight(2)
    for (let i = 0; i < tp.length - 1; i++) {
        let a = src_to_screen(tp[i])
        let b = src_to_screen(tp[i + 1])
        line(a.x, a.y, b.x, b.y)
    }
    tp.map(src_to_screen).forEach((p, i) => {
        noStroke()
        if (i == selected_path_index) {
            fill(255, 255, 0)
            stroke(150, 100, 0)
        } else {
            stroke(150, 0, 0)
            fill(255, 0, 0)
        }
        strokeWeight(2)
        circle(p.x, p.y, node_radius)
    })
}

function draw_preview() {
    if (selected_path_index == null) return
    let selectedPt = trunk_path[selected_path_index]

    let tx = target_x + target_width
    let ty = target_y

    draw_frame_rect(tx, ty, preview_size, preview_size)
    image(
        src_image,
        tx,
        ty,
        preview_size,
        preview_size,
        floor(selectedPt.x - preview_scale / 2),
        floor(selectedPt.y - preview_scale / 2),
        preview_scale,
        preview_scale
    )

    stroke(0, 255, 0, 50)
    strokeWeight(2)
    line(tx, ty + preview_size / 2, tx + preview_size, ty + preview_size / 2)
    line(tx + preview_size / 2, ty, tx + preview_size / 2, ty + preview_size)
}

function draw() {
    let tx = target_x
    let ty = target_y
    let tw = target_width
    let th = target_height

    background(0)
    draw_frame_rect(tx, ty, tw, th)

    if (mode == EDIT_MODE) {
        image(src_image, tx, ty, tw, th)

        draw_preview()
        draw_trunk_path()
    } else if (mode == VIEW_MODE) {
        image(comp_image, tx, ty, tw, th)
    }
}

function screen_to_src(pt) {
    let tx = ((pt.x - target_x) / target_width) * src_width
    let ty = ((pt.y - target_y) / target_height) * src_height
    return createVector(tx, ty)
}

function add_trunk_point() {
    // make sure the image is loaded
    if (src_image == null) return

    // get the new point
    newPt = screen_to_src(createVector(mouseX, mouseY))

    // dont add if out of bounds
    if (newPt.x < 0 || newPt.x >= src_width) return
    if (newPt.y < 0 || newPt.y >= src_height) return

    // dont add if not higher than the last one
    if (trunk_path.length != 0)
        if (newPt.y >= trunk_path[trunk_path.length - 1].y) return

    trunk_path.push(newPt)
}

function keyPressed() {}

function mousePressed(e) {
    if (e.target.localName != 'canvas') return

    if (mode == EDIT_MODE) {
        let src_pt = screen_to_src(createVector(mouseX, mouseY))
        let find_result = find_closest_point_index(
            src_pt,
            trunk_path,
            node_radius
        )

        // if the there is a selected index
        if (find_result != null) {
            selected_path_index = find_result
        }

        // if there was not a selected index
        else {
            add_trunk_point()
            selected_path_index = trunk_path.length - 1
        }
    }
}

function mouseDragged() {
    if (mode == EDIT_MODE) {
        if (selected_path_index != null) {
            let newPt = screen_to_src(createVector(mouseX, mouseY))
            if (trunk_path.length > 1)
                if (newPt.y > trunk_path[selected_path_index - 1].y) return
            trunk_path[selected_path_index] = newPt
        }
    }
}

function mouseReleased() {
    if (mode == EDIT_MODE) {
        selected_path_index = null
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    update_viewport()
}
