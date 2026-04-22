---
task_id: UNASSIGNED-SKILL-CREATOR-IMPROVE-PROMPT-CONTRACT-ALIGNMENT-001
task_name: improve-prompt モード正本契約アライメント
category: 整合修正
target_feature: SkillCreatorService improve-prompt mode / skill-creator canonical spec
priority: 中
scale: 小規模
status: unassigned
issue_number: 2378
created_date: 2026-04-21
implementation_mode: "update"
dependencies:
  - TASK-SC-IMPROVE-PROMPT-IMPL-001
---

# UNASSIGNED-SKILL-CREATOR-IMPROVE-PROMPT-CONTRACT-ALIGNMENT-001

`improve-prompt` モードの正本契約を、skill-creator 正本仕様と `SkillCreatorService` 実装の間で統一する。

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UNASSIGNED-SKILL-CREATOR-IMPROVE-PROMPT-CONTRACT-ALIGNMENT-001 |
| タスク名     | improve-prompt モード正本契約アライメント                      |
| 分類         | 整合修正                                                       |
| 対象機能     | SkillCreatorService improve-prompt mode / skill-creator spec   |
| 優先度       | 中                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | unassigned                                                     |
| GitHub Issue | #2378                                                          |
| 依存タスク   | TASK-SC-IMPROVE-PROMPT-IMPL-001（完了済み）                    |

## 背景・問題

- 正本仕様（`.claude/skills/skill-creator/SKILL.md`）では `improve-prompt` が `agents/*.md` 改善を指す記述が残っている
- `TASK-SC-IMPROVE-PROMPT-IMPL-001` の実装は `SKILL.md` 改善として閉じている
- mode 名の意味がずれると UI / IPC / 運用 / close-out 判定がぶれる

## 苦戦箇所（TASK-SC-IMPROVE-PROMPT-IMPL-001 から引き継ぎ）

- `progress.test.ts` の `beforeEach` に `executeJson` デフォルト返り値がなく、既存テストが一時失敗した。新しいモードを追加する際は **既存テストセットアップへの影響を事前確認** すること
- `runCreateWorkflow` の処理を improve-prompt 後も踏まないよう分岐させる必要があったが、flow のどこで止めるかが曖昧で設計に迷いが生じた。`case` 文 + `return` で早期終了するパターンを統一することで解決

## 対応方針

| 方針 | 内容                                                        | 推奨         |
| ---- | ----------------------------------------------------------- | ------------ |
| A    | canonical contract を `SKILL.md` 改善へ寄せる（実装に追従） | ✅ 推奨      |
| B    | 実装を `agents/*.md` 改善フローへ戻す                       | 追加コスト大 |

方針 A を採用し、仕様書・コード・テスト・close-out を同一 wave で同期する。

## 完了条件

- [ ] `improve-prompt` の対象が「SKILL.md 改善」として仕様書・コード・テストで単一化されている
- [ ] skill-creator 正本仕様（`.claude/skills/skill-creator/SKILL.md`）の `improve-prompt` 説明が実装と一致している
- [ ] Phase 12 の unassigned-task-detection にて本タスクを解消済みと記録できる

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                 | ステータス |
| ----- | -------------------- | ------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)     | 未実施     |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                 | 未実施     |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)   | 未実施     |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)   | 未実施     |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md) | 未実施     |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 未実施     |
| 7     | テストカバレッジ確認 | [phase-7-coverage.md](phase-7-coverage.md)             | 未実施     |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)       | 未実施     |
| 9     | 品質保証             | [phase-9-quality.md](phase-9-quality.md)               | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)   | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)     | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md) | 未実施     |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)     | 未実施     |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/unassigned-task/UNASSIGNED-SKILL-CREATOR-IMPROVE-PROMPT-CONTRACT-ALIGNMENT-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```
