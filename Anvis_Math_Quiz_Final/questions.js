
const CATEGORIES = [
  'Horizontal Addition',
  'Vertical Addition (no carry)',
  'Vertical Addition (with carry)',
  'Addition & Subtraction Word Problems',
  'Multiplication & Division Word Problems',
  'Place Value & Expanded Form',
  'Time & Money',
  'Patterns & Basic Geometry',
  'Measurement & Number to Words'
];

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
const QUESTIONS = [];
let qid=1;

function addMCQ(cat,prompt,choices,answer){
  QUESTIONS.push({id:qid++, category:cat, type:'mcq', prompt, choices: choices.map(String), answer: String(answer)});
}
function addInput(cat,prompt,answer){
  QUESTIONS.push({id:qid++, category:cat, type:'input', prompt, answer: String(answer)});
}

function expandedForm(n){
  let s = String(n).padStart(3,'0'), parts=[];
  if(s[0] !== '0') parts.push(s[0]+'00');
  if(s[1] !== '0') parts.push(s[1]+'0');
  if(s[2] !== '0') parts.push(s[2]);
  return parts.join(' + ');
}

function numberToWords(num){
  const ones=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if(num<20) return ones[num];
  if(num<100){ let t=Math.floor(num/10), o=num%10; return tens[t] + (o? ' ' + ones[o]: ''); }
  return String(num);
}

function shuffleChoices(choices, correct){
  const arr = Array.from(new Set(choices));
  if(!arr.includes(String(correct))) arr[0]=String(correct);
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr.map(String);
}

// generate 5 per category
CATEGORIES.forEach(cat => {
  for(let i=0;i<5;i++){
    if(cat==='Horizontal Addition'){
      let a=randInt(1,20), b=randInt(1,20), c=a+b;
      addMCQ(cat, `${a} + ${b} = ?`, shuffleChoices([c,c+1,c-1,c+2], c), c);
    } else if(cat==='Vertical Addition (no carry)'){
      let a=randInt(10,29), b=randInt(10,29);
      while(((a%10)+(b%10))>=10){ a=randInt(10,29); b=randInt(10,29); }
      let c=a+b; addMCQ(cat, `Add vertically: ${a} + ${b}`, shuffleChoices([c,c+10,c-1,Math.abs(a-b)], c), c);
    } else if(cat==='Vertical Addition (with carry)'){
      let a=randInt(10,99), b=randInt(10,99);
      while(((a%10)+(b%10))<10){ a=randInt(10,99); b=randInt(10,99); }
      let c=a+b; addMCQ(cat, `Add vertically (with carry): ${a} + ${b}`, shuffleChoices([c,c-10,c+1,Math.abs(a-b)], c), c);
    } else if(cat==='Addition & Subtraction Word Problems'){
      let a=randInt(2,12), b=randInt(1,10);
      addInput(cat, `Ria had ${a} apples. She got ${b} more. How many apples now?`, `${a+b}`);
    } else if(cat==='Multiplication & Division Word Problems'){
      let a=[2,3,4,6][randInt(0,3)], b=randInt(1,6), c=a*b;
      addMCQ(cat, `If you have ${a} baskets with ${b} apples each, how many apples total?`, shuffleChoices([c,c+1,a+b,Math.max(1,c-2)], c), c);
    } else if(cat==='Place Value & Expanded Form'){
      let n=randInt(101,999); addInput(cat, `Write ${n} in expanded form (e.g., 123 = 100 + 20 + 3).`, expandedForm(n));
    } else if(cat==='Time & Money'){
      let hrs=randInt(1,12), mins=[0,15,30,45][randInt(0,3)]; let c=`${hrs}:${String(mins).padStart(2,'0')}`;
      addMCQ(cat, `What time is shown if clock shows ${c}?`, shuffleChoices([c,`${(hrs%12)+1}:00`, `${hrs}:30`, `${Math.max(1,hrs-1)}:${String(mins).padStart(2,'0')}`], c), c);
    } else if(cat==='Patterns & Basic Geometry'){
      let start=randInt(1,5), step=randInt(1,4), c=start+step*3;
      addMCQ(cat, `Complete the pattern: ${start}, ${start+step}, ${start+step*2}, ?`, shuffleChoices([c,c+1,c-1,start+1], c), c);
    } else if(cat==='Measurement & Number to Words'){
      let n=randInt(1,99); addInput(cat, `Write the number ${n} in words (e.g., 21 => twenty one).`, numberToWords(n));
    }
  }
});

console.log('Generated', QUESTIONS.length, 'questions.');
