# Phase 13: PR 作成

## メタ情報

- Phase: 13
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 重要: このフェーズはユーザー承認後のみ実施すること

**Phase 13 は Phase 1〜12 が全て完了し、ユーザーが PR 作成を明示的に承認した後にのみ実行する。**

自動実行・先行実行は禁止。必ずユーザーに確認を取ること。

---

## 目的

Phase 1〜12 の成果物をまとめ、GitHub Pull Request を作成する。レビュアーが変更内容を理解しやすい PR 本文を作成し、CI が通ることを確認する。

## 実行タスク

- [ ] ブランチ名を確認・作成する
- [ ] 変更ファイルをステージングする
- [ ] コミットを作成する
- [ ] リモートへ push する
- [ ] PR を作成する（`gh pr create`）
- [ ] CI の通過を確認する

## 参照資料

| 資料名                    | パス                                                              | 説明                        |
| ------------------------- | ----------------------------------------------------------------- | --------------------------- |
| 変更ファイル 1            | `packages/shared/src/types/skillCreator.ts`                       | PR に含める変更（追記）     |
| 変更ファイル 2            | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | PR に含める変更（新規作成） |
| Phase 12 仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`                  | Step 1 / Step 2 の根拠      |
| Phase 12 仕様準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md`          | 最終確認の根拠              |

## 実行手順

### Step 1: ブランチ作成

```bash
# ブランチが未作成の場合
git checkout -b feat/ut-skill-wizard-t01-skill-info-form-types

# ブランチが既に存在する場合は確認
git branch --show-current
```

### Step 2: 変更ファイルのステージング

```bash
git add packages/shared/src/types/skillCreator.ts
git add packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
```

### Step 3: コミット作成

```bash
git commit -m "$(cat <<'EOF'
feat(shared/types): UT-SKILL-WIZARD-W0-seq-01 スキルウィザード共有型定義追加

スキルウィザード再設計 Wave 0 の先行タスク。
Step 0/Step 1/Step 3 で必要になる共有型契約を skillCreator.ts へ追記。

追加型:
- SkillCategory: Step 0 のカテゴリ選択用 type union
- SkillInfoFormData: Step 0 フォームデータ
- SkillWizardScheduleConfig: Q3 定期実行設定（既存 ScheduleConfig との衝突回避）
- QuestionAnswer: Q1〜Q6 の個別回答
- ConversationAnswers: 6 問の回答集約型
- SmartDefaultResult: Q1〜Q6 のスマートデフォルトと推論ログ
- SkeletonQualityFeedback: 骨格品質フィードバック

テスト:
- packages/shared/src/types/__tests__/skillCreator-wizard.test.ts を新規作成
EOF
)"
```

### Step 4: リモートへ push

```bash
git push -u origin feat/ut-skill-wizard-t01-skill-info-form-types
```

### Step 5: PR 作成

````bash
gh pr create \
  --title "feat(shared/types): UT-SKILL-WIZARD-W0-seq-01 スキルウィザード共有型定義追加" \
  --body "$(cat <<'EOF'
## 概要

スキルウィザード再設計（skill-wizard-redesign）の Wave 0 先行タスク。
`packages/shared/src/types/skillCreator.ts` に Step 0/Step 1/Step 3 で必要な共有型定義を追記します。

## 変更内容

### 追加ファイル

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`（新規作成）

### 修正ファイル

- `packages/shared/src/types/skillCreator.ts`（末尾にセクション追記）

### 追加した型

| 型名 | 種別 | 用途 |
|------|------|------|
| `SkillCategory` | type union | Step 0 のカテゴリ選択値（5 種） |
| `SkillInfoFormData` | interface | Step 0 フォームデータ |
| `SkillWizardScheduleConfig` | interface | Q3 の定期実行設定 |
| `QuestionAnswer` | interface | Q1〜Q6 の個別回答 |
| `ConversationAnswers` | interface | 6 問の回答集約 |
| `SmartDefaultResult` | interface | Q1〜Q6 のスマートデフォルトと推論ログ |
| `SkeletonQualityFeedback` | interface | 骨格品質フィードバック |

## 命名上の注意点

既存の `ScheduleConfig`（スキル実行スケジュール管理用）と同名になるため、
ウィザード用スケジュール設定は `SkillWizardScheduleConfig` に改名しています。

## テスト

```bash
pnpm --filter @repo/shared test
pnpm --filter @repo/shared typecheck
````

## チェックリスト

- [x] 既存型との衝突なし（`ScheduleConfig` → `SkillWizardScheduleConfig` で回避）
- [x] 全型に `export` キーワード付与
- [x] 全フィールドに JSDoc コメント記載
- [x] 型テスト全件パス
- [x] 型チェック通過
- [x] リント通過

## 関連タスク

- UT-SKILL-WIZARD-W0-seq-01（本タスク）
- 後続 Wave 1 以降のタスク群（このタスク完了後に開始可能）
  EOF
  )"

````

### Step 6: CI 確認

```bash
# PR の CI 状態を確認
gh pr checks

# CI が失敗した場合は内容を確認
gh run list --limit 5
```

CI が全て通過するまで確認する。失敗した場合は内容を調査し、必要に応じて修正コミットを追加する。

## 成果物

- GitHub Pull Request（URL は PR 作成後に確認）

## 完了条件

- [ ] ユーザーの PR 作成承認を得ている
- [ ] ブランチが作成・push されている
- [ ] コミットメッセージがプロジェクトの規約に沿っている
- [ ] PR が作成されている
- [ ] PR 本文に変更内容・命名上の注意点・チェックリストが記載されている
- [ ] CI が全て通過している
- [ ] PR の URL をユーザーに報告している
````
