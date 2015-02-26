"use strict";

//This game uses a two state system in which one state is a turn based battle against a single opponent
//and one state is a world map for the player to explore.


var game = new Phaser.Game(832, 450, Phaser.AUTO, 'game');

game.state.add('preload', Preloader);
game.state.add('world', WorldState);
game.state.add('battle', BattleState);

game.state.start('preload');