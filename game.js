const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

const fps=60;
const root2 = Math.pow(2,0.5);

let player = {
    x: 100,
    y: 50,
    width:10,
    height:10,
    health:100,
    speedX:5,
    speedY:5,
}

let maze = [[1,1,1,0,1,1],
    [1,1,0,1,1,1],
    [0,0,0,0,1,1],
    [1,0,1,0,0,1],
    [1,0,1,1,0,1],
    [1,1,1,1,0,1],];

let maze_column = 6;
let maze_row = 6;
let maze_width = 30;
let maze_heigth = 30;
let maze_x = 0;
let maze_y = 0;
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
    if(dx>0){
        for(let i=0;i<maze_row;i++){
            for(let j=0;j<maze_column;j++){
                if(maze[i][j]==1){
                    let left_check=maze_x+j*maze_width;
                    if(left_check>e.x+e.width && left_check<e.x-e.width+dx && ((e.y<maze_y+i*maze_heigth && e.y+e.height>i*maze_heigth)||(e.y<maze_y+(i-1)*maze_heigth && e.y+e.height>(i-1)*maze_heigth))) {
                        e.x = left_check-e.width;
                        ctx.beginPath();
                        ctx.rect(maze_x+j*maze_width,maze_y+i*maze_heigth, maze_width,maze_heigth);
                        ctx.fillStyle = "blue";
                        ctx.fill();
                        ctx.closePath();
                        return true;
                    }
                }
            }
        }
    } else if(dx<0){
        for(let i=0;i<maze_row;i++){
            for(let j=0;j<maze_column;j++){
                if(maze[i][j]==1){
                    
                    let right_check=maze_x+(j+1)*maze_width;
                    if(right_check>e.x-e.width+dx && right_check<e.x+e.width && ((e.y<maze_y+i*maze_heigth && e.y+e.height>i*maze_heigth)||(e.y<maze_y+(i-1)*maze_heigth && e.y+e.height>(i-1)*maze_heigth))) {
                        ctx.beginPath();
                        ctx.rect(maze_x+j*maze_width,maze_y+i*maze_heigth, maze_width,maze_heigth);
                        ctx.fillStyle = "blue";
                        ctx.fill();
                        ctx.closePath();
                        e.x = right_check+e.width;
                        return true;
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
    ctx.arc(player.x,player.y, player.width, 0, Math.PI * 2);
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
    if(e.x-e.width+dx<0 || e.x+e.width+dx>canvas.width) {
        if(dx<0) e.x=e.width;
        else e.x = canvas.width-e.width;
        console.log("hit wall");
    } else if(!collisionDetectionX(e,dx)) e.x+=dx;
    if(e.y-e.height+dy<0 || e.y+e.height+dy>canvas.height) {
        if(dy<0) e.y=e.height;
        else e.y = canvas.height-e.height;
        console.log("hit wall");
    } else e.y+=dy;
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

