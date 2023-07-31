import React, { useState, useEffect } from 'react';
import CharacterCard from './CharacterCard';
import _ from 'lodash';
import './App.css';

const TIME_LIMIT = 30;
const MAX_ATTEMPTS = 3;
const MAX_SCORE = 100;

const prepareStateFromWord = (given_word) => {
  let word = given_word.toUpperCase();
  let chars = _.shuffle(Array.from(word));
  return {
    word,
    chars,
    attempt: 1,
    guess: '',
    completed: false,
    gameOver: false,
    score: TIME_LIMIT,
  };
};

export default function WordCard(props) {
  const [state, setState] = useState(prepareStateFromWord(props.value));

  useEffect(() => {
    if (!state.completed && !state.gameOver) {
      const timer = setTimeout(() => {
        const newScore = Math.max(state.score - 1, 0);
        if (newScore === 0) {
          // จับเวลา
          setState((prevState) => ({
            ...prevState,
            gameOver: true,
          }));
        } else {
          // อัปเดตคะแแนนตามเวลา
          setState((prevState) => ({
            ...prevState,
            score: newScore,
          }));
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state]);

  const activationHandler = (c) => {
    console.log(`${c} has been activated`);

    if (!state.completed && !state.gameOver) {
      const guess = state.guess + c;
      setState({ ...state, guess });

      if (guess.length === state.word.length) {
        if (guess === state.word) {
          console.log('You Won');
          const attemptsLeft = MAX_ATTEMPTS - state.attempt;
          const bonusScore = MAX_SCORE * attemptsLeft;
          const totalScore = ((state.score * 10) + bonusScore) / 6;
          setState({ ...state, completed: true, score: totalScore });
        } else {
          const nextAttempt = state.attempt + 1;
          if (nextAttempt > MAX_ATTEMPTS) {
            console.log('Game Over');
            setState({ ...state, gameOver: true });
          } else {
            console.log('Reset');
            setState({ ...state, guess: '', attempt: nextAttempt });
          }
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
          <p>ยินดีด้วย คุณทายคำถูกต้อง</p>
          <p>Score: {state.score.toFixed(2)}</p> {/* Display the score as a decimal */}
          <button onClick={resetGame}>เล่นอีกครั้ง</button>
        </div>
      )}
      {state.gameOver && (
        <div className="game-over-message">
          <p>คุณแพ้แล้ว</p>
          <p>Final Score: {0}</p> {/* Display the score as a decimal */}
          <button onClick={resetGame}>ลองใหม่</button>
        </div>
      )}
      {!state.completed && !state.gameOver && (
        <div className="timer">
          <p>Time Remaining: {state.score} seconds</p>
        </div>
      )}
    </div>
  );
}
