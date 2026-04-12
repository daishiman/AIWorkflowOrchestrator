# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 12                                                                    |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 11                                                              |
| 後続Phase  | Phase 13                                                              |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

実装ガイド・システム仕様書更新・未タスク検出・スキルフィードバックの
5タスクを完了させる。

---

## Task 1: 実装ガイド作成（2パート構成）

### Part 1: 中学生レベルの説明

#### なぜこの設定が必要なの？

パソコンで作業をするとき、「自動ツール」が勝手にファイルの中身を変えることがあります。
このプロジェクトでは、コードの書き方チェックツール（ESLint）が
「みんなが使う共通ファイルの呼び方」を自動で変換します。

具体的には:

- 変換前: `import { something } from "../shared/something"` （直接パスで呼ぶ）
- 変換後: `import { something } from "@repo/shared"` （名前で呼ぶ）

ところが、テストを実行するツール（vitest）は「`@repo/shared` という名前がどこにあるか」を
知らないので、テストが全部失敗してしまいます。

**解決策**: vitestの設定ファイルに「`@repo/shared` という名前は `./index.ts` を見て」と
教えてあげます。これを「エイリアス（別名）設定」と呼びます。

#### 日常の例え話

図書館で本を探すとき、「〇〇先生の本」と言っても館員さんは分かりません。
正式な書名か著者名を伝える必要があります。
エイリアス設定は「〇〇先生の本 = 書名「ABC」」という対応表を作るようなものです。

---

### Part 2: 技術者向け説明

#### 問題の原因

ESLint の `eslint-plugin-import` による import パス自動変換が
`../relativePath` → `@repo/shared` に変換するが、
`packages/shared/vitest.config.ts` に `resolve.alias` が未設定だったため
vitest の module resolution が失敗した。

#### 解決策

```typescript
// packages/shared/vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared": path.resolve(__dirname, "./index.ts"),
    },
  },
  test: {
    // 既存設定
  },
});
```

#### 設定のポイント

| 項目                | 値                                      | 理由                                    |
| ------------------- | --------------------------------------- | --------------------------------------- |
| alias キー          | `"@repo/shared"`                        | package.json の `name` と一致させる     |
| alias 解決先        | `path.resolve(__dirname, "./index.ts")` | バレルエクスポートファイルを指定        |
| path.resolve の使用 | CJS 互換                                | `__dirname` は CJS モードでのみ使用可能 |

#### 影響範囲

- `packages/shared/vitest.config.ts` のみ
- 実行時コードへの影響なし
- テスト設定のみの変更

#### 再発防止

新規パッケージ作成時は vitest.config.ts に以下を標準で含めること:

```typescript
resolve: {
  alias: {
    "@repo/<package-name>": path.resolve(__dirname, "./index.ts"),
  },
},
```

---

## Task 2: システム仕様書更新（2ステップ）

### Step 1-A: タスク完了記録

| 項目             | 内容                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| 完了タスクID     | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                      |
| 完了日           | 2026-04-08                                                                  |
| 実装ファイル     | `packages/shared/vitest.config.ts`                                          |
| 関連ドキュメント | `docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001/` |

**LOGS.md更新対象**:

- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`

### Step 1-B: 実装状況テーブル更新

| タスクID                                               | 変更前 | 変更後 |
| ------------------------------------------------------ | ------ | ------ |
| UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001 | 未実装 | 完了   |

### Step 1-C: 関連タスクテーブル更新

| 関連タスクID                                   | 変更内容                      |
| ---------------------------------------------- | ----------------------------- |
| UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 | Phase 11 FB-01 対応済みを記録 |

### Step 2: システム仕様更新（条件付き）

**判定**: 本タスクは `vitest.config.ts` の設定変更のみ。
新規インターフェース/型の追加はなし。

**Step 2 更新**: **不要**（内部設定変更のみ）

---

## Task 3: ドキュメント更新履歴作成

```bash
node scripts/generate-documentation-changelog.js \
  --task UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001 \
  --output outputs/phase-12/documentation-changelog.md
```

| 更新日     | 対象ファイル                       | 変更内容                    |
| ---------- | ---------------------------------- | --------------------------- |
| 2026-04-08 | `packages/shared/vitest.config.ts` | resolve.alias 追加          |
| 2026-04-08 | タスク仕様書（本ディレクトリ）     | Phase 1-13 仕様書の新規作成 |

---

## Task 4: 未タスク検出レポート（0件でも出力必須）

```bash
node scripts/detect-unassigned-tasks.js \
  --scan packages/shared/src \
  --output .tmp/unassigned-candidates.json
```

### 検出結果

| ソース                     | 検出内容                                                 | 対応方針               |
| -------------------------- | -------------------------------------------------------- | ---------------------- |
| 他パッケージのalias        | `apps/desktop`, `packages/ui` 等で同様の問題がある可能性 | 新規未タスクとして記録 |
| 新規パッケージテンプレート | vitest.config.ts テンプレートが未整備の可能性            | 新規未タスクとして記録 |

### 新規未タスク候補

| 未タスクID（候補）                   | 内容                                                    | 優先度 |
| ------------------------------------ | ------------------------------------------------------- | ------ |
| UT-VITEST-ALIAS-ALL-PACKAGES-001     | 全パッケージの vitest.config.ts に alias 標準設定を適用 | LOW    |
| UT-PACKAGE-TEMPLATE-VITEST-ALIAS-001 | 新規パッケージ作成テンプレートに alias を組み込む       | LOW    |

---

## Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

### フィードバック内容

| フィードバックID | 内容                                                                           | 種別     |
| ---------------- | ------------------------------------------------------------------------------ | -------- |
| FB-TASK-01       | ESLint フックと vitest の組み合わせ問題は他パッケージでも潜在的に存在する      | 警告     |
| FB-TASK-02       | `resolve.alias` を標準テンプレートに含めることで、このクラスの問題を根絶できる | 改善提案 |

### スキル改善提案

| スキル                     | 改善内容                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| task-specification-creator | vitest alias 設定チェックを Phase 1 の P50チェック項目に追加する   |
| aiworkflow-requirements    | packages/\*/vitest.config.ts の resolve.alias を標準設定として記録 |

---

## 参照資料

| 資料名         | パス                                     | 用途            |
| -------------- | ---------------------------------------- | --------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | Phase 11 成果物 |

## 成果物

| 成果物                       | パス                                            | 説明                               |
| ---------------------------- | ----------------------------------------------- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Part 1（中学生）+ Part 2（技術者） |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜1-C の記録               |
| 更新履歴                     | `outputs/phase-12/documentation-changelog.md`   | ドキュメント変更履歴               |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 未タスク候補一覧（0件含む）        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案                     |

## 完了条件

- [x] Task 1（実装ガイド）: Part 1・Part 2 ともに作成済み
- [x] Task 2（仕様更新）: Step 1-A〜1-C 完了、Step 2 は N/A 判定済み
- [x] Task 3（更新履歴）: ドキュメント変更履歴が記録済み
- [x] Task 4（未タスク検出）: 0件でも出力済み（2件の候補を記録）
- [x] Task 5（フィードバック）: 改善点も含めて記録済み

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 13: PR作成
