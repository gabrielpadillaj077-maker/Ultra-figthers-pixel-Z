// ========================================
// ULTRA WARRIORS Z
// GAME ENGINE - PARTE 1/2
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let mode = "";
let running = false;

let keys = {};

let selected = 0;

let player1;
let player2;

let blasts = [];

let camera = {
    x:0,
    y:0
};

let message = document.getElementById("message");



// ========================================
// GUERREROS
// ========================================

const warriors = [

{
name:"KAROT",
color:"#ff8c00",
aura:"#ffff00",
speed:6,
power:12
},

{
name:"VEGETOR",
color:"#164dff",
aura:"#00ffff",
speed:7,
power:14
},

{
name:"PICOLAR",
color:"#008000",
aura:"#00ff00",
speed:5,
power:16
},

{
name:"BROLYR",
color:"#00aa00",
aura:"#99ff00",
speed:5,
power:20
},

{
name:"FREZER",
color:"#a020f0",
aura:"#ffffff",
speed:8,
power:13
}

];



// ========================================
// MENU PERSONAJES
// ========================================

const charBox =
document.getElementById("characters");


warriors.forEach((w,i)=>{


let div=document.createElement("div");

div.className="character";


div.innerHTML=
`
<div style="
width:40px;
height:50px;
background:${w.color}">
</div>

${w.name}
`;



div.onclick=function(){

selected=i;

document
.querySelectorAll(".character")
.forEach(c=>c.classList.remove("selected"));


div.classList.add("selected");

};



charBox.appendChild(div);


});


// seleccionar primero

document
.querySelector(".character")
.classList.add("selected");




// ========================================
// MODOS
// ========================================


function startMode(m){

mode=m;


document
.querySelectorAll("#menu>button")
.forEach(b=>{
b.style.display="none";
});


document
.getElementById("characterBox")
.style.display="block";


}




// botón pelear

let fight=document.createElement("button");

fight.innerHTML="¡A PELEAR!";

fight.onclick=startGame;

document
.getElementById("characterBox")
.appendChild(fight);





// ========================================
// INICIAR JUEGO
// ========================================


function startGame(){


document
.getElementById("menu")
.style.display="none";


document
.getElementById("mobileControls")
.style.display="flex";



player1=new Warrior(
300,
350,
warriors[selected],
true
);



let enemy;



if(mode==="cpu"){

enemy =
warriors[
Math.floor(
Math.random()*warriors.length
)
];

}
else{

enemy =
warriors[
(selected+1)%warriors.length
];

}



player2=new Warrior(
800,
350,
enemy,
false
);



running=true;


loop();

}



// ========================================
// CONTROLES
// ========================================


document.addEventListener(
"keydown",
e=>{

keys[e.key.toLowerCase()]=true;

});


document.addEventListener(
"keyup",
e=>{

keys[e.key.toLowerCase()]=false;

});



function press(k){

keys[k]=true;

}


function release(k){

keys[k]=false;

}




// ========================================
// CLASE GUERRERO
// ========================================


class Warrior{


constructor(x,y,data,isPlayer){


this.x=x;
this.y=y;


this.w=55;
this.h=85;


this.data=data;


this.isPlayer=isPlayer;


this.hp=100;
this.ki=50;


this.speed=data.speed;


this.power=data.power;


this.vx=0;
this.vy=0;


this.facing =
isPlayer ? 1 : -1;


this.flying=false;


this.charging=false;


this.aura=false;


this.cooldown=0;


this.transform=false;


}




update(){


if(this.hp<=0)
return;



if(this.isPlayer){


this.playerMove();


}

else{


this.ai();


}



// física

this.x+=this.vx;

this.y+=this.vy;



if(!this.flying){

this.vy+=0.5;

}

else{

this.vy*=0.8;

}



// suelo

if(
this.y>canvas.height-170
){

this.y=canvas.height-170;

this.vy=0;

this.flying=false;

}



// límites

this.x=Math.max(
0,
Math.min(
canvas.width-this.w,
this.x
)
);



if(this.cooldown>0)
this.cooldown--;


}




playerMove(){


if(keys["a"]){

this.vx=-this.speed;

this.facing=-1;

}

else if(keys["d"]){

this.vx=this.speed;

this.facing=1;

}

else{

this.vx*=0.8;

}



if(keys["w"]){

this.vy=-6;

this.flying=true;

}



if(keys["s"]){

this.vy=6;

}



if(keys["l"]){

this.charge();

}

else{

this.charging=false;

}



if(keys["j"]){

this.punch();

}



if(keys["k"]){

this.shoot();

}


}




ai(){


if(!player1)
return;


let dist =
player1.x-this.x;



if(dist>100){

this.vx=-this.speed;

}

else if(dist<-100){

this.vx=this.speed;

}

else{

this.vx=0;


if(Math.random()<0.02){

this.shoot();

}

}



}
// ========================================
// PARTE 2/2
// ========================================


// ========================================
// KI Y TRANSFORMACIÓN
// ========================================


Warrior.prototype.charge=function(){


if(this.ki<100){

this.ki+=0.5;

this.aura=true;

}



if(this.ki>=100 && !this.transform){


this.transform=true;

this.power*=1.5;

this.speed+=2;


showMessage(
"¡TRANSFORMACIÓN ULTRA!"
);


}



}




// ========================================
// ATAQUE FÍSICO
// ========================================


Warrior.prototype.punch=function(){


if(this.cooldown>0)
return;



let enemy =
this.isPlayer ?
player2 :
player1;



if(
Math.abs(this.x-enemy.x)<90
){

enemy.hp-=this.power;


enemy.hp=Math.max(
0,
enemy.hp
);


showMessage("¡GOLPE!");

}



this.cooldown=20;


};





// ========================================
// ATAQUE KI
// ========================================


Warrior.prototype.shoot=function(){


if(this.cooldown>0)
return;


if(this.ki<10)
return;



this.ki-=10;



blasts.push(

new Blast(

this.x+(this.facing*40),

this.y+35,

this.facing,

this.data.aura,

this.power

)

);



this.cooldown=30;


};





// ========================================
// DIBUJAR GUERRERO
// ========================================


Warrior.prototype.draw=function(){


let x=this.x-camera.x;

let y=this.y-camera.y;



// aura


if(this.aura){


ctx.beginPath();

ctx.fillStyle=
this.data.aura+"55";

ctx.shadowBlur=40;

ctx.shadowColor=
this.data.aura;


ctx.arc(
x+this.w/2,
y+this.h/2,
80,
0,
Math.PI*2
);


ctx.fill();


ctx.shadowBlur=0;

}




// cuerpo


ctx.fillStyle=this.data.color;


ctx.fillRect(
x,
y,
this.w,
this.h
);


// cabeza


ctx.fillRect(
x+10,
y-25,
35,
25
);



// ojos


ctx.fillStyle="#000";


ctx.fillRect(
x+18,
y-15,
5,
5
);


ctx.fillRect(
x+30,
y-15,
5,
5
);



// transformación


if(this.transform){


ctx.fillStyle="#fff";


ctx.fillRect(
x+5,
y-35,
45,
8
);


}


};





// ========================================
// PROYECTIL KI
// ========================================


class Blast{


constructor(x,y,dir,color,power){


this.x=x;

this.y=y;

this.dir=dir;

this.color=color;

this.power=power;

this.speed=12;

this.size=10+power/2;


}




update(){

this.x+=this.speed*this.dir;

}




draw(){


ctx.beginPath();


ctx.fillStyle=this.color;


ctx.shadowBlur=30;

ctx.shadowColor=this.color;


ctx.arc(
this.x-camera.x,
this.y-camera.y,
this.size,
0,
Math.PI*2
);


ctx.fill();


ctx.shadowBlur=0;


}




hit(enemy){


if(

this.x>enemy.x &&
this.x<enemy.x+enemy.w &&
this.y>enemy.y &&
this.y<enemy.y+enemy.h

){


enemy.hp-=this.power;


enemy.hp=Math.max(
0,
enemy.hp
);


showMessage(
"¡KI IMPACTO!"
);


return true;

}


return false;


}



}





// ========================================
// CÁMARA
// ========================================


function updateCamera(){


if(!player1||!player2)
return;


let center =
(player1.x+player2.x)/2;



camera.x =
center -
canvas.width/2;



if(camera.x<0)
camera.x=0;



}





// ========================================
// ARENA
// ========================================


function drawArena(){


let bg=
ctx.createLinearGradient(
0,
0,
0,
canvas.height
);



bg.addColorStop(
0,
"#55bfff"
);


bg.addColorStop(
1,
"#d4a373"
);



ctx.fillStyle=bg;


ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);



// suelo


ctx.fillStyle="#555";


ctx.fillRect(
0-camera.x,
canvas.height-80,
3000,
80
);




// montañas


ctx.fillStyle="#765";


ctx.beginPath();

ctx.moveTo(
0-camera.x,
500
);


ctx.lineTo(
300-camera.x,
180
);


ctx.lineTo(
600-camera.x,
500
);


ctx.fill();



}





// ========================================
// ATAQUES
// ========================================


function updateBlasts(){


for(
let i=blasts.length-1;
i>=0;
i--
){


let b=blasts[i];


b.update();

b.draw();



let target =
b.dir>0 ?
player2 :
player1;



if(b.hit(target)){

blasts.splice(i,1);

continue;

}



if(
b.x<camera.x-200 ||
b.x>camera.x+canvas.width+200
){

blasts.splice(i,1);

}


}



}




// ========================================
// CHOQUE DE PODERES
// ========================================


function powerClash(){


for(let i=0;i<blasts.length;i++){


for(let j=i+1;j<blasts.length;j++){



let a=blasts[i];

let b=blasts[j];



if(

Math.abs(a.x-b.x)<40 &&
Math.abs(a.y-b.y)<40 &&
a.dir!=b.dir

){


showMessage(
"¡¡CHOQUE DE PODERES!!"
);


blasts.splice(j,1);

blasts.splice(i,1);


return;


}


}


}


}





// ========================================
// HUD
// ========================================


function updateHUD(){


if(!player1||!player2)
return;



life1.style.width=
player1.hp+"%";


life2.style.width=
player2.hp+"%";


ki1.style.width=
player1.ki+"%";


ki2.style.width=
player2.ki+"%";



name1.innerHTML=
player1.data.name;


name2.innerHTML=
player2.data.name;


}




// ========================================
// MENSAJE
// ========================================


function showMessage(t){


message.style.display="block";


message.innerHTML=t;



setTimeout(()=>{


message.style.display="none";


},1000);


}





// ========================================
// GANADOR
// ========================================


function checkWinner(){


if(player1.hp<=0){


showMessage(
player2.data.name+" GANA"
);


running=false;


}


if(player2.hp<=0){


showMessage(
player1.data.name+" GANA"
);


running=false;


}


}




// ========================================
// LOOP DEL JUEGO
// ========================================


function loop(){


if(!running)
return;



ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);



updateCamera();


drawArena();



player1.update();

player2.update();



updateBlasts();


powerClash();



player1.draw();

player2.draw();



updateHUD();


checkWinner();



requestAnimationFrame(loop);


}
