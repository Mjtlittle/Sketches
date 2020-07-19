class Node {
    constructor(x, y, v) {
        this.x = x;
        this.y = y;
        this.v = v;
    }

    draw() {
        noStroke();
        fill(255,0,0);
        circle(this.x, this.y, 10);
    }
}

class QuadTree {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.contents = [];
        this.capacity = 1;

        this.children = [];
        this.rows = 2;
        this.cols = 2;
    }

    draw() {

        // draw the frame
        noFill();
        stroke(0);
        strokeWeight(1);
        rect(this.x, this.y, this.width, this.height);

        // draw data
        for (let content of this.contents) {
            content.draw();
        }

        // draw sub trees
        for (let row of this.children) {
            for (let child of row) {
                child.draw();
            }
        }
    }

    subdivide() {
        let new_child;
        let row;
        
        this.children = [];

        for (let ri = 0; ri < this.rows; ri++) {
            
            row = [];
            
            for (let ci = 0; ci < this.cols; ci++) {
                
                let new_w = this.width / this.cols;
                let new_h = this.height / this.rows;
                let new_x = this.x + new_w * ci;
                let new_y = this.y + new_h * ri;
                
                new_child = new QuadTree(new_x, new_y, new_w, new_h);
                row.push(new_child);
            }

            this.children.push(row);
        }
    }

    add(x, y, v) {

        // halt if x and y are outside of tree
        if (x < 0 || x > this.width || y < 0 || y > this.height)
            return;
        
        // add to contents if not full
        if (this.contents.length < this.capacity) {
            this.contents.push(new Node(x, y, v));
        
        // otherwise add to a sub tree 
        } else {

            // make sub trees if they dont exist
            if (this.children.length == 0)
                this.subdivide();
            
            // get the subtree the point will go into
            let tx = floor(x / (this.width / this.cols));
            let ty = floor(y / (this.height / this.rows));

            console.log(tx, ",", ty)

            // add it
            this.children[ty][tx].add(x, y, v);
        }   
    }
}