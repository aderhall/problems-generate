# Problem object
Problems are stored as objects with the following structure:
```javascript
"id": {
  name: "name",
  generate() {/*...*/},
  format(problem) {/*...*/},
  turnover: 50
  // Optional
  documented: false,
  calculator: false
}
```
## Fields
### `name`
The display name for the problem type. Lowercase.
### `generate()`
Returns a randomly generated object representing the variation of the question and answer, in two fields, `"q"` and `"a"`. The format of these fields' content is an implementation detail, as they will be received by `format()`.

For example:
```javascript
{
    "q": [7, 13, -2],
    "a": [7, -1, 1, 2]
}
```
The `"q"` field is used to check if two questions are the same (to prevent the same question being produced twice in a row), so it must be unique, and strictly speaking it's the only field necessary. `format()` could calculate the answer from the question data if it's easy. It's also possible to add extra fields; they just won't be taken account when checking for duplicates.

For example:
```javascript
problem.generate = () => ({
  // In reality these would be randomly generated
  "q": [5, 3],
  "a": 8,
  "name": "John"
});

problem.format = ({q, a, name}) => ({question: `${name} has ${q[0]} apples and ${q[1]} oranges. How many fruits does ${name} have in total?`, answer: `${name} has ${a} fruits.`});
```
In the above example, the `name` field won't be taken into account when checking duplicates, so the same question with two different names won't be considired different.
### `format()`
Takes in the generated random object and outputs an object with structure:
```javascript
{
  "question": "", // String representation of question
  "answer": "", // String representation of answer
  // Optional:
  "explanation": "", // A short explanation of why the answer is what it is
  "calculator": false, // Override default calculator setting
  "diagram": "" // SVG code for rendering a diagram that will accompany the question
}
```
### `turnover`
An integer representing how many unique problems must be offered before past problems can be reused. This determines how many questions to store in history. If a problem can't generate unique results before the turnover has been reached, the student may be given recent problems anyway.

`turnover` should be less than or equal to 80% of the number of possible variants of the problem's `q` data. In the example problem below, there are 21 possible values each of q[0] and q[1], meaning 21 * 21 + 441 possible variants. The turnover, 200, is less than 80% of this number. If the turnover is too high, the stochastic `newProblem()` function may take too long to execute if it struggles to produce a unique answer.
### `documented` (optional)
Whether or not the problem has a help page at `/help/{id}.html`. Defaults to false.
### `calculator` (optional)
Whether the student is allowed a calculator for this problem. Can be overridden in the output of `format()`. Defaults to false.

## Example problem
Below is a problem that would generate simple one-variable linear equations problems
```javascript
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
    };
  },
  format({q, a}) {
    return {
      question: `x + ${q[0]} = ${q[1]}`,
      answer: `x = ${a}`,
      explanation: `To get only x on the left side, we can subtract ${q[0]} from both sides.
      This gives us ${q[1]} - ${q[0]} on the right-hand-side: ${a}.`
    }
  },
  turnover: 200,
  documented: false,
  calculator: false
}
```

# History
The history stores past problem data from different questions.
```javascript
{
  "id": {
    "YYYYMMDD": [
      // Entries corresponding to field `q` of output of generate()
    ]
  }
}
```
For example:
```javascript
{
  "factorq": {
    "20210415": [
      [1, -4, 32],
      [1, 10, 21]
    ],
    "20210418": [
      [7, 13, -2],
      [-1, -3, 10]
    ]
  },
  "gcd": {
    "20210410": [
      [64, 24],
      [13, 39],
      [48, 56]
    ]
  }
}
```
