# Phase 5: 実装（TDD グリーンフェーズ）

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 5                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 4（テスト作成）                                 |
| 後続Phase  | Phase 6                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

Phase 4 で FAIL した全テストを PASS にする実装を行う（TDD グリーンフェーズ）。
`resolveSemanticLabel()` の変換テーブルを `@repo/shared` に外部化し、
`ConversationRoundStep.tsx` から shared マッピングを参照する構造へ移行する。
実装完了後に全テストが PASS することと型チェックが通過することを確認する。

---

## 実装計画

変更するファイルを以下に一覧する。実装はこの順序で行うこと（依存関係の上流から下流へ）。

| 変更種別 | ファイルパス                                                                  | 内容                                                      |
| -------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| 新規作成 | `packages/shared/src/types/skill-wizard-label-map.ts`                         | `QuestionSemanticLabelMap` 型と `SEMANTIC_LABEL_MAP` 定数 |
| 修正     | `packages/shared/src/types/index.ts`                                          | `QuestionSemanticLabelMap` などの barrel 再公開           |
| 修正     | `packages/shared/package.json`                                                | subpath export `@repo/shared/types/skillWizard` の追加    |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | shared 参照への変更・ハードコードテーブルの削除           |

---

## 実行タスク

### Task 1: skill-wizard-label-map.ts の実装

`packages/shared/src/types/skill-wizard-label-map.ts` を新規作成する。

**実装内容:**

1. `QuestionSemanticLabelMap` 型定義
2. `SEMANTIC_LABEL_MAP` 定数（Phase 1 Task 1 の成果物から転記）

**型定義:**

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
 * エントリは ConversationRoundStep.tsx の resolveSemanticLabel() から移植。
 */
export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  // NOTE: 実際のエントリは Phase 1 Task 1 の成果物から転記すること。
  // 以下は設計ドラフト（確認済み後に正式値に置き換える）
  // q5: { "自分だけ": "自分のみ", ... },
  // q6: { "毎日": "毎日", "週次": "週に1回", ... },
};
```

> **[NOTE]** `SEMANTIC_LABEL_MAP` の実際のエントリ値は
> `outputs/phase-1/requirements-definition.md` に記録された
> `resolveSemanticLabel()` の変換テーブルから転記すること。
> ドラフトのままリリースしないよう注意する。

**確認コマンド:**

```bash
# ファイルが作成されていることを確認
ls packages/shared/src/types/skill-wizard-label-map.ts

# TypeScript 構文エラーがないことを確認
pnpm --filter @repo/shared typecheck
```

---

### Task 2: packages/shared へのエクスポート設定

`@repo/shared/types/skillWizard` として subpath export を追加する。

**packages/shared/package.json の exports フィールドに追加:**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./types/skillWizard": {
      "types": "./dist/types/skill-wizard-label-map.d.ts",
      "import": "./dist/types/skill-wizard-label-map.js",
      "require": "./dist/types/skill-wizard-label-map.cjs"
    }
  }
}
```

> **補足:** `packages/shared/package.json` では `exports` と同時に `typesVersions` も更新する。
> `@repo/shared/types/skillWizard` の型解決が package.json / TypeScript の両方で一致していることを前提にする。

> **[Feedback W0-01 適用]** 既存 root barrel への追加は `SkillCategory` 等との名前衝突リスクがあるため、
> subpath export に閉じる方針を採用する。root barrel（`packages/shared/index.ts`）は変更しない。
> ただし `packages/shared/src/types/index.ts` は shared types の barrel として更新し、
> `@repo/shared` / `@repo/shared/types` からも新シンボルを再公開する。

**ビルド・エクスポート確認コマンド:**

```bash
# shared をビルドして型定義ファイルが生成されることを確認
pnpm --filter @repo/shared build

# subpath export が解決できることを確認
node -e "require('@repo/shared/types/skillWizard')" 2>&1 || echo "ESM の場合は import で確認"

# 型定義ファイルの存在確認
ls packages/shared/dist/types/skill-wizard-label-map.d.ts
```

**ビルド失敗時の対処:**

| エラー種別                          | 対処方法                                                        |
| ----------------------------------- | --------------------------------------------------------------- |
| `dist/` ディレクトリが存在しない    | `pnpm --filter @repo/shared build` を再実行                     |
| `tsconfig.json` の include に未追加 | `packages/shared/tsconfig.json` の `include` に型ファイルを追加 |
| `typesVersions` に未追加            | `packages/shared/package.json` の `typesVersions` を更新        |
| subpath export が解決できない       | `package.json` の `exports` フィールドのパスを確認・修正        |

---

### Task 3: ConversationRoundStep.tsx の改修

既存の `resolveSemanticLabel()` を shared マッピング参照へ変更する。

**変更内容:**

1. `@repo/shared/types/skillWizard` からの import 追加
2. `resolveSemanticLabel()` のシグネチャをデフォルト引数方式に変更
3. 関数内のハードコードテーブルを `SEMANTIC_LABEL_MAP` 参照に置き換え
4. 旧ハードコードテーブルの削除

**新しい resolveSemanticLabel() シグネチャ:**

```typescript
import {
  QuestionSemanticLabelMap,
  SEMANTIC_LABEL_MAP,
} from "@repo/shared/types/skillWizard";

/**
 * semantic default の rawValue を UI ラベルへ正規化する。
 * @param value - 変換対象の raw 値
 * @param questionId - 質問ID（q1〜q6）
 * @param labelMap - 変換テーブル（省略時は SEMANTIC_LABEL_MAP を使用）
 * @returns 正規化後の UI ラベル、または undefined（value が undefined の場合）
 */
function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  if (value === undefined) return undefined;
  const questionMap = labelMap[questionId];
  if (!questionMap) return value; // フォールバック: 未定義 questionId はそのまま返す
  return questionMap[value] ?? value; // フォールバック: 未定義 rawValue はそのまま返す
}
```

**削除対象（旧ハードコードテーブル）:**

```typescript
// 以下のような形式のハードコード定義を削除する
// （実際のコードは Phase 1 Task 1 の成果物を参照）
// const Q5_LABEL_MAP = { "自分だけ": "自分のみ", ... };
// const Q6_LABEL_MAP = { "週次": "週に1回", ... };
```

**確認コマンド:**

```bash
# ConversationRoundStep.tsx に旧ハードコードテーブルが残っていないことを確認
grep -n "自分だけ\|週次" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
# → 0件であること（全て SEMANTIC_LABEL_MAP に移動済み）

# import が正しく追加されていることを確認
grep -n "skill-wizard-label-map\|skillWizard" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

---

### Task 4: グリーン確認

全テストが PASS し、型チェックが通過することを確認する。

```bash
# テスト実行（全件 PASS を確認）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx 2>&1 | tee outputs/phase-5/green-test-result.log

# 全件 PASS の確認
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx 2>&1 | grep -E "Tests|FAIL|PASS|×|✓"

# 型チェック（desktop パッケージ）
pnpm --filter @repo/desktop typecheck 2>&1 | tee outputs/phase-5/typecheck-result.log

# 型チェック（shared パッケージ）
pnpm --filter @repo/shared typecheck 2>&1 | tee -a outputs/phase-5/typecheck-result.log

# shared ビルド最終確認
pnpm --filter @repo/shared build
```

**グリーン確認基準:**

| 確認項目                                                                                                                    | 期待結果                  |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 12件以上 PASS、0件 FAIL   |
| `pnpm --filter @repo/desktop typecheck`                                                                                     | 型エラー 0件              |
| `pnpm --filter @repo/shared typecheck`                                                                                      | 型エラー 0件              |
| `pnpm --filter @repo/shared build`                                                                                          | ビルド成功（exit code 0） |
| `ConversationRoundStep.tsx` にハードコードテーブルなし                                                                      | grep で 0件確認           |

**グリーン達成できない場合の対処:**

| 症状                           | 対処方法                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| TC-07（DI テスト）が FAIL      | `resolveSemanticLabel()` の第3引数のデフォルト引数を確認      |
| TC-12（import テスト）が FAIL  | `package.json` の subpath export 設定を再確認                 |
| TC-01〜03（変換テスト）が FAIL | `SEMANTIC_LABEL_MAP` のエントリが正しく転記されているか確認   |
| 型エラー: `Cannot find module` | `pnpm --filter @repo/shared build` を再実行してから型チェック |

---

## canUseTool 適用範囲

本タスクは SDK Hook 系タスク（`canUseTool` / Permission Control）**ではない**ため、
`canUseTool` の実装・設定変更は対象外（**N/A**）。

対象は純粋な TypeScript リファクタリングであり、IPC・Electron プロセス間通信への影響はない。

---

## 参照資料

| 資料名                       | パス                                                                          | 用途                     |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Phase 1 インベントリ         | `outputs/phase-1/requirements-definition.md`                                  | 変換テーブル転記元       |
| Phase 2 型設計書             | `outputs/phase-2/type-design.md`                                              | 型定義・シグネチャの確認 |
| Phase 4 テスト仕様書         | `outputs/phase-4/test-specification.md`                                       | 実装すべき振る舞いの確認 |
| Phase 4 Red 確認結果         | `outputs/phase-4/red-test-result.md`                                          | FAIL 件数・内容の確認    |
| ConversationRoundStep.tsx    | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 改修対象ファイル         |
| packages/shared/package.json | `packages/shared/package.json`                                                | exports 設定の確認       |

---

## 統合テスト連携

- Phase 5 で実装した `SEMANTIC_LABEL_MAP` は Phase 6（テスト拡充）で追加の境界値テストに使用する
- Phase 6 では異常系（空文字列・null・型違反）テストを追加し、本 Phase の基盤を強化する
- `resolveSemanticLabel()` の新シグネチャ（第3引数 `labelMap`）は Phase 6 でのモック DI テストに活用する
- `outputs/phase-5/changed-files.md` に変更ファイル一覧を記録し、Phase 9 品質保証の対象スコープとする

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 論点思考     | 実装の本質（ハードコード排除）が達成されているか。ファイルを分けただけでなく DI 可能な設計か           |
| システム思考 | `@repo/shared` → `@repo/desktop` の依存方向が正しく保たれているか。逆依存が生じていないか              |
| 価値提案思考 | 将来の入力元拡張（新しい semantic default プロバイダ）が `SEMANTIC_LABEL_MAP` の追記だけで対応できるか |
| 整合性確認   | Phase 4 テストマトリクスの TC-01〜TC-12 が全件 PASS していること（1件も例外なし）                      |
| リスク思考   | デフォルト引数による後方互換が保たれており、既存の呼び出し箇所が壊れていないか                         |
| 保守性確認   | `skill-wizard-label-map.ts` が将来の q7 以降の追加に対応できる構造か（Open/Closed 原則）               |

---

## 成果物

| 成果物名         | パス                                        | 必須 |
| ---------------- | ------------------------------------------- | ---- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | ✅   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | ✅   |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | ✅   |
| Green テスト結果 | `outputs/phase-5/green-test-result.log`     | ✅   |
| 型チェック結果   | `outputs/phase-5/typecheck-result.log`      | ✅   |

---

## 完了条件

- [ ] Task 1: `packages/shared/src/types/skill-wizard-label-map.ts` が作成されており、`QuestionSemanticLabelMap` 型と `SEMANTIC_LABEL_MAP` 定数が正しく定義されている
- [ ] Task 1: `SEMANTIC_LABEL_MAP` に Phase 1 インベントリの全エントリが転記されている（ドラフトのまま残っていない）
- [ ] Task 2: `packages/shared/package.json` に subpath export `@repo/shared/types/skillWizard` と `typesVersions` が追加されている
- [ ] Task 2: `pnpm --filter @repo/shared build` が成功している
- [ ] Task 3: `ConversationRoundStep.tsx` に `@repo/shared/types/skillWizard` からの import が追加されている
- [ ] Task 3: `resolveSemanticLabel()` が `(value, questionId, labelMap = SEMANTIC_LABEL_MAP)` のシグネチャになっている
- [ ] Task 3: 旧ハードコードテーブルが `ConversationRoundStep.tsx` から削除されている
- [ ] Task 4: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が12件以上 PASS、0件 FAIL
- [ ] Task 4: `pnpm --filter @repo/desktop typecheck` が型エラー 0件
- [ ] `outputs/phase-5/` 以下に全必須成果物が保存されている

## タスク100%実行確認【必須】

- [ ] Task 1: skill-wizard-label-map.ts の実装 ✅
- [ ] Task 2: packages/shared へのエクスポート設定 ✅
- [ ] Task 3: ConversationRoundStep.tsx の改修 ✅
- [ ] Task 4: グリーン確認（全 TC PASS・型チェック通過） ✅
- [ ] 全成果物が `outputs/phase-5/` に保存されていること ✅

---

## 次Phase

**Phase 6: テスト拡充**（`phase-6-test-expansion.md`）へ進む。

Phase 5 で PASS した基本テスト（TC-01〜TC-12）を基盤として、
異常系・境界値・追加シナリオのテストケースを Phase 6 で拡充する。
`outputs/phase-5/changed-files.md` を Phase 6 の参照資料として引き継ぐ。
