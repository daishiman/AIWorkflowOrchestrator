# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 12                                      |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

実装ガイドの作成、システム仕様書の更新、ドキュメント更新履歴の作成、未タスク検出レポートの作成を行う。

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成）
- Task 2: システム仕様書更新（2ステップ）
- Task 3: ドキュメント更新履歴作成
- Task 4: 未タスク検出レポート作成（0件でも出力必須）

## 参照資料

| 資料名               | パス                                         | 説明           |
| -------------------- | -------------------------------------------- | -------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`     | Phase 11成果物 |
| 最終レビューレポート | `outputs/phase-10/final-review-report.md`    | Phase 10成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1成果物  |

### システム仕様（aiworkflow-requirements）

| 参照資料          | パス                                                                       | 内容             |
| ----------------- | -------------------------------------------------------------------------- | ---------------- |
| コード品質仕様    | `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md` | ESLint設定方針   |
| CI/CDインフラ仕様 | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`        | CI品質ゲート定義 |

## 実行手順

### Task 1: 実装ガイド作成（2パート構成）【必須】

#### Part 1: 初学者・中学生レベルの概念説明

**対象読者**: 初学者、非技術者、中学生レベル

**必須要件**:

- 日常生活での例え話を必ず含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**記載内容**:

1. **なぜ lint 設定を変更する必要があるのか**
   - 例え話: 「lint」は文章の校正ツールのようなもの。作文を書いた後に誤字脱字チェックをするのと同じ。今まで使っていた校正ツール（`next lint`）が新しいバージョンで使えなくなったので、別の校正ツール（`eslint`）を直接使うようにした。

2. **何が変わったのか**
   - Next.js というフレームワーク（ウェブサイトを作るための道具箱）が新しくなり、その中に入っていた校正機能が取り出された
   - 校正機能自体はまだ使えるが、呼び出し方が変わった

3. **どう修正したのか**
   - 設定ファイル2つを書き換えた
   - 校正ツールの呼び出し方を「道具箱経由」から「直接呼び出し」に変更

#### Part 2: 技術者向けの詳細説明

**対象読者**: 開発者、技術者

**必須要件**:

- 変更前後のコード差分を含める
- 設定の技術的根拠を説明
- エッジケースとトラブルシューティングを記載

**記載内容**:

1. **背景と根本原因**
   - Next.js 16 で `next lint` サブコマンドが削除された経緯
   - Next.js 15.5 での非推奨化、16 での完全削除のタイムライン
   - `next` CLI が `lint` をディレクトリパスとして解釈するメカニズム

2. **変更内容**

   **package.json**:

   ```diff
   - "lint": "next lint"
   + "lint": "eslint . --cache --cache-location .next/cache/eslint/"
   ```

   **eslint.config.mjs**:

   ```diff
   - // Simplified ESLint config for Next.js 15 backend
   - export default [
   -   {
   -     ignores: [...],
   -   },
   - ];
   + import { dirname } from "path";
   + import { fileURLToPath } from "url";
   + import { FlatCompat } from "@eslint/eslintrc";
   +
   + const __filename = fileURLToPath(import.meta.url);
   + const __dirname = dirname(__filename);
   +
   + const compat = new FlatCompat({ baseDirectory: __dirname });
   +
   + export default [
   +   ...compat.extends("next/core-web-vitals"),
   +   {
   +     ignores: [...],
   +   },
   + ];
   ```

3. **FlatCompat の必要性**
   - `eslint-config-next` はレガシー設定形式（`.eslintrc` 形式）
   - ESLint 9.x の flat config で使用するには `FlatCompat` で変換が必要
   - `@eslint/eslintrc` パッケージが提供する互換性レイヤー

4. **トラブルシューティング**
   - `FlatCompat` でエラーが出る場合: `@eslint/eslintrc` のバージョン確認
   - ルール競合が発生する場合: ルート `eslint.config.js` との差異を確認
   - キャッシュ問題: `.next/cache/eslint/` を手動削除して再実行

### Task 2: システム仕様書更新（2ステップ）【必須】

#### Step 1: タスク完了記録【必須・全タスク】

以下の全項目を実施する:

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記

**1-A: LOGS.md 更新（必須: 2ファイル両方を更新）**

| ファイル                                            | 目的                         |
| --------------------------------------------------- | ---------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | システム仕様書更新の記録     |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書スキルの使用記録 |

**aiworkflow-requirements/LOGS.md** エントリ形式:

```markdown
## 2026-01-29: fix-backend-lint-next16（TASK-CI-FIX-001）

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-CI-FIX-001                             |
| 操作         | update-spec                                 |
| 対象ファイル | devops-code-quality.md, devops-ci-cd.md     |
| 結果         | success                                     |
| 備考         | next lint → eslint . 移行（Next.js 16対応） |
```

**task-specification-creator/LOGS.md** エントリ形式:

```markdown
## 2026-01-29 - fix-backend-lint-next16（TASK-CI-FIX-001）タスク完了

### コンテキスト

- スキル: task-specification-creator
- タスクID: TASK-CI-FIX-001
- タスク名: fix-backend-lint-next16
- Phase: 1-13

### 成果

- 実装内容:
  - next lint → eslint . への移行
  - eslint.config.mjs に eslint-config-next ルール統合

### 結果

- ステータス: success
- 完了日時: 2026-01-29
```

**1-B: topic-map.md 更新（新規セクション追加時）**

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の該当ファイルセクションに新規セクションエントリを追加する（該当する場合のみ）。

**1-C: 実装状況テーブル更新**

該当する仕様書の実装状況を更新する。

#### Step 2: システム仕様更新【条件付き】

**更新判断**:

| 確認項目                      | 本タスクでの判定 |
| ----------------------------- | ---------------- |
| 新規インターフェース/型の追加 | なし             |
| 既存インターフェースの変更    | なし             |
| 新規定数/設定値の追加         | なし             |
| API仕様の変更                 | なし             |

**判定**: 本タスクは設定ファイルの変更のみであり、インターフェースやAPIの変更を含まないため、**Step 2 は不要**。

ただし、以下の仕様書で `next lint` に言及している箇所がある場合は更新が必要:

- `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md`
- `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`

### Task 3: ドキュメント更新履歴作成【必須】

以下の内容でドキュメント更新履歴を作成する:

```markdown
## 更新履歴

| 日付       | 更新内容                                          | 対象ファイル                   |
| ---------- | ------------------------------------------------- | ------------------------------ |
| 2026-01-29 | `next lint` → `eslint .` に移行（Next.js 16対応） | apps/backend/package.json      |
| 2026-01-29 | eslint-config-next ルール統合                     | apps/backend/eslint.config.mjs |
```

### Task 4: 未タスク検出レポート作成【0件でも出力必須】

以下のソースを確認し、未タスクを検出する:

| ソース                 | 確認項目                           |
| ---------------------- | ---------------------------------- |
| 元タスク仕様書         | 「スコープ外」として明示された項目 |
| Phase 3/10レビュー結果 | MINOR判定の指摘事項                |
| Phase 11手動テスト     | スコープ外の発見事項・改善提案     |
| コードコメント         | TODO/FIXME/HACK/XXX                |

**想定される未タスク候補**:

| ID  | 候補                                          | 理由                           |
| --- | --------------------------------------------- | ------------------------------ |
| U1  | Next.js 16 その他の破壊的変更対応             | スコープ外として除外済み       |
| U2  | eslint-config-next の native flat config 対応 | FlatCompat が不要になる可能性  |
| U3  | apps/web の同様の lint 修正                   | web パッケージが追加された場合 |

## 統合テスト連携【必須】

| 検証項目           | 内容                                       |
| ------------------ | ------------------------------------------ |
| ドキュメント整合性 | 実装ガイドの内容が実際の実装と一致している |
| 仕様書更新         | 必要な仕様書が全て更新されている           |

## アーキテクチャ層別ドキュメント（monorepo観点）

| 層                 | ドキュメント内容                | 仕様参照先             |
| ------------------ | ------------------------------- | ---------------------- |
| Backend パッケージ | ESLint設定変更の経緯と手順      | devops-code-quality.md |
| CI/CD              | lint コマンド変更による CI 影響 | devops-ci-cd.md        |

## 成果物

| 成果物               | パス                                            | 説明                 |
| -------------------- | ----------------------------------------------- | -------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2      |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | ドキュメント更新履歴 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果     |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1: **中学生レベル概念説明**）が作成されている
- [ ] Task 1: 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】**システム仕様書に「完了タスク」セクションを追加した
- [ ] **【Task 2 Step 1】**関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] **【Task 2 Step 1】**変更履歴セクションにバージョンを追記した
- [ ] **【Task 2 Step 1】**`aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] **【Task 2 Step 1】**`task-specification-creator/LOGS.md` にタスク完了記録を追加した
- [ ] **【Task 2 Step 1】**`topic-map.md` に新規セクションエントリを追加した（該当する場合）
- [ ] **【Task 2 Step 2】**システム仕様更新の要否を判断し、`documentation-changelog.md` に記録した
- [ ] Task 2 Step 2: 仕様書で `next lint` に言及している箇所が確認されている
- [ ] Task 3: ドキュメント更新履歴が作成されている
- [ ] Task 4: 未タスク検出レポートが作成されている（0件でも出力）
- [ ] **artifacts.json が更新されている**
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 実装ガイド Part 1（中学生レベル）の作成
3. Task 1: 実装ガイド Part 2（技術者レベル）の作成
4. Task 2 Step 1: タスク完了記録の追加
5. Task 2 Step 2: 仕様書の `next lint` 言及確認・更新判断
6. Task 3: ドキュメント更新履歴の作成
7. Task 4: 未タスク検出レポートの作成
8. 成果物の作成・配置
9. 完了条件の検証

## 次のPhase

Phase 13: PR作成
