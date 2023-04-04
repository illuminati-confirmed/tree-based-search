const _ = require("lodash");
const { probeCoordinates, getInitialNode } = require("./agent");

/**
 * Select Search Algorithm
 *
 * @param {*} method
 * @returns function
 *
 * Returns the correct search algorithm from the command-line argument
 */
const selectAlgorithm = (method) => {
  const algorithmMap = {
    DFS: dfs,
    BFS: bfs,
    GBFS: gbfs,
    AS: aStar,
    CUS1: customOne,
    CUS2: customTwo,
  };

  return algorithmMap[method];
};

/**
 * Depth-First Search
 *
 * @param {*} problem
 * @returns {{status: string, path: []}} dfs search
 *
 * Finds the nearest goal by searching through a single node tree until it hits the goal or hits a dead end
 */
const dfs = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  while (frontier.length > 0) {
    const searchLocation = frontier.pop();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path, searchTree };
    }
    const candidates = probeCoordinates(
      searchLocation.coordinates,
      path,
      mazeSize,
      goal,
      walls,
      searchTree
    ).reverse();

    frontier.push(...candidates);
    searchTree.push(...candidates);
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * Breadth-first Search
 *
 * @param {*} problem
 * @returns {{status: string, path: []}} bfs search
 *
 * Finds the goals by searching through all nodes on a single level
 */
const bfs = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  while (frontier.length > 0) {
    const searchLocation = frontier[0];
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path, searchTree };
    }
    const candidates = probeCoordinates(
      searchLocation.coordinates,
      path,
      mazeSize,
      goal,
      walls,
      searchTree
    );

    frontier.push(...candidates);
    searchTree.push(...candidates);
    frontier.shift();
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * Greedy Best-first Search
 *
 * @param {*} problem
 * @returns gbfs search
 *
 * Finds the goals by using the path-cost between the root node and the goals
 */
const gbfs = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  while (frontier.length > 0) {
    const searchLocation = frontier.shift();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path, searchTree };
    }
    const candidates = probeCoordinates(
      searchLocation.coordinates,
      path,
      mazeSize,
      goal,
      walls,
      searchTree
    );

    frontier.push(...candidates);
    frontier.sort(
      (a, b) =>
        a.distanceToGoal.fromCurrentNode - b.distanceToGoal.fromCurrentNode
    );

    searchTree.push(...candidates);
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * A-Star Search
 *
 * @param {*} problem
 * @returns A* seach
 *
 * Finds the goals by using the lowest path-cost and heuristic cost
 */
const aStar = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  while (frontier.length > 0) {
    const searchLocation = frontier.shift();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path, searchTree };
    }
    const candidates = probeCoordinates(
      searchLocation.coordinates,
      path,
      mazeSize,
      goal,
      walls,
      searchTree
    );

    frontier.push(...candidates);
    frontier.sort(
      (a, b) =>
        a.distanceToGoal.fromStartingNode - b.distanceToGoal.fromStartingNode
    );
    searchTree.push(...candidates);
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * Depth Limited DFS - custom uninformed search
 *
 * @param {*} problem
 */
const customOne = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  const depthLimit = 12;
  while (frontier.length > 0) {
    const searchLocation = frontier.pop();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path, searchTree };
    }
    const candidates = probeCoordinates(
      searchLocation.coordinates,
      path,
      mazeSize,
      goal,
      walls,
      searchTree
    ).reverse();
    searchTree.push(...candidates);

    if (_.get(candidates[0], "depth", 0) !== depthLimit) {
      frontier.push(...candidates);
    }
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * Depth Limited A* - custom informed search
 *
 * @param {*} problem
 * @returns
 */
const customTwo = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  const depthLimit = 12;
  while (frontier.length > 0) {
    const searchLocation = frontier.shift();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path, searchTree };
    }
    const candidates = probeCoordinates(
      searchLocation.coordinates,
      path,
      mazeSize,
      goal,
      walls,
      searchTree
    );
    searchTree.push(...candidates);

    if (_.get(candidates[0], "depth", 0) !== depthLimit) {
      frontier.push(...candidates);
    }
    frontier.sort(
      (a, b) =>
        a.distanceToGoal.fromStartingNode - b.distanceToGoal.fromStartingNode
    );
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * Search Maze
 *
 * @param {*} problem
 * @param {*} searchMethod
 * @returns {*} solution
 *
 * From a given problem and algorithm, find a path through the maze to the goal
 */
const searchMaze = (problem, searchMethod) => {
  const { agentLocation, goals } = problem;
  const goal = goals[0];
  const initialSearchCoordinate = getInitialNode(agentLocation, goal);

  const algorithm = selectAlgorithm(searchMethod);
  const solution = algorithm(problem, goal, initialSearchCoordinate);
  return solution;
};

// map search functions on export
module.exports = { searchMaze };
