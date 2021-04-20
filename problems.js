let problems = {
  "lineareq1": {
    name: "solving simple linear equations",
    generate() {
      // Question: x + a = b
      // Answer: x = b - a
      // Random integer between -10 and 10
      let a = Math.floor(21*Math.random()) - 10;
      let b = Math.floor(21*Math.random()) - 10;
      return {
        q: [a, b],
        a: b - a
      }
    },
    format({q, a}) {
      return {
        question: `Solve for x: x + ${q[0]} = ${q[1]}`,
        answer: `x = ${a}`,
        explanation: `To get only x on the left side, we can subtract ${q[0]} from both sides.
        This gives us ${q[1]} - ${q[0]} on the right-hand-side: ${a}.`
      }
    },
    documented: false,
    calculator: false
  },
  "dummy": {
    name: "dummy",
    generate() {
      return {
        q: 1
      }
    },
    format({q}) {
      return {
        question: `${q}`,
        answer: `${q}`
      }
    }
  }
};
let history = {};

function logProblem(problem) {
  for (let prop in problem) {
    console.log(`${prop}: `, problem[prop]);
  }
}

// Returns a new problem object if possible
// Returns null if unable to create a unique problem not already in history
function newProblem(id) {
  let data;
  let count = 0;
  do {
    data = problems[id].generate();
    count++;
  } while (!tryAddToHistory(id, data.q) && count < 200);
  if (count == 200) {
    return null;
  }
  return problems[id].format(data);
}

// Returns true if successful, false if already in history
function tryAddToHistory(id, q) {
  // If this problem id doesn't exist in history, create it
  if (!(id in history)) {
    history[id] = {};
  }
  
  // If there's no entry for today, create one
  let today = dateToString(new Date());
  if (!(today in history[id])) {
    history[id][today] = [];
  }
  
  // Check for a matching q object in today's history
  let qAsString = JSON.stringify(q);
  for (let i of history[id][today]) {
    if (JSON.stringify(i) === qAsString) {
      // If there's a match, return false without adding the duplicate q
      return false;
    }
  }
  // If no duplicates were found, go ahead and add it
  history[id][today].push(q);
  return true;
}

// Removes all entries from history that are older than 3 weeks
function cleanHistory() {
  let now = new Date();
  for (let id in history) {
    for (let dateString in history[id]) {
      // If entry is more than 3 weeks old, delete it
      if (now - stringToDate(dateString) > 3 * 7 * 24 * 60 * 60 * 1000) {
        delete history[id][dateString]
      }
    }
  }
}

function dateToString(date) {
  let m = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1);
  let d = (date.getDate() < 10 ? "0": "") + date.getDate();
  return `${date.getFullYear()}${m}${d}`;
}

function stringToDate(string) {
  let ys = parseInt(string.slice(0, 4));
  let ms = parseInt(string.slice(4, 6)) - 1;
  let ds = parseInt(string.slice(6, 8));
  return new Date(ys, ms, ds)
}

