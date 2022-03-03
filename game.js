//this is to store the highscore inside the browser
const localStorageHighScore = "highscore";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,

  dom: {
    createContainer: true
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },

  scene: {
      preload: preload,
      create: create,
      update: update
  },

  audio: { disableWebAudio: true}
};


var game = new Phaser.Game(config);
let platformGroup

function preload ()
{
  //load all the images will be used.
  this.load.image('tile', 'images/tile.png');
  this.load.image('tileup', 'images/tileup.png');
  this.load.image('sky', 'images/starfield.jpg');
  this.load.spritesheet('dude', 'images/dude.png',{ frameWidth: 32, frameHeight: 48 })
  this.load.spritesheet('dudeup', 'images/dudeup.png',{ frameWidth: 32, frameHeight: 48 })

  this.load.audio('bgmusic', ['sounds/TFR.mp3']);
  this.load.audio('jumpsound', ['sounds/Bruh.mp3']);
  this.load.audio('GCsound', ['sounds/gravityChange.mp3']);

  

}

function create ()
{ 
  score = 0;

  //to load the highscore from the local storage(saved in browser)
  highscore = localStorage.getItem(localStorageHighScore) == null ? 0 :
  localStorage.getItem(localStorageHighScore);

  //set sky as background
  this.background = this.add.tileSprite(400,300,800,600,'sky')

  //create a group to store platform
  platformGroup = this.physics.add.group()
  //create platform
  for (var i = 0; i < 20; i++)
  {
          addTile(0 + i * 70, 568,"down");
  }
  for (var i = 0; i < 20; i++)
  {
    
    addTile(0 + i * 70, 35,"up");
  }



  //create player and set its physic config
  this.player = this.physics.add.sprite(100, 300, 'dude')
  .setBounce(0)
  .setCollideWorldBounds(false)
  .setScale(2.5)
  .setImmovable(false)

  //animation of player
  this.anims.create({
    //running to right animation
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  })
  this.anims.create({
    //running to right animation(when gravity is up)
    key: 'upright',
    frames: this.anims.generateFrameNumbers('dudeup', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  })

  //let player collide with platform
  this.physics.add.collider(this.player, platformGroup)

  //call the two platform generator function and add them into timer
  this.time.addEvent({ delay:2000 , callback: addPlatformTop, callbackScope: this, loop: false })
  this.time.addEvent({ delay:1500 , callback: addPlatformBottom, callbackScope: this, loop: false })


  //play right animation for player when game starts
  this.player.anims.play('right', false)

  //loop the background music
  bgmusic = this.sound.add('bgmusic');
  
  /*
  setTimeout(bgmusic.play({
    loop: true,
    volume: 0.3,
   }));
  */
   
   

   //this sound is for jump
   jumpsound = this.sound.add('jumpsound');
   //this sound is for gravity change
   GCsound = this.sound.add('GCsound');

   //display the max score and score
   text = this.add.text(00, 100, '', { font: '30px', fill: '#00ff00' });
}

function update ()
{
  //keep adding score until player die
  score += 100/60;

  //compare highscore with score,if highscore is lower,change it to the score
  highscore = Math.max(score,highscore)
  text.setText([
    'Highscore: ' + Math.ceil(highscore),
    'Score: ' + Math.ceil(score)
]);

  if(! bgmusic.isPlaying){
    bgmusic.play({
      loop: true,
      volume: 0.3,
     })
  }

  //let the background keep scrolling,speed =4
  this.background.tilePositionX += 4

  this.cursors = this.input.keyboard.createCursorKeys()
  
  //change gravity of the player when ‘UP’/'DOWN' is pressed,
  if (this.cursors.up.isDown&& this.player.body.touching.down ) {
    //sound effect
    jumpsound.play({volume:0.8});
    this.player.setVelocityY(-100);
    this.player.body.gravity.y = -1600;

    this.player.anims.play('upright', true)
  } else if (this.cursors.down.isDown && this.player.body.touching.up ) {
    //sound effect
    jumpsound.play({volume:0.8});

    this.player.setVelocityY(100);
    this.player.body.gravity.y = 0;

    this.player.anims.play('right', true)
  } 

  //this is to let the sprite jump when ‘SPACE’ is press,speed =300
  if (this.cursors.space.isDown && this.player.body.touching.down ) {
    GCsound.play({volume:0.4});
    this.player.setVelocityY(-320)
  }else if (this.cursors.space.isDown && this.player.body.touching.up) {
    GCsound.play({volume:0.4});
    this.player.setVelocityY(320)
  }

  
  //detect is the character out of bound,our of bound then die
  if (this.player.body.position.y<-100 || this.player.body.position.y>550) 
  {
    this.scene.pause();
    /*
    */ 
    if(score>=highscore){
      alert('congrats ,you broke the highest score :'+Math.ceil(score))
      localStorage.setItem(localStorageHighScore,highscore)
    }else{
      alert("GAME OVER!! \nYOUR SCORE: "+ Math.ceil(score) +"\n HIGHEST SCORE: "+ Math.ceil(highscore))
    }
    
      this.registry.destroy(); // destroy registry
    this.events.off(); // disable all active events
    this.scene.restart(); // restart current scene
  }

  
    
  
}


/*this function is to add platform
  reference:https://www.joshmorony.com/how-to-create-an-infinite-climbing-game-in-phaser/
 x and y is the coordinate of the tile(platform)
 z is the direction(up/down)
*/
function addTile(x,y,z){

  //create platfrom
  if (z == "up"){
    tile = platformGroup.create(x, y, 'tileup')
  }else{
    tile = platformGroup.create(x, y, 'tile')
  }

  //set the physic config of platform
  tile.setImmovable(true)  //wont move when collide by player
  tile.setVelocityX(-350)  //keep moving left
  tile.body.setAllowGravity(false)  //wont affect by gravity

}

/*
this function is to calculate the holesize and platform size
with random number,
after that,we use loop to call out the addTile() function to build platform
*/
function addPlatformTop() {
 
  /*
     we use generate number to generate out platform size
     60% generate 5(size)platform,30% generate 7(size)platform,10%generate 3(size)platform
  */
  var platformSize=0;
  platformSizepb = Math.random()
  if(platformSizepb<=0.6){
     platformSize=5
  }else if( platformSizepb>0.6 && platformSizepb<=0.9 ){
    platformSize=7
  }else if( platformSizepb>0.9 && platformSizepb<=1 ){
    platformSize=3
  }else{
    platformSize=5
  }

  
  //generate random hole size 3-6
  var holesize = Phaser.Math.Between(2, 5);
  if(Math.random()<=0.05){
    holesize=6
 }else if(Math.random()<=0.1){
   holesize=7
 }

  //creating platform
  for (var i = 0; i < platformSize; i++)
  {
          addTile(800 + i * 70, 35,"up");
  }

  //calculate the delay time depends on the hole size(longer time bigger hole)
  delaytime = ((70*platformSize)/350)*1000 + 70/350*1000*holesize

  //call this function out after delaytime
  this.time.addEvent({ delay:delaytime , callback: addPlatformTop, callbackScope: this, loop: false })

}

/*
total same as addPlatformTop(),just different direction and coordinates
*/
function addPlatformBottom() {
 
  /*
  40% generate 5(size)platform,
  20% generate 6(size)platform,
  20% generate 9(size)platform,
  10% generate 7(size)platform,
  10%generate  3(size)platform
  */
  var platformSize=0;
  platformSizepb = Math.random()
  if(platformSizepb<=0.4){
     platformSize=5
  }else if( platformSizepb>0.4 && platformSizepb<=0.6 ){
    platformSize=6
  }else if( platformSizepb>0.6 && platformSizepb<=0.8 ){
    platformSize=9
  }else if( platformSizepb>0.8 && platformSizepb<=0.9 ){
    platformSize=7
  }else if( platformSizepb>0.9 && platformSizepb<=1 ){
    platformSize=3
  }else{
    platformSize=5
  }

  
  //generate random hole size 2-6
  var holesize = Phaser.Math.Between(2, 5);
  if(Math.random()<=0.05){
    holesize=6
 }else if(Math.random()<=0.1){
   holesize=7
 }

  //creating platform
  for (var i = 0; i < platformSize; i++)
  {
          addTile(800 + i * 70, 568,"down");
  }

  //calculate the delay time depends on the hole size(longer time bigger hole)
  delaytime = ((70*platformSize)/350)*1000 + 70/350*1000*holesize

  //call this function out after delaytime
  this.time.addEvent({ delay:delaytime , callback: addPlatformBottom, callbackScope: this, loop: false })

}

//this function will save the highscore into txt file
function loadfromTXT() {

}

function writeToTXT(highscore) 
{
  var fso = new ActiveXObject(Scripting.FileSystemObject);
  var f   = fso.createtextfile("highscore.txt",2,true); 
  f.writeLine("Hello Word!");  //写入内容
  f.close(); //关闭对象
}
