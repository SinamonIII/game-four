"use strict";

//Characters are to be used in order to contain and transfer information for a given character between
//the world map and battle states
var Character = function(spriteOne, spriteTwo, actions, statistics) {
	//The map sprite is the sprite that this character is to be represented by on the world map
	this.mapSprite = spriteOne;
	
	//The battle sprite is the sprite that is to represent this character in battle
	this.battleSprite = spriteTwo;
	
	//NOT CURRENTLY IN USE; This variable is for future use to determine what abilities are available to this character in battle
	this.battleActions = actions;
	
	//This variable contains information about this character's power in battle.
	//Currently implemented stats:
		//maxHealth - The character's maximum health
		//currentHealth - The character's current health
		//attack - The average amount of damage the character will do when attacking
		//defense - The average amount of damage the character will do when defending; a portion of this will take effect even when not defending
		//experience - The amount of experience that the character currently has; reaching a certain amount of experience will cause the character to level up
		//level - The level that the character has currently achieved
		//expPerLevel - The amount of experience required to reach the next level
		//levelMultiplier - The amount of stat growth that will occur when the character levels up
	this.stats = statistics;
};

Character.prototype.setMapSprite = function(sprite) {
	this.mapSprite = sprite;
};

Character.prototype.setBattleSprite = function(sprite) {
	this.battleSprite = sprite;
};

Character.prototype.setBattleActions = function(actions) {
	this.battleActions = actions;
};

Character.prototype.setStats = function(statistics) {
	this.stats = statistics;
};



