# Phase 2: 設計

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 2                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 1                                            |
| 後続Phase  | Phase 3                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

Phase 1 の調査結果をもとに、`packages/shared/src/constants/skillName.ts` に `SKILL_NAME_PATTERN` 定数を新規作成し、`SkillScanner.ts` と `init_skill.js` が単一の信頼源を参照する構成を設計する。各ファイルの変更内容・型設計・ビルド設定の確認方針を定義する。

## 実行タスク

- `skillName.ts` の公開定数を 1 つに絞り、設計責務を固定する。
- `SkillScanner.ts` と `init_skill.js` の参照経路を `@repo/shared/constants` に統一する。
- `packages/shared` の CJS/ESM 出力条件を確認し、Phase 5 に引き継ぐ。

## SubAgent チーム編成

| SubAgent   | 関心ごと            | 主担当                                                   |
| ---------- | ------------------- | -------------------------------------------------------- |
| SubAgent-A | shared 定数設計     | skillName.ts の新規作成・型定義・エクスポート設計        |
| SubAgent-B | TypeScript 参照更新 | SkillScanner.ts の import 追加・正規表現リテラル置き換え |
| SubAgent-C | ESM 参照更新        | init_skill.js の import 追加・正規表現リテラル置き換え   |
| SubAgent-D | 統合監査            | CJS/ESM 互換性・後方互換性・循環依存・ビルド設定確認     |

## 変更ファイル一覧

| ファイル                                             | 変更種別 | 変更内容                                                                                   |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `packages/shared/src/constants/skillName.ts`         | 新規作成 | `SKILL_NAME_PATTERN` 定数を定義                                                            |
| `packages/shared/src/constants/index.ts`             | 修正     | `skillName.ts` からのエクスポートを追加                                                    |
| `packages/shared/src/claude-cli/constants.ts`        | 修正     | `MAX_SKILL_NAME_LENGTH` を shared 定数へ寄せて再エクスポート                               |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 修正     | `SKILL_NAME_PATTERN` を shared からインポートし参照を置き換え                              |
| `.claude/skills/skill-creator/scripts/init_skill.js` | 修正     | `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` で定数を取得し参照を置き換え |

## skillName.ts 設計案

```typescript
/**
 * スキル名バリデーション定数
 *
 * スキル名は kebab-case（英小文字・数字・ハイフン区切り）でなければならない。
 * 例: my-skill, skill-001, hello-world
 *
 * @module constants/skillName
 */

/**
 * スキル名として有効な文字列パターン。
 * - 先頭は英小文字または数字
 * - ハイフン区切りのセグメントで構成
 * - 末尾はハイフン以外
 */
export const SKILL_NAME_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;
```

## index.ts 変更方針

`packages/shared/src/constants/index.ts` に以下を追記する：

```typescript
export { SKILL_NAME_PATTERN } from "./skillName";
```

## SkillScanner.ts 変更方針

`validateSkillName()` メソッド内のコメントまたはインラインリテラルを削除し、以下のインポートを追加する：

```typescript
import { SKILL_NAME_PATTERN } from "@repo/shared/constants";
```

正規表現リテラルが使われている箇所を `SKILL_NAME_PATTERN` 定数に置き換える。

## init_skill.js 変更方針

Node.js ESM 環境で動作するスクリプトであるため、`import` を使用する：

```javascript
import { SKILL_NAME_PATTERN } from "@repo/shared/constants";
```

`validateSkillName()` 関数内のインラインリテラル `/^[a-z0-9]+(-[a-z0-9]+)*$/` を `SKILL_NAME_PATTERN` に置き換える。

> 注意: `@repo/shared/constants` が CJS/ESM の両方で公開されていることを Phase 1 で確認済みであること。未確認の場合は `tsup.config.ts` と `package.json` の exports を参照して確認する。

## claude-cli/constants.ts 変更方針

`packages/shared/src/claude-cli/constants.ts` では、`CLAUDE_CLI_DEFAULTS.MAX_SKILL_NAME_LENGTH` が `skillName.ts` の単一信頼源を参照するようにする。

```typescript
import {
  MAX_SKILL_NAME_LENGTH,
  SKILL_NAME_PATTERN,
} from "../constants/skillName";

export const CLAUDE_CLI_DEFAULTS = {
  MAX_SKILL_NAME_LENGTH,
  // ...
} as const;
```

これにより、desktop 側と skill-creator 側が同じ上限値を共有し、今後の変更漏れを防ぐ。

## ビルド設定確認方針

- `packages/shared/tsup.config.ts` で `format: ["cjs", "esm"]` が指定されていることを確認する。
- `packages/shared/package.json` の `exports` フィールドに `./constants` の CJS/ESM 両方のエントリポイントが存在することを確認する。
- `skillName.ts` を追加した後、`pnpm --filter @repo/shared build` が成功することを実装 Phase で検証する。

## 参照資料

### 実装・コード

| 資料名                  | パス                                                 | 用途                                 |
| ----------------------- | ---------------------------------------------------- | ------------------------------------ |
| SkillScanner.ts         | `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 変更対象箇所の特定                   |
| init_skill.js           | `.claude/skills/skill-creator/scripts/init_skill.js` | 変更対象箇所の特定                   |
| shared 定数インデックス | `packages/shared/src/constants/index.ts`             | エクスポート追加先の確認             |
| shared package.json     | `packages/shared/package.json`                       | CJS/ESM エクスポートフィールドの確認 |
| tsup.config.ts          | `packages/shared/tsup.config.ts`                     | ビルド設定（CJS/ESM 両対応）の確認   |
| security.ts             | `packages/shared/src/constants/security.ts`          | 既存定数ファイルの構造を参考にする   |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                                        | 用途                |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止        |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート基準      |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | shared 定数パターン |
| タスク運用     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳同期ルール      |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見        |

## 実行手順

1. `packages/shared/src/constants/security.ts` を参考にして `skillName.ts` のファイル構造（JSDoc・エクスポート形式）を設計する。
2. `packages/shared/src/constants/index.ts` への追記内容を確定し、既存エクスポートと競合しないことを確認する。
3. `SkillScanner.ts` の変更箇所（インポート追加・正規表現リテラル置き換え）を設計ドキュメントに記録する。
4. `init_skill.js` の変更箇所（import 追加・リテラル置き換え）を設計ドキュメントに記録し、ESM/CJS ビルドの前提条件を明記する。
5. `tsup.config.ts` と `package.json` を確認してビルド設定分析書を作成し、CJS/ESM 両対応であることを文書化する。

## 統合テスト連携

- Phase 1 の要件定義を受け取り、Phase 3 のレビュー判定へつなぐ。
- Phase 2 の設計成果物は Phase 4 のテストマトリクスと Phase 5 の実装計画の基準になる。

## 成果物

| 成果物           | パス                                       | 説明                                       |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| 設計ドキュメント | `outputs/phase-2/design-document.md`       | 定数設計・各ファイル変更内容の詳細         |
| 変更ファイル一覧 | `outputs/phase-2/file-change-list.md`      | 変更対象ファイル・変更種別・変更内容の一覧 |
| ビルド設定分析   | `outputs/phase-2/build-config-analysis.md` | CJS/ESM 両対応の確認結果                   |

## 完了条件

- [ ] `skillName.ts` の型設計・エクスポート設計が文書化されていること
- [ ] `index.ts` への追記内容が確定していること
- [ ] `SkillScanner.ts` の変更箇所が特定・文書化されていること
- [ ] `init_skill.js` の変更箇所が特定・文書化されていること
- [ ] CJS/ESM ビルド設定の確認方針が文書化されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. SubAgent-A: skillName.ts 設計・index.ts 追記内容確定
2. SubAgent-B: SkillScanner.ts 変更箇所の特定と設計
3. SubAgent-C: init_skill.js 変更箇所の特定と設計
4. SubAgent-D: ビルド設定確認・循環依存チェック・統合判定
5. 成果物出力・完了条件判定

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次の Phase

Phase 3: 設計レビューゲート
