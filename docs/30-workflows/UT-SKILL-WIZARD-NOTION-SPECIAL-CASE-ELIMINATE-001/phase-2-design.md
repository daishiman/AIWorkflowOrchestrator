# Phase 2: 設計

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 2                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

3つの設計オプションを比較・評価し、採用オプションを決定した上で、
型定義・`resolveLabelEntry()` 追加・`createQuestionAnswer()` 変更の詳細設計を確定する。

## 実行タスク

- 設計オプション比較: Option 1〜3 の利点・欠点を評価
- 採用オプション決定: 理由を明示して1つに絞り込む
- 型定義の変更設計: `QuestionSemanticLabelMap` の拡張方針を確定
- `resolveLabelEntry()` の追加設計: 戻り値型・ロジック変更
- `createQuestionAnswer()` の変更設計: 特別ケース削除後の呼び出し修正
- 検証マトリクス: テスト対象コマンド一覧の定義

## 参照資料

| 資料名                       | パス                                                                          | 用途                     |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物               | `outputs/phase-1/requirements-definition.md`                                  | 要件・AC参照             |
| skill-wizard-label-map.ts    | `packages/shared/src/types/skill-wizard-label-map.ts`                         | 現行型定義・関数確認     |
| ConversationRoundStep.tsx    | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 変更箇所確認             |
| aiworkflow-requirements refs | `.claude/skills/aiworkflow-requirements/references/`                          | プロジェクト共通仕様参照 |

## 実行手順

### 1. 設計オプション比較

Issue #2089 で挙げられた3つのオプションを評価する。

#### Option 1: `QuestionSemanticLabelMap` の値型を `string | { label: string; freeText?: string }` に拡張

```typescript
// 拡張後の型定義
export type SemanticLabelEntry = string | { label: string; freeText?: string };
export type QuestionSemanticLabelMap = Record<string, Record<string, SemanticLabelEntry>>;

// SEMANTIC_LABEL_MAP の q5 エントリ変更
q5: {
  slack: "Slack",
  github: "GitHub",
  notion: { label: "その他", freeText: "Notion" },
},
```

| 評価軸                   | 評価                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| 後方互換性               | 既存のstring値はそのまま使用可能（union型で吸収）                  |
| 型の複雑さ               | 呼び出し元で `typeof entry === "string"` 分岐が必要                |
| SEMANTIC_LABEL_MAP       | 変更最小（q5.notion のみ変更）                                     |
| resolveSemanticLabel変更 | 戻り値を `{ label, freeText? }` に統一するか、内部分岐で吸収するか |

#### Option 2: `freeText` マッピングを別テーブル（`FREE_TEXT_MAP`）で管理

```typescript
// 新しい freeText マッピングテーブル
export const FREE_TEXT_MAP: Record<string, Record<string, string>> = {
  q5: { notion: "Notion" },
};

// 呼び出し元での参照
const label = resolveSemanticLabel(value, questionId);
const freeText = FREE_TEXT_MAP[questionId]?.[normalizedKey] ?? "";
```

| 評価軸           | 評価                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 後方互換性       | `resolveSemanticLabel()` の変更不要・完全互換                    |
| 型の複雑さ       | 単純（既存型を変更しない）                                       |
| 変換ロジック分散 | `FREE_TEXT_MAP` と `SEMANTIC_LABEL_MAP` の2テーブル管理が必要    |
| 拡張性           | 将来 freeText 付き変換が増えた場合に両テーブルを更新する必要あり |

#### Option 3: `resolveLabelEntry()` を追加し、`{ label, freeText? }` オブジェクトを返すよう拡張

```typescript
export type SemanticLabelResult = { label: string; freeText?: string };

export function resolveLabelEntry(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): SemanticLabelResult | undefined {
  if (value === undefined) return undefined;
  const questionMap = labelMap[questionId];
  if (!questionMap) return { label: value };
  const entry = questionMap[value];
  if (entry === undefined) return { label: value };
  return typeof entry === "string" ? { label: entry } : entry;
}

export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  return resolveLabelEntry(value, questionId, labelMap)?.label;
}
```

| 評価軸             | 評価                                                             |
| ------------------ | ---------------------------------------------------------------- |
| 後方互換性         | `resolveSemanticLabel()` の既存契約を維持できる                  |
| 型の明確さ         | `resolveLabelEntry()` が `{ label, freeText? }` を一元返却する   |
| 変換ロジック一元化 | `SEMANTIC_LABEL_MAP` だけで `label` と `freeText` を一元管理可能 |
| テスト容易性       | shared 層のユニットテストで notion 変換を完全にカバーできる      |

### 2. 採用オプション決定

**採用: Option 3**（`resolveLabelEntry()` を追加し、`resolveSemanticLabel()` は既存契約を維持）

**理由**:

1. **後方互換性の維持**: `resolveSemanticLabel()` の既存文字列契約を壊さずに済む
2. **責務分離**: `resolveSemanticLabel()` は純粋なラベル正規化、`resolveLabelEntry()` は freeText 付きの回答組み立て前処理に分けられる
3. **テスト容易性**: shared 層のユニットテストで helper と既存関数を別々に検証できる
4. **拡張性**: 将来 freeText 付き変換が増えても `SEMANTIC_LABEL_MAP` と helper の対応だけで広げやすい
5. **最小変更**: `ConversationRoundStep.tsx` の特殊分岐だけを helper 呼び出しへ置換できる

> 注意: `resolveSemanticLabel()` は既存呼び出し元のために維持し、`freeText` が必要な経路だけ `resolveLabelEntry()` を使う。

### 3. 型定義の変更設計

#### 3-1. `SemanticLabelEntry` 型の新設

```typescript
/**
 * SEMANTIC_LABEL_MAP の値型。
 * - string: ラベルのみの変換（freeText なし）
 * - { label, freeText? }: ラベル + オプションの freeText 付き変換
 */
export type SemanticLabelEntry = string | { label: string; freeText?: string };
```

#### 3-2. `QuestionSemanticLabelMap` 型の変更

```typescript
// 変更前
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

// 変更後
export type QuestionSemanticLabelMap = Record<
  string,
  Record<string, SemanticLabelEntry>
>;
```

#### 3-3. `SemanticLabelResult` 型の新設（resolveLabelEntry 戻り値）

```typescript
/**
 * resolveLabelEntry() の戻り値型。
 * - label: UI 表示ラベル
 * - freeText: オプションの自由入力初期値（例: "Notion"）
 */
export type SemanticLabelResult = { label: string; freeText?: string };
```

#### 3-4. `SEMANTIC_LABEL_MAP` の q5 エントリ変更

```typescript
export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  q5: {
    slack: "Slack",
    github: "GitHub",
    notion: { label: "その他", freeText: "Notion" }, // 特別ケースをここに移管
  },
  q6: { 週次: "週に1回" },
};
```

### 4. `resolveSemanticLabel()` の変更設計

```typescript
/**
 * semantic default の rawValue を UI ラベルへ正規化する純粋関数。
 * freeText が必要な経路は resolveLabelEntry() を使う。
 *
 * @param value - 変換対象の raw 値（toLowerCase() 済みを推奨）
 * @param questionId - 質問ID（q1〜q6）
 * @param labelMap - 変換テーブル（省略時は SEMANTIC_LABEL_MAP を使用）
 * @returns UI ラベル文字列、または undefined（value が undefined の場合）
 *
 * @example
 * resolveSemanticLabel("自分だけ", "q1") // => "自分のみ"
 * resolveSemanticLabel("slack", "q5")    // => "Slack"
 * resolveSemanticLabel("notion", "q5")   // => "その他"
 * resolveSemanticLabel(undefined, "q1") // => undefined
 */
export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  return resolveLabelEntry(value, questionId, labelMap)?.label;
}
```

**変更点**:

- 戻り値型: `string | undefined` を維持
- value が undefined: `undefined` を返す（変更なし）
- マッピングなし: `resolveLabelEntry()` が `{ label: value }` を返し、`resolveSemanticLabel()` は `value` を返す
- string エントリ: `resolveLabelEntry()` が `{ label: entry }` を返し、`resolveSemanticLabel()` は `entry` を返す
- オブジェクトエントリ: `resolveLabelEntry()` が `entry`（`{ label, freeText? }`）を返し、`resolveSemanticLabel()` は `label` を返す

### 5. `createQuestionAnswer()` の変更設計

`ConversationRoundStep.tsx` の変更前後:

```typescript
// 変更前
function createQuestionAnswer(
  rawValue: string | undefined,
  options: string[],
  questionId: string,
): { selectedOptions: string[]; freeText: string } {
  if (!rawValue) {
    return { selectedOptions: [], freeText: "" };
  }
  const normalizedKey = rawValue.toLowerCase();

  const result = resolveLabelEntry(normalizedKey, questionId);
  const displayLabel = result?.label ?? normalizedKey;
  const freeText = result?.freeText ?? "";

  if (options.includes(displayLabel)) {
    return { selectedOptions: [displayLabel], freeText };
  }
  return { selectedOptions: [], freeText: freeText || displayLabel };
}

// 変更後
function createQuestionAnswer(
  rawValue: string | undefined,
  options: string[],
  questionId: string,
): { selectedOptions: string[]; freeText: string } {
  if (!rawValue) {
    return { selectedOptions: [], freeText: "" };
  }
  const normalizedKey = rawValue.toLowerCase();
  const result = resolveSemanticLabel(normalizedKey, questionId);
  const displayLabel = result?.label ?? normalizedKey;
  const freeText = result?.freeText ?? "";

  if (options.includes(displayLabel)) {
    return { selectedOptions: [displayLabel], freeText };
  }
  return { selectedOptions: [], freeText: freeText || displayLabel };
}
```

**変更点**:

- notion 特別ケース（L162〜L165）を削除
- `resolveLabelEntry()` の戻り値から `label` と `freeText` を取得
- `resolveSemanticLabel()` は既存呼び出し元のため string 契約を維持する

### 6. 影響範囲の調査コマンド

```bash
# resolveSemanticLabel の全呼び出し元を確認
grep -rn "resolveSemanticLabel" apps/ packages/

# 既存テストでの resolveSemanticLabel の使用確認
grep -rn "resolveSemanticLabel" packages/shared/src/types/__tests__/
```

### 7. 検証マトリクス

| テスト対象            | テストコマンド                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| shared ユニットテスト | `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts` |
| 型チェック            | `pnpm --filter @repo/shared typecheck`                                                          |
| desktop 型チェック    | `pnpm --filter @repo/desktop typecheck`                                                         |
| lint                  | `pnpm --filter @repo/shared lint`                                                               |

## 統合テスト連携【必須】

| 判定項目             | 基準 | 結果      |
| -------------------- | ---- | --------- |
| ユニットテストLine   | 80%+ | completed |
| ユニットテストBranch | 60%+ | completed |
| 型チェック           | PASS | completed |

## 多角的チェック観点

| 観点               | チェック内容                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| 後方互換性         | `resolveSemanticLabel()` の既存テスト・呼び出し元が戻り値変更後も正常動作するか |
| 型一貫性           | `SemanticLabelEntry` の union 型が TypeScript の型推論を妨げないか              |
| フォールバック挙動 | マッピングなしの値（未登録キー）が `{ label: value }` として正しく返るか        |
| ConversationRound  | notion 以外の変換（slack→Slack、github→GitHub）が変更後も同一動作するか         |

## 成果物

| 成果物 | パス                        | 説明                                            |
| ------ | --------------------------- | ----------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | オプション比較・採用決定・型/関数変更の詳細設計 |

## 完了条件

- [ ] 設計オプション（Option 1〜3）の比較評価が完了
- [ ] 採用オプション（Option 3）の決定理由が明示されている
- [ ] `SemanticLabelEntry` 型の定義が確定済み
- [ ] `QuestionSemanticLabelMap` 型の変更内容が確定済み
- [ ] `SemanticLabelResult` 型の定義が確定済み
- [ ] `SEMANTIC_LABEL_MAP` の q5.notion エントリ変更内容が確定済み
- [ ] `resolveSemanticLabel()` の変更前後のシグネチャ・ロジックが確定済み
- [ ] `createQuestionAnswer()` の変更前後のコードが確定済み
- [ ] 影響範囲（呼び出し元）の調査コマンドが定義済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 設計オプション比較（Option 1〜3）
2. 採用オプション決定（Option 3）と理由明示
3. 型定義変更設計（SemanticLabelEntry・QuestionSemanticLabelMap・SemanticLabelResult）
4. SEMANTIC_LABEL_MAP 変更設計（q5.notion）
5. resolveSemanticLabel() 変更設計
6. createQuestionAnswer() 変更設計
7. 影響範囲調査コマンド定義
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビュー
