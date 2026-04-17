# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 対象機能   | TASK-SW-STREAM-001   |
| 前提Phase  | Phase 11: 手動テスト |
| 次Phase    | Phase 13: PR作成     |
| ステータス | 未実施               |
| 作成日     | 2026-04-16           |

## 目的

本タスクの実装内容を中学生レベルの概念説明と技術者向けの実装ガイドとして記録する。
未タスクの検出を行い、後続の TASK-SW-STREAM-002 への引き継ぎ情報を整備する。
Phase 12 標準に合わせ、`TASK-SW-STREAM-001-skill-feedback-report.md` と
`TASK-SW-STREAM-001-phase12-task-spec-compliance-check.md` も同波で作成する。

## 実行タスク

### Task 1: 中学生レベルの概念説明

**何を追加したか（誰でもわかる説明）**:

このタスクでは、スキル作成アプリの「スキル生成中に進捗を知らせる仕組み」を追加しました。

たとえば、ファイルをコピーするときにパソコンが「残り何%」と表示するように、
スキルを作るときも「今どの作業をしているか」を外部に伝える窓口（コールバック）を作りました。

具体的には:

- スキル生成を担当する部品（`createSkill`）に「進捗を伝える関数」を渡せるようにした
- 処理が進むたびに、その関数を「10%完了」「40%完了」のように呼び出すようにした
- この関数を渡さない場合でも、普通通りスキル生成が完了する

次のタスク（TASK-SW-STREAM-002）では、この「進捗を伝える関数」に実際の画面への通知処理を接続します。

### Task 2: 技術者向け実装ガイド

**修正ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**変更内容**:

- `SkillCreatorProgress` 型定義を追加（`{ phase: string; percentage: number; message: string }`）
- `createSkill()` の第2引数に `onProgress?: (progress: SkillCreatorProgress) => void` を追加
- 処理の5節目でオプショナルチェーン呼び出し（`onProgress?.(...)`）を追加:
  - `planning` / 10% : `runCreateWorkflow` 開始前
  - `generating-skill` / 40% : SKILL.md 生成開始前
  - `generating-agents` / 70% : エージェント定義生成開始前
  - `validating` / 90% : 検証開始前
  - `done` / 100% : スキルディレクトリ返却前

**後続タスクへの引き継ぎ**:

- TASK-SW-STREAM-002 は本タスク完了後に着手できる
- TASK-SW-STREAM-002 では `skillCreatorHandlers.ts:276` の呼び出しを変更し、
  `onProgress` に `sendSkillCreatorProgress(mainWindow, progress)` を渡して接続する
- `SkillCreatorProgress` 型と Preload 側の `SkillCreatorProgress` 型の整合性を確認すること

### Task 3: 未タスク検出

本タスクの実施中に判明した未タスク候補:

| 未タスクID | 内容                                                                   | 優先度 |
| ---------- | ---------------------------------------------------------------------- | ------ |
| FUTURE-001 | `collaborative` / `orchestrate` モードへの進捗通知追加                 | Medium |
| FUTURE-002 | `SkillCreatorProgress` 型を shared パッケージへ移動して型共通化        | Low    |
| FUTURE-003 | コールバック内例外の保護（`onProgress` 呼び出しを `try/catch` で囲む） | Low    |

### Task 4: スキルフィードバックレポート

Phase 12 の実行で得られた学びを整理し、今後の同系タスクに再利用できる観点を残す。

- オプショナルチェーン（`?.`）を使うことで既存の呼び出し元を変更せずに引数拡張できたこと
- コールバック呼び出し位置は「処理開始直前」に統一することで、フロント側のプログレス表示が
  実際の処理と対応するタイミングになること
- `done` コールバックは `return` 直前に配置することで、必ず最後に呼ばれることを保証できること
- TASK-SW-STREAM-002 との接続設計を事前に確認することで、型の齟齬が防げること

### Task 5: 準拠チェック

5 成果物が揃っていること、task prefix 付きファイル名が spec と一致していること、
planned wording がないことを確認する。

## 参照資料

- `outputs/phase-11/TASK-SW-STREAM-001-manual-test-result.md` — 手動テスト結果
- `outputs/phase-10/TASK-SW-STREAM-001-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 本フェーズはドキュメント作成のみ。統合テストの変更は不要。

## 成果物

| 成果物                                                   | パス                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| TASK-SW-STREAM-001-implementation-guide.md               | `outputs/phase-12/TASK-SW-STREAM-001-implementation-guide.md`               |
| TASK-SW-STREAM-001-documentation-changelog.md            | `outputs/phase-12/TASK-SW-STREAM-001-documentation-changelog.md`            |
| TASK-SW-STREAM-001-unassigned-task-detection.md          | `outputs/phase-12/TASK-SW-STREAM-001-unassigned-task-detection.md`          |
| TASK-SW-STREAM-001-skill-feedback-report.md              | `outputs/phase-12/TASK-SW-STREAM-001-skill-feedback-report.md`              |
| TASK-SW-STREAM-001-phase12-task-spec-compliance-check.md | `outputs/phase-12/TASK-SW-STREAM-001-phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] 中学生レベルの概念説明が記述されている
- [ ] 技術者向け実装ガイドが完成している
- [ ] 未タスク検出が記録されている
- [ ] スキルフィードバックレポートが記録されている
- [ ] 準拠チェックが完了している
- [ ] TASK-SW-STREAM-002 への引き継ぎ情報が整備されている

## タスク100%実行確認【必須】

- [ ] Task 1（中学生レベルの概念説明）を100%実行した
- [ ] Task 2（技術者向け実装ガイド）を100%実行した
- [ ] Task 3（未タスク検出）を100%実行した
- [ ] Task 4（スキルフィードバックレポート）を100%実行した
- [ ] Task 5（準拠チェック）を100%実行した
- [ ] 全成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
