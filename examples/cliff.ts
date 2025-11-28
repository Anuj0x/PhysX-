#!/usr/bin/env ts-node

console.log("\nThis is the cliff problem.\nThe virtual world consists of a 7x3 world like so:\n\n" +
" +-------+\n |ScccccR|\n |       |\n |       |\n +-------+\n\n" +
"The bot starts at 'S' and is trying to get to 'R'.  If the bot touches a 'c' it falls off the cliff.\n" +
"Falling off the cliff is -10,000 points, the reward is 1,000 points, and everything else is -1 point.\n" +
"After the bot falls or gets a reward it starts again.  To make matters more challenging, 20% of the\n" +
"time the bot will move randomly, increasing the odds that it falls off the cliff.\n" +
"It takes 12 moves to take the 'long' way around the cliff, so a score of 80 is near perfect\n" +
"and assumes that no random movements delay the bot.\n");

type Position = [number, number];
type WorldMap = number[][];

const map: WorldMap = [
  [     -1, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [   1000, -1, -1 ]
];

const width = map.length;
const height = map[0].length;

// The possible actions
const actionList = ['up','down','right','left','hold'] as const;
type Action = typeof actionList[number];

function move(location: Position, action: Action): Position {
    if ( action == 'up'    ) { return [ location[0]                        , Math.min(location[1] + 1, height-1) ] }
    if ( action == 'down'  ) { return [ location[0]                        , Math.max(location[1] - 1, 0) ] }
    if ( action == 'left'  ) { return [ Math.min(location[0] + 1, width-1) , location[1] ] }
    if ( action == 'right' ) { return [ Math.max(location[0] - 1, 0)       , location[1] ] }
    return [ location[0] , location[1] ]
}

import { createSARSA } from '../src';

const sarsa = createSARSA();  // use default settings since they are fairly good for this problem.

// keep track of where the virtual bot is
let location: Position = [0, 0];
let action: Action = 'hold';
let reward = 0;

// let it learn by trying a lot.  This is the number of moves, not the number of games.
const trialsMax = 8192;

// we keep track of the last several rewards to calculate average reward
const rewardHistory: number[] = [];
function averageReward(rewardHistory: number[]): number {
    return Math.round(rewardHistory.reduce((a, b) => a + b) / rewardHistory.length);
}

let lastFullRun: Position[] = []; // movement of last full game
let currentRun: Position[] = []; // current game

for(let trials = 1; trials <= trialsMax; trials++) {

    // if the bot touches something other than regular 'ground' then restart.
    if ( reward != -1 ) {
        location = [0, 0];
        action = 'hold';
        lastFullRun = currentRun;
        currentRun = [location];
    }


    const nextLocation = move(location, action);
    const nextAction = sarsa.chooseAction(nextLocation, [...actionList]) as Action;

    // 5% of the time the bot does not go where it wants but instead does something random
    let finalNextAction = nextAction;
    if (( Math.random() <= 0.05 )&&( trials < trialsMax - 800 )) {
        finalNextAction = actionList[Math.floor(Math.random()*4)] as Action;
    }

    // get reward from map, see top
    reward = map[nextLocation[0]][nextLocation[1]];

    sarsa.update(location, action, reward, nextLocation, finalNextAction);

    // set the current location and action for the next step
    location = nextLocation;
    action = finalNextAction;

    currentRun.push(location);

    // add the reward to the history so we can calculate an average
    rewardHistory.push(reward);
    if ( rewardHistory.length > 800 ) { // only keep a bit of recent history
        rewardHistory.shift();
    }

    if ( Math.log2(trials) % 1 == 0 && trials >= 64 )  {
        console.log("Move " + trials + " , average reward per move "
            + averageReward(rewardHistory)
            + " for the last " + rewardHistory.length + " moves" );
    }

}

const averageReward_ = averageReward(rewardHistory);
if ( averageReward_ >= 70 ) {
    console.log("\nAfter " + trialsMax + " moves the SARSA RL algorithm found a solution to the\n"+
    "cliff problem and accumulated an average of " + averageReward_ + " points per move.\n"+
    "These results are good and expected.\n");
} else if (averageReward_ >= 50 ) {
    console.log("\nThese results are fair.  Try running the simulation again.\n");
} else {
    console.log("\nThese results are very poor.  Try running the simulation again.\n");
}

console.log("Here is the last run.");
console.log( lastFullRun.map((a: Position) => "[" + a + "]").join(" ") );

const displayMap = [
  [ 'S', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'R', ' ', ' ' ]
];

function printMap(displayMap: string[][]): void {
    console.log("+-------+");
    for( let height = 0 ; height < displayMap[0].length ; height++ ) {
        const row: string[] = [];
        for( let width = 0 ; width < displayMap.length ; width++ ) {
            row.push( displayMap[width][height] );
        }
        console.log("|" + row.join("") +"|");
    }
    console.log("+-------+");
}

console.log("An empty map");
printMap(displayMap);

for( const position of lastFullRun ) {
    displayMap[ position[0] ][ position[1] ] = "x";
}

console.log("The last path taken marked by 'x'");
printMap(displayMap);
