class Body {
    constructor(pos, vel, r, mass) {
        this.pos = pos;
        this.vel = vel;
        this.r = r;
        this.mass = mass;

        this.delete = false;
    }

    is_within_camera(camera) {
        let x = this.pos.x;
        let y = this.pos.y;

        return (x >= camera.x) && (y >= camera.y) &&
            (x < (camera.x + camera.width)) &&
            (y < (camera.y + camera.height));
    }

    is_touching(other) {
        let dist = Math.abs(this.pos.copy().sub(other.pos).mag());
        return dist < (this.r + other.r);
    }

    is_within(pos) {
        let dist = Math.abs(this.pos.copy().sub(pos).mag());
        return dist < this.r
    }

    get_volume() {
        return Math.PI * (this.r * this.r)
    }

    apply_force(force) {
        let accleration = force.div(this.mass);
        this.vel.add(accleration);
    }

    tick(dt) {
        this.pos.add(this.vel.copy().mult(dt));
    }

    draw_pending(camera) {

        let center = camera.world_to_screen(this.pos);

        // draw planet
        fill(127);
        noStroke();
        circle(center.x, center.y, this.r*2 / camera.zoom)
    }

    draw(camera) {

        let center = camera.world_to_screen(this.pos);

        let vel = this.vel.copy()

        // draw planet
        fill(255,127,0);
        smooth();
        noStroke();
        circle(center.x, center.y, this.r*2 / camera.zoom)

        // draw velocity
        stroke(0);
        strokeWeight(2);
        line(center.x, center.y, center.x + vel.x, center.y + vel.y);
    }
}