/**
 * CodeGenerator - テンプレートベースのスキルコード生成
 * TASK-9B Phase 5
 *
 * Mustache風テンプレート変数の置換、SDK連携によるコード生成、
 * 型チェック、マルチファイル生成を提供する。
 * Script First原則に基づき、実行はScriptExecutorに委譲する。
 */
import type { ScriptExecutor } from "./ScriptExecutor";

/** テンプレート変数（キーと値のペア） */
interface TemplateVariable {
  /** 変数名（テンプレート内の {{name}} に対応） */
  name: string;
  /** 置換する値 */
  value: string;
}

/** 型チェック結果 */
interface TypeCheckResult {
  /** エラーが存在するか */
  hasErrors: boolean;
  /** 個別エラー情報 */
  errors: Array<{
    /** ファイルパス */
    file: string;
    /** 行番号 */
    line: number;
    /** エラーメッセージ */
    message: string;
  }>;
}

/** マルチファイル生成仕様 */
interface MultiFileSpec {
  /** エージェント名一覧 */
  agents?: string[];
  /** リファレンス名一覧 */
  references?: string[];
}

/** マルチファイル生成結果 */
interface MultiFileResult {
  /** 生成されたファイルパス一覧 */
  files: string[];
}

export class CodeGenerator {
  private scriptExecutor: ScriptExecutor | null = null;

  /**
   * ScriptExecutorを設定する（Setter Injection）
   * P34: 遅延初期化が必要な依存オブジェクトのDIパターン
   *
   * @param executor - ScriptExecutorインスタンス
   */
  setScriptExecutor(executor: ScriptExecutor): void {
    this.scriptExecutor = executor;
  }

  /**
   * テンプレートの変数を置換してコードを生成する
   * Mustache風の {{変数名}} パターンを置換する
   *
   * @param template - テンプレート文字列（{{変数名}} を含む）
   * @param variables - 置換変数の配列
   * @returns 変数置換後の文字列
   * @throws Error - テンプレートが空の場合
   */
  generateFromTemplate(
    template: string,
    variables: TemplateVariable[],
  ): string {
    if (!template || template.trim() === "") {
      throw new Error("Template must not be empty");
    }

    let result = template;
    for (const variable of variables) {
      const pattern = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g");
      result = result.replace(pattern, variable.value);
    }

    return result;
  }

  /**
   * SDK連携によるコード生成
   * ScriptExecutorを通じて外部スクリプトでコードを生成する
   *
   * @param prompt - コード生成プロンプト
   * @returns 生成されたコード文字列
   * @throws Error - ScriptExecutorが未設定、またはスクリプト実行失敗時
   */
  async generateWithSDK(prompt: string): Promise<string> {
    if (!this.scriptExecutor) {
      throw new Error("ScriptExecutor is not configured");
    }

    const result = await this.scriptExecutor.execute("generate_code.js", [
      "--prompt",
      prompt,
    ]);

    if (!result.success) {
      throw new Error(`Code generation failed: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * 生成コードの型チェックを実行する
   *
   * @param code - チェック対象のコード文字列
   * @returns 型チェック結果
   * @throws Error - ScriptExecutorが未設定の場合
   */
  async checkTypes(code: string): Promise<TypeCheckResult> {
    if (!this.scriptExecutor) {
      throw new Error("ScriptExecutor is not configured");
    }

    const result = await this.scriptExecutor.executeJson<TypeCheckResult>(
      "check_types.js",
      ["--code", code],
    );

    return result;
  }

  /**
   * マルチファイルスキルを生成する
   * エージェントとリファレンスを含む複数ファイル構成のスキルを生成する
   *
   * @param skillName - スキル名
   * @param spec - マルチファイル生成仕様（エージェント・リファレンス）
   * @returns 生成されたファイルパス一覧
   * @throws Error - ScriptExecutorが未設定、またはスクリプト実行失敗時
   */
  async generateMultiFile(
    skillName: string,
    spec: MultiFileSpec,
  ): Promise<MultiFileResult> {
    if (!this.scriptExecutor) {
      throw new Error("ScriptExecutor is not configured");
    }

    const args = ["--name", skillName];
    if (spec.agents) {
      args.push("--agents", spec.agents.join(","));
    }
    if (spec.references) {
      args.push("--references", spec.references.join(","));
    }

    const result = await this.scriptExecutor.execute(
      "generate_multi_file.js",
      args,
    );

    if (!result.success) {
      throw new Error(`Multi-file generation failed: ${result.stderr}`);
    }

    // 出力から生成されたファイルパスを解析
    const files = result.stdout.split("\n").filter(Boolean);
    return { files: files.length > 0 ? files : ["SKILL.md"] };
  }
}
