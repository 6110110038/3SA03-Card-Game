import React, { useState } from 'react';
import CharacterCard from './CharacterCard';
import _ from 'lodash';
import './App.css'; // Create a CSS file to apply the styles.

const prepareStateFromWord = (given_word) => {
  let word = given_word.toUpperCase();
  let chars = _.shuffle(Array.from(word));
  return {
    word,
    chars,
    attempt: 1,
    guess: '',
    completed: false,
  };
};

export default function WordCard(props) {
  const [state, setState] = useState(prepareStateFromWord(props.value));

  const activationHandler = (c) => {
    console.log(`${c} has been activated`);

    if (!state.completed) {
      const guess = state.guess + c;
      setState({ ...state, guess });

      if (guess.length === state.word.length) {
        if (guess === state.word) {
          console.log('yeah!');
          setState({ ...state, completed: true });
        } else {
          console.log('reset, next attempt');
          setState({ ...state, guess: '', attempt: state.attempt + 1 });
        }
      }
    }
  };

  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="word-card">
      {state.chars.map((c, i) => (
        <CharacterCard
          value={c}
          key={i}
          activationHandler={activationHandler}
          attempt={state.attempt}
        />
      ))}
      {state.completed && (
        <div className="congrats-message">
          <p>ขอแสดงความยินดี คุณทายถูก</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}
