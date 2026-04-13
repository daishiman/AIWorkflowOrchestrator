# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 13                                                                      |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 12                                                                |
| 後続Phase  | -                                                                       |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 重要: このフェーズはユーザー承認後のみ実施すること

**Phase 13 は Phase 1〜12 が全て完了し、ユーザーが PR 作成を明示的に承認した後にのみ実行する。**

自動実行・先行実行は禁止。必ずユーザーに確認を取ること。

---

## 目的

Phase 1〜12 の成果物をまとめ、GitHub Pull Request を作成する。
レビュアーが変更内容を理解しやすい PR 本文を作成し、CI が通ることを確認する。

## 実行タスク

- [ ] ブランチ名を確認・作成する
- [ ] 変更ファイルをステージングする
- [ ] コミットを作成する
- [ ] リモートへ push する
- [ ] PR を作成する（`gh pr create`）
- [ ] CI の通過を確認する

## 参照資料

| 資料名                    | パス                                                                            | 説明                    |
| ------------------------- | ------------------------------------------------------------------------------- | ----------------------- |
| 変更ファイル1             | `packages/shared/src/types/skillCreator.ts`                                     | PR に含める変更（修正） |
| 変更ファイル2             | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`     | PR に含める変更（修正） |
| 変更ファイル3             | `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | PR に含める変更（修正） |
| 変更ファイル4             | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`        | PR に含める変更（修正） |
| 変更ファイル5             | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`           | PR に含める変更（修正） |
| 変更ファイル6             | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | PR に含める変更（修正） |
| 変更ファイル7             | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`              | PR に含める変更（修正） |
| Phase 12 実装ガイド       | `outputs/phase-12/implementation-guide.md`                                      | PR 本文の根拠           |
| Phase 12 仕様準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md`                        | 最終確認の根拠          |

## 実行手順

### Step 1: ブランチ作成

```bash
# ブランチが未作成の場合
git checkout -b fix/task-sw-fix-ui-001-wizard-ui-consistency

# ブランチが既に存在する場合は確認
git branch --show-current
```

### Step 2: 変更ファイルのステージング

```bash
git add packages/shared/src/types/skillCreator.ts
git add packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts
git add apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts
git add apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx
git add apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
git add apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git add apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

テストファイルを変更した場合は合わせてステージングする:

```bash
git add packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
git add apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

### Step 3: コミット作成

```bash
git commit -m "$(cat <<'EOF'
fix(skill-wizard): TASK-SW-FIX-UI-001 UI整合性修正

問題2・3・11・15・16（UIクラスターD）を修正する。

変更内容:
- カテゴリ複数選択対応: SkillInfoFormData.category を SkillCategory[] に変更（問題2）
- カテゴリ解除: handleCategoryClick をトグル動作に修正（問題15）
- ProgressBar動的化: currentQuestion を回答済み問数から動的計算（問題11・16）
- ボタンスタイル統一: bg-blue-600 を CSS変数 --status-primary に統一（問題3）

対象ファイル:
- packages/shared/src/types/skillCreator.ts
- packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts
- apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts
- apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx
- apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
EOF
)"
```

### Step 4: リモートへ push

```bash
git push -u origin fix/task-sw-fix-ui-001-wizard-ui-consistency
```

### Step 5: PR 作成

````bash
gh pr create \
  --title "fix(skill-wizard): TASK-SW-FIX-UI-001 UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar）" \
  --body "$(cat <<'EOF'
## 概要

スキルウィザードのUI整合性問題（クラスターD: 問題2・3・11・15・16）を修正します。

## 変更内容

### 修正した問題

| 問題番号 | 問題内容                                          | 修正内容                                               |
| -------- | ------------------------------------------------- | ------------------------------------------------------ |
| 問題2    | カテゴリが単一選択のみ                            | `SkillCategory[]`型に変更し複数選択に対応             |
| 問題3    | ボタンスタイルの不統一（`bg-blue-600` hardcoded） | CSS変数 `--status-primary` / `--text-inverse` に統一   |
| 問題11   | `currentQuestion`が固定値（1または4）             | 回答済み問数から動的計算（`Math.max(1, answeredCount)`）|
| 問題15   | 選択済みカテゴリを再クリックしても解除できない    | `handleCategoryClick`をトグル動作に修正                |
| 問題16   | ProgressBarが実際の進捗と乖離                     | 問題11と同じ修正で解消                                 |

### 修正ファイル

| ファイル                                      | 変更内容                                      |
| --------------------------------------------- | --------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`   | `category: SkillCategory \| null` → `SkillCategory[]` |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` | format 推論を配列対応へ更新 |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | shared 推論への薄い再利用に整理 |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx` | Q5 必須判定を配列対応へ更新 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | `handleCategoryClick`トグル化・`isSelected`修正・ボタンCSS変数化 |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | `currentQuestion`動的計算・Q5 必須判定を配列対応 |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | shared 推論の利用・代表カテゴリ解決・LLMモードボタンCSS変数化 |

## 動作確認

- [x] カテゴリを複数選択できること
- [x] 選択済みカテゴリを再クリックで解除できること
- [x] 全ウィザードボタンが CSS変数スタイルで統一されていること
- [x] InterviewProgressBar が実際の回答数に応じて動的変化すること
- [x] 既存テストが全て通過すること

## テスト

```bash
pnpm --filter @repo/shared test
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop typecheck
````

## 注意事項

`SkillInfoFormData.category`の型変更は破壊的変更のため、
`@repo/shared/types/skillCreator`サブパスを参照している箇所への影響を確認済みです。
ルートbarrel（`@repo/shared`）への変更はありません。

## 関連タスク

- TASK-SW-FIX-UI-001（本タスク）
- 依存: TASK-SW-FIX-FEEDBACK-001（Wave B）
- 並列: TASK-SW-FIX-STATE-DETAIL-001（Wave C）
  EOF
  )"

````

### Step 6: CI 確認

```bash
# PR の CI 状態を確認
gh pr checks

# CI が失敗した場合は内容を確認
gh run list --limit 5
````

CI が全て通過するまで確認する。失敗した場合は内容を調査し、必要に応じて修正コミットを追加する。

## 成果物

- GitHub Pull Request（URL は PR 作成後に確認）

## 完了条件

- [ ] ユーザーの PR 作成承認を得ている
- [ ] ブランチが作成・push されている
- [ ] コミットメッセージがプロジェクトの規約に沿っている
- [ ] PR が作成されている
- [ ] PR 本文に変更内容・問題番号・チェックリストが記載されている
- [ ] CI が全て通過している
- [ ] PR の URL をユーザーに報告している
