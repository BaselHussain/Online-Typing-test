#! /usr/bin/env node
import inquirer from "inquirer";
interface User{
    name:string,
    email:string,
    password:string
}
interface TestResult{
    wpm:number,
    error:number,
    accuracy?:number
}
const textSamples:Record<string,string>={
    basic:"The quick brown fox jumps over the lazy dog.",
random:"In the city's bustle, a figure walked with purpose, his shadow trailing as the sun dipped low. Amidst traffic's din, he strode, resolute in his quest.",
technical:"The quick brown fox jumps over the lazy dog, but the dog turns around and bites the fox's tail, causing the fox to yelp in pain and run away into the dense forest, where it finds refuge under a thick canopy of trees, hidden from sight but not from the memory of the dog, who continues to search for its elusive prey"
}

let currentUser:User|null=null
const users:User[]=[];
function getRandomText(difficulty:string):string{

return textSamples[difficulty]
}
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function runTypingTest(difficulty: string, timer: number) {
  const testText = getRandomText(difficulty);
  console.log("\nType the following text as fast as you can:");
  console.log(testText);
  console.log("\nPress Enter when you're ready to start...");
  await inquirer.prompt([{ name: 'ready', message: 'Press Enter to start', type: 'input' }]);
  const startTime = new Date().getTime();
  const { userInput } = await inquirer.prompt([{ name: 'userInput', message: 'Start typing:', type: 'input' }]);
  const endTime = new Date().getTime();
  const timeTakenSeconds = (endTime - startTime) / 1000; // time in seconds
  const timeTakenMinutes = timeTakenSeconds / 60; // time in minutes
  const wordCount = testText.split(' ').length;

  // Ensure timeTakenMinutes is greater than zero
  const wpm = timeTakenMinutes > 0 ? Math.round(wordCount / timeTakenMinutes) : 0;
  const errors = calculateErrors(testText, userInput);
  const accuracy = calculateAccuracy(testText, userInput);

  if (timer < timeTakenMinutes) {
    console.log(`Time is up! You were supposed to complete in ${timer} minutes.`);
  }

  return { wpm, errors, accuracy };
}



function calculateErrors(original:string,typed:string){
    let originalWords=original.split(" ");
    let typedWords=typed.split(" ");
    let error=0
    originalWords.forEach((words,index)=>{
if(typedWords[index]!==words){
error++
 }
    })
    return error
}
function calculateAccuracy(original:string,typed:string){
    let originalWords=original.split(" ");
    let typedWords=typed.split(" ");
    let correct =0
    originalWords.forEach((words,index)=>{
        if(typedWords[index]===words){
        correct++
         }
})

return (correct / originalWords.length) * 100;
}
async function signup() {
  const { name, email, password } = await inquirer.prompt([
    { name: 'name', message: 'Enter your name:', type: 'input' },
    { 
      name: 'email', 
      message: 'Enter your email:', 
      type: 'input',
      validate: (input: string) => {
        const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return validEmailRegex.test(input) || "Please enter a valid email address.";
      }
    },
    { name: 'password', message: 'Enter your password:', type: 'password' }
  ]);

  const user: User = { name, email, password };
  users.push(user);
  currentUser = user;
  console.log('Signup successful!');
}

async function login() {
  const { email, password } = await inquirer.prompt([
    { 
      name: 'email', 
      message: 'Enter your email:', 
      type: 'input',
      validate: (input: string) => {
        const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return validEmailRegex.test(input) || "Please enter a valid email address.";
      }
    },
    { name: 'password', message: 'Enter your password:', type: 'password' }
  ]);
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    console.log('Login successful!');
  } else {
    console.log('Invalid email or password.');
  }
}
async function main() {
    console.log("Welcome to the Typing Speed Tester!");
    const { action } = await inquirer.prompt([
        { name: 'action', message: 'Do you want to Signup or Login?', type: 'list', choices: ['Signup', 'Login'] }
      ]);
      if (action === 'Signup') {
        await signup();
        await main()
      } else {
        await login();
      }
      
  if (!currentUser) {
    console.log('You need to be logged in to continue.');
  }else{
  console.log(`Hello, ${currentUser.name}! Let's start the typing test.`);
}
const { difficulty,timer } = await inquirer.prompt([
    { 
      name: 'difficulty', message: 'Choose difficulty level:', type: 'list', choices: ['basic', 'random', 'technical'] 
    },{name:"timer",type:"list",message:"Select the timer",choices:[1,3]}
]);

const result = await runTypingTest(difficulty,timer);
if(currentUser){
console.log(`\nTyping Test Results for ${currentUser.name}:`);
console.log(`Words Per Minute (WPM): ${result.wpm}`);
console.log(`Errors: ${result.errors}`);
console.log(`Accuracy: ${result.accuracy?.toFixed(2)}%`);

}
const { exitOrRestart } = await inquirer.prompt([
    { name: 'exitOrRestart', message: 'Do you want to exit or restart the test?', type: 'list', choices: ['Exit', 'Restart'] }
  ]);
  if (exitOrRestart === 'Restart') {
    main();
  } else {
    console.log("\nThank you for using the Typing Speed Tester. Goodbye!");
  }
}


main();
