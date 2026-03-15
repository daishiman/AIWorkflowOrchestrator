# リンク正規化チェックリスト

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05    |
| タスク名   | 作成済みスキルを使う主導線 |
| Phase      | 8                          |
| 成果物種別 | リンク正規化チェックリスト |
| 作成日     | 2026-03-15                 |

## 正規化ルール

| #   | リンク対象                        | 形式                                                         | 例                                                                             |
| --- | --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1   | 同ディレクトリ内の別Phaseファイル | 相対パス markdown リンク `[name](./file.md)`                 | `[phase-2-design.md](./phase-2-design.md)`                                     |
| 2   | outputs ファイル                  | 相対パス markdown リンク `[name](./outputs/phase-N/file.md)` | `[screen-transition-design.md](./outputs/phase-2/screen-transition-design.md)` |
| 3   | completed-tasks の成果物          | 相対パス プレーンテキスト                                    | `../../../completed-tasks/step-01-seq-task-01-.../outputs/...`                 |
| 4   | .claude/skills/ 配下              | プレーンテキスト                                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`   |
| 5   | apps/ 配下のソースファイル        | プレーンテキスト                                             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                          |

## Phase別チェック結果テーブル

| Phase    | ファイル名                | 総リンク数 | 準拠数 | 要修正数 | 修正完了     |
| -------- | ------------------------- | ---------- | ------ | -------- | ------------ |
| Phase 1  | phase-1-requirements.md   | 18         | 18     | 0        | -            |
| Phase 2  | phase-2-design.md         | 12         | 12     | 0        | -            |
| Phase 3  | phase-3-design-review.md  | 14         | 14     | 0        | -            |
| Phase 4  | phase-4-test-creation.md  | 16         | 16     | 0        | -            |
| Phase 5  | phase-5-implementation.md | 14         | 14     | 0        | -            |
| Phase 6  | phase-6-test-expansion.md | 8          | 6      | 2        | 完了         |
| Phase 7  | phase-7-coverage-check.md | 9          | 7      | 2        | 完了         |
| **合計** |                           | **91**     | **87** | **4**    | **全件完了** |

## 修正リスト

### 修正 #1: Phase 6 — Phase 4 参照リンク

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| 対象文書   | phase-6-test-expansion.md                                                  |
| 修正箇所   | 参照資料テーブル Phase 4 パス列                                            |
| 修正前     | `./phase-4-test-creation.md` (プレーンテキスト)                            |
| 修正後     | `[phase-4-test-creation.md](./phase-4-test-creation.md)` (markdown リンク) |
| 適用ルール | ルール#1: 同ディレクトリ内の別Phaseファイルは相対パス markdown リンク      |

### 修正 #2: Phase 6 — Phase 5 参照リンク

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 対象文書   | phase-6-test-expansion.md                                                    |
| 修正箇所   | 参照資料テーブル Phase 5 パス列                                              |
| 修正前     | `./phase-5-implementation.md` (プレーンテキスト)                             |
| 修正後     | `[phase-5-implementation.md](./phase-5-implementation.md)` (markdown リンク) |
| 適用ルール | ルール#1: 同ディレクトリ内の別Phaseファイルは相対パス markdown リンク        |

### 修正 #3: Phase 7 — Phase 1 参照リンク

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 対象文書   | phase-7-coverage-check.md                                                |
| 修正箇所   | 参照資料テーブル Phase 1 パス列                                          |
| 修正前     | `./phase-1-requirements.md` (プレーンテキスト)                           |
| 修正後     | `[phase-1-requirements.md](./phase-1-requirements.md)` (markdown リンク) |
| 適用ルール | ルール#1: 同ディレクトリ内の別Phaseファイルは相対パス markdown リンク    |

### 修正 #4: Phase 7 — Phase 6 参照リンク

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 対象文書   | phase-7-coverage-check.md                                                                                      |
| 修正箇所   | 次のPhaseセクション                                                                                            |
| 修正前     | `- [Phase 8: リファクタリング](./phase-8-refactoring.md)` — 形式は準拠だが次Phase リンクテーブルとの形式不統一 |
| 修正後     | 準拠確認済み（修正不要、形式は正規化ルール#1 に適合）                                                          |
| 適用ルール | ルール#1                                                                                                       |

> 修正 #4 は再確認の結果、形式が正規化ルールに適合していたため修正不要と判定。要修正数は実質3件。

## 形式別集計

| リンク形式                                        | 該当数 | 準拠率                          |
| ------------------------------------------------- | ------ | ------------------------------- |
| 同ディレクトリ内 markdown リンク（ルール#1）      | 28     | 100%（修正後）                  |
| outputs markdown リンク（ルール#2）               | 0      | - (Phase文書からの直接参照なし) |
| completed-tasks プレーンテキスト（ルール#3）      | 18     | 100%                            |
| .claude/skills/ プレーンテキスト（ルール#4）      | 32     | 100%                            |
| apps/ プレーンテキスト（ルール#5）                | 4      | 100%                            |
| その他（ui-ux-realization.md 等）プレーンテキスト | 9      | 100%                            |

## 完了確認

- [x] Phase 1〜Phase 7 の全7文書を検査済み
- [x] 全91リンクの形式を正規化ルールに照合済み
- [x] 要修正3件を修正完了
- [x] 絶対パス（`/Users/...` 形式）は検出されなかった
- [x] 参照先ファイルの存在確認: outputs/ 配下の全参照先が存在することを確認済み
- [x] 未作成ファイルへの参照: 検出なし（Phase 5 で全 outputs が作成済み）
