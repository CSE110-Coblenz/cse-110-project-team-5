/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
	private currentQuestion = "YOU SHOULDN'T SEE THIS";
	private currentAnswer = -999;

	public setQuestionAndAnswer(question: string, answer: number): void {
		this.currentQuestion = question;
		this.currentAnswer = answer;
	}

	public getQuestion(): string {
		return this.currentQuestion;
	}

	public getAnswer(): number {
		return this.currentAnswer;
	}
}
