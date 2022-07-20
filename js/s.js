const words = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam quasi sint voluptas, pariatur est a odio unde suscipit culpa vel dignissimos nobis distinctio dolores iste velit sed repellendus aliquid in nisi tenetur corporis repudiandae illo ex commodi? Totam eius asperiores veritatis est aliquid hic delectus maxime sint eveniet. Corporis nobis dolorem, ad velit porro nemo. Quo labore corporis consequuntur sit ad culpa reiciendis tenetur. Minima, dignissimos doloribus? Commodi cumque ipsam eius perferendis pariatur, a dolorum laudantium harum dolores alias, maxime temporibus similique, iste beatae tempora accusantium aliquid saepe distinctio non quia. Voluptatum mollitia asperiores dignissimos vero beatae impedit debitis recusandae.'.split(' ');
const wordCount = words.length;
const gameTime = 20 * 1000;

window.timer = null;
window.gameStart = null;

function addClass(e,name) {
  e.className += ' '+name;
}
function removeClass(e,name) {
  e.className = e.className.replace(name, '');
}

function randomWord(){
    const randomIndex = Math.ceil(Math.random()*wordCount);
    return words[randomIndex - 1];
}

function formatWord(word){
  return `<div class='word'><span class='letter'>${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame(){
    document.getElementById('words').innerHTML = '';
    for (let i = 0; i < 200; i++) {
      document.getElementById('words').innerHTML += formatWord(randomWord());
    };
   addClass(document.querySelector('.word'),'current');
   addClass(document.querySelector('.letter'),'current');
   document.getElementById('info').innerHTML = gameTime / 1000;
   window.timer = null;
}

function getWpm(){
  const words = [...document.querySelectorAll('.word')];
  const lastTypedWord = document.querySelector('.word.current');
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter(word => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
    const correctLetters = letters.filter(letter => letter.className.includes('correct'));
    return incorrectLetters.length === 0 && correctLetters.length === letters.length;
  })
  return correctWords.length / gameTime * 60000;
}

function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById('game'), 'over');
  document.getElementById('info').innerHTML = `WPM ${getWpm()}`

}

document.getElementById('game').addEventListener('keyup',e => {
  const key = e.key;

  const currentWord = document.querySelector('.word.current')

  const currentLetter = document.querySelector('.letter.current');

  const expected = currentLetter?.innerHTML || ' ';

  const isLetter = key.length === 1 && key !== ' ';

  const isSpace = key === ' ';

  const isBackSpace = key === 'Backspace';

  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) {
    return;
  }

  console.log({key, expected});

  if(!window.timer && isLetter){
    window.timer = setInterval(() => {
      if(!window.gameStart){
        window.gameStart = (new Date()).getTime();
      }
      const currentTime = (new Date()).getTime();
      const msPassed = currentTime - window.gameStart;
      const sPassed = Math.round(msPassed/1000);
      const sLeft = (gameTime / 1000) - sPassed; 

      if(sLeft <= 0){
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft;
    }, 1000)
  }

  if(isLetter){
    if (currentLetter) {
      addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
      removeClass(currentLetter, 'current');

      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, 'current');
      }
        
    } else {
      const incorrectLetter = document.createElement('span');
      incorrectLetter.innerHTML = key;
      incorrectLetter.className = 'letter incorrect extra';
      currentWord.appendChild(incorrectLetter);
    }
  }
  
  if (isSpace) {
    if(expected !== ' '){
      const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.corrent)')];
      lettersToInvalidate.forEach(letter => {
        addClass(letter, 'incorrect')
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextSibling, 'current');
    if (currentLetter) {
      removeClass(currentLetter, 'current')
    }
    addClass(currentWord.nextSibling.firstChild, 'current');
  }

  if(isBackSpace){
    if (currentLetter && isFirstLetter) {
      // make prev word current. last letter current

      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
    }
    
    if(currentLetter && !isFirstLetter){
      // move back one letter, invalidate letter
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
    }

    if(!currentLetter){
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
    }

  }

  // move line / words

  if (currentWord.getBoundingClientRect().top > 240 ) {
    const words = document.getElementById('words');
    const margin = parseInt( words.style.marginTop  || '0px');
    words.style.marginTop = (margin - 37) + 'px' ;
  }

  // move cursor
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current')
  const cursor = document.getElementById('cursor');
  cursor.style.top =( nextLetter || nextWord).getBoundingClientRect().top +2+ 'px';

  cursor.style.left = ( nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right']+ 'px';

});

document.getElementById('newGameBtn').addEventListener(onclick, () => {
 gameOver();
 newGame();
})

newGame()