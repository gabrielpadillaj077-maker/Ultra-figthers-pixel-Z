// ========================================
// ULTRA WARRIORS Z - GAME ENGINE
// ESTILO BUDOKAI TENKAICHI 2D
// ========================================


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



let mode="";
let running=false;

let keys={};

let selected=0;

let player1;
let player2;

let blasts=[];

let camera={
    x:0,
    y:0
};


let message=document.getElementById("message");



// ========================================
// GUERREROS
// ========================================


const warriors=[


{
name:"KAROT",
color:"#ff8c00",
aura:"#ffff00",
speed:6,
power:12,
defense:5
},


{
name:"VEGETOR",
color:"#164dff",
aura:"#00ffff",
speed:7,
power:14,
defense:6
},


{
name:"PICOLAR",
color:"#008000",
aura:"#00ff00",
speed:5,
power:15,
defense:10
},


{
name:"BROLYR",
color:"#00aa00",
aura:"#99ff00",
speed:5,
power:20,
defense:12
},


{
name:"FREZER",
color:"#a020f0",
aura:"#ffffff",
speed:8,
power:13,
defense:4
}


];




// ========================================
// CREAR SELECCIÓN
// ========================================


let charBox=document.getElementById("characters");


warriors.forEach((w,i)=>{


let div=document.createElement("div");

div.className="character";


div.innerHTML=
`
<div style="
width:40px;
height:50px;
background:${w.color};
">
</div>

${w.name}
`;


div.onclick=()=>{

selected=i;

document.querySelectorAll(".character")
.forEach(x=>x.classList.remove("selected"));


div.classList.add("selected");

};


charBox.appendChild(div);


});




// ========================================
// MODOS
// ========================================


function startMode(m){

mode=m;


document.getElementById("characterBox").style.display="block";


}



function startGame(){


document.getElementById("menu").style.display="none";

document.getElementById("mobileControls").style.display="flex";


player1=new Warrior(
300,
400,
warriors[selected],
true
);



let enemy;


if(mode==="cpu"){

enemy=
warriors[
Math.floor(Math.random()*warriors.length)
];

}

else{

enemy=
warriors[
(selected+1)%warriors.length
];

}


player2=new Warrior(
800,
400,
enemy,
false
);



running=true;


loop();


}



// ========================================
// TECLADO
// ========================================


document.addEventListener(
"keydown",
e=>{

keys[e.key.toLowerCase()]=true;

}
);



document.addEventListener(
"keyup",
e=>{

keys[e.key.toLowerCase()]=false;

}
);



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


this.vx=0;
this.vy=0;


this.speed=data.speed;


this.facing=
isPlayer?1:-1;


this.flying=false;


this.charging=false;


this.aura=false;


this.attackCooldown=0;


this.transform="BASE";


this.power=data.power;

}





update(){


if(this.hp<=0)return;



// =============================
// MOVIMIENTO JUGADOR 1
// =============================


if(this.isPlayer){


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




// VOLAR


if(keys["w"]){

this.vy=-6;
this.flying=true;

}


if(keys["s"]){

this.vy=6;

}



// CARGAR KI


if(keys["l"]){

this.charge();

}

else{

this.charging=false;

}




// ATAQUES


if(keys["j"]){

this.punch();

}


if(keys["k"]){

this.kiAttack();

}



}



// =============================
// IA
// =============================


else{


let distance=
player1.x-this.x;



if(distance>100){

this.vx=this.speed*-1;

}


else if(distance<-100){

this.vx=this.speed;

}


else{

this.vx=0;


if(Math.random()<0.02){

this.kiAttack();

}


}



}




// FISICA


this.x+=this.vx;
this.y+=this.vy;



if(!this.flying){

this.vy+=0.4;

}



else{

this.vy*=0.8;

}




// SUELO


if(this.y>canvas.height-160){

this.y=canvas.height-160;

this.vy=0;

this.flying=false;

}



// LIMITES


this.x=Math.max(
0,
Math.min(
canvas.width-this.w,
this.x
)
);





if(this.attackCooldown>0){

this.attackCooldown--;

}



}



// =================================
// CARGAR KI
// =================================


charge(){


if(this.ki<100){


this.ki+=0.5;

this.aura=true;


}



if(this.ki>=100){


this.transform="ULTRA";

this.power*=1.5;


showMessage(
"¡TRANSFORMACIÓN!"
);


}


}



// =================================
// ATAQUE FÍSICO
// =================================


punch(){


if(this.attackCooldown>0)
return;



let enemy=
this.isPlayer?
player2:
player1;



let distance=
Math.abs(
this.x-enemy.x
);



if(distance<90){


enemy.hp-=this.power;


enemy.hp=Math.max(
0,
enemy.hp
);


showMessage(
"¡GOLPE!"
);


}


this.attackCooldown=20;


}



// =================================
// ATAQUE KI
// =================================


kiAttack(){


if(this.attackCooldown>0)
return;



if(this.ki<10)
return;



this.ki-=10;


blasts.push(

new Blast(

this.x+
(this.facing*40),

this.y+35,

this.facing,

this.data.aura,

this.power

)

);



this.attackCooldown=30;


}
// ========================================
// PROYECTILES DE KI
// ========================================


class Blast{


constructor(x,y,dir,color,power){


this.x=x;
this.y=y;

this.dir=dir;

this.size=
10+(power/2);


this.color=color;

this.power=power;


this.speed=12;


}



update(){


this.x+=
this.speed*this.dir;


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
// DIBUJAR GUERRERO
// ========================================


Warrior.prototype.draw=function(){


let x=
this.x-camera.x;


let y=
this.y-camera.y;



ctx.save();



if(this.aura){


ctx.beginPath();


ctx.fillStyle=
this.data.aura+"55";


ctx.shadowBlur=50;

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




// cuerpo pixel


ctx.fillStyle=
this.data.color;


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


ctx.fillStyle="black";


ctx.fillRect(
x+18,
y-15,
5,
5
);

ctx.fillRect(
x+28,
y-15,
5,
5
);



// transformación


if(this.transform==="ULTRA"){


ctx.fillStyle="#fff";


ctx.fillRect(
x+5,
y-35,
45,
8
);


}



ctx.restore();



}




// ========================================
// CÁMARA
// ========================================


function updateCamera(){


let center=
(player1.x+player2.x)/2;



camera.x=
center-
canvas.width/2;



camera.x=
Math.max(
0,
camera.x
);



}




// ========================================
// ESCENARIO
// ========================================


function drawArena(){


let grad=
ctx.createLinearGradient(
0,
0,
0,
canvas.height
);


grad.addColorStop(
0,
"#65c7ff"
);


grad.addColorStop(
1,
"#d2a679"
);



ctx.fillStyle=grad;


ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);




// montañas


ctx.fillStyle="#754c24";


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





ctx.fillStyle="#444";


ctx.fillRect(
0-camera.x,
canvas.height-80,
3000,
80
);



}




// ========================================
// ACTUALIZAR HUD
// ========================================


function updateHUD(){


document.getElementById(
"life1"
).style.width=
player1.hp+"%";



document.getElementById(
"life2"
).style.width=
player2.hp+"%";



document.getElementById(
"ki1"
).style.width=
player1.ki+"%";



document.getElementById(
"ki2"
).style.width=
player2.ki+"%";



document.getElementById(
"name1"
).innerHTML=
player1.data.name;


document.getElementById(
"name2"
).innerHTML=
player2.data.name;



}





// ========================================
// MENSAJES
// ========================================


function showMessage(text){


message.style.display="block";


message.innerHTML=text;



setTimeout(()=>{


message.style.display="none";


},1000);



}
// ========================================
// COLISIONES DE KI
// ========================================


function updateBlasts(){


for(let i=blasts.length-1;i>=0;i--){


let b=blasts[i];


b.update();


b.draw();



let target=
b.dir>0?
player2:
player1;



if(b.hit(target)){


blasts.splice(i,1);


}


// eliminar fuera de pantalla

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
a.dir!==b.dir

){



showMessage(
"¡¡CHOQUE DE PODERES!!"
);



// eliminar ambos ataques


blasts.splice(j,1);

blasts.splice(i,1);



return;


}



}


}



}





// ========================================
// FIN DE BATALLA
// ========================================


function checkWinner(){


if(player1.hp<=0){


showMessage(
player2.data.name+" GANA"
);


running=false;


setTimeout(()=>{

location.reload();

},3000);


}



if(player2.hp<=0){


showMessage(
player1.data.name+" GANA"
);


running=false;


setTimeout(()=>{

location.reload();

},3000);


}



}





// ========================================
// LOOP PRINCIPAL
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





// ========================================
// INICIAR CUANDO SE SELECCIONE
// ========================================


document
.querySelector("#characterBox")
.insertAdjacentHTML(
"beforeend",
`
<br>
<button onclick="startGame()">
¡A PELEAR!
</button>
`
);
