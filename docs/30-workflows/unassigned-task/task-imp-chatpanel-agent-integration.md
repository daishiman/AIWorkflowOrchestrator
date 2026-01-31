# ChatPanel + Agent Execution統合 - タスク指示書

## メタ情報

```yaml
issue_number: 593
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-7D                                                 |
| タスク名     | ChatPanel + Agent Execution統合                         |
| 分類         | 改善                                                    |
| 対象機能     | Agent Execution UI / ChatPanel                          |
| 優先度       | 高                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | arch-state-management.md（TASK-7Cまでの関連タスク一覧） |
| 発見日       | 2026-01-31                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Agent SDK統合のUIコンポーネント実装はTASK-7A（SkillSelector）→ TASK-7B（SkillImportDialog）→ TASK-7C（PermissionDialog）の順で進行し、すべて完了している。TASK-7Dは最後のUIコンポーネント統合タスクであり、ChatPanelとAgent Executionフローを結合して、ユーザーがスキルを選択→実行→対話できるエンドツーエンドのフローを実現する。

### 1.2 問題点・課題

- 現在、Agent Execution UIの各コンポーネント（SkillSelector、PermissionDialog、SkillStreamDisplay等）は個別に実装・テスト済みだが、ChatPanelとの統合がされていない
- ユーザーがメインのChatPanelからAgent Executionフローを開始・管理する導線が存在しない
- AgentExecutionView（views/AgentExecutionView/）とメインChatPanel間の状態連携が未実装

### 1.3 放置した場合の影響

- Agent SDK機能がUIとして完結せず、ユーザーがスキル実行機能にアクセスできない
- 実装済みコンポーネント（TASK-7A〜7C）が孤立し、機能として利用不可の状態が継続
- Agent SDK統合の最終ゴール（ユーザーがスキルを対話的に実行）が達成できない

---

## 2. 何を達成するか（What）

### 2.1 目的

メインChatPanelとAgent Execution UIを統合し、ユーザーがChatPanel上からスキルの選択・実行・対話・権限確認を一貫して行えるフローを構築する。

### 2.2 最終ゴール

- ChatPanelからスキル実行を開始できる
- ストリーミングレスポンスがChatPanel内にリアルタイム表示される
- PermissionDialogがChatPanel上に適切にオーバーレイ表示される
- 実行状態（idle/executing/streaming/awaiting_permission/completed/cancelled/error）がChatPanel UIに反映される
- 全57件の既存テスト + 新規統合テストがPASSする

### 2.3 スコープ

#### 含むもの

- ChatPanelコンポーネントへのAgent Execution機能統合
- AgentExecutionView → ChatPanel間の状態連携
- skillSlice/agentSliceの統合利用
- SkillSelector表示トリガーの実装
- ストリーミング出力のChatPanel内表示
- PermissionDialogのChatPanel内モーダル表示
- 統合テスト（E2Eレベル）の作成

#### 含まないもの

- SkillSelector、PermissionDialog、SkillStreamDisplay等の個別コンポーネント修正（既存機能の変更は最小限）
- Main Process側のSkillExecutor修正
- IPC通信プロトコルの変更
- 新しいPreload APIの追加（既存のwindow.skillAPI/window.agentAPIを使用）

### 2.4 成果物

| 成果物              | パス                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| ChatPanel統合実装   | `apps/desktop/src/renderer/views/ChatPanel/` 配下                    |
| 統合テスト          | `apps/desktop/src/renderer/views/ChatPanel/__tests__/`               |
| E2Eテスト（該当時） | `apps/desktop/e2e/chatpanel-agent-integration.spec.ts`               |
| 実装ガイド          | `docs/30-workflows/TASK-7D/outputs/phase-12/implementation-guide.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-7A（SkillSelector）完了 ✅
- TASK-7B（SkillImportDialog）完了 ✅
- TASK-7C（PermissionDialog）完了 ✅
- TASK-IMP-permission-tool-icons（ツールアイコン）完了 ✅
- TASK-6-1（SkillSlice Zustand）完了 ✅
- TASK-5-1（SkillAPI Preload）完了 ✅

### 3.2 依存タスク

| タスクID | 内容             | ステータス |
| -------- | ---------------- | ---------- |
| TASK-7C  | PermissionDialog | 完了       |
| TASK-6-1 | SkillSlice実装   | 完了       |
| TASK-5-1 | SkillAPI Preload | 完了       |

### 3.3 必要な知識

- React + TypeScript（コンポーネント設計、Hooks）
- Zustand状態管理（skillSlice, agentSlice の構造理解）
- Electron IPC通信パターン（Preload API経由）
- WCAG 2.1 AA アクセシビリティ要件

### 3.4 推奨アプローチ

1. 既存のAgentExecutionViewのロジックをChatPanelに統合する形で実装
2. skillSlice/agentSliceのセレクターを使い、ChatPanel内で実行状態を管理
3. 条件付きレンダリングで通常チャットモードとAgent実行モードを切り替え
4. Store-directパターン（TASK-7Cと同じ）で状態取得

---

## 4. 実行手順

### Phase構成

task-specification-creatorの13-Phaseワークフローに従い、Phase 1〜13を実行する。

### Phase 1: タスク分解・要件分析

#### 目的

ChatPanel統合の要件を整理し、サブタスクに分解する。

#### 手順

1. ChatPanelの現在の構造を調査（ファイル構成、Props、状態管理）
2. AgentExecutionViewの構造を調査（統合対象のロジック特定）
3. 統合ポイント（モード切替、状態連携、イベントハンドリング）を定義

#### 成果物

- タスク分解結果（サブタスク一覧）

#### 完了条件

- 統合対象のコンポーネントとロジックが明確に特定されている

### Phase 5: 実装

#### 目的

ChatPanelとAgent Execution UIの統合実装。

#### 手順

1. ChatPanel内にAgent実行モードのUIを追加
2. SkillSelectorの表示トリガーを実装（ツールバーボタン等）
3. ストリーミング出力のChatPanel内レンダリングを実装
4. PermissionDialogのモーダル表示を接続
5. 実行状態に応じたUI切り替えロジックを実装
6. エラー状態の表示を実装

#### 成果物

- ChatPanel統合コード（TypeScript）

#### 完了条件

- ChatPanelからスキル実行→対話→完了の全フローが動作する
- TypeScript strict PASS
- ESLint/Prettier PASS

### Phase 6-7: テスト

#### 目的

統合テストの作成と実行。

#### 手順

1. ユニットテスト作成（モード切替、状態連携、イベント処理）
2. 統合テスト作成（ChatPanel + Agent Execution全フロー）
3. アクセシビリティテスト（キーボードナビ、スクリーンリーダー対応）
4. 既存テスト（57件）が全てPASSすることを確認

#### 成果物

- テストファイル
- テスト結果レポート

#### 完了条件

- Line Coverage 95%以上
- 既存テスト全件PASS
- 新規テスト全件PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ChatPanelからSkillSelectorを表示できる
- [ ] スキル選択後、Agent Execution フローが開始される
- [ ] ストリーミングレスポンスがChatPanel内にリアルタイム表示される
- [ ] PermissionDialogがChatPanel上にモーダル表示される
- [ ] 実行キャンセルが正常に動作する
- [ ] エラー状態が適切に表示される
- [ ] 実行完了後に通常チャットモードに戻れる

### 品質要件

- [ ] TypeScript strict PASS
- [ ] ESLint PASS
- [ ] Prettier PASS
- [ ] Line Coverage 95%以上
- [ ] Branch Coverage 85%以上
- [ ] 既存テスト57件が全てPASS

### ドキュメント要件

- [ ] 実装ガイド（Phase 12）が作成されている
- [ ] システム仕様書（arch-state-management.md）が更新されている
- [ ] interfaces-agent-sdk-ui.mdに統合仕様が追記されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                          | 期待結果                                   |
| --- | ------------------------------------- | ------------------------------------------ |
| 1   | ChatPanelでスキル選択ボタンをクリック | SkillSelectorが表示される                  |
| 2   | スキルを選択して実行開始              | 実行状態がexecutingに遷移                  |
| 3   | ストリーミング中のUI表示              | テキストが逐次表示される                   |
| 4   | PermissionDialog表示                  | モーダルが表示されフォーカストラップが動作 |
| 5   | 権限許可後に実行再開                  | ストリーミングが継続される                 |
| 6   | 実行キャンセル                        | 状態がcancelledに遷移しUIがリセット        |
| 7   | エラー発生時                          | エラーメッセージが表示される               |
| 8   | 実行完了                              | 完了状態が表示され通常モードに戻れる       |

### 検証手順

1. `pnpm --filter @repo/desktop test` でユニットテストを実行
2. `pnpm --filter @repo/desktop typecheck` で型チェック
3. `pnpm lint` でLint確認
4. 手動でChatPanel→スキル実行→完了の全フローを確認

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                         |
| ----------------------------------- | ------ | -------- | -------------------------------------------- |
| 既存ChatPanelの構造が複雑で統合困難 | 中     | 中       | 既存構造を事前調査し、最小限の変更で統合する |
| skillSlice/agentSliceの状態競合     | 高     | 低       | shallow比較セレクターで必要な状態のみ購読    |
| アクセシビリティ要件の見落とし      | 中     | 低       | WCAG 2.1 AAチェックリストを使用              |
| 既存テストの破損                    | 高     | 低       | 統合前に既存テスト全件PASSを確認             |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------- |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`        |
| Agent SDK UI仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`      |
| Agent SDK履歴          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`        |
| SkillSlice実装         | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                              |
| PermissionDialog実装   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                   |

### 参考資料

- TASK-7C PermissionDialog実装ガイド: `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md`
- TASK-IMP ツールアイコン実装ガイド: `docs/30-workflows/TASK-IMP-permission-tool-icons/outputs/phase-12/implementation-guide.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
arch-state-management.md L324:
| TASK-7D  | ChatPanel統合             | 未着手     |
```

### 補足事項

- TASK-7A〜7Cで確立されたStore-directパターン、TDDサイクル（Red→Green→Refactor）、WCAG 2.1 AAアクセシビリティ準拠を踏襲すること
- PermissionDialogのtoolIconsマッピング（TASK-IMP-permission-tool-icons-001）が統合後も正しく動作することを確認すること
- ChatPanelの既存機能（テキストチャット）を壊さない形で統合すること
