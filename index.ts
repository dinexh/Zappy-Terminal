import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout 
});

function ask() {
  rl.question("zappy> ", (word: string) => {
    word = word.trim().toLowerCase();
    console.log("get Started with Zappy!");
    console.log("You can say hi, what, or bye.");
    console.log("You can also say help to Know more");
    if (word === "hi") {
      console.log("hello");
    } else if (word === "what") {
      console.log("I can say hello, help you, and say bye!");
    } else if (word === "bye") {
      console.log("See ya!");
      rl.close(); 
    } else if (word === "") {
    } else {
      console.log("Sorry, try hi, what, or bye.");
    }
    if (word !== "bye") {
      ask();
    }
  });
}
console.log("Hey there! I'm Zappy, your friendly terminal!");
ask();
