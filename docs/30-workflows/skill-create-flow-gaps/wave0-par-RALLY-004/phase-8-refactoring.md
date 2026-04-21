# Phase 8: リファクタリング

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 8              |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 7        |
| 後続Phase  | Phase 9        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                         | 実行形態 |
| ---------- | ---------------------------- | -------- |
| SubAgent-A | JSDoc 文言の統一性確認・整形 | **直列** |

## リファクタリング方針

本タスクは JSDoc コメント追加のみであり、ロジックの変更を伴わない。リファクタリングの対象は以下に限定する。

- `@canonical` / `@deprecated` の文言が2箇所で統一されているか確認する
- JSDoc のインデントや空行が既存コードスタイルと一致しているか確認する
- Prettier フォーマットが適用済みであることを確認する

## 確認コマンド

```bash
# Prettier フォーマット確認
pnpm --filter @repo/shared format:check

# または手動フォーマット
pnpm --filter @repo/shared format
```

## 完了条件

- [ ] `@canonical` JSDoc が `SkillCreatorUserInputSubmission` と `InterviewUserAnswer` の両方で文言統一されている
- [ ] `@deprecated` JSDoc が `SkillCreatorUserInputSubmission` と `InterviewUserAnswer` の両方で文言統一されている
- [ ] Prettier フォーマットが適用済みである

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証
