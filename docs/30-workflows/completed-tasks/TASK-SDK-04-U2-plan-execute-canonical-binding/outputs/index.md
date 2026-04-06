# TASK-SDK-04-U2-plan-execute-canonical-binding - タスク実行仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| 機能名     | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 作成日     | 2026-03-27                                    |
| ステータス | spec_created                                  |
| 総Phase数  | 13                                            |

---

## Phase一覧

| Phase | 名称                 | 仕様書                          | ステータス |
| ----- | -------------------- | ------------------------------- | ---------- |
| 1     | 要件定義             | [phase-1-\*.md](phase-1-*.md)   | 完了       |
| 2     | 設計                 | [phase-2-\*.md](phase-2-*.md)   | 完了       |
| 3     | 設計レビューゲート   | [phase-3-\*.md](phase-3-*.md)   | 完了       |
| 4     | テスト作成           | [phase-4-\*.md](phase-4-*.md)   | 完了       |
| 5     | 実装                 | [phase-5-\*.md](phase-5-*.md)   | 完了       |
| 6     | テスト拡充           | [phase-6-\*.md](phase-6-*.md)   | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-\*.md](phase-7-*.md)   | 完了       |
| 8     | リファクタリング     | [phase-8-\*.md](phase-8-*.md)   | 完了       |
| 9     | 品質保証             | [phase-9-\*.md](phase-9-*.md)   | 完了       |
| 10    | 最終レビューゲート   | [phase-10-\*.md](phase-10-*.md) | 完了       |
| 11    | 手動テスト検証       | [phase-11-\*.md](phase-11-*.md) | 完了       |
| 12    | ドキュメント更新     | [phase-12-\*.md](phase-12-*.md) | 完了       |
| 13    | PR作成               | [phase-13-\*.md](phase-13-*.md) | 完了       |

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
  --workflow docs/30-workflows/completed-tasks/TASK-SDK-04-U2-plan-execute-canonical-binding/outputs --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書                                                                                                      |
| 2     | 設計書                                                                                                          |
| 3     | 設計レビュー結果                                                                                                |
| 4     | テスト仕様書                                                                                                    |
| 5     | 実装記録                                                                                                        |
| 6     | テスト拡充記録                                                                                                  |
| 7     | カバレッジレポート                                                                                              |
| 8     | リファクタリング記録                                                                                            |
| 9     | 品質保証レポート                                                                                                |
| 10    | 最終レビュー結果                                                                                                |
| 11    | 手動テストチェックリスト, 手動テスト結果, 手動テスト証跡計画                                                    |
| 12    | 実装ガイド, 仕様更新サマリ, ドキュメント変更履歴, 未タスク検出結果, スキルフィードバック, Phase 12 準拠チェック |
| 13    | 変更サマリ, ローカルチェック結果                                                                                |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-04-04T13:54:38.416Z_
