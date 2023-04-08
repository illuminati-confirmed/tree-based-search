const _ = require("lodash");

// return true if coordinate is a goal
const checkGoal = (searchLocation, goal) => {
  return goal.x === searchLocation.x && goal.y === searchLocation.y;
};

// return true if coordinate is within a wall
const checkWall = (searchLocation, walls) => {
  return walls.some(
    (w) =>
      _.inRange(searchLocation.x, w.x, w.x + w.columns) &&
      _.inRange(searchLocation.y, w.y, w.y + w.rows)
  );
};

// return true if location is outside the maze
const checkOutOfBounds = (searchLocation, mazeSize) => {
  return (
    searchLocation.x < 0 ||
    searchLocation.x >= mazeSize.columns ||
    searchLocation.y < 0 ||
    searchLocation.y >= mazeSize.rows
  );
};

// make sure agent hasn't doubled back on itself
const checkBacktrack = (searchLocation, searchTree) => {
  return searchTree.some(
    (p) =>
      p.coordinates.x === searchLocation.x &&
      p.coordinates.y === searchLocation.y
  );
};

// calculate the distance to the goal and from the starting node using Manhattan distance
const calculateManhattan = (searchLocation, previousCoordinates, goal) => {
  const nodesTravelled = previousCoordinates.length;
  const distance =
    Math.abs(goal.y - searchLocation.y) + Math.abs(goal.x - searchLocation.x);
  const currentDistance = _.get(
    previousCoordinates[nodesTravelled - 1],
    `distanceToGoal.fromStartingNode`,
    0
  );
  return {
    fromCurrentNode: distance,
    fromStartingNode: currentDistance + distance,
    nodesTravelled,
  };
};

/**
 * Probe Coordinates
 *
 * @param {{x: number, y: number}} currentLocation
 * @param {[]} path
 * @param {{rows: number, columns: number}} mazeSize
 * @param {{x: number, y: number}} goal
 * @param {[]} walls
 * @returns {[{direction: string, coordinates: {x: number, y: number}, isGoal: boolean, previousCoordinates: [], distanceToGoal: [] }]} candidates
 *
 * tests each coordinate point and returns a list of valid candidates for frontier expansion
 */
const probeCoordinates = (
  currentLocation,
  path,
  mazeSize,
  goal,
  walls,
  searchTree
) => {
  const directionString = ["up; ", "left; ", "down; ", "right; "];
  const searchLocation = [
    { x: currentLocation.x, y: currentLocation.y - 1 },
    { x: currentLocation.x - 1, y: currentLocation.y },
    { x: currentLocation.x, y: currentLocation.y + 1 },
    { x: currentLocation.x + 1, y: currentLocation.y },
  ];

  const searchSpace = searchLocation.map((coordinates, compass) => {
    return {
      direction: directionString[compass],
      coordinates,
      isGoal: checkGoal(coordinates, goal),
      previousCoordinates: path,
      distanceToGoal: calculateManhattan(coordinates, path, goal),
      depth: _.get(path[path.length - 1], "depth", 0) + 1,
    };
  });

  return searchSpace.filter(
    (node) =>
      !(
        checkWall(node.coordinates, walls) ||
        checkOutOfBounds(node.coordinates, mazeSize) ||
        checkBacktrack(node.coordinates, searchTree)
      )
  );
};

const getInitialNode = (agentLocation, goal) => {
  return {
    direction: "start; ",
    coordinates: agentLocation,
    isGoal: false,
    previousCoordinates: [],
    distanceToGoal: calculateManhattan(agentLocation, [], goal),
    depth: 0,
  };
};

module.exports = { probeCoordinates, getInitialNode };
