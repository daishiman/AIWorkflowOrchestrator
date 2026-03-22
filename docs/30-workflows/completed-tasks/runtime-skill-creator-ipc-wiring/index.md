# runtime-skill-creator-ipc-wiring - タスク実行仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| 機能名     | runtime-skill-creator-ipc-wiring |
| 作成日     | 2026-03-21                       |
| ステータス | 完了                             |
| 総Phase数  | 13                               |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                   | ステータス |
| ----- | -------------------- | -------------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-01-requirements.md](phase-01-requirements.md)     | 完了       |
| 2     | 設計                 | [phase-02-design.md](phase-02-design.md)                 | 完了       |
| 3     | 設計レビューゲート   | [phase-03-design-review.md](phase-03-design-review.md)   | 完了       |
| 4     | テスト作成           | [phase-04-test-creation.md](phase-04-test-creation.md)   | 完了       |
| 5     | 実装                 | [phase-05-implementation.md](phase-05-implementation.md) | 完了       |
| 6     | テスト拡充           | [phase-06-test-expansion.md](phase-06-test-expansion.md) | 完了       |
| 7     | テストカバレッジ確認 | [phase-07-coverage.md](phase-07-coverage.md)             | 完了       |
| 8     | リファクタリング     | [phase-08-refactoring.md](phase-08-refactoring.md)       | 完了       |
| 9     | 品質保証             | [phase-09-quality.md](phase-09-quality.md)               | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)     | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)       | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)   | 完了       |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)       | blocked    |

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
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/runtime-skill-creator-ipc-wiring --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義サマリー, 現状棚卸し, 受入条件一覧                                                                                                                                                                                                      |
| 2     | -                                                                                                                                                                                                                                               |
| 3     | -                                                                                                                                                                                                                                               |
| 4     | runtime public handler 契約テスト, skillCreator entrypoint 統合テスト, renderer surface 契約テスト                                                                                                                                              |
| 5     | runtime public handler, 3チャンネル定数 + ホワイトリスト, 3メソッド追加, shared runtime contract                                                                                                                                                |
| 6     | auth fallback / handoff テスト拡充                                                                                                                                                                                                              |
| 7     | 37テスト全PASS、19分岐カバー                                                                                                                                                                                                                    |
| 8     | -                                                                                                                                                                                                                                               |
| 9     | typecheck PASS + 37テスト PASS                                                                                                                                                                                                                  |
| 10    | PASS判定                                                                                                                                                                                                                                        |
| 11    | review board fallback の実施チェックリスト, typecheck PASS / targeted vitest BLOCKED / visual 3件 PASS, product/spec follow-up 0件 + environment note 1件, review board PNG 3件の capture plan, review board PNG 3件, fallback capture metadata |
| 12    | Part 1 + Part 2 実装ガイド, system spec 実更新サマリー, ドキュメント変更ログ, product/spec 0件 + environment note 1件, 未タスク検出の根拠一覧, validator alias / fallback / close-out 改善, Task 12-1〜12-5 PASS                                |
| 13    | PR 情報テンプレート（user 指示待ち）                                                                                                                                                                                                            |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-03-21T11:14:44.924Z_
