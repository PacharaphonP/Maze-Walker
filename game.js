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
        maze_width-=10;
        player.radius-=3;
    } 
    generateLevel();
}

function restart(){
    level = 1;
    maze_width= 40;
    player.radius = 12;
    canvas.width = 320;
    canvas.height = 320;
    generateLevel();
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

    if(player.x>goal.x && player.y>goal.y) nextLevel();
}

function collisionDetection(e,speed,direction){
    if(speed==0) return true;
    let left_e = e.x-e.radius;
    let right_e = e.x+e.radius;
    let top_e = e.y-e.radius;
    let bot_e = e.y+e.radius;
    for(let k=0;k<maze.maze_row;k++){
        for(let l=0;l<maze_column;l++){
            let i = maze[k][l].i;
            let j = maze[k][l].j;
            let left_m =(j)*maze_width;
            let right_m = (j+1)*maze_width;
            let top_m = i*maze_width;
            let bot_m = (i+1)*maze_width;

            // if(direction=="y"){
            //     if(checkCollide1(left_m,right_m,left_e,right_e,e.x)){
            //         if(speed>0){
            //             if(bot_e<=top_m && bot_e+dy>=top_m){

            //                 e.y = top_m-e.radius;
            //                 return true;
            //             }
            //         } else {
            //             if(top_e>=bot_m && top_e+dy<=bot_m){
            //                 e.y = bot_m+e.radius;
            //                 return true;
            //             }
            //         }
            //     }
            // } else if(direction=="x"){
            //     if(checkCollide1(top_m,bot_m,top_e,bot_e,e.y)){
            //         if(speed>0){
            //             if(right_e<=left_m && right_e+dx>=left_m){
            //                 e.x = left_m-e.radius;
            //                 return true;
            //             }
            //         } else {
            //             if(left_e>=right_m && left_e+dx<=right_m){
            //                 e.x = right_m+e.radius;
            //                 return true;
            //             }
            //         }
            //     }
            // }
        }
        
    }
    return false;
}

function checkCollide1(m1,m2,e1,e2,x){
    return (m1>e1 && m1<e2) || (m2>e1 && m2<e2) || (m1<x && m2>x);
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

function move(e,dx,dy) {
    if(e.x-e.radius+dx<0 || e.x+e.radius+dx>canvas.width) {
        if(dx<0) e.x=e.radius;
        else e.x = canvas.width-e.radius;
        console.log("hit wall");
    } else if(!collisionDetection(e,dx,"x")) e.x+=dx;
    if(e.y-e.radius+dy<0 || e.y+e.radius+dy>canvas.height) {
        if(dy<0) e.y=e.radius;
        else e.y = canvas.height-e.radius;
        console.log("hit wall");
    } else if(!collisionDetection(e,dy,"y")) e.y+=dy;
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

restart();
