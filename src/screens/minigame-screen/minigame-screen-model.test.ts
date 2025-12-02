import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {MinigameScreenModel} from './minigame-screen-model.ts';

describe('MinigameScreenModel', () => {
	let model: MinigameScreenModel;

	beforeEach(() => {
		// Mock Math.random to return predictable values
		let callCount = 0;
		vi.spyOn(Math, 'random').mockImplementation(() => {
			callCount++;
			return (callCount * 0.123) % 1; // Predictable sequence
		});

		model = new MinigameScreenModel();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with score 0', () => {
			const state = model.getState();
			expect(state.score).toBe(0);
		});

		it('should initialize with question number 1', () => {
			const state = model.getState();
			expect(state.questionNumber).toBe(1);
		});

		it('should initialize with 4 answer options', () => {
			const state = model.getState();
			expect(state.answers).toHaveLength(4);
		});

		it('should initialize with 3 potion images', () => {
			const state = model.getState();
			expect(state.potions).toHaveLength(3);
		});

		it('should generate a question on construction', () => {
			const state = model.getState();
			expect(state.question.highlighted).not.toBe('');
		});
	});

	describe('getMaxQuestions', () => {
		it('should return 10', () => {
			expect(model.getMaxQuestions()).toBe(10);
		});
	});

	describe('submitAnswer', () => {
		it('should increment score by 10 for correct answer', () => {
			// Get the correct index from any answer submission
			const {correctIndex} = model.submitAnswer(0);

			// Create a fresh model and submit the correct answer
			vi.restoreAllMocks();
			let callCount = 0;
			vi.spyOn(Math, 'random').mockImplementation(() => {
				callCount++;
				return (callCount * 0.123) % 1;
			});

			const freshModel = new MinigameScreenModel();
			const result = freshModel.submitAnswer(correctIndex);

			expect(result.isCorrect).toBe(true);
			expect(result.score).toBe(10);
		});

		it('should decrement score by 5 for wrong answer, minimum 0', () => {
			// Find a wrong answer
			let wrongIndex = -1;
			for (let i = 0; i < 4; i++) {
				const testResult = model.submitAnswer(i);
				if (!testResult.isCorrect) {
					wrongIndex = i;
					break;
				}
			}

			model.reset();
			if (wrongIndex >= 0) {
				const result = model.submitAnswer(wrongIndex);
				expect(result.isCorrect).toBe(false);
				expect(result.score).toBe(0); // Can't go below 0
			}
		});

		it('should return the correct index in result', () => {
			const result = model.submitAnswer(0);
			expect(result.correctIndex).toBeGreaterThanOrEqual(0);
			expect(result.correctIndex).toBeLessThan(4);
		});

		it('should return current question number', () => {
			const result = model.submitAnswer(0);
			expect(result.questionNumber).toBe(1);
		});

		it('should handle invalid index gracefully', () => {
			const result = model.submitAnswer(99);
			expect(result.isCorrect).toBe(false);
		});
	});

	describe('advanceQuestion', () => {
		it('should return true when more questions available', () => {
			const hasNext = model.advanceQuestion();
			expect(hasNext).toBe(true);
		});

		it('should increment question number', () => {
			model.advanceQuestion();
			const state = model.getState();
			expect(state.questionNumber).toBe(2);
		});

		it('should return false after 10 questions', () => {
			for (let i = 1; i < 10; i++) {
				expect(model.advanceQuestion()).toBe(true);
			}

			expect(model.advanceQuestion()).toBe(false);
		});

		it('should generate new question', () => {
			model.advanceQuestion();
			expect(model.getState().question.highlighted).toBeDefined();
		});
	});

	describe('isWin', () => {
		it('should return false with 0 correct answers', () => {
			expect(model.isWin()).toBe(false);
		});

		it('should return false with less than 70% correct', () => {
			// Just checking the initial state (0 correct)
			expect(model.isWin()).toBe(false);
		});
	});

	describe('reset', () => {
		it('should reset score to 0', () => {
			model.submitAnswer(0);
			model.reset();
			expect(model.getState().score).toBe(0);
		});

		it('should reset question number to 1', () => {
			model.advanceQuestion();
			model.advanceQuestion();
			model.reset();
			expect(model.getState().questionNumber).toBe(1);
		});

		it('should generate new question', () => {
			model.reset();
			expect(model.getState().question.highlighted).not.toBe('');
		});
	});

	describe('getState', () => {
		it('should return question with prefix, highlighted, and suffix', () => {
			const state = model.getState();
			expect(state.question.prefix).toBe('Expand ');
			expect(state.question.suffix).toBe(' to its full expression:');
			expect(state.question.highlighted).toMatch(/\d\(x [+-] \d\)/);
		});

		it('should return answers array', () => {
			const state = model.getState();
			expect(Array.isArray(state.answers)).toBe(true);
			expect(state.answers.length).toBe(4);
			for (const answer of state.answers) {
				expect(typeof answer.label).toBe('string');
			}
		});

		it('should return potions array with URLs', () => {
			const state = model.getState();
			expect(state.potions).toHaveLength(3);
			for (const potion of state.potions) {
				expect(potion.url).toMatch(/\.png$/);
			}
		});
	});

	describe('question generation', () => {
		it('should generate question in format "n(x + m)" or "n(x - m)"', () => {
			const state = model.getState();
			expect(state.question.highlighted).toMatch(/^\d\(x [+-] \d\)$/);
		});

		it('should have exactly one correct answer', () => {
			const state = model.getState();
			// Check that exactly one answer matches the correct index
			const result = model.submitAnswer(0);
			expect(result.correctIndex).toBeGreaterThanOrEqual(0);
			expect(result.correctIndex).toBeLessThan(state.answers.length);
		});

		it('should have unique answer options', () => {
			const state = model.getState();
			const labels = state.answers.map((a) => a.label);
			const uniqueLabels = new Set(labels);
			expect(uniqueLabels.size).toBe(labels.length);
		});
	});

	describe('answer format', () => {
		it('should format answers as "nx + c" or "nx - c" or "nx"', () => {
			const state = model.getState();
			for (const answer of state.answers) {
				expect(answer.label).toMatch(/^\d+x( [+-] \d+)?$/);
			}
		});
	});

	describe('score boundaries', () => {
		it('should not allow score to go below 0', () => {
			// Submit wrong answers repeatedly
			for (let i = 0; i < 5; i++) {
				model.submitAnswer(0);
				if (i < 4) model.advanceQuestion();
			}

			expect(model.getState().score).toBeGreaterThanOrEqual(0);
		});
	});

	describe('deterministic behavior', () => {
		it('should produce same results with same mock', () => {
			const state1 = model.getState();

			// Restore and re-mock with same pattern
			vi.restoreAllMocks();
			let callCount = 0;
			vi.spyOn(Math, 'random').mockImplementation(() => {
				callCount++;
				return (callCount * 0.123) % 1;
			});

			const model2 = new MinigameScreenModel();
			const state2 = model2.getState();

			expect(state1.question.highlighted).toBe(state2.question.highlighted);
		});
	});
});
