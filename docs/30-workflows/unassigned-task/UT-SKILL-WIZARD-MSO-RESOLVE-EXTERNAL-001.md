# スキルウィザード Q5 複数ツール並列統合対応 - タスク指示書

## メタ情報

```yaml
issue_number: 2069
task_id: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001
task_name: resolveExternalIntegration 複数ツール並列統合対応
category: 新機能
target_feature: skill-wizard/resolve-external-integration
priority: 低
scale: 中規模
status: 未実施
created_date: 2026-04-09
dependencies: [UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001]
dependencies_status:
  UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: completed # 2026-04-13 完了（Issue #2071 CLOSED）
origin_task: skill-wizard-multi-select-options（CONST_FUTURE-001 として登録）
```

## メタ情報

| 項目         | 内容                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001                                                       |
| タスク名     | resolveExternalIntegration 複数ツール並列統合対応                                              |
| 分類         | 新機能                                                                                         |
| 対象機能     | スキル作成ウィザード - Q5 外部ツール統合処理                                                   |
| 優先度       | 低                                                                                             |
| 見積もり規模 | 中規模                                                                                         |
| ステータス   | 未実施                                                                                         |
| 発見元       | skill-wizard-multi-select-options Phase 12 未タスク検出（CONST_FUTURE-001）                    |
| 発見日       | 2026-04-09                                                                                     |
| タスク分類   | NON_VISUAL（Renderer 内部のロジック変更のみ）                                                  |
| 参照タスク   | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/implementation-guide.md` |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-wizard-multi-select-options` タスクにおいて、Q5「どの外部ツールを統合しますか？」の
回答型が `selectedOption: string | null` から `selectedOptions: string[]` へ変更された。

複数選択が可能になったため、ユーザーは「GitHub + Slack」のように複数の外部ツールを
同時に選択できる。しかし現在の `resolveExternalIntegration` 実装は先頭値のみを参照する：

```typescript
// 現在の実装（先頭値のみ）
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

この制約はスコープ外として `M-01` TODO コメントで明示・記録済みだが、
本実装では複数ツールが選ばれても最初のツールしか統合されない問題が残る。

### 1.2 問題点・課題

- Q5 で複数ツールを選択しても、先頭ツールのみが `resolveExternalIntegration` に渡される
- 「GitHub + Slack」「GitHub + Notion」などの複数ツール並列統合が実現できない
- スキル生成プロンプトに複数ツールの情報が渡らず、生成品質が低下する可能性がある

### 1.3 放置した場合の影響

- Q5 複数選択 UX を提供しておきながら、実際には最初の選択しか反映されないという
  UX と機能の乖離が生じる
- ユーザーが複数ツールを選んでも「2番目以降が無視される」という混乱を招く

---

## 2. 何を達成するか（What）

### 2.1 目的

`resolveExternalIntegration` に複数ツールを受け取る API を設計し、
選択された全ツールの統合情報をスキル生成プロンプトに反映する。

### 2.2 受入条件（AC）

| AC   | 内容                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------- |
| AC-1 | `resolveExternalIntegration` が `string[]` を受け取り、複数ツールを並列で処理できる            |
| AC-2 | 各ツールの統合情報（API エンドポイント・認証方式・主要操作）がそれぞれ取得・マージされる       |
| AC-3 | 単一ツール選択時は従来と同一の動作を維持する（後方互換性）                                     |
| AC-4 | 空配列 `[]` や未対応ツールに対して安全にフォールバックする                                     |
| AC-5 | `SkillCreateWizard.tsx` の `resolveExternalIntegration` 呼び出し箇所が複数ツールを渡すよう更新 |
| AC-6 | `resolveExternalIntegration` のテストカバレッジが 90% 以上                                     |
| AC-7 | M-01 TODO コメントが削除される（本タスク完了のマーカー）                                       |

### 2.3 スコープ

含むもの:

- `SkillCreateWizard.tsx` 内 `resolveExternalIntegration` 呼び出し箇所の変更
- `resolveExternalIntegration` 関数シグネチャ（`string` → `string[]` 対応）
- 複数ツール情報のマージロジック実装
- 対応ユニットテストの追加・更新

含まないもの:

- Q5 の UI 表示変更（別タスク `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001` でカバー）
- 新規ツール統合情報の追加（既存ツール定義の範囲で対応）

---

## 3. 苦戦箇所・実装上の注意

### 3.1 発見元タスクでの教訓

`skill-wizard-multi-select-options` 実装時の `M-01` コメント：

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

### 3.2 設計上の考慮点

- 複数ツール情報のマージ戦略を事前に設計すること（結合 vs 先頭優先 vs 順序保証）
- ツール間で依存関係がある場合（GitHub → Slack 通知など）の処理順序を定義すること
- `SmartDefaultResult` は `string | null` 型のままであることを前提とし、
  変換は UI 層で完結させること（バックエンド変更なし）

### 3.3 前提タスク（UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001）実装完了による追加教訓

**完了日**: 2026-04-13（Issue #2071 CLOSED）

#### バッジ削除手順（本タスク実装時に必須）

`ConversationRoundStep.tsx` に暫定バッジが実装されており、本タスク完了時に削除が必要：

1. `MAIN_TOOL_BADGE_ENABLED` フラグと `shouldShowMainToolBadge` 関数を削除
2. `aria-describedby` を含むバッジ JSX（`<span id={mainToolBadgeId} ...>主ツール</span>`）を削除
3. `ConversationRoundStep.test.tsx` の主ツールバッジ関連テスト（TC-1〜TC-6）を削除
4. `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントを削除

詳細は `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-12/implementation-guide.md` の「削除手順」セクション参照。

#### aria アクセシビリティ設計の注意点

バッジを削除した後、`aria-labelledby` 参照が残ると button の accessible name が壊れる可能性がある：

- `aria-labelledby={optionLabelId}` は button 名の固定に使用 → バッジ削除後も維持すること
- `aria-describedby={isMainTool ? mainToolBadgeId : undefined}` はバッジ削除と同時に削除
- テストの `screen.getByRole("button", { name: "Slack" })` は削除後も通ることを確認する

---

## 4. 関連情報

| 項目                 | 内容                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 関連タスク           | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001（Q5「主ツール」UI表示）**← 完了済み**                                                                    |
| 前提タスク実装ガイド | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-12/implementation-guide.md`（バッジ削除手順含む）       |
| 参照ファイル         | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                            |
| M-01 TODO            | `SkillCreateWizard.tsx` 内の `resolveExternalIntegration` 呼び出し箇所                                                                        |
| バッジ実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（`shouldShowMainToolBadge` / `MAIN_TOOL_BADGE_ENABLED` を削除） |
