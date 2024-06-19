const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

const fps=60;
const root2 = Math.pow(2,0.5);

class Cell{
    constructor(i,j){
        this.i=i;
        this.j=j;
        this.walls = [true,true,true,true];
    }

    draw(){
        let x = this.j*maze_width;
        let y = this.i*maze_width;
        let w = maze_width;
        if(this.walls[0]) drawLine( x, y, x + w, y);//top
        if(this.walls[1]) drawLine( x + w, y, x + w, y + w);//right
        if(this.walls[2]) drawLine( x, y + w, x + w, y + w);//bottom
        if(this.walls[3]) drawLine( x, y, x, y + w);//left
    }

    checkCellMate(){
        let cellMate = [];
        let i = this.i;
        let j = this.j;
        if(i>0 && unvisited[i-1][j]) {
            cellMate.push("top");
        }
        if(i+1<maze_row && unvisited[i+1][j]) {
            cellMate.push("bottom");
        }
        if(j>0 && unvisited[i][j-1]) {
            cellMate.push("left");
        }
        if(j+1<maze_column && unvisited[i][j+1]) {
            cellMate.push("right");
        }
        return cellMate;
    }
}

class Stack {

    constructor()
    {
        this.items = [];
    }

    push(item){
        this.items.push(item);
    }

    pop(){
        if (this.items.length == 0)
            return 'Underflow'
        return this.items.pop();
    }

    top(){
        return this.items[this.items.length - 1];
    }

    isEmpty(){
        return this.items.length == 0;
    }
}

let maze = [];
let unvisited = [];
let level = 0;

let maze_column;
let maze_row;
let maze_width = 40;
let r = 10;
let mazeBuilt;

let w_pressed = false;
let a_pressed = false;
let s_pressed = false;
let d_pressed = false;

let player = {
    x: 20,
    y: 20,
    radius:r,
    speedX:5,
    speedY:5,
}

let goal = {
    x:0,
    y:0,
}

let interval;

function generateLevel(){
    $(".level").text("LEVEL "+level);
    maze_row = Math.floor(canvas.height/maze_width);
    maze_column = Math.floor(canvas.width/maze_width);
    mazeBuilt =  maze_row*maze_column;

    goal.x = canvas.width-maze_width;
    goal.y = canvas.height-maze_width;

    player.x = maze_width/2;
    player.y = maze_width/2;

    unvisited = [];
    maze = [];

    for(let i=0; i < maze_row; i++){
        let maze_i =[];
        let unvisited_i = [];
        for(let j=0; j < maze_column; j++){
            maze_i.push(new Cell(i,j));
            unvisited_i.push(true);
        }
        maze.push(maze_i);
        unvisited.push(unvisited_i);
    }
    dps();
}

function dps(){
    let s = new Stack();
    unvisited[0][0] = false;
    s.push(maze[0][0]);
    while(!s.isEmpty()){
        let current_cell = s.top();
        let i = current_cell.i;
        let j = current_cell.j;
        unvisited[i][j] = false;
        //console.log(s.top());
        mazeBuilt--;
        let unvisited_cellmate = current_cell.checkCellMate();
        if(unvisited_cellmate.length>0){
            let random_idx = Math.floor(Math.random()*unvisited_cellmate.length);
            //console.log(unvisited_cellmate[random_idx]);
            let random_cell = chosenCell(i,j,unvisited_cellmate[random_idx])
            s.push(random_cell);
            removeWalls(current_cell,random_cell);        
        } else s.pop();
    }

}

function nextLevel(){
    if(level==10) {
        console.log("you win"+player.x,player.y,goal.x,goal.y);
        restart();
        return;
    }

    level++;
    if(level<9) {
        canvas.width = canvas.width+maze_width;
        canvas.height = canvas.height+maze_width;
    } else if(level<=10){
        maze_width/=2;
        player.radius/=2;
    } 
    generateLevel();
}

function restart(){
    level = 1;
    maze_width= 40;
    player.radius = 12;
    canvas.width = 320;
    canvas.height = 320;
    $(".start-button").show();
    $(".level").text("");
    clearInterval(interval);
    //generateLevel();
}

function chosenCell(i,j,direction){
    switch (direction) {
        case "top":
            return maze[i-1][j];
        case "bottom":
            return maze[i+1][j];
        case "left":
            return maze[i][j-1];
        case "right":
            return maze[i][j+1];
        default:
            break;
    }
}

function removeWalls(a,b){
    let y = a.i-b.i;
    let x = a.j-b.j;

    if( x === 1){
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x === -1){
        a.walls[1] = false;
        b.walls[3] = false;
    }

    if( y === 1){
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (y === -1){
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

function update() {
    draw();
    playerUpdate();
}

function playerUpdate(){
    if(w_pressed && !s_pressed){
        if(a_pressed && !d_pressed){
            move(player,-player.speedX/root2,-player.speedY/root2);
        } else if(!a_pressed && d_pressed){
            move(player,player.speedX/root2,-player.speedY/root2);
        } else move(player,0,-player.speedY);
    } else if(!w_pressed && s_pressed){
        if(a_pressed && !d_pressed){
            move(player,-player.speedX/root2,player.speedY/root2);
        } else if(!a_pressed && d_pressed){
            move(player,player.speedX/root2,player.speedY/root2);
        } else move(player,0,player.speedY);
    } else{
        if(a_pressed && !d_pressed){
            move(player,-player.speedX/root2,0);
        } else if(!a_pressed && d_pressed){
            move(player,player.speedX/root2,0);
        } 
    }

    if(player.x-player.radius>goal.x && player.y-player.radius >goal.y) nextLevel();
}

function collisionDetection(player,speed,direction){
    if(speed==0) return true;
    let j = Math.floor(player.x/maze_width);
    let i = Math.floor(player.y/maze_width);

    let current_cell = maze[i][j];
    let right_wall = (j+1)*maze_width;
    let left_wall = j*maze_width;
    let bottom_wall = (i+1) *maze_width;
    let top_wall = i*maze_width;

    let top_collide = player.y-player.radius < top_wall;
    let bottom_collide =player.y+player.radius > bottom_wall;
    let left_collide = player.x - player.radius < left_wall;
    let right_collide = player.x + player.radius >right_wall;

    let have_right = (j+1< maze_column);
    let have_left = (j>0);
    let have_bottom = i+1 <maze_row;
    let have_top = i>0;

    if(direction==="x") {
        if(speed > 0) {
            if(current_cell.walls[1] || (have_right && ((top_collide && maze[i][j+1].walls[0])
                || (bottom_collide && (maze[i][j+1].walls[2])))) ||
                ((bottom_collide && maze[i+1][j].walls[1]) || (top_collide && maze[i-1][j].walls[1]))) {
                if(player.x+player.radius + speed > right_wall) {
                    player.x = right_wall-player.radius;
                    return true;
                }
            } 
        } else {
            if(current_cell.walls[3] || (have_left && ((top_collide && maze[i][j-1].walls[0]) 
                || (bottom_collide && maze[i][j-1].walls[2]))) ||
                ((bottom_collide && maze[i+1][j].walls[3]) || (top_collide && maze[i-1][j].walls[3]))) {
                if(player.x - player.radius + speed < left_wall) {
                    player.x = left_wall+player.radius;
                    return true;
                }
            } 
        }
    } else if(direction === "y") {
        if(speed > 0) {
            if(current_cell.walls[2] || (have_bottom && (right_collide && maze[i+1][j].walls[1]) 
                || (left_collide && maze[i+1][j].walls[3])) ||
                ((right_collide && maze[i][j+1].walls[2]) || (left_collide && maze[i][j-1].walls[2]))) {
               if( player.y + player.radius + speed > bottom_wall) {
                player.y = bottom_wall - player.radius;
                return true;
               }
            }
        } else {
            if(current_cell.walls[0] || (have_top && (right_collide && maze[i-1][j].walls[1]) 
                || (left_collide && maze[i-1][j].walls[3])) ||
            ((right_collide && maze[i][j+1].walls[0]) || (left_collide && maze[i][j-1].walls[0]))) {
                if(player.y - player.radius + speed < top_wall) {
                    player.y = top_wall + player.radius;
                    return true;
                }
            } 
        }
    }
    return false;
}

function move(e,dx,dy) {

    if(e.x-e.radius+dx<0 || e.x+e.radius+dx>canvas.width) {
        if(dx<0) e.x=e.radius;
        else e.x = canvas.width-e.radius;
    } else if(collisionDetection(e,dx,"x") === false) e.x+=dx;

    if(e.y-e.radius+dy<0 || e.y+e.radius+dy>canvas.height) {
        if(dy<0) e.y=e.radius;
        else e.y = canvas.height-e.radius;
    } else if(!collisionDetection(e,dy,"y")) e.y+=dy;
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGoal();
    drawMaze();
    drawEntity(player,"yellow");
}

function drawEntity(e,color){
    ctx.beginPath();
    ctx.arc(e.x,e.y, e.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawGoal(){
    ctx.beginPath()
    ctx.rect(goal.x,goal.y,maze_width,maze_width);
    ctx.fillStyle="red";
    ctx.fill();
    ctx.closePath();
}

function drawMaze(){
    for(let i=0;i<maze_row;i++){
        for(let j=0;j<maze_column;j++) maze[i][j].draw();
    }
}

function drawLine(x,y,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();
}

$(".start-button").on("click", function() {
    restart();
    $(this).hide();
    generateLevel();
    interval = setInterval(update,1000/fps);
    
});

$("body").on("keydown",function(e) {
    if(e.keyCode==87) w_pressed=true;
    if(e.keyCode==83) s_pressed=true;
    if(e.keyCode==65) a_pressed=true;
    if(e.keyCode==68) d_pressed=true;
});

$("body").on("keyup",function(e) {
    if(e.keyCode==87) w_pressed=false;
    if(e.keyCode==83) s_pressed=false;
    if(e.keyCode==65) a_pressed=false;
    if(e.keyCode==68) d_pressed=false;
});

