class BuildingConnector {
    constructor(dx, dy) {
        this.dx = dx;
        this.dy = dy;

        this.child = null;
    }

    draw(x, y) {
        stroke(0);
        strokeWeight(2);
        circle(x + this.dx, y + this.dy, 20);
        
        if (this.child != null)
            this.child.draw(x + this.dx, y + this.dy);
    }
}

class BuildingRect {
    constructor(w, h) {

        this.dx = 0;
        this.dy = 0;
        this.w = w;
        this.h = h;

        this.inactive_connectors = [];
        this.connectors = [];
    }

    stack_connector_center() {
        let connector = new BuildingConnector(0, this.h);
        this.inactive_connectors.push(connector);
    }

    set_next_connector(b) {
        let connector = this.inactive_connectors.pop();
        connector.child = b;
        this.connectors.push(connector)
    }

    rect(x, y, w, h) {
        rect(x, y, w, h);
    }

    draw(x, y) {
        this.rect(x + this.dx - this.w/2, y + this.dy, this.w, this.h);
        this.connectors.forEach((c) => {
            c.draw(x + this.dx , y + this.dy);
        })
    }
}

function building_random_rect() {
    let new_building = new BuildingRect(random(50,100), random(50,120));
    new_building.stack_connector_center();
    return new_building
}

class Building {
    constructor() {
        this.root = building_random_rect();
        this.generate();
    }

    generate() {
        let curr = this.root;
        for(let i = 0; i < 10; i++){
            let new_building = building_random_rect();
            curr.set_next_connector(new_building);
            curr = new_building;
        }
    }

    draw(x, y) {
        this.root.draw(x, y)
    }
}