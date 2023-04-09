const _ = require("lodash");
const { probeCoordinates, getInitialNode } = require("./agent");

/**
 * Select Search Algorithm
 *
 * @param {*} method
 * @returns {*} function
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
 * @returns {{status: string, path: [], searchTree: []}} dfs search
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
      return { status: "found", path: _.tail(path), searchTree };
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
 * @returns {{status: string, path: [], searchTree: []}} bfs search
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
      return { status: "found", path: _.tail(path), searchTree };
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
 * @returns {{status: string, path: [], searchTree: []}} gbfs search
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
      return { status: "found", path: _.tail(path), searchTree };
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
 * @returns {{status: string, path: [], searchTree: []}} A* seach
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
      return { status: "found", path: _.tail(path), searchTree };
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
 * @returns {{status: string, path: [], searchTree: []}}
 *
 * Depth limited dfs to a depth of 12
 */
const customOne = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls } = problem;
  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];

  const depthLimit = 10;
  while (frontier.length > 0) {
    const searchLocation = frontier.pop();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    if (searchLocation.isGoal) {
      return { status: "found", path: _.tail(path), searchTree };
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

    if (_.get(candidates[0], "depth", 0) !== depthLimit + 1) {
      frontier.push(...candidates);
    }
  }

  return { status: "fail", path: [], searchTree };
};

/**
 * Bidirectional A* - custom informed search
 *
 * @param {*} problem
 * @returns {{status: string, path: [], searchTree: []}}
 *
 * aStar but it searches with a forward and backward frontier
 */
const customTwo = (problem, goal, initialSearchCoordinate) => {
  const { mazeSize, walls, agentLocation } = problem;
  const reverseInitialSearchCoordinate = getInitialNode(goal, agentLocation);

  let frontier = [initialSearchCoordinate];
  let searchTree = [initialSearchCoordinate];
  let reverseFrontier = [reverseInitialSearchCoordinate];
  let reverseSearchTree = [reverseInitialSearchCoordinate];

  while (frontier.length > 0 && reverseFrontier.length > 0) {
    const searchLocation = frontier.shift();
    const path = [...searchLocation.previousCoordinates, searchLocation];

    const reverseSearchLocation = reverseFrontier.shift();
    const reversePath = [
      ...reverseSearchLocation.previousCoordinates,
      reverseSearchLocation,
    ];

    const intersectingCoordinate = reverseSearchTree.some(
      (rsl) =>
        rsl.coordinates.x === searchLocation.coordinates.x &&
        rsl.coordinates.y === searchLocation.coordinates.y
    )
      ? searchLocation
      : searchTree.some(
          (sl) =>
            sl.coordinates.x === reverseSearchLocation.coordinates.x &&
            sl.coordinates.y === reverseSearchLocation.coordinates.y
        )
      ? reverseSearchLocation
      : undefined;

    if (!_.isUndefined(intersectingCoordinate)) {
      const intersectingForwardPath = searchTree.find(
        (node) =>
          node.coordinates.x === intersectingCoordinate.coordinates.x &&
          node.coordinates.y === intersectingCoordinate.coordinates.y
      ).previousCoordinates;
      const intersectingReversePath = reverseSearchTree.find(
        (node) =>
          node.coordinates.x === intersectingCoordinate.coordinates.x &&
          node.coordinates.y === intersectingCoordinate.coordinates.y
      ).previousCoordinates;

      const joinedPath = intersectingForwardPath.concat(
        intersectingCoordinate,
        intersectingReversePath.reverse()
      );
      const finalPath = joinedPath.map((p, index) => {
        const previousCoordinate =
          index > 0 ? _.get(joinedPath[index - 1], "coordinates") : null;
        const currentDirection = _.isNull(previousCoordinate)
          ? "start; "
          : previousCoordinate.y > p.coordinates.y
          ? "up; "
          : previousCoordinate.x > p.coordinates.x
          ? "left; "
          : previousCoordinate.y < p.coordinates.y
          ? "down; "
          : previousCoordinate.x < p.coordinates.x
          ? "right; "
          : "broken; ";
        return { direction: currentDirection };
      });

      return {
        status: "found",
        path: _.tail(finalPath),
        searchTree: searchTree.concat(reverseSearchTree),
      };
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

    const reverseCandidates = probeCoordinates(
      reverseSearchLocation.coordinates,
      reversePath,
      mazeSize,
      agentLocation,
      walls,
      reverseSearchTree
    );

    reverseFrontier.push(...reverseCandidates);
    reverseFrontier.sort(
      (a, b) =>
        a.distanceToGoal.fromStartingNode - b.distanceToGoal.fromStartingNode
    );

    reverseSearchTree.push(...reverseCandidates);
  }

  return {
    status: "fail",
    path: [],
    searchTree: searchTree.concat(reverseSearchTree),
  };
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
const searchMaze = (problem, searchMethod, allGoals) => {
  return allGoals
    ? searchAllGoals(problem, searchMethod)
    : findSolution(
        problem,
        problem.agentLocation,
        problem.goals[0],
        searchMethod
      );
};

const findSolution = (problem, startNode, goal, searchMethod) => {
  const initialSearchCoordinate = getInitialNode(startNode, goal);
  const algorithm = selectAlgorithm(searchMethod);

  const solution = algorithm(problem, goal, initialSearchCoordinate);
  return solution;
};

const searchAllGoals = (problem, searchMethod) => {
  const { agentLocation, goals } = problem;
  let goalList = _.cloneDeep(goals);
  let startNode = agentLocation;
  let solutionPath = [];
  while (goalList.length > 0) {
    const solutions = goalList
      .map((goal) => {
        return {
          goal: goal,
          solution: findSolution(problem, startNode, goal, searchMethod),
        };
      })
      .sort((a, b) => b.solution.path.length - a.solution.path.length);
    const solution = solutions.pop();
    solutionPath.push(solution.solution);
    goalList = goalList.filter((goal) => goal !== solution.goal);
    startNode = solution.goal;
  }

  const finalSolution = solutionPath.reduce(
    (combinedSolution, solution) => {
      combinedSolution.status = "found";
      combinedSolution.searchTree.push(...solution.searchTree);
      combinedSolution.path.push(...solution.path);
      return combinedSolution;
    },
    { status: "fail", path: [], searchTree: [] }
  );

  return finalSolution;
};

// map search functions on export
module.exports = { searchMaze };
