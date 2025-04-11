import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout 
});

function ask() {
  rl.question("zappy> ", (word: string) => {
    word = word.trim().toLowerCase();
    if (word === "hi") {
      console.log("hello");
    } else if (word === "what") {
      console.log("I can say hello, help you, and say bye!");
    } else if (word === "bye") {
      console.log("See ya!");
      rl.close(); 
    } else if (word === "")
    {
      console.log("Please enter a command.");
    }
    else if (word == "exit") {
      console.log("See ya!");
      rl.close();
    } else if (word === "help") {
    } else {
      console.log("Sorry, try hi, what, or bye.");
    }

    if (word !== "bye" && word !== "exit") {
      ask();
    }
  });
}
console.log("Hey there! I'm Zappy, your friendly terminal!");
ask();
