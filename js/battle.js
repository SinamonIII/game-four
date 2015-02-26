"use strict";

var BattleState = function() {};

BattleState.prototype.init = function(player, enemies, currentEnemy) {
	this.player = player;
	this.enemies = enemies;
	this.currentEnemy = currentEnemy;
};

BattleState.prototype.create = function() {
	
	
	this.game.physics.startSystem(Phaser.Physics.ARCADE);
	
	this.map = this.game.add.tilemap('battleBackground');
    
    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('RPGMakerTileset', 'gameTiles');

    
    
    
    //background layer
    this.background = this.map.createLayer('Background');
    
    
    //Add the player
    var playerLocation = this.findObjectsByType('player', this.map, 'objects');
    this.player.setBattleSprite(this.game.add.sprite(playerLocation[0].x, playerLocation[0].y, 'mapPlayer'));
    this.player.battleSprite.scale.set(4,4);
    this.addPlayerAnimations();
    this.player.battleSprite.animations.play('walkUp');
    
    //Add the enemy
    var enemyLocation = this.findObjectsByType('enemy', this.map, 'objects');
    this.enemies['enemy' + this.currentEnemy].setBattleSprite(this.game.add.sprite(enemyLocation[0].x, enemyLocation[0].y, 'villan'));
    this.enemies['enemy' + this.currentEnemy].battleSprite.scale.set(3,3);
    
    //Add the text box to the bottom of the screen
    this.box = this.map.createLayer('TextBox');
    
	
	
	
	//Set up buttons
	this.buttons = {};
	
	this.buttons.button1 = this.game.add.button(400, 385, 'button', this.attack, this);
	this.buttons.button2 = this.game.add.button(600, 385, 'button', this.defend, this);
	
	//Used by the text displays  
	this.style = { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: this.buttons.button1.width, align: "center" };
	this.combatStyle = { font: "20px Arial", align: "center", wordWrap: true, wordWrapWidth: 400};
	
	this.button1Text = this.game.add.text( Math.floor(this.buttons.button1.x + this.buttons.button1.width / 2), Math.floor(this.buttons.button1.y + this.buttons.button1.height / 2 + 3), "Attack", this.style);
    this.button1Text.anchor.set(0.5);
    
    this.button2Text = this.game.add.text( Math.floor(this.buttons.button2.x + this.buttons.button2.width / 2), Math.floor(this.buttons.button2.y + this.buttons.button2.height / 2 + 3), "Defend", this.style);
    this.button2Text.anchor.set(0.5);
    
	this.playerHealthText = this.game.add.text( Math.floor(this.player.battleSprite.x + 10), Math.floor(this.player.battleSprite.y - 50), this.player.stats['currentHealth'] + '/' + this.player.stats['maxHealth'], this.style);
    this.button1Text.anchor.set(0.5);
    
    this.enemyHealthText = this.game.add.text( Math.floor(this.enemies['enemy' + this.currentEnemy].battleSprite.x - 10), Math.floor(this.enemies['enemy' + this.currentEnemy].battleSprite.y + this.enemies['enemy' + this.currentEnemy].battleSprite.height + 30), this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] + '/' + this.enemies['enemy' + this.currentEnemy].stats['maxHealth'], this.style);
    this.button1Text.anchor.set(0.5);
    
    this.levelText = this.game.add.text( Math.floor(this.buttons.button1.x + this.buttons.button1.width / 2), Math.floor(this.buttons.button1.y - 35), "Level: " + this.player.stats['level'], this.battleStyle);
    this.levelText.anchor.set(0.5);
    
    this.expText = this.game.add.text( Math.floor(this.buttons.button1.x + this.buttons.button1.width / 2), Math.floor(this.buttons.button1.y - 10), "Exp: " + this.player.stats['experience'] + '/' + this.player.stats['expPerLevel'], this.battleStyle);
    this.expText.anchor.set(0.5);
    
    this.damageText = this.game.add.text( Math.floor(this.buttons.button2.x + this.buttons.button2.width / 2), Math.floor(this.buttons.button2.y - 35), "Attack Damage: " + this.player.stats['attack'], this.battleStyle);
    this.damageText.anchor.set(0.5);
    
    this.defenseText = this.game.add.text( Math.floor(this.buttons.button2.x + this.buttons.button2.width / 2), Math.floor(this.buttons.button2.y - 10), "Defense: " + this.player.stats['defense'], this.battleStyle);
    this.defenseText.anchor.set(0.5);
    
    this.playerActionsLog = this.game.add.text( 205 , Math.floor(this.buttons.button2.y - 25), "", this.combatStyle);
    this.playerActionsLog.anchor.set(0.5);
    
    this.enemyActionsLog = this.game.add.text( 205 , Math.floor(this.buttons.button2.y + 20), "", this.combatStyle);
    this.enemyActionsLog.anchor.set(0.5);
	
	//Tracks whether the player is defending or attacking in the current turn
	this.defending = false;
	
	this.hasLost = false;
	
	this.hasWon = false;
};

BattleState.prototype.update = function() {};

BattleState.prototype.attack = function() {
	if(this.hasLost) {
		this.game.state.start('preload', true, true);
	}
	if(this.hasWon) {
		this.winBattle();
	}
	if(this.game.rnd.integerInRange(1, 5) < 4) {
		this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] -= ( this.player.stats['attack'] - Math.floor(this.enemies['enemy' + this.currentEnemy].stats['defense'] / 3));
		this.playerActionsLog.setText('You hit the enemy for ' + (this.player.stats['attack'] - Math.floor(this.enemies['enemy' + this.currentEnemy].stats['defense'] / 3)) + ' damage');
	}
	else {
		this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] -= ( this.player.stats['attack'] * 2 - Math.floor(this.enemies['enemy' + this.currentEnemy].stats['defense'] / 3));
		this.playerActionsLog.setText('You crit the enemy for ' + (this.player.stats['attack'] * 2 - Math.floor(this.enemies['enemy' + this.currentEnemy].stats['defense'] / 3)) + ' damage');
	}
	this.respondToTurn();
};

BattleState.prototype.defend = function() {
	this.defending = true;
	this.playerActionsLog.setText('You are defending');
	this.respondToTurn();
};

BattleState.prototype.respondToTurn = function() {	
	if(this.game.rnd.integerInRange(1, 5) < 4) {
		if(this.defending) {
			this.player.stats['currentHealth'] -= this.enemies['enemy' + this.currentEnemy].stats['attack'] - Math.floor(this.player.stats['defense'] * 2 / 3)
			this.enemyActionsLog.setText('The enemy hit you for ' + (this.enemies['enemy' + this.currentEnemy].stats['attack'] - Math.floor(this.player.stats['defense'] * 2 / 3)) + ' damage');
		}
		else {
			this.player.stats['currentHealth'] -= this.enemies['enemy' + this.currentEnemy].stats['attack'] - Math.floor(this.player.stats['defense'] / 3)
			this.enemyActionsLog.setText('The enemy hit you for ' + (this.enemies['enemy' + this.currentEnemy].stats['attack'] - Math.floor(this.player.stats['defense'] / 3)) + ' damage');
		}
		
	}
	else {
		if(this.defending) {
			this.player.stats['currentHealth'] -= this.enemies['enemy' + this.currentEnemy].stats['attack'] * 2 - Math.floor(this.player.stats['defense'] * 4 / 3)
			this.enemyActionsLog.setText('The enemy crit you for ' + (this.enemies['enemy' + this.currentEnemy].stats['attack'] * 2 - Math.floor(this.player.stats['defense'] * 4 / 3)) + ' damage');
		}
		else {
			this.player.stats['currentHealth'] -= this.enemies['enemy' + this.currentEnemy].stats['attack'] * 2 - Math.floor(this.player.stats['defense'] / 3)
			this.enemyActionsLog.setText('The enemy crit you for ' + (this.enemies['enemy' + this.currentEnemy].stats['attack'] * 2 - Math.floor(this.player.stats['defense'] / 3)) + ' damage');

		}

	}
	
	//Update health displays
	this.playerHealthText.setText(this.player.stats['currentHealth'] + '/' + this.player.stats['maxHealth']);
    
    this.enemyHealthText.setText(this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] + '/' + this.enemies['enemy' + this.currentEnemy].stats['maxHealth']);
	
	//Reset the variable that tracks whether the player is defending
	this.defending = false;
	
	if(this.player.stats['currentHealth'] <= 0) {
		this.playerActionsLog.setText('You lose, press the Attack button to try again');
		this.player.stats['currentHealth'] = 0;
		this.playerHealthText.setText(this.player.stats['currentHealth'] + '/' + this.player.stats['maxHealth']);
		this.hasLost = true;
	}
	
	if(this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] <= 0 && !this.hasLost) {
		this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] = 0;
		this.enemyHealthText.setText(this.enemies['enemy' + this.currentEnemy].stats['currentHealth'] + '/' + this.enemies['enemy' + this.currentEnemy].stats['maxHealth']);
		this.playerActionsLog.setText('You win, press the Attack button to continue');
		this.hasWon = true;
	}
};

BattleState.prototype.findObjectsByType = function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
};
  
BattleState.prototype.addPlayerAnimations = function() {

	//Animations
	
	//							 name			 frames			fps		loop?
	this.player.battleSprite.animations.add(	'didle', 		[0], 			10, 	false);
	this.player.battleSprite.animations.add(	'lidle', 		[4], 			10, 	false);
	this.player.battleSprite.animations.add(	'ridle', 		[8], 			10, 	false);
	this.player.battleSprite.animations.add(	'uidle', 		[12], 			10, 	false);
	this.player.battleSprite.animations.add(	'walkDown',		[0,1,2,3], 		5, 		true);
	this.player.battleSprite.animations.add(	'walkLeft', 	[4,5,6,7], 		5, 		true);
	this.player.battleSprite.animations.add(	'walkRight',	[8,9,10,11],	5, 		true);
	this.player.battleSprite.animations.add(	'walkUp', 		[12,13,14,15], 	5, 		true);
	
};

BattleState.prototype.winBattle = function() {
	this.playerActionsLog.setText('You have defeated the enemy');
	this.player.stats['experience'] += this.enemies['enemy' + this.currentEnemy].stats['experienceGiven'];
	this.calculateLevels();
	console.log(this.player);
	this.returnToWorld();
};

BattleState.prototype.calculateLevels = function() {
	while(this.player.stats['experience'] >= this.player.stats['expPerLevel']) {
		this.player.stats['experience'] -= this.player.stats['expPerLevel'];
		this.player.stats['level']++;
		this.player.stats['attack'] *= this.player.stats['levelMultiplier'];
		this.player.stats['attack'] = Math.floor(this.player.stats['attack']);
		this.player.stats['defense'] *= this.player.stats['levelMultiplier'];
		this.player.stats['defense'] = Math.floor(this.player.stats['defense']);
		this.player.stats['maxHealth'] *= this.player.stats['levelMultiplier'];
		this.player.stats['maxHealth'] = Math.floor(this.player.stats['maxHealth']);
		this.player.stats['currentHealth'] = this.player.stats['maxHealth'];
		
	}
};

BattleState.prototype.returnToWorld = function() {
	this.game.state.start('world', true, false, this.player, this.enemies);
};