/**
 * HearingFacilitator - ユーザーインタビューによるスキル要件収集
 * TASK-9B Phase 5
 *
 * collaborativeモードで使用するインタビュー機能を提供する。
 * 最大10個の質問を通じて、スキルの目的・機能・制約・入出力・ツールを収集する。
 */
import type { InterviewResult } from "@repo/shared/types";

/** インタビューの最大質問数 */
const MAX_QUESTIONS = 10;

/** 質問カテゴリ */
type QuestionCategory =
  | "purpose"
  | "features"
  | "constraints"
  | "inputs"
  | "outputs"
  | "tools";

/** インタビュー質問 */
interface Question {
  /** 質問ID（1から順番に付与） */
  id: number;
  /** 質問テキスト */
  text: string;
  /** 質問カテゴリ */
  category: QuestionCategory;
}

/** 回答バリデーション結果 */
interface AnswerValidation {
  /** バリデーション成功フラグ */
  isValid: boolean;
  /** エラーメッセージ（失敗時のみ） */
  error?: string;
}

export class HearingFacilitator {
  private questions: Question[] = [];
  private answers: Map<number, string> = new Map();
  private currentQuestionIndex = 0;

  /**
   * 初回質問を生成する
   *
   * @returns 最初の質問テキスト
   */
  generateInitialQuestion(): string {
    const question: Question = {
      id: 1,
      text: "このスキルの主な目的を教えてください。何を達成したいですか？",
      category: "purpose",
    };
    this.questions.push(question);
    return question.text;
  }

  /**
   * ユーザーの回答を処理し、次の質問を返す
   *
   * @param answer - ユーザーの回答文字列
   * @returns 次の質問テキスト、またはnull（質問完了時）
   * @throws Error - 回答が空またはスペースのみの場合（P42準拠3段バリデーション）
   */
  processAnswer(answer: string): string | null {
    // P42: 空文字列とスペースのみの回答を拒否
    if (!answer || answer.trim() === "") {
      throw new Error("回答が空です。有効な回答を入力してください。");
    }

    this.answers.set(this.questions[this.currentQuestionIndex].id, answer);
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= MAX_QUESTIONS) {
      return null; // 最大質問数に達した
    }

    // 次の質問を生成（回答に基づいて）
    const nextQuestion = this.deriveNextQuestion(answer);
    if (nextQuestion) {
      this.questions.push(nextQuestion);
      return nextQuestion.text;
    }

    return null; // 質問完了
  }

  /**
   * インタビューを完了し、結果を返す
   *
   * @returns インタビュー結果（InterviewResult型）
   */
  completeInterview(): InterviewResult {
    const purpose = this.answers.get(1) || "";
    const features: string[] = [];
    const constraints: string[] = [];

    for (const [id, answer] of this.answers) {
      const question = this.questions.find((q) => q.id === id);
      if (question?.category === "features") {
        features.push(answer);
      } else if (question?.category === "constraints") {
        constraints.push(answer);
      }
    }

    return {
      purpose,
      features:
        features.length > 0
          ? features
          : [this.answers.get(2) || "default feature"],
      inputs: [],
      outputs: [],
      toolsNeeded: [],
      abstractionLevel: "L2",
    };
  }

  /**
   * 回答のバリデーション
   *
   * @param answer - 検証する回答文字列
   * @returns バリデーション結果
   */
  validateAnswer(answer: string): AnswerValidation {
    if (typeof answer !== "string") {
      return { isValid: false, error: "回答は文字列である必要があります" };
    }
    if (answer.trim() === "") {
      return { isValid: false, error: "回答が空です" };
    }
    return { isValid: true };
  }

  /**
   * 現在の質問数を取得
   *
   * @returns 質問数
   */
  getQuestionCount(): number {
    return this.questions.length;
  }

  /**
   * インタビューが完了しているかを判定
   *
   * @returns 完了フラグ
   */
  isComplete(): boolean {
    return (
      this.currentQuestionIndex >= MAX_QUESTIONS ||
      this.currentQuestionIndex >= this.questions.length
    );
  }

  /**
   * 前回の回答に基づいて次の質問を導出する
   *
   * @param _previousAnswer - 前回の回答（将来的にコンテキスト分析に使用）
   * @returns 次の質問、またはnull（全カテゴリ質問済み）
   */
  private deriveNextQuestion(_previousAnswer: string): Question | null {
    const nextId = this.questions.length + 1;

    // カテゴリ順に質問を生成
    const categories: QuestionCategory[] = [
      "features",
      "inputs",
      "outputs",
      "constraints",
      "tools",
    ];
    const askedCategories = new Set(this.questions.map((q) => q.category));

    for (const category of categories) {
      if (!askedCategories.has(category)) {
        return {
          id: nextId,
          text: this.getQuestionForCategory(category),
          category,
        };
      }
    }

    return null;
  }

  /**
   * カテゴリに対応する質問テキストを取得
   *
   * @param category - 質問カテゴリ
   * @returns 質問テキスト
   */
  private getQuestionForCategory(category: QuestionCategory): string {
    const questionMap: Record<QuestionCategory, string> = {
      purpose: "このスキルの主な目的を教えてください。",
      features: "このスキルに必要な主な機能は何ですか？",
      constraints: "制約条件や注意事項はありますか？",
      inputs: "入力として受け取るデータの形式を教えてください。",
      outputs: "出力として期待するデータの形式を教えてください。",
      tools: "使用が必要なツールはありますか？",
    };
    return questionMap[category];
  }
}
