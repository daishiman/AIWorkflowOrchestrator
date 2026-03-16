# 定義重複監査レポート（Phase 8）

## メタ情報

| 項目      | 値                                        |
| --------- | ----------------------------------------- |
| 成果物    | `outputs/phase-8/duplication-audit.md`    |
| タスク ID | TASK-SKILL-LIFECYCLE-06                   |
| Phase     | 8: リファクタリング                       |
| 作成日    | 2026-03-16                                |
| 対象範囲  | Phase 1-2 成果物 10 ファイル（8定義ペア） |

---

## 1. 監査方針

Phase 1 は「要件定義（概念レベル）」、Phase 2 は「詳細設計（実装レベル）」の役割を持つ。Phase 1 が概念・要件を定義し、Phase 2 がそれを具体化した設計に落とし込む構造は**意図的な段階的詳細化**であり「重複」ではない。

判定基準:

- **重複（DUPLICATE）**: 同一の実装レベルの定義が複数ファイルに存在し、どちらかを削除しても機能要件に影響がない場合
- **段階的詳細化（REFINEMENT）**: Phase 1 が概念・要件レベルで記述し、Phase 2 が実装詳細に落とし込んだ場合（正常な設計プロセス）
- **要追記（NOTE）**: 重複でも詳細化でもないが、実装時の混乱防止のために注意が必要な場合

---

## 2. 8定義ペアの分析テーブル

### ペア 1: ToolRiskConfig 型定義

| 項目                    | 内容                                           |
| ----------------------- | ---------------------------------------------- |
| 正本ファイル（Phase 2） | `outputs/phase-2/risk-level-design.md`         |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/risk-level-classification.md` |

**Phase 1 の記述内容（risk-level-classification.md）:**

- セクション 1「ToolRiskLevel 4段階定義」テーブル: `critical` / `high` / `medium` / `low` の 4 段階、デフォルト権限状態（`denied`）、autoDeny 挙動の定義
- セクション 5「デフォルト権限状態まとめ」テーブル: autoDeny・PermissionDialog 表示条件の一覧

**Phase 2 の記述内容（risk-level-design.md）:**

- `interface ToolRiskConfig` 型定義: `level`, `allowApproveOnce`, `allowPermanent`, `autoDenyDefault`, `headerColorToken`, `dialogWidth` の 6 フィールド
- `export const TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig>` の具体値（4レベル分）

**分析結果:**
Phase 1 は「リスクレベルの概念定義（何段階あるか、autoDeny の概念）」を記述している。Phase 2 は「PermissionDialog の表示制御に必要な実装レベルの型定義（dialogWidth, headerColorToken 等 UI 固有フィールド）」を追加している。Phase 1 には `headerColorToken` や `dialogWidth` という実装詳細は存在しない。

**判定: REFINEMENT（段階的詳細化）**

Phase 2 は Phase 1 の 4 段階概念を型として形式化し、UI 実装に必要な詳細（色トークン・ダイアログ幅）を追加した。集約不要。

---

### ペア 2: リスクレベル4段階の判定基準

| 項目                           | 内容                                           |
| ------------------------------ | ---------------------------------------------- |
| 正本ファイル（Phase 1 が正本） | `outputs/phase-1/risk-level-classification.md` |
| 重複疑い箇所（Phase 2）        | `outputs/phase-2/risk-level-design.md`         |

**Phase 1 の記述内容（risk-level-classification.md）:**

- セクション 1: `critical` / `high` / `medium` / `low` の意味（「システム破壊」「権限昇格」「影響範囲限定」「読み取り専用」）
- セクション 2: BASH_COMMANDS 危険パターン 24 件の判定根拠
- セクション 3: PROTECTED_PATHS 25 件の判定根拠

**Phase 2 の記述内容（risk-level-design.md）:**

- セクション 3.1「設計判断の根拠」テーブル: 各リスクレベルで `allowApproveOnce` / `allowPermanent` / `autoDenyDefault` をそのように設定した理由を記述
- 4 段階の意味自体の再定義はない

**分析結果:**
Phase 1 がリスクレベルの意味・判定基準（正本）を定義しており、Phase 2 はその判定基準を前提として PermissionDialog の表示設定の「設計根拠」を補足している。Phase 2 はリスクレベルの判定基準自体を再定義していない（セクション 3.1 は「なぜ `allowPermanent=false` にしたか」の設計根拠であり、判定基準ではない）。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 が判定基準の正本。Phase 2 はその結果を参照して表示制御設定の根拠を記述している。集約不要。

---

### ペア 3: AllowedToolEntryV2 型定義

| 項目                    | 内容                                               |
| ----------------------- | -------------------------------------------------- |
| 正本ファイル（Phase 2） | `outputs/phase-2/permission-persistence-design.md` |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/approval-history-policy.md`       |

**Phase 1 の記述内容（approval-history-policy.md）:**

- セクション 4「AllowedToolEntryV2 拡張プレビュー」: `interface AllowedToolEntryV2 extends AllowedToolEntry` のプレビュー定義（`expiresAt?: number`, `skillName?: string`, `expiryPolicy?: ExpiryPolicy` の 3 フィールド追加）
- タイトルに「プレビュー、Phase 2 で正式設計」と明記

**Phase 2 の記述内容（permission-persistence-design.md）:**

- セクション 2「AllowedToolEntry 拡張型定義」: `interface AllowedToolEntryV2 extends AllowedToolEntry` の正式定義（同一の 3 フィールド追加）
- フィールド仕様の詳細表（デフォルト値・説明を追加）
- 後方互換性設計（マイグレーション）

**分析結果:**
Phase 1 は「Phase 2 で正式設計する」と明記した上でプレビューとして型を示している。Phase 2 が正式な型定義として確定させており、フィールドの仕様詳細（デフォルト値・スコープ説明）が追加されている。フィールドの構造は同一だが、Phase 1 は意図的にプレビューとして記述している。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 は「これが Phase 2 で正式定義される型の予告」として記述。Phase 2 が正本。集約不要。

---

### ペア 4: 失効ポリシー4種テーブル

| 項目                    | 内容                                               |
| ----------------------- | -------------------------------------------------- |
| 正本ファイル（Phase 2） | `outputs/phase-2/permission-persistence-design.md` |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/approval-history-policy.md`       |

**Phase 1 の記述内容（approval-history-policy.md）:**

- セクション 5「失効ポリシー定義（4種）」: `session` / `time_24h` / `time_7d` / `permanent` の意味・説明・`expiresAt` 計算式

**Phase 2 の記述内容（permission-persistence-design.md）:**

- セクション 3「失効ポリシー4種の定義」: 同じ 4 種について「適用条件」「electron-store 書き込み」「値」列を追加した拡張テーブル
- `computeExpiresAt` 関数の疑似コード
- ポリシーとリスクレベルの組み合わせ制約テーブル（新規）

**分析結果:**
Phase 1 は失効ポリシーの概念定義と `expiresAt` 計算式の基本を定義している。Phase 2 は「どの操作（PermissionDialog / 設定画面）で各ポリシーが選択されるか」「electron-store に書き込むか否か」「リスクレベルとの組み合わせ制約」という実装レベルの詳細を追加している。4 種のポリシー名は共通だが、記述の詳細度が異なる。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 が概念定義、Phase 2 が実装制約・選択トリガーを追加。集約不要。

---

### ペア 5: SafetyGatePort インターフェース

| 項目                    | 内容                                       |
| ----------------------- | ------------------------------------------ |
| 正本ファイル（Phase 2） | `outputs/phase-2/safety-gate-contract.md`  |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/skill-safety-contract.md` |

**Phase 1 の記述内容（skill-safety-contract.md）:**

- セクション 2「SafetyGatePort インターフェース」:
  ```typescript
  interface SafetyGatePort {
    evaluate(skillName: string): Promise<SafetyGateResult>;
  }
  ```
  非同期の理由・引数バリデーション条件・details 要素数保証を記述

**Phase 2 の記述内容（safety-gate-contract.md）:**

- セクション 2 の型定義:
  ```typescript
  export interface SafetyGatePort {
    evaluate(skillName: string): Promise<SafetyGateResult>;
  }
  ```
  JSDoc コメントを追加（引数バリデーションの注意、エラーケース 2 種）

**分析結果:**
シグネチャが完全に一致している（`evaluate(skillName: string): Promise<SafetyGateResult>`）。Phase 2 は `export` キーワードと JSDoc コメントを追加しているが、インターフェース本体は同一。Phase 1 が概念として定義し、Phase 2 が `packages/shared/src/types/safety-gate.ts` への配置先・`export` 宣言を確定させた形。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 がインターフェース概念を定義し、Phase 2 がモジュール配置・JSDoc を確定。構造は意図的な詳細化。集約不要。

---

### ペア 6: 安全性チェックルール5件

| 項目                    | 内容                                       |
| ----------------------- | ------------------------------------------ |
| 正本ファイル（Phase 2） | `outputs/phase-2/safety-gate-contract.md`  |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/skill-safety-contract.md` |

**Phase 1 の記述内容（skill-safety-contract.md）:**

- セクション 5「SafetyCheckId 5種とチェック定義」テーブル: 5 チェック ID・条件式・結果グレードを定義（`passed: boolean` / `grade: SafetyGrade` の 2 フィールドで結果を記述）

**Phase 2 の記述内容（safety-gate-contract.md）:**

- セクション 3「安全性チェックルール5件」テーブル: 同じ 5 チェックを `status: "passed" | "warned" | "blocked"` という 3 値で表現（Phase 1 の `passed: boolean` + `grade: SafetyGrade` の 2 フィールドを 1 フィールドに統合）
- `SafetyCheckDetail` の構造変更: Phase 1 では `passed: boolean` + `grade: SafetyGrade` の 2 フィールド、Phase 2 では `status: "passed" | "warned" | "blocked"` の 1 フィールドに統合
- メッセージテンプレートが具体化された（Phase 1 は `message: string` の説明のみ、Phase 2 は実際のテンプレート文字列を定義）

**分析結果:**
5 チェックルールの判定条件（条件式）は同一だが、Phase 2 は `SafetyCheckDetail` 型の設計を変更している（`passed: boolean` + `grade` → `status` 単一フィールドへの統合）。これは Phase 2 での設計上の改良（型のシンプル化）であり、Phase 1 の要件を破壊していない。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 の概念（5チェック・条件式）を維持しつつ、Phase 2 が型設計を改良（`status` への統合）。正常な段階的詳細化。集約不要。ただし `SafetyCheckDetail` の型定義は Phase 2 の `status` フィールド仕様（`"passed" | "warned" | "blocked"`）が正本となる点を Phase 5 実装担当者が認識すること。

---

### ペア 7: abort/skip/retry フロー

| 項目                    | 内容                                       |
| ----------------------- | ------------------------------------------ |
| 正本ファイル（Phase 2） | `outputs/phase-2/abort-fallback-design.md` |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/permission-state-flow.md` |

**Phase 1 の記述内容（permission-state-flow.md）:**

- セクション 6「abort フロー（4ステップ）」: `cancelAll()` → `sessionEntries削除` → `ログ記録` → `IPC送信` の 4 ステップ
- セクション 3「状態遷移条件詳細」: `approved_once` の消失条件として abort 時の `PermissionResolver.cancelAll()` を記述

**Phase 2 の記述内容（abort-fallback-design.md）:**

- セクション 3「3フロー詳細定義」: abort (1) / skip (2) / retry (3) の 3 フローを定義（Phase 1 に skip と retry は存在しない）
- セクション 4「abort 時クリーンアップ契約（4ステップ）」: Phase 1 の 4 ステップを TypeScript 疑似コードで詳細化
- セクション 5「retry フローの制約」: 新規（最大 3 回・カウンター管理等）
- セクション 6「skip フローの制約」: 新規（`requiredTools` 判定・`SkillPermissionResponseExtended` 型）

**分析結果:**
abort フロー（4ステップ）は Phase 1 と Phase 2 の両方に存在するが、Phase 2 は疑似コードと事前・事後条件で詳細化している。skip フローと retry フローは Phase 2 で新規追加された概念であり、Phase 1 には記述がない。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 が abort フローの概念を定義し、Phase 2 がコードレベルの詳細（疑似コード・事前事後条件）と、skip/retry の新規フローを追加。集約不要。

---

### ペア 8: INS-01〜INS-03 挿入点

| 項目                    | 内容                                              |
| ----------------------- | ------------------------------------------------- |
| 正本ファイル（Phase 2） | `outputs/phase-2/accountability-ui-design.md`     |
| 重複疑い箇所（Phase 1） | `outputs/phase-1/accountability-insertion-map.md` |

**Phase 1 の記述内容（accountability-insertion-map.md）:**

- セクション 1「挿入ポイント一覧」テーブル: INS-01 / INS-02 / INS-03 の挿入先・表示条件・挿入物の種類を記述
- セクション 2-4: 各 INS の表示条件関数・表示内容の概要
- セクション 5「ScoringGate × RiskLevel 16パターンマトリクス」: 条件マトリクスと優先順位関数

**Phase 2 の記述内容（accountability-ui-design.md）:**

- セクション 2「挿入点 Topology 表」: INS-01 / INS-02 / INS-03 の挿入点を再掲（同一構造）
- セクション 3-5: 各 INS のワイヤーフレーム・詳細な条件式・`computeINS01State` / `computeINS03State` 関数の完全実装
- セクション 7「ScoringGate x maxRiskLevel 組合せマトリクス（4x4 = 16パターン）」: Phase 1 マトリクスを再掲し SafetyGrade 上書きルールを追加
- セクション 8「PermissionDialog 説明責任テキスト挿入ルール」: 新規（Phase 1 に対応する記述なし）

**分析結果:**
INS-01〜INS-03 の挿入点定義は Phase 1 と Phase 2 の両方に存在するが、Phase 1 は概要テーブルと基本条件式のみ、Phase 2 はワイヤーフレーム・完全な TypeScript 関数・SafetyGrade 上書きルールを追加している。16 パターンマトリクスは実質的に同一だが、Phase 2 が SafetyGrade 上書き規則を追加している点で拡張されている。

**判定: REFINEMENT（段階的詳細化）**

Phase 1 が挿入点の概念・基本条件を定義し、Phase 2 がワイヤーフレーム・完全な実装可能な関数・上書き規則を追加。集約不要。

---

## 3. 集約が必要なペアの詳細

**全 8 ペアにおいて DUPLICATE 判定はゼロ。集約は不要。**

---

## 4. 結論

| ペア # | 定義内容                        | 判定       | 対応                                     |
| ------ | ------------------------------- | ---------- | ---------------------------------------- |
| 1      | ToolRiskConfig 型定義           | REFINEMENT | 集約不要                                 |
| 2      | リスクレベル4段階の判定基準     | REFINEMENT | 集約不要                                 |
| 3      | AllowedToolEntryV2 型定義       | REFINEMENT | 集約不要                                 |
| 4      | 失効ポリシー4種テーブル         | REFINEMENT | 集約不要                                 |
| 5      | SafetyGatePort インターフェース | REFINEMENT | 集約不要                                 |
| 6      | 安全性チェックルール5件         | REFINEMENT | 集約不要（Phase 2 の `status` 型が正本） |
| 7      | abort/skip/retry フロー         | REFINEMENT | 集約不要                                 |
| 8      | INS-01〜INS-03 挿入点           | REFINEMENT | 集約不要                                 |

Phase 1-2 成果物 10 ファイルは、「要件定義 → 詳細設計」の段階的詳細化プロセスの正常な産物として記述されており、意図しない重複は存在しない。

**実装担当者への注意事項（Phase 5 向け）:**

- ペア 6: `SafetyCheckDetail.passed: boolean` (Phase 1) は廃止。Phase 2 の `status: "passed" | "warned" | "blocked"` を使用すること。
- ペア 3: `AllowedToolEntryV2` は Phase 2 `permission-persistence-design.md` が正本。Phase 1 の「拡張プレビュー」は参考情報。
- ペア 5: `SafetyGatePort` の配置先は Phase 2 指定の `packages/shared/src/types/safety-gate.ts`。
