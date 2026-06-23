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
