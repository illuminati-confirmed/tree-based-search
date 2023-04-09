const fs = require("fs");
const _ = require("lodash");
const { searchMaze } = require("./searchFunctions");

/**
 * Map File Data
 *
 * @param {*} fileData
 * @returns problem
 *
 * Maps the text file into the data structure defining the maze
 */
const mapFileData = (fileData) => {
  const lines = fileData.split(/\r?\n|\r/g).filter(Boolean);
  const mazeSize = lines[0]
    .replace(/\[*\]*/g, "")
    .split(",")
    .map(Number);
  const agentLocation = lines[1]
    .replace(/\(*\)*/g, "")
    .split(",")
    .map(Number);
  const goals = lines[2].split("|").map((coord) =>
    coord
      .replace(/\(*\)*/g, "")
      .split(",")
      .map(Number)
  );
  const walls = lines.slice(3).map((w) =>
    w
      .replace(/\(*\)*/g, "")
      .split(",")
      .map(Number)
  );

  const problem = {
    mazeSize: { rows: mazeSize[0], columns: mazeSize[1] },
    agentLocation: { x: agentLocation[0], y: agentLocation[1] },
    goals: goals.map((g) => {
      return { x: g[0], y: g[1] };
    }),
    walls: walls.map((w) => {
      return { x: w[0], y: w[1], columns: w[2], rows: w[3] };
    }),
  };
  return problem;
};

const args = process.argv.slice(2);
const fileName = args[0];
const searchMethod = args[1];
const allGoals = args[2] === "allGoals" ? true : false;
const fileData = fs.readFileSync(fileName, "utf-8", (err, data) => {
  if (err) return;
  return data;
});
const problem = mapFileData(fileData);
const solution = searchMaze(problem, searchMethod, allGoals);
console.log(`${fileName} ${searchMethod} ${solution.searchTree.length}`);

// output the path if found, else output no solution found
if (solution.status === "found") {
  const directionString = solution.path.reduce(
    (str, node) => (str = str + node.direction),
    ""
  );
  console.log(`${directionString}`);
} else {
  console.log(`No solution found.`);
}
