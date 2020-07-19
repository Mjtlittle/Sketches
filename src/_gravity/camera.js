class Camera {
    constructor(width, height) {
        this.pos = createVector(0, 0);
        this.offset = createVector(0, 0);
        this.dimensions = createVector(width, height);
        this.zoom = 1.0;

        this.zoom_min = 0.05;
        this.zoom_max = 5;

        this.cell_size = 100;
    }

    world_to_screen(v) {
        return v.copy().div(this.zoom).sub(this.pos).sub(this.offset);
    }
    
    screen_to_world(v) {
        return v.copy().add(this.pos).add(this.offset).mult(this.zoom);
    }

    set_size(w, h) {
        this.dimensions = createVector(w, h);
    }

    draw_grid() {

        let cell_size = this.cell_size / this.zoom;

        let grid_width = Math.ceil(width / cell_size);
        let grid_height = Math.ceil(height / cell_size);

        for(let ix = 0; ix < grid_width; ix++) {
            for(let iy = 0; iy < grid_height; iy++) {
                
                let x = (ix * cell_size) + (this.pos.x + this.offset.x) * -1 % cell_size;
                let y = (iy * cell_size) + (this.pos.y + this.offset.y) * -1 % cell_size;
                
                stroke(200);
                strokeWeight(2);
                line(x,0,x,height);
                line(0,y,width,y);
            }
        }


    }

    zoom_at(delta, pos) {

        // add zoom delta
        this.zoom += delta;

        //this.pos.sub(this.screen_to_world(pos).mult(this.zoom))

        // clamp zoom to min and max
        if (this.zoom > this.zoom_max)
            this.zoom = this.zoom_max;
        if (this.zoom < this.zoom_min)
            this.zoom = this.zoom_min;

    }
}