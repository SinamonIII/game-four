"use strict";

var Preloader = function() {};

Preloader.prototype.preload = function() {
	//Load all of the game's assets
	
	//Load the map from the json file and the tileset from the image
	this.game.load.tilemap('map', 'assets/MapWithTrees.json', null, Phaser.Tilemap.TILED_JSON);
	this.game.load.tilemap('battleBackground', 'assets/battleBackground.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('gameTiles', 'assets/RPGMakerTileset.png');
    
	this.game.load.spritesheet('button', 'assets/buttons.png', 200, 52, 2);    
    this.game.load.spritesheet('mapPlayer', 'assets/guy.png', 32, 48, 16);
    this.game.load.spritesheet('villan', 'assets/villan.png', 32, 48, 16);
    
	
};

Preloader.prototype.create = function() {
	//The number of enemy characters to create
	this.NUM_ENEMIES = 5;
	console.log('Number of enemies:');
	console.log(this.NUM_ENEMIES);
	
	//Create the player
	this.makePlayer();
	console.log('Player:');
	console.log(this.player);
	
	//Create the number of enemies specified by NUM_ENEMIES
	this.makeEnemies();
	console.log('Enemies:');
	console.log(this.enemies);
	

	//Send the game over to the world map with the newly generated player and enemies
	this.game.state.start('world', true, false, this.player, this.enemies);
};

Preloader.prototype.makePlayer = function() {
	//Create a new Character to be the player and give it some stats
	this.player = new Character();
	this.player.setStats({'maxHealth': 200, 'currentHealth': 200, 'attack': 20, 'defense': 25, 'experience': 0, 'level': 1, 'expPerLevel': 50, 'levelMultiplier': 1.15});
	
};

Preloader.prototype.makeEnemies = function() {
	//Create some Characters to be the enemies and give them some stats
	this.enemies = {};
	
	for(var i = 1; i <= this.NUM_ENEMIES; i++) {
		this.enemies['enemy' + i] = new Character();
		var enemyStats = {};
		
		//Set health
		enemyStats['maxHealth'] = Math.floor( 100 * this.randMult() );
		enemyStats['currentHealth'] = enemyStats.maxHealth;
		
		//Set attack
		enemyStats['attack'] = Math.floor( 17 * this.randMult() );
		
		//Set defense
		enemyStats['defense'] = Math.floor( 12 * this.randMult() );
		
		//Set experience given
		enemyStats['experienceGiven'] = Math.floor( 30 * this.randMult() );
		
		
		//Give the enemy its stats
		this.enemies['enemy' + i].setStats(enemyStats);
		
	}
	
};

//Generates a random multiplier for an enemy's stat between 1.01 and 1.5
Preloader.prototype.randMult = function() {
	return (1 + this.game.rnd.integerInRange(1, 50) / 100);
};

