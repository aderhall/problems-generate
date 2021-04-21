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
  "expgr1": {
    name: "calculating exponential growth",
    generate() {
      return {
        q: [random.int(15, 10000), random.bool(), random.int(1, 10) / 2, random.int(3, 20)],
        name: random.name(),
        noun: random.noun(),
        currency: random.currency()
      }
    },
    format({q, name, noun, currency}) {
      let multiplier = 1 + (q[1] ? 0.01 : -0.01) * q[2];
      let answer = q[0] * Math.pow(multiplier, q[3]);
      return {
        question: `${name} buys ${currency}${fmt.toNPlaces(q[0], 2)} worth of stock in ${fmt.indArticle(noun)} ${noun} company. Every year, the stock price ${q[1] ? "increases" : "decreases"} by ${q[2]}%. After ${q[3]} years, how valuable is the stock?`,
        answer: `${currency}${fmt.toNPlaces(answer, 2)}`,
        explanation: `${name}'s stock ${q[1] ? "increases" : "decreases"} in value by ${q[2]}% per year, so each year the price changes by a factor of ${multiplier}. Repeatedly multiplying by ${multiplier}, ${q[3]} times, is the same as taking ${multiplier} to the power of ${q[3]}, which is ${fmt.round(Math.pow(multiplier, q[3]), 3)}. Multiplying this by the initial amount gives us ${fmt.round(answer, 3)}.`
      }
    },
    documented: false,
    calculator: true
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
let problemHistory = {};

let random = {
  names: {
    male: ["Bill", "Bob", "Jebediah"],
    female: ["Valentina", "Roxanne", "Virginia"]
  },
  nouns: ["shoe", "car", "carpet", "jewel", "rocket", "microscope", "tambourine", "guitar", "envelope", "jetpack"],
  currencies: ["$", "€", "￡"],
  int(min, max) {
    return Math.floor((1 + max - min) * Math.random()) + min;
  },
  bool() {
    return Math.random() >= 0.5;
  },
  choice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
  },
  name() {
    return this.choice(this.names.male.concat(this.names.female));
  },
  nameAndGender() {
    let allNames = this.names.male.concat(this.names.female);
    let index = Math.floor(allNames.length * Math.random());
    return [
      allNames[index],
      index >= this.names.male.length // true if female, false if male
    ]
  },
  noun() {
    return this.choice(this.nouns);
  },
  currency() {
    return this.choice(this.currencies);
  },
  money(min, max) {
    return this.int(min, max) + 0.01 * this.int(0, 99);
  },
  moneyString(min, max) {
    return fmt.toNPlaces(this.money(min, max), 2);
  }
}
let fmt = {
  indArticle(word) {
    if (word[0] in ["a", "e", "i", "o", "u"]) {
      return "an";
    } else {
      return "a";
    }
  },
  round(number, places) {
    return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
  },
  toNPlaces(number, places) {
    let s = this.round(number, places).toString();
    if (places > 0) {
      let pointIndex = s.indexOf(".")
      if (pointIndex === -1) {
        s += ".";
        pointIndex = s.length - 1;
      }
      let remainingZeros = places - (s.length - 1 - pointIndex)
      for (let i = 0; i < remainingZeros; i++) {
        s += "0";
      }
    }
    return s;
  }
}

function logProblem(problem) {
  for (let prop in problem) {
    console.log(`${prop}: `, problem[prop]);
  }
}

// Returns a new problem object if possible
// Returns null if unable to create a unique problem not already in problemHistory
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

// Returns true if successful, false if already in problemHistory
function tryAddToHistory(id, q) {
  // TODO: This only looks at today's problemHistory, it should look at all problemHistory
  // If this problem id doesn't exist in problemHistory, create it
  if (!(id in problemHistory)) {
    problemHistory[id] = {};
  }
  
  // Check for a matching q object in this id's history
  let qAsString = JSON.stringify(q);
  for (let date in problemHistory[id]) {
    for (let entry of problemHistory[id][date]) {
      if (JSON.stringify(entry) === qAsString) {
        // If there's a match, return false without adding the duplicate q
        return false;
      }
    }
  }
  
  // If there's no entry for today, create one
  let today = dateToString(new Date());
  if (!(today in problemHistory[id])) {
    problemHistory[id][today] = [];
  }
  // If no duplicates were found, go ahead and add it
  problemHistory[id][today].push(q);
  return true;
}

// Removes all entries from problemHistory that are older than 3 weeks
function cleanHistory() {
  let now = new Date();
  for (let id in problemHistory) {
    for (let dateString in problemHistory[id]) {
      // If entry is more than 3 weeks old, delete it
      if (now - stringToDate(dateString) > 3 * 7 * 24 * 60 * 60 * 1000) {
        delete problemHistory[id][dateString]
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

function testHistory() {
  for (let i = 0; i < 3; i++) {
    problem = newProblem("dummy");
    if (problem === null) {
      console.log("null");
    } else {
      logProblem(problem);
    }
  }
}

logProblem(newProblem("expgr1"));