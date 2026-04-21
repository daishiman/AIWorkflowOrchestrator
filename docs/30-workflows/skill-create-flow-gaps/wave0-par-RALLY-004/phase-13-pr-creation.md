# Phase 13: PR作成

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 13             |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 12       |
| 後続Phase  | -              |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当             | 実行形態 |
| ---------- | ---------------- | -------- |
| SubAgent-A | PR作成・完了確認 | **直列** |

## PR作成手順

```bash
# ブランチ確認
git branch

# 変更の最終確認
git diff packages/shared/src/types/skillCreator.ts

# コミット
git add packages/shared/src/types/skillCreator.ts
git commit -m "feat(types): RALLY-004 selectedOptionIds/selectedValues重複フィールド整理

- SkillCreatorUserInputSubmission.selectedOptionIds に @canonical JSDoc 追加
- SkillCreatorUserInputSubmission.selectedValues に @deprecated JSDoc 追加
- InterviewUserAnswer.selectedOptionIds に @canonical JSDoc 追加
- InterviewUserAnswer.selectedValues に @deprecated JSDoc 追加

rally-phase-1-analysis.md 懸念点9を解消。
RALLY-009（型ガード強化）の前提条件を確立。"

# PR作成
gh pr create \
  --title "feat(types): RALLY-004 selectedOptionIds/selectedValues重複フィールド整理" \
  --body "..."
```

## PR説明テンプレート

```markdown
## 概要

`packages/shared/src/types/skillCreator.ts` の重複フィールドに正規化マークを追加します。

## 変更内容

- `selectedOptionIds`: `@canonical` マーク追加（正規フィールド）
- `selectedValues`: `@deprecated` マーク追加（レガシー互換）

## 関連タスク

- TASK-RALLY-004
- 後続: RALLY-009（型ガード強化）

## テスト

- `pnpm typecheck` PASS
- `pnpm lint` PASS
- 既存テスト全件 PASS
```

## 完了条件

- [ ] PR が作成されている
- [ ] CI がすべて PASS している
- [ ] レビュアーがアサインされている

## タスク100%実行確認【必須】

- [ ] Phase 1（要件定義）完了・P50チェック実施済み
- [ ] Phase 2（設計）完了
- [ ] Phase 3（設計レビュー）完了
- [ ] Phase 4（テスト設計）完了
- [ ] Phase 5（実装）完了
- [ ] Phase 6（テスト拡充）完了
- [ ] Phase 7（カバレッジ確認）完了
- [ ] Phase 8（リファクタリング）完了
- [ ] Phase 9（品質保証）完了
- [ ] Phase 10（最終レビュー）完了
- [ ] Phase 11（手動テスト）完了
- [ ] Phase 12（ドキュメント）完了
- [ ] 受け入れ基準 AC-1〜AC-7 全 PASS
