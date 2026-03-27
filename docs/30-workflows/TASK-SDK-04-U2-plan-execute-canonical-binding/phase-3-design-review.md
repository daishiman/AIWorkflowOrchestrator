# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| Phase名    | 設計レビュー                                  |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 2: 設計                                 |
| 次Phase    | Phase 4: テスト作成                           |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

設計が skill 準拠、4条件、30思考法の観点で破綻していないかを gate 判定する。

## 実行タスク

### Task 1: skill 準拠チェック

- `task-specification-creator` の共通構造と Phase 12 要件に矛盾がないか確認する
- `aiworkflow-requirements` の canonical binding 教訓と一致するか確認する

### Task 2: 4条件レビュー

- 矛盾なし: draft / approved / execute owner が競合しない
- 漏れなし: cancel、回帰、test、doc が揃っている
- 整合性あり: ファイル名、状態名、成果物名が揃っている
- 依存関係整合: Phase 4 以降へ引き継げる

### Task 3: gate 判定

- PASS: 実装は局所修正で足りる
- MAJOR: API shape 変更が必要
- CRITICAL: 既存実装を破棄再構成する必要がある

## 参照資料

| 資料名          | パス                                                                                       | 説明                       |
| --------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| 設計書          | `phase-2-design.md`                                                                        | レビュー対象               |
| エレガンス監査  | `.agents/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md`     | 再現性と整合性の観点       |
| lessons learned | `.agents/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` | canonical binding 再発防止 |

## 統合テスト連携

- Phase 4 のテスト観点が AC-1〜AC-5 を 1:1 に覆うことを確認する
- UI draft と approved snapshot の差分がテスト観測点に落ちていることを確認する

## 成果物

| 成果物           | パス                               | 説明              |
| ---------------- | ---------------------------------- | ----------------- |
| 設計レビュー結果 | `outputs/phase-3/review-result.md` | gate 判定と残論点 |

## 完了条件

- [ ] skill 準拠の PASS / FAIL が明示されている
- [ ] 4条件判定が記録されている
- [ ] 実装に進める gate 結論がある
- [ ] 破棄再構成が不要である理由が示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
