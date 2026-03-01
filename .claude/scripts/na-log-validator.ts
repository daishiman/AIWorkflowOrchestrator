/**
 * N/A判定ログバリデータ
 *
 * Phase 12 の仕様書更新時に、各仕様書に対して「更新」または「N/A」の判定を
 * 記録するログエントリのバリデーションを行う。
 *
 * P42対策: 全文字列フィールドで `.trim() === ""` の3段バリデーションを実施。
 */

/** N/A判定ログの1エントリを表す型 */
export interface NaLogEntry {
  /** 仕様書名 */
  specName: string;
  /** 判定ステータス: "更新" または "N/A" */
  status: "更新" | "N/A";
  /** N/Aの場合の理由（更新の場合は空でも可） */
  reason: string;
  /** N/Aの場合の代替証跡パス（更新の場合は空でも可） */
  alternativeEvidence: string;
  /** 担当SubAgent識別子 */
  updatedBy: string;
}

/** バリデーション結果 */
export interface ValidationResult {
  /** バリデーション全体の合否 */
  isValid: boolean;
  /** エラーメッセージの配列（isValid === true の場合は空配列） */
  errors: string[];
}

/** 許可されたSubAgent識別子のリスト */
const VALID_UPDATED_BY = [
  "SubAgent-A",
  "SubAgent-B",
  "SubAgent-C",
  "SubAgent-D",
  "SubAgent-E",
  "leader",
] as const;

/** 許可されたステータス値 */
const VALID_STATUS = ["更新", "N/A"] as const;

/**
 * 単一のN/A判定ログエントリをバリデーションする。
 *
 * バリデーションルール:
 * 1. specName: typeof === "string" && .trim() !== ""（P42対策: 3段バリデーション）
 * 2. status: "更新" | "N/A" のいずれか
 * 3. status === "N/A" の場合: reason.trim() !== "" 必須
 * 4. status === "N/A" の場合: alternativeEvidence.trim() !== "" 必須
 * 5. updatedBy: VALID_UPDATED_BY リストに含まれる
 *
 * @param entry - バリデーション対象のログエントリ
 * @returns バリデーション結果
 */
export function validateNaLogEntry(entry: NaLogEntry): ValidationResult {
  const errors: string[] = [];

  // 1. specName: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
  if (typeof entry.specName !== "string") {
    errors.push("specName: 文字列型である必要があります");
  } else if (entry.specName === "") {
    errors.push("specName: 空文字列は許可されていません");
  } else if (entry.specName.trim() === "") {
    errors.push("specName: 空白のみの文字列は許可されていません");
  }

  // 2. status: "更新" | "N/A" のいずれか
  if (!VALID_STATUS.includes(entry.status as (typeof VALID_STATUS)[number])) {
    errors.push(
      `status: "${entry.status}" は無効です。"更新" または "N/A" のいずれかを指定してください`,
    );
  }

  // 3 & 4. status === "N/A" の場合のみ reason と alternativeEvidence を検証
  if (entry.status === "N/A") {
    // reason の3段バリデーション
    if (typeof entry.reason !== "string") {
      errors.push("reason: 文字列型である必要があります");
    } else if (entry.reason === "") {
      errors.push("reason: N/A判定の場合、理由は必須です");
    } else if (entry.reason.trim() === "") {
      errors.push("reason: N/A判定の場合、空白のみの理由は許可されていません");
    }

    // alternativeEvidence の3段バリデーション
    if (typeof entry.alternativeEvidence !== "string") {
      errors.push("alternativeEvidence: 文字列型である必要があります");
    } else if (entry.alternativeEvidence === "") {
      errors.push("alternativeEvidence: N/A判定の場合、代替証跡は必須です");
    } else if (entry.alternativeEvidence.trim() === "") {
      errors.push(
        "alternativeEvidence: N/A判定の場合、空白のみの代替証跡は許可されていません",
      );
    }
  }

  // 5. updatedBy: 許可値リストに含まれること
  if (
    !VALID_UPDATED_BY.includes(
      entry.updatedBy as (typeof VALID_UPDATED_BY)[number],
    )
  ) {
    errors.push(
      `updatedBy: "${entry.updatedBy}" は無効です。許可値: ${VALID_UPDATED_BY.join(", ")}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 複数のN/A判定ログエントリを一括バリデーションする。
 *
 * @param entries - バリデーション対象のログエントリ配列
 * @returns バリデーション結果（全エントリのエラーを結合）
 */
export function validateNaLogEntries(entries: NaLogEntry[]): ValidationResult {
  const errors: string[] = [];

  // 空配列チェック
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      isValid: false,
      errors: ["entries: ログエントリが空です（0件）。1件以上の記録が必要です"],
    };
  }

  // 各エントリのバリデーション結合
  for (let i = 0; i < entries.length; i++) {
    const result = validateNaLogEntry(entries[i]);
    if (!result.isValid) {
      for (const error of result.errors) {
        errors.push(`[${i + 1}] ${error}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
