"use strict";

var WorldState = function() {};

WorldState.prototype.init = function(player, enemies) {
	this.player = player;
	this.enemies = enemies;
};


WorldState.prototype.create = function() {
	
	
	this.game.physics.startSystem(Phaser.Physics.ARCADE);
	
	
	
    this.map = this.game.add.tilemap('map');
    
    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('RPGMakerTileset', 'gameTiles');

    
    
   		 //Create Layers
    
    //background layers
    this.background = this.map.createLayer('background');
    this.groundClutter = this.map.createLayer('groundClutter');
    
    //colliding layer
    this.collidingTerrain = this.map.createLayer('collidingTerrain');
	
	//create player
	if(typeof this.player.mapSprite == 'undefined')  {
    	var playerObject = this.findObjectsByType('playerStart', this.map, 'objects');
    	this.player.setMapSprite(this.game.add.sprite(playerObject[0].x, playerObject[0].y, 'mapPlayer'));
    	this.addPlayerAnimations();
    	this.game.physics.arcade.enable(this.player.mapSprite);
    	console.log(this.player.mapSprite);
    }
    else {
    	console.log(this.player.mapSprite);
    	this.player.setMapSprite(this.game.add.sprite(this.player.mapSprite.x, this.player.mapSprite.y, 'mapPlayer'));
    	this.addPlayerAnimations();
    	this.game.physics.arcade.enable(this.player.mapSprite);
    }
    
    this.createEnemies();
    
	//top layer details
	this.nonCollidingTerrainFarBack = this.map.createLayer('nonCollidingTerrainFarBack');
	this.nonCollidingTerrainBack = this.map.createLayer('nonCollidingTerrainBack');
    this.nonCollidingTerrainFront = this.map.createLayer('nonCollidingTerrainFront');
    

    //enable collision for the colliding layer
    this.map.setCollisionBetween(1, 10000, true, 'collidingTerrain');

    //resizes the game world to match the layer dimensions
    this.background.resizeWorld();

	
    

    //the camera will follow the player in the world
    this.game.camera.follow(this.player.mapSprite, Phaser.Camera.FOLLOW_TOPDOWN);

    
    
    //Set up input capture
    this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
    ]);
    
};

WorldState.prototype.addPlayerAnimations = function() {

	//Animations
	this.player.mapSprite.lastDirection = 'd';
	
	//							 name			 frames			fps		loop?
	this.player.mapSprite.animations.add(	'didle', 		[0], 			10, 	false);
	this.player.mapSprite.animations.add(	'lidle', 		[4], 			10, 	false);
	this.player.mapSprite.animations.add(	'ridle', 		[8], 			10, 	false);
	this.player.mapSprite.animations.add(	'uidle', 		[12], 			10, 	false);
	this.player.mapSprite.animations.add(	'walkDown',		[0,1,2,3], 		5, 		true);
	this.player.mapSprite.animations.add(	'walkLeft', 	[4,5,6,7], 		5, 		true);
	this.player.mapSprite.animations.add(	'walkRight',	[8,9,10,11],	5, 		true);
	this.player.mapSprite.animations.add(	'walkUp', 		[12,13,14,15], 	5, 		true);
	
};


WorldState.prototype.createItems = function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var item;    
    var result = this.findObjectsByType('item', this.map, 'objects');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
    this.items.scale.setTo(0.5,0.5);
  };
  
WorldState.prototype.createEnemies = function() {
	var i = 1;
	this.enemyGroup = this.game.add.group();
	this.enemyGroup.enableBody = true;
	console.log(this.map);
	var result = this.findObjectsByType('enemyCharacter', this.map, 'objects');
	console.log(result);
    result.forEach(function(element){
    	this.enemies['enemy' + i].setMapSprite(this.enemyGroup.create(element.x, element.y, 'villan'));
    	if(this.enemies['enemy' + i].stats['currentHealth'] === 0) {
    		this.enemies['enemy' + i].mapSprite.kill();
    	}
    	this.enemies['enemy' + i].mapSprite.enemyNumber = i++;
    	
    }, this);
    this.game.physics.arcade.enable(this.enemyGroup);
};
  
  
  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  WorldState.prototype.findObjectsByType = function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  };
  
  
  //create a sprite from an object
  WorldState.prototype.createFromTiledObject = function(element, group) {
    var sprite = group.create(element.x * 2, element.y * 2, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  };
  
   //create a sprite from an object
  WorldState.prototype.createFromTiledObject2 = function(element, group, storeIn) {
    storeIn = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        storeIn[key] = element.properties[key];
      });
  };


WorldState.prototype.update = function() {
	
	//Collision
    this.game.physics.arcade.collide(this.player.mapSprite, this.collidingTerrain);
    this.game.physics.arcade.overlap(this.player.mapSprite, this.enemyGroup, this.battle, null, this);

    
    
    //Update inputList based on the currently active input keys
    this.getInput();
    
    //Update the game based on the input
    this.move();
};

WorldState.prototype.battle = function(player, enemy) {
	//Start a battle between the player and the enemy 
	
	this.game.state.start('battle', true, false, this.player, this.enemies, enemy.enemyNumber);
};

WorldState.prototype.getInput = function() {
	//Create a dictionary to track which input keys are active for the current frame   
	this.inputList = {'left': false, 'right': false, 'up': false, 'down': false, 'space': false};
	
	//Update inputList to reflect the active keys
	if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        this.inputList['left'] = true;
    } 
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        this.inputList['right'] = true;
    } 
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        this.inputList['down'] = true;
    } 
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        this.inputList['up'] = true;
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.inputList['space'] = true;
    }
};



WorldState.prototype.move = function() {
	//Update the game based on the information stored in inputList 
	
	//player movement
    this.player.mapSprite.body.velocity.y = 0;
    this.player.mapSprite.body.velocity.x = 0;
	
	//Set x and y velocity to determine movement
    if(this.inputList['up']) {
      this.player.mapSprite.body.velocity.y -= 100;
    }
    if(this.inputList['down']) {
      this.player.mapSprite.body.velocity.y += 100;
    }
    if(this.inputList['left']) {
      this.player.mapSprite.body.velocity.x -= 100;
    }
    if(this.inputList['right']) {
      this.player.mapSprite.body.velocity.x += 100;
    }
    
    //Check for action button input
    if(this.inputList['space']) {
    	this.doAction();
    }
    
    //Deal with updating the animations
    if(this.inputList['up'] && !this.inputList['down']) {
    	this.player.mapSprite.animations.play('walkUp');
    	this.player.mapSprite.lastDirection = 'u';
    }
    else if(!this.inputList['up'] && this.inputList['down']) {
    	this.player.mapSprite.animations.play('walkDown');
    	this.player.mapSprite.lastDirection = 'd';
    } 
    else if(this.inputList['left'] && !this.inputList['right']) {
    	this.player.mapSprite.animations.play('walkLeft');
    	this.player.mapSprite.lastDirection = 'l';
    }
    else if(!this.inputList['left'] && this.inputList['right']) {
    	this.player.mapSprite.animations.play('walkRight');
    	this.player.mapSprite.lastDirection = 'r';
    }
    else {
    	this.player.mapSprite.animations.play( (this.player.mapSprite.lastDirection + 'idle') );
    }
    
};

WorldState.prototype.doAction = function() {
	//Execute the appropriate action
	
	//NO ACTIONS CURRENTLY IMPLEMENTED
	//this.battle(this.player, '1');
};









