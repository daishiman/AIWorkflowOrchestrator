# Phase 4: テスト作成（TDD: Red）- タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 4                                   |
| Phase名   | テスト作成                          |
| カテゴリ  | TDD-Red                             |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 1, Phase 2, Phase 3           |
| 後続Phase | Phase 5                             |

## 目的

期待される動作を検証するテストをTDDのRed原則に従い、実装より先に作成する。ChatPanel統合とSkillStreamingViewの全テストが失敗状態（Red）で完了する。

## 実行タスク

### タスク1: ChatPanel統合テスト作成

**目的**: ChatPanelの統合機能をテストするファイルを作成する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` を修正する（既存テストに統合テストを追加）
2. 以下のテストケースを作成する:

**レンダリング系テスト**:

- `SkillSelectorがヘッダー内にレンダリングされる`
- `選択中のスキル名がヘッダーに表示される`
- `PermissionDialogが常時マウントされている`

**SkillStreamingView連携テスト**:

- `isExecuting && selectedSkillNameがtruthyの場合、SkillStreamingViewが表示される`
- `isExecutingがfalseの場合、SkillStreamingViewが表示されない`
- `selectedSkillNameがnullの場合、SkillStreamingViewが表示されない`
- `SkillStreamingViewにskillName/messages/statusが正しく渡される`

**SkillImportDialog連携テスト**:

- `onImportRequest呼び出しでSkillImportDialogが表示される`
- `SkillImportDialogのonCloseでダイアログが閉じる`

**アクセシビリティテスト**:

- `aria-live属性がストリーミングエリアに設定されている`

3. 全テストが失敗することを確認する（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`（修正）

### タスク2: SkillStreamingViewテスト作成

**目的**: SkillStreamingViewコンポーネントの動作を検証するテストファイルを作成する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` を作成する
2. 以下のテストケースを作成する:

**StatusBadgeテスト**:

- `status === "running"の場合、青いバッジに"実行中..."が表示される`
- `status === "permission_pending"の場合、黄色いバッジに"権限確認"が表示される`
- `status === "completed"の場合、緑のバッジに"完了"が表示される`
- `status === "cancelled"の場合、灰色のバッジに"キャンセル"が表示される`
- `status === "error"の場合、赤いバッジに"エラー"が表示される`
- `status === nullの場合、バッジが表示されない`
- `status === "idle"の場合、バッジが表示されない`

**StreamMessageItemテスト**:

- `assistantメッセージのテキストが表示される`
- `assistant.isPartialがtrueの場合、▌カーソルが表示される`
- `tool_useメッセージに🔧アイコンとツール名が表示される`
- `tool_result成功時に✅が表示される`
- `tool_result失敗時に❌とエラーメッセージが表示される`
- `errorメッセージが赤色で表示される`

**ToolExecutionHistoryテスト**:

- `ツール実行履歴が折りたたみ表示される`
- `ツールメッセージがゼロの場合、履歴が表示されない`
- `ツール数が正しく計算される（toolMessages.length / 2）`

**中止ボタンテスト**:

- `status === "running"の場合、中止ボタンが表示される`
- `中止ボタンクリックでabortExecutionが呼ばれる`
- `status !== "running"の場合、中止ボタンが表示されない`

**アクセシビリティテスト**:

- `ストリーミングエリアにrole="log"とaria-live="polite"が設定されている`
- `中止ボタンにaria-label="スキル実行を中止する"が設定されている`
- `StatusBadgeにrole="status"が設定されている`

3. 全テストが失敗することを確認する（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`

### タスク3: テスト仕様書の作成

**目的**: テスト設計をドキュメントとして記録する。

**手順**:

1. タスク1〜2のテストケースをテスト仕様書としてまとめる
2. 統合テスト設計（コンポーネント間連携テスト）を文書化する

**期待される成果物**:

- テスト仕様書（`outputs/phase-4/test-specification.md`）
- テストケース一覧（`outputs/phase-4/test-cases.md`）
- 統合テスト設計（`outputs/phase-4/integration-test-design.md`）

## 参照資料

| 参照資料                  | パス                                         | 内容               |
| ------------------------- | -------------------------------------------- | ------------------ |
| Phase 1要件定義書         | `outputs/phase-1/requirements-definition.md` | 要件一覧           |
| Phase 2コンポーネント設計 | `outputs/phase-2/component-design.md`        | コンポーネント階層 |
| Phase 2状態管理設計       | `outputs/phase-2/state-management-design.md` | 状態管理パターン   |
| Phase 3レビュー結果       | `outputs/phase-3/design-review-result.md`    | 設計レビュー       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` | コンポーネント仕様 |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                                | テストファイル              |
| ------------------ | ------------------------------------------------------- | --------------------------- |
| データフローテスト | skillSlice → ChatPanel → SkillStreamingViewのProps渡し  | ChatPanel.test.tsx          |
| コンポーネント連携 | SkillSelector → onImportRequest → SkillImportDialog表示 | ChatPanel.test.tsx          |
| 状態遷移テスト     | isExecuting/statusの変更によるUI切り替え                | ChatPanel.test.tsx          |
| エラーハンドリング | errorメッセージの表示                                   | SkillStreamingView.test.tsx |

## アーキテクチャ層別テスト

| 層               | テスト観点                                   | テストファイル配置                                                                 |
| ---------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Renderer Process | UIコンポーネント、状態管理、条件レンダリング | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           |
| Renderer Process | サブコンポーネント動作                       | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |

## 成果物

| 成果物                   | パス                                                                               | 種別     |
| ------------------------ | ---------------------------------------------------------------------------------- | -------- |
| テスト仕様書             | `outputs/phase-4/test-specification.md`                                            | document |
| テストケース一覧         | `outputs/phase-4/test-cases.md`                                                    | document |
| 統合テスト設計           | `outputs/phase-4/integration-test-design.md`                                       | document |
| ChatPanelテスト          | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           | code     |
| SkillStreamingViewテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` | code     |

## 完了条件

- [ ] ChatPanel統合テストが作成されている（レンダリング、連携、a11y）
- [ ] SkillStreamingViewテストが作成されている（StatusBadge、StreamMessageItem、ToolExecutionHistory、中止ボタン、a11y）
- [ ] 全テストが失敗状態（Red）である
- [ ] テスト仕様書・テストケース一覧が作成されている
- [ ] 統合テスト設計が文書化されている
- [ ] 既存テスト57件が全てPASSしていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx

# 確認項目
# - [ ] 新規テストが失敗することを確認（Red状態）
# - [ ] 既存テスト57件が全てPASS
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: ChatPanel統合テスト作成
3. タスク2: SkillStreamingViewテスト作成
4. タスク3: テスト仕様書の作成
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）→ [phase-5-implementation.md](phase-5-implementation.md)
