const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

const fps=60;
const root2 = Math.pow(2,0.5);

let player = {
    x: 20,
    y: 50,
    radius:10,
    health:100,
    speedX:5,
    speedY:5,
}

let maze = [[1,0,1,0,0,1,1],
    [1,0,1,0,1,1,1],
    [0,0,0,0,1,0,0],
    [1,0,1,0,0,0,1],
    [1,0,1,1,1,1,1],
    [1,0,0,0,0,1,1],
    [1,1,1,1,0,0,0]];

let maze_column = 7;
let maze_row = 7;
let maze_width = 30;
let maze_heigth = 30;
let maze_x = 100;
let maze_y = 50;
let w_pressed = false;
let a_pressed = false;
let s_pressed = false;
let d_pressed = false;

const interval = setInterval(update,1000/fps);

function update() {
    draw();
    playerUpdate();
}

function playerUpdate(){
    //player's movement
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

    if(player.health==0) clearInterval(interval);
}

function collisionDetectionX(e,dx) {
    if(dx==0) return true;
    let top_e = e.y-e.radius;
    let bot_e = e.y+e.radius;
    let left_e = e.x-e.radius;
    let right_e = e.x+e.radius;
    for(let i=0;i<maze_row;i++){
        for(let j=0;j<maze_column;j++){
            if(maze[i][j]==1){//wall
                let top_m = maze_y+i*maze_heigth;
                let bot_m = maze_y+(i+1)*maze_heigth;
                //check y
                if((top_m>top_e && top_m<bot_e) || (bot_m>top_e && bot_m<bot_e) || (top_m<e.y && bot_m>e.y)){
                    if(dx>0){
                        let left_m = maze_x+(j)*maze_width;
                        if(right_e<=left_m && right_e+dx>=left_m){
                            e.x = left_m-e.radius;
                            return true;
                        }
                    } else {
                        let right_m = maze_x+(j+1)*maze_width;
                        if(left_e>=right_m && left_e+dx<=right_m){
                            e.x = right_m+e.radius;
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function collisionDetectionY(e,dy){
    if(dy==0) return true;
    let left_e = e.x-e.radius;
    let right_e = e.x+e.radius;
    let top_e = e.y-e.radius;
    let bot_e = e.y+e.radius;
    for(let i=0;i<maze_row;i++){
        for(let j=0;j<maze_column;j++){
            if(maze[i][j]==1){//wall
                let left_m = maze_x+(j)*maze_width;
                let right_m = maze_x+(j+1)*maze_width;
                //check y
                if((left_m>left_e && left_m<right_e) || (right_m>left_e && right_m<right_e) || (left_m<e.x && right_m>e.x)){
                    if(dy>0){
                        let top_m = maze_y+i*maze_heigth;
                        if(bot_e<=top_m && bot_e+dy>=top_m){
                            e.y = top_m-e.radius;
                            return true;
                        }
                    } else {
                        let bot_m = maze_y+(i+1)*maze_heigth;
                        if(top_e>=bot_m && top_e+dy<=bot_m){
                            e.y = bot_m+e.radius;
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawMaze();
}

function drawPlayer(){
    ctx.beginPath();
    ctx.arc(player.x,player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
}

function drawMaze(){
    for(let i=0;i<maze_row;i++){
        for(let j=0;j<maze_column;j++){
            if(maze[i][j]==1) {
                ctx.beginPath();
                ctx.rect(maze_x+j*maze_width,maze_y+i*maze_heigth, maze_width,maze_heigth);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function move(e,dx,dy) {
    if(e.x-e.radius+dx<0 || e.x+e.radius+dx>canvas.width) {
        if(dx<0) e.x=e.radius;
        else e.x = canvas.width-e.radius;
        console.log("hit wall");
    } else if(!collisionDetectionX(e,dx)) e.x+=dx;
    if(e.y-e.radius+dy<0 || e.y+e.radius+dy>canvas.height) {
        if(dy<0) e.y=e.radius;
        else e.y = canvas.height-e.radius;
        console.log("hit wall");
    } else if(!collisionDetectionY(e,dy)) e.y+=dy;
}

$(".start-button").on("click", function() {
    $(this).hide();
    setInterval(update,5);
    
});

//keypresed 
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

