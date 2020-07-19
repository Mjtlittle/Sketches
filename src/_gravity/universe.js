class Universe {
    constructor() {
        this.bodies = [];
        this.G = 1;
    }

    add_body(body) {
        this.bodies.push(body);
    }

    tick(dt) {
    
        // iterate over all pairs of bodys
        this.bodies.forEach((body_a) => {
            this.bodies.forEach((body_b) => {
                
                // skip the the check if the same body
                if (body_a === body_b)
                    return;

                // skip the check if either marked for deletion
                if (body_a.delete || body_b.delete)
                    return;

                // calculate force
                let pos_diff = body_b.pos.copy().sub(body_a.pos);
                let r_hat = pos_diff.copy().normalize();
                let r = pos_diff.copy().mag();

                // collide if touching
                if (body_a.is_touching(body_b)) {

                    let dist_away = Math.abs(pos_diff.mag() - body_a.r - body_b.r);
                    let total_radius = body_a.r + body_b.r;

                    let p_half = (body_a.mass * body_a.vel.mag() + body_b.mass * body_b.vel.mag()) / 2;

                    body_a.vel = r_hat.copy().mult(-1 * p_half / body_a.mass);
                    body_b.vel = r_hat.copy().mult(p_half / body_b.mass);
                    
                    body_a.pos.add(r_hat.copy().mult(-1 * dist_away * (body_b.r / total_radius)));
                    body_b.pos.add(r_hat.copy().mult(dist_away * (body_a.r / total_radius)));

                }
                
                // apply force to body a
                let force = r_hat.copy().mult(this.G * body_a.mass * body_b.mass).div(r * r);
                body_a.apply_force(force);
                
            });
        });

        // tick all bodies
        this.bodies.forEach((body) => {
            body.tick(dt);
        });

        // filter out deleted
        this.bodies = this.bodies.filter((b) => !b.delete);

    }

    draw(camera) {
        
        // for each body
        this.bodies.forEach((body) => {
            
            // draw the body
            body.draw(camera);

        });
    }
}