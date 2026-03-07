# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 12                                                 |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

実装ガイド（Part 1: 中学生レベル概念説明、Part 2: 開発者向け技術詳細）を作成し、システム仕様書を更新し、未タスクを検出する。

## 実行タスク

- Task 1: 実装ガイド作成（Part 1 + Part 2）
- Task 2: システム仕様書更新（spec-update-workflow.md準拠）
- Task 3: documentation-changelog.md作成
- Task 4: 未タスク検出

## 参照資料

| 資料名                 | パス                                                                           | 説明                |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Phase 12チェックリスト | `.claude/rules/05-task-execution.md`                                           | Phase 12必須項目    |
| 仕様書更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様書更新手順      |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P28, P43 |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: 並行実行ガードの設計記録を追記
- `interfaces-agent-sdk.md`: executeSkillのガード仕様を追記

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### Task 1: 実装ガイド

#### Part 1: 概念説明（中学生レベル）

**配置先:** `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/implementation-guide.md`

**内容:**

> **エレベーターのボタンの仕組み**
>
> エレベーターの「閉じる」ボタンを想像してみてください。ドアが閉まっている最中に何度ボタンを押しても、エレベーターは追加の操作を無視します。なぜなら、「もう動いているから、同じ命令を重ねて実行する意味がない」からです。
>
> AIスキル実行も同じです。「実行」ボタンを押すと、AIが考え始めます。考えている最中にもう一度「実行」ボタンを押すと、本来なら2つのAIの回答が同時に流れてきて、画面がぐちゃぐちゃになってしまいます。
>
> これを防ぐために、「もう実行中ですよ」という状態を確認するチェック（ガード）を追加しました。エレベーターが「ドアが動いている最中は新しいボタン操作を無視する」のと同じ仕組みです。
>
> さらに安全にするために、2つの防御を用意しました:
>
> 1. **ボタン自体を押せなくする**（エレベーターのボタンが光ってロックされるイメージ）
> 2. **たとえボタンが押されても、中の仕組みが無視する**（エレベーターの制御装置が二重で確認するイメージ）

#### Part 2: 技術詳細（開発者向け）

**内容:**

1. **ガードパターン（Guard Clause）**
   - `executeSkill` 関数冒頭の `if (isExecuting) return;` パターン
   - Zustand `get()` による同期的状態取得の安全性
   - 非同期race conditionとの関係（`get()` は同期的なため、2つの非同期呼び出しが同時にガードを通過することはない）

2. **二重防御アーキテクチャ**
   - Store層ガード: プログラム的呼び出しからも保護
   - UI層disabled: ユーザー操作レベルで防止
   - 各防御層の独立性と冗長性

3. **Zustand Store設計上の注意点**
   - P31対策: 個別セレクタ `useIsExecuting()` の使用理由
   - P48非該当: `isExecuting` はプリミティブ型のため `useShallow` 不要

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `arch-state-management.md` にexecuteSkillガード追加の記録
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `.claude/skills/task-specification-creator/LOGS.md` 更新（**2ファイル両方**、P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] 該当する実装ステータステーブルの更新（該当する場合）

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27対策）

#### Step 2: システム仕様更新

- [ ] `arch-state-management.md` にexecuteSkillの並行実行ガードパターンを追記

#### Step 3: IPC契約検証

- 本タスクはIPC修正ではないため、Step 3はスキップ

### Task 3: documentation-changelog.md

**配置先:** `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/documentation-changelog.md`

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各Stepの完了結果を詳細に記録
- [ ] **全Step確認前に「完了」と記載しない**（P4対策）

### Task 4: 未タスク検出

**配置先:** `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/unassigned-task-report.md`

- [ ] `outputs/phase-12/unassigned-task-report.md` 作成（**0件でも必須**）
- [ ] 検出した未タスクは3ステップ全完了（P3対策）:
  1. `tasks/unassigned-task/` に指示書作成
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータス更新

**想定される未タスク候補:**

| 候補                                    | 判断基準                                 |
| --------------------------------------- | ---------------------------------------- |
| cancelSkill（実行中止）の並行実行ガード | executeSkillと同様の問題が存在する可能性 |
| 他のStore Sliceの並行実行チェック       | 同様のパターンが他のSliceにもある可能性  |

## 成果物

| 成果物                  | パス                                                                                                                  | 説明             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------- |
| ドキュメント更新仕様書  | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-12-documentation.md`                   | 本ドキュメント   |
| 実装ガイド              | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2  |
| documentation-changelog | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/documentation-changelog.md` | 変更記録         |
| 未タスクレポート        | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/unassigned-task-report.md`  | 未タスク検出結果 |

## 完了条件

- [ ] 実装ガイドPart 1（中学生レベル概念説明、エレベーターの例え含む）が作成されている
- [ ] 実装ガイドPart 2（開発者向け技術詳細）が作成されている
- [ ] LOGS.md 2ファイルが両方とも更新されている（P1/P25対策）
- [ ] SKILL.md 2ファイルが両方とも更新されている
- [ ] topic-map.md が再生成されている（P2/P27対策）
- [ ] documentation-changelog.md が全Step完了後に作成されている（P4対策）
- [ ] unassigned-task-report.md が作成されている（0件でも必須）
- [ ] 未タスクが検出された場合、3ステップ全完了している（P3対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
