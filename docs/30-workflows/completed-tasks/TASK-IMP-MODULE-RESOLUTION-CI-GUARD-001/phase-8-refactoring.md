# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 8                                       |
| 名称       | リファクタリング（TDD: Refactor）       |
| 前提Phase  | Phase 7（カバレッジ確認 — 基準充足）    |
| 次Phase    | Phase 9（品質検証）                     |
| ステータス | completed                               |

## 目的

Phase 5〜7 で「テストを PASS させる」ことを最優先にした実装を、可読性・メンテナンス性・責務分離の観点で改善する。TDD の Refactor フェーズとして、全テストが PASS し続ける状態を維持しながらコードを整理する。

## 参照資料

| 資料                               | パス / リンク                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Phase 7 カバレッジ確認             | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-7-coverage-check.md`          |
| Phase 7 カバレッジレポート         | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-7/coverage-report.md` |
| Phase 5 実装（本体コード参照）     | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-5-implementation.md`          |
| Phase 6 テスト拡充                 | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-6-test-expansion.md`          |
| Phase 1 要件定義                   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-1-requirements.md`            |
| Phase 2 設計                       | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md`                  |
| コード品質ルール                   | `.claude/rules/02-code-quality.md`                                                             |
| 既知の落とし穴（P11: PostToolUse） | `.claude/rules/06-known-pitfalls.md#P11`                                                       |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: リファクタリング対象の特定

`scripts/check-shared-module-sync.ts` を以下の判断基準で精査し、リファクタリング対象を特定する。

#### 判断基準

| #   | 基準                                  | 該当した場合のアクション                   |
| --- | ------------------------------------- | ------------------------------------------ |
| 1   | 重複コード（2箇所以上の同一ロジック） | 共通関数に抽出する                         |
| 2   | 過度に長い関数（50行超）              | 責務ごとに分割する                         |
| 3   | マジックナンバー / マジックストリング | 名前付き定数に置換する                     |
| 4   | ハードコードされたファイルパス        | 定数として `CONFIG` オブジェクトに集約する |
| 5   | ハードコードされた正規表現パターン    | 名前付き定数として外部化する               |
| 6   | エラーメッセージの直書き              | テンプレート関数に統一する                 |
| 7   | 1つの関数に複数の責務が混在           | 関数を分割し、単一責務にする               |

### Task 2: 定数の外部化

ハードコードされた値を定数オブジェクトに集約する。

#### 2.1 ファイルパス定数

```typescript
const CONFIG = {
  PACKAGE_JSON_PATH: "packages/shared/package.json",
  TSCONFIG_PATH: "tsconfig.json",
  VITEST_CONFIG_PATH: "vitest.config.ts",
  SHARED_PREFIX: "@repo/shared",
} as const;
```

#### 2.2 正規表現パターン定数

```typescript
const PATTERNS = {
  VITEST_ALIAS:
    /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g,
  SUBPATH_PREFIX: /^\.\//,
} as const;
```

#### 2.3 チェック名定数

```typescript
const CHECK_NAMES = {
  EXPORTS_VS_PATHS: "exports → paths",
  PATHS_VS_EXPORTS: "paths → exports",
  EXPORTS_VS_ALIASES: "exports → aliases",
  ALIASES_VS_EXPORTS: "aliases → exports",
  EXPORTS_VS_TYPES_VERSIONS: "exports → typesVersions",
} as const;
```

### Task 3: エラーメッセージのテンプレート化

差分レポートで使用するメッセージを関数に統一する。

```typescript
function formatCheckLine(checkName: string, passed: boolean): string;
function formatMissingEntries(entries: string[]): string;
function formatSummaryLine(totalChecks: number, failedChecks: number): string;
function formatGuidance(): string;
```

### Task 4: 関数責務の分離確認

以下の責務が明確に分離されていることを確認する。

| 責務             | 対応する関数群                                             | 確認ポイント                                   |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| ファイル読み取り | parseExports, parsePaths, parseAliases, parseTypesVersions | 各関数が1つの設定ソースのみを担当している      |
| キー変換         | サブパスキー → paths/alias/typesVersions キー変換          | 変換ロジックが重複していない                   |
| 整合性チェック   | checkExportsVsPaths 等 5つのチェッカー関数                 | 各関数が1つのチェック方向のみを担当している    |
| レポート生成     | formatReport, printSummary                                 | レポート生成と出力が分離されている             |
| エントリポイント | main()                                                     | オーケストレーションのみ（ロジックを含まない） |

### Task 5: 共通変換ロジックの抽出

exports キーから各層のキーへの変換ロジックが複数のチェッカー関数に散在している場合、以下のヘルパー関数に抽出する。

```typescript
/** exports サブパスキーを paths/alias キーに変換: "." → "@repo/shared", "./xxx" → "@repo/shared/xxx" */
function toModuleKey(subpath: string): string;

/** exports サブパスキーを typesVersions キーに変換: "./xxx" → "xxx"（"./" 除去） */
function toTypesVersionsKey(subpath: string): string;

/** paths/alias キーを exports サブパスキーに逆変換: "@repo/shared" → ".", "@repo/shared/xxx" → "./xxx" */
function toSubpath(moduleKey: string): string;
```

### Task 6: リファクタリング後のテスト全 PASS 確認

リファクタリングの各ステップ後に、全テストが PASS することを確認する。

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

---

## リファクタリングの安全性ガード

### 原則

- リファクタリングは**外部振る舞い（テストの期待値）を変更しない**
- 各ステップの変更後に `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts` を実行し、全テスト PASS を確認する
- テストが失敗した場合、直前の変更を取り消し、変更を分割して再実施する

### P11 対策

Prettier / ESLint の自動修正がファイルを変更し、後続の Edit の文字列マッチが失敗する場合がある。リファクタリング中に大量の変更を行った場合は `git diff --stat` で変更ファイル数を確認する。

---

## 実行手順

1. `scripts/check-shared-module-sync.ts` の現在のコードを精査し、Task 1 の判断基準に基づいてリファクタリング対象を洗い出す
2. 定数の外部化を実施する（Task 2）
   - ファイルパス定数を `CONFIG` オブジェクトに集約する
   - 正規表現パターンを `PATTERNS` オブジェクトに集約する
   - チェック名を `CHECK_NAMES` オブジェクトに集約する
3. テストを実行し、全 PASS を確認する:
   ```bash
   pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
   ```
4. エラーメッセージのテンプレート化を実施する（Task 3）
5. テストを実行し、全 PASS を確認する
6. 関数責務の分離状況を確認し、不足があれば分割する（Task 4）
7. テストを実行し、全 PASS を確認する
8. 共通変換ロジックが散在している場合、ヘルパー関数に抽出する（Task 5）
9. テストを実行し、全 PASS を確認する
10. 最終的な全テスト PASS を確認する:
    ```bash
    pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
    ```
11. リファクタリング結果を `outputs/phase-8/` に記録する

---

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | 成果物                         | パス                                                                                              |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1   | リファクタリング済みスクリプト | `scripts/check-shared-module-sync.ts`                                                             |
| 2   | リファクタリングレポート       | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-8/refactoring-report.md` |

### リファクタリングレポートの記載フォーマット

```markdown
## リファクタリング結果

### 変更一覧

| #   | 変更内容   | 対象箇所          | 理由                   |
| --- | ---------- | ----------------- | ---------------------- |
| 1   | 定数外部化 | ファイルパス3箇所 | マジックストリング排除 |
| ... | ...        | ...               | ...                    |

### テスト結果

- 総テスト数: XX 件
- PASS: XX 件
- FAIL: 0 件

### 変更不要と判断した箇所

| 箇所 | 理由 |
| ---- | ---- |
| ...  | ...  |
```

---

## 完了条件

- [ ] Task 1 の判断基準（7項目）に基づいてリファクタリング対象が洗い出されている
- [ ] ハードコードされたファイルパスが `CONFIG` 定数に集約されている
- [ ] ハードコードされた正規表現パターンが `PATTERNS` 定数に集約されている
- [ ] チェック名が `CHECK_NAMES` 定数に集約されている
- [ ] エラーメッセージがテンプレート関数に統一されている
- [ ] 各関数が単一責務を持ち、50行以下に収まっている
- [ ] 共通変換ロジック（toModuleKey, toTypesVersionsKey, toSubpath）が抽出されている（重複が存在した場合）
- [ ] 全テストが PASS している（テスト数の変化なし）
- [ ] リファクタリングレポートが `outputs/phase-8/refactoring-report.md` に記録されている

## 次Phase

Phase 9（品質検証）へ進む。
