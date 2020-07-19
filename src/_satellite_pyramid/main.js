
let grid_size = 100;
let pyramid_count = 5;
let pyramid_levels = 10;

function update_grid_size() {
    grid_size = min(width, height) * 0.9;
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    panel = QuickSettings.create(20,20,'Satellite Pyramid')
        .addRange('Pyramid Count (Squared)', 1, 10, pyramid_count, 1, v => {pyramid_count = v;})
        .addRange('Pyramid Levels', 1, 20, pyramid_levels, 1, v => {pyramid_levels = v;})
    
    update_grid_size();
}

function draw_pyramid(x, y, size, levels) {

    noFill();
    stroke('#000000');
    strokeWeight(1);

    for (let i = 0; i < levels; i++) {
        
        // if (!missing[i])
        //     continue;
        
        let s = (size / levels) * (i + 1);
        let offset = -(s/2) + (size/2);
        
        rect(x + offset, y + offset, s, s);
    }
}

function draw_grid(x, y, size, count, levels) {
    let cs = size / count;
    let padding = cs / levels / 2;
    for (let xi = 0; xi < count; xi++) {
        for (let yi = 0; yi < count; yi++) {
            let tx = x + (cs * xi) + padding/2;
            let ty = y + (cs * yi) + padding/2;
            draw_pyramid(tx, ty, cs - padding, levels);
        }
    }
}



function draw() {
    clear();
    draw_grid(width / 2 - grid_size / 2, height / 2 - grid_size / 2, grid_size, pyramid_count, pyramid_levels);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    update_grid_size();
}