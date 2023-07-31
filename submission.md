นายณัฐพงค์ ปิติศรีพัฒนรากุล 6110110038
##	First Commit
ในส่วนนี้ได้ปรับปรุง code ใน WordCard.js ส่วน return ให้แสดงผลอยู่ตรงกลางหน้าจอ ด้วยการรวมให้อยู่ใน container เดียวกัน แล้วกำหนด class ขึ้นมา

	return (
        <div className="word-card">
            {    
                state.chars.map((c, i) => (
                    <CharacterCard value={c} key={i} activationHandler={activationHandler} attempt={state.attempt}/>
                )
            )}
        </div>
    );
เพิ่ม component นี้ ใน App.css
	
	.word-card {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
##	Second Commit
เพิ่มฟังก์ชันในการทำให้สามารถเล่นเกมใหม่ได้อีกครั้ง

    const  resetGame  = () => {
	    window.location.reload();
    };
ก่อนหน้าผมใช้

    const resetGame  = () => {
	    setState(prepareStateFromWord(props.value));
	};
- แต่เกิดปัญหา คือ เมื่อคำตอบถูก กดปุ่มรีเซ็ต แต่คำไม่รีเซ็ต
- แต่ถ้าทำให้ครั้งแรกผิด ครั้งที่สองถูก กดปุ่มรีเซ็ต ผลลัพธ์ที่ควรจะเป็นจะถูกต้อง
- สรุปคือ ต้องสลับผิดก่อน 1 ครั้ง ถึงจะทำให้ผลลัพธ์ถูกอย่างที่ควรจะเป็น ผมเลยแก้ปัญหาด้วยการใช้ window.location.reload(); แทน

ในฟังก์ชัน activationHandler เพิ่ม condition คือ if (!state.completed) ครอบทับไป เพื่อเช็คให้ state ทำงานได้ถูกเงื่อนไข ว่าเกมจะยังรันจนกว่าเกมจะจบ

    const  activationHandler  = (c) => {
	    console.log(`${c} has been activated`);
	    if (!state.completed) {
		    const  guess  =  state.guess  +  c;
		    setState({ ...state, guess });
		    
			if (guess.length  ===  state.word.length) {
				if (guess  ===  state.word) {
				console.log('yeah!');
				setState({ ...state, completed:  true });
			} else {
				console.log('reset, next attempt');
				setState({ ...state, guess:  '', attempt:  state.attempt  +  1 });
			}
		}
	}

ปรับส่วนของ return เพิ่มเติม ด้วยการเพิ่มปุ่มรีเซ็ตค่าใหม่ หากต้องการเล่นอีกครั้ง

    {state.completed && (
	    <div  className="congrats-message">
		    <p>Congratulations! You guessed the word correctly!</p>
		    <button  onClick={resetGame}>Play Again</button>
		</div>
	)}
## Third Commit
ประกาศตัวแปรเพิ่ม สำหรับระบบจับเวลา ระบบค่าชีวิต และระบบคะแนน

    const  TIME_LIMIT  =  30;
    const  MAX_ATTEMPTS  =  3;
    const  MAX_SCORE  =  100;
ปรับแก้ prepareStateFromWord

    const  prepareStateFromWord  = (given_word) => {
	    let  word  =  given_word.toUpperCase();
	    let  chars  =  _.shuffle(Array.from(word));
	    return {
		    word,
		    chars,
		    attempt:  1,
		    guess:  '',
		    completed:  false,
		    gameOver:  false,
		    score:  TIME_LIMIT,
		};
	};
เรียกใช้งานฟังก์ชัน useEffact เพิ่มการใช้ตัวจับเวลา โดยให้ตัวจับเวลายังทำงานอยู่ หากคะแนนยังไม่เป็น 0

    useEffect(() => {
	    if (!state.completed  &&  !state.gameOver) {
		    const  timer  =  setTimeout(() => {
			    const  newScore  =  Math.max(state.score  -  1, 0);
			    if (newScore  ===  0) {  // จับเวลา
				    setState((prevState) => ({
					    ...prevState,
					    gameOver:  true,
					}));
				} else {  // อัปเดตคะแนนตามเวลา
					setState((prevState) => ({
						...prevState,
						score:  newScore,
					}));
				}
			}, 1000);
		return () =>  clearTimeout(timer);
ใน activationHandler เพิ่มส่วนการคำนวนคะแนน และ state ใหม่ นั่นคือ gameOver

    const  activationHandler  = (c) => {
	    console.log(`${c} has been activated`);
	    if (!state.completed  &&  !state.gameOver) {
		    const  guess  =  state.guess  +  c;
		    setState({ ...state, guess });
		    if (guess.length  ===  state.word.length) {
				if (guess  ===  state.word) {
					console.log('You Won');
					const  attemptsLeft  =  MAX_ATTEMPTS  -  state.attempt;
					const  bonusScore  =  MAX_SCORE  *  attemptsLeft;
					const  totalScore  = ((state.score  *  10) +  bonusScore) /  6;
					setState({ ...state, completed:  true, score:  totalScore });
				} else {
					const  nextAttempt  =  state.attempt  +  1;
					if (nextAttempt  >  MAX_ATTEMPTS) {
						console.log('Game Over');
						setState({ ...state, gameOver:  true });
					} else {
						console.log('Reset');
						setState({ ...state, guess:  '', attempt:  nextAttempt });
					}
				}
			}
		}
	};
และเพิ่มส่วนแสดงผลเหล่านี้ ในฟังก์ชัน return

    {state.gameOver && (
	    <div  className="game-over-message">
		    <p>คุณแพ้แล้ว</p>
		    <p>Score: {0}</p>
		    <button  onClick={resetGame}>ลองใหม่</button>
		</div>
	)}
	{!state.completed && !state.gameOver && (
		<div  className="timer">
			<p>Time Remaining: {state.score} seconds</p>
		</div>
	)}
## Forth Commit
เพิ่มระบบการเก็บคะแนนสูงสุด 5 อันดับ โดยสร้างฟังก์ชันสำหรับเก็บค่าคะแนน

    const  saveHighScores  = (highScores) => {
	    localStorage.setItem('highScores', JSON.stringify(highScores));
	};
แปลงอาร์เรย์เป็นสตริง JSON โดยใช้ JSON.stringify(highScores) เพื่อเก็บใน Local
เพิ่มส่วนนี้ใน export default function WordCard(props)

    const [highScores, setHighScores] =  useState([]);
    useEffect(() => {
	    const  savedHighScores  =  JSON.parse(localStorage.getItem('highScores') ||  '[]');
	    setHighScores(savedHighScores);
	}, []);
สร้าง component สำหรับจัดการคะแนนสูงสุด

    const  updateHighScores  = (score) => {
	    const  newHighScores  = [...highScores, score];
	    newHighScores.sort((a, b) =>  b  -  a); // เรียงลำดับมาก>น้อย
	    const  topHighScores  =  newHighScores.slice(0, 5); // เก็บค่าคะแนน 5 อันดับ
	    setHighScores(topHighScores);
	    saveHighScores(topHighScores);
	};
เพิ่มการอัปเดตคะแนนใน condition ส่วนนี้

    if (guess  ===  state.word) {
	    console.log('You Won');
	    const  attemptsLeft  =  MAX_ATTEMPTS  -  state.attempt;
	    const  bonusScore  =  MAX_SCORE  *  attemptsLeft;
	    const  totalScore  = ((state.score  *  10) +  bonusScore) /  6;
	    setState({ ...state, completed:  true, score:  totalScore });
	    updateHighScores(totalScore);
	}
เพิ่มส่วนแสดงผลใน return

    <div  className="high-scores">
	    <h2>คะแนนที่ดีที่สุด</h2>
	    <ol>
		    {highScores.map((score, index) => (
		    <li  key={index}>{score.toFixed(2)}</li>
		    ))}
		</ol>
	</div>
## Fifth Commit
เพิ่มการตกแต่งส่วนนี้ใน App.css

    .word-card {
	    display: flex;
	    justify-content: center;
	    align-items: center;
	    height: 100vh;
	    flex-wrap: wrap;
	    gap: 8px;
	    max-width: auto;
	    margin: 0  auto;
	    padding: 20px;
	    background-color: #e3e3e3;
	    border: 1px  solid  #ccc;
	    border-radius: 8px;
	}
	
	.congrats-message,
	.game-over-message,
	.timer,
	.high-scores {
		width: 100%;
		text-align: center;
		margin-top: 20px;
	}
	
	.congrats-message  p,
	.game-over-message  p,
	.timer  p,
	.high-scores  h2 {
		margin-bottom: 10px;
	}
	
	.congrats-message  button,
	.game-over-message  button {
		padding: 10px  20px;
		background-color: #14a1d4;
		color: #fff;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 16px;
		text-transform: uppercase;
		transition: background-color 0.2s;
	}
	
	.congrats-message  button:hover,
	.game-over-message  button:hover {
		background-color: #00b3ff;
	}
	
	.high-scores {
		max-width: 300px;
		margin: 0  auto;
	}
	
	.high-scores  ol {
		padding-left: 20px;
		text-align: left;
	}
	
	.high-scores  li {
		font-size: 18px;
		margin-bottom: 8px;
	}
