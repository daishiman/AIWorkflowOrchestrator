# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 2                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 1（要件定義）                                   |
| 後続Phase  | Phase 3                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

Phase 1 で確定した受け入れ基準を実現するための型設計・アーキテクチャ設計を行う。
`QuestionSemanticLabelMap` の型構造と `@repo/shared` への配置設計を確定し、
Phase 4 TDD のレッドフェーズで使用するインターフェースを固定する。

---

## 実行タスク

### Task 1: 型設計 — QuestionSemanticLabelMap

`packages/shared/src/types/skill-wizard-label-map.ts` で定義する型を設計する。

**設計方針の選択肢:**

| 方針                  | 概要                                            | メリット                       | デメリット             |
| --------------------- | ----------------------------------------------- | ------------------------------ | ---------------------- |
| A. 設定テーブル外部化 | `Record<string, string>` の定数をファイルに分離 | シンプル・型定義が少ない       | 拡張性が限定的         |
| B. Option Registry    | `questionId → labelMap` のネスト構造            | q1〜qN の追加が容易            | 設計が複雑になりやすい |
| C. ハイブリッド       | 型は B、定数は A のフラット形式                 | 型安全性と運用コストのバランス | 2層管理が必要          |

**推奨:** Phase 1 インベントリ確認結果を踏まえて選択する。小規模タスク（q6 まで固定）のため A または C が現実的。

**型定義ドラフト（TypeScript）:**

```typescript
// packages/shared/src/types/skill-wizard-label-map.ts

/**
 * 質問IDと semantic default 値の UI ラベルへのマッピング。
 * questionId → (rawValue → displayLabel) の2段階構造。
 */
export type QuestionSemanticLabelMap = {
  [questionId: string]: {
    [rawValue: string]: string;
  };
};

/**
 * inferSmartDefaults() の返り値を UI ラベルへ変換する正準マッピング定数。
 * 各 questionId と rawValue → displayLabel の変換テーブル。
 */
export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  // q1 〜 q6 の全エントリは Phase 1 インベントリ確認後に確定する
  // 例:
  // q5: { "自分だけ": "自分のみ", "チームで": "チームで共有" },
  // q6: { "毎日": "毎日", "週次": "週に1回" },
};
```

> **注意:** 実際のエントリ値は Phase 1 Task 1 で抽出した `resolveSemanticLabel()` の変換テーブルから転記する。

### Task 2: @repo/shared へのエクスポート設計

**配置先:** `packages/shared/src/types/skill-wizard-label-map.ts`

**エクスポート方針:**

- `packages/shared/index.ts` の barrel export に追加するか
- subpath export `@repo/shared/types/skillWizard` に閉じるか を選択する

> **[Feedback W0-01 適用]** 既存 root barrel に追加すると `SkillCategory` 等との名前衝突リスクがある。
> **推奨:** subpath export に閉じ、`packages/shared/package.json` の `exports` フィールドに追加する。
> 併せて `typesVersions` も同じキーで更新し、TypeScript の型解決を一致させる。

```json
// packages/shared/package.json (exports 追加例)
{
  "exports": {
    ".": "./src/index.ts",
    "./types/skillWizard": "./src/types/skill-wizard-label-map.ts"
  }
}
```

### Task 3: ConversationRoundStep.tsx 改修設計

**改修方針:**

```
Before:
  ConversationRoundStep.tsx
    └─ resolveSemanticLabel(value, questionId)
         └─ ハードコードテーブル (q1-q6 全エントリ)

After:
  ConversationRoundStep.tsx
    └─ resolveSemanticLabel(value, questionId, labelMap?)
         └─ SEMANTIC_LABEL_MAP からルックアップ
              └─ フォールバック: value をそのまま返す
```

**シグネチャ変更案（後方互換を保つ）:**

```typescript
// After: shared マッピング参照
import { SEMANTIC_LABEL_MAP } from "@repo/shared/types/skillWizard";

function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  if (!value) return undefined;
  return labelMap[questionId]?.[value] ?? value;
}
```

> **後方互換:** `labelMap` はデフォルト引数で既存呼び出しを壊さない。
> テスト時には `labelMap` を差し替えることで DI テストが容易になる。

### Task 4: テスト戦略設計

**テスト対象:** `applySmartDefaults()` と `resolveSemanticLabel()`

**テストファイル配置案:**

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`（新規または既存に追記）

**テストマトリクス（Phase 4 で詳細化）:**

| TC番号 | テストカテゴリ             | 対象関数             |
| ------ | -------------------------- | -------------------- |
| TC-01  | 正常変換（q5）             | resolveSemanticLabel |
| TC-02  | 正常変換（q6）             | resolveSemanticLabel |
| TC-03  | 異形入力（自分だけ）       | resolveSemanticLabel |
| TC-04  | 英語入力                   | resolveSemanticLabel |
| TC-05  | undefined 入力             | resolveSemanticLabel |
| TC-06  | 未定義 questionId          | resolveSemanticLabel |
| TC-07  | フォールバック確認         | resolveSemanticLabel |
| TC-08  | applySmartDefaults 全体    | applySmartDefaults   |
| TC-09  | DI テスト（labelMap 差替） | resolveSemanticLabel |
| TC-10  | 回帰テスト（既存動作）     | applySmartDefaults   |

**private method テスト方針:**

> [Feedback P0-09-U1-1] `resolveSemanticLabel` が private の場合は
> **public API 経由（`applySmartDefaults` から間接的に検証）を採用する**。
> キャスト経由テストは使用しない。

### Task 5: 依存整合マトリクス

| コンポーネント               | 依存先                              | 変更影響                     |
| ---------------------------- | ----------------------------------- | ---------------------------- |
| ConversationRoundStep        | @repo/shared/types/skillWizard      | 新規依存（ビルド影響を確認） |
| packages/shared              | なし（新規ファイル追加のみ）        | barrel 変更有無を確認        |
| SkillWizard 他コンポーネント | ConversationRoundStep の public API | シグネチャ不変のため影響なし |

---

## 参照資料

| 資料名                | パス                                                                          | 用途                    |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------- |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 改修前の実装確認        |
| shared package.json   | `packages/shared/package.json`                                                | exports フィールド確認  |
| shared src/index.ts   | `packages/shared/index.ts`                                                    | barrel エクスポート確認 |
| Phase 1 成果物        | `outputs/phase-1/requirements-definition.md`                                  | 確定した変換テーブル    |

---

## 統合テスト連携

- Phase 4 で `resolveSemanticLabel(value, questionId, labelMap)` のシグネチャを使う
- Phase 5 で `SEMANTIC_LABEL_MAP` に Phase 1 抽出の全エントリを転記する
- Phase 9 で `pnpm --filter @repo/shared build` の通過を確認する

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                     |
| ------------ | ------------------------------------------------------------ |
| システム思考 | packages/shared ビルドが desktop 側に影響しないか            |
| 逆説思考     | shared 型を subpath に閉じることで import が煩雑にならないか |
| 価値提案思考 | 将来の q7〜qN 追加時にこの設計で本当に管理コストが下がるか   |
| トレードオン | デフォルト引数による後方互換 vs 全呼び出し箇所の明示的更新   |

---

## 成果物

| 成果物名           | パス                                               | 必須 |
| ------------------ | -------------------------------------------------- | ---- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | ✅   |
| 型設計書           | `outputs/phase-2/type-design.md`                   | ✅   |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | ✅   |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | ✅   |

---

## 完了条件

- [ ] `QuestionSemanticLabelMap` 型の構造が確定している
- [ ] `SEMANTIC_LABEL_MAP` 定数の配置先が決定されている
- [ ] subpath export か barrel export かの方針が決定されている
- [ ] `resolveSemanticLabel()` の新シグネチャ（DI 対応）が設計されている
- [ ] テストマトリクス（TC-01〜TC-10 以上）のカテゴリが整理されている
- [ ] private method テスト方針（public API 経由）が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1: 型設計 ✅
- [ ] Task 2: エクスポート設計 ✅
- [ ] Task 3: ConversationRoundStep 改修設計 ✅
- [ ] Task 4: テスト戦略設計 ✅
- [ ] Task 5: 依存整合マトリクス ✅
- [ ] 全成果物が `outputs/phase-2/` に保存されていること ✅

---

## 次Phase

完了後 → **Phase 3: 設計レビュー**（`phase-3-design-review.md`）へ進む。
