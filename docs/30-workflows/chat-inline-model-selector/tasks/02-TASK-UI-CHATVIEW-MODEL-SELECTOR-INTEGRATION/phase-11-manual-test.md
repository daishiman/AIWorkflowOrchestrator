# Phase 11: 手動テスト — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 機能名        | chat-inline-model-selector                                                                                                 |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION                                                                                |
| Phase         | 11                                                                                                                         |
| 作成日        | 2026-03-21                                                                                                                 |
| 依存          | Phase 10（最終レビュー）PASS/MINOR後                                                                                       |
| 前Phase成果物 | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-10-final-review.md |

## 目的

ElectronアプリをローカルでビルドしてChatViewでのモデル選択操作・メッセージ送信・ヘッダーレイアウトを視覚的に確認する。

## 実行タスク

- Electronアプリをdev環境で起動する
- ChatViewでのモデル選択操作を確認する
- メッセージ送信からAI応答までのフローを確認する
- ヘッダーレイアウトの視覚的整合性を確認する

## 参照資料

| 資料                                       | パス                                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | docs/30-workflows/chat-inline-model-selector/phase-2-design.md                                                             |
| Phase 10 最終レビュー結果                  | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-10-final-review.md |
| P53: CLI環境でのスクリーンショット取得制約 | .claude/rules/06-known-pitfalls.md#P53                                                                                     |
| Apple HIG アーキテクチャルール             | .claude/rules/01-architecture.md                                                                                           |

## 実行手順

### Step 1: アプリ起動

```bash
pnpm --filter @repo/desktop dev
```

### Step 2: シナリオ MT-1 — ChatViewでのモデル選択操作確認

**前提**: Electronアプリが起動しChatViewが表示された状態

1. ChatViewのヘッダー左側にInlineModelSelectorが表示されていることを目視確認する
2. SystemPromptToggleButtonがInlineModelSelectorの隣に配置されていることを確認する
3. InlineModelSelectorをクリックしてドロップダウンが開くことを確認する
4. 任意のプロバイダー・モデルを選択する
5. ドロップダウンが閉じ、選択したモデル名がInlineModelSelector上に表示されることを確認する

**期待結果**: 手順3〜5がすべて正常に動作する

**注記（P53）**: CLI環境でのスクリーンショット自動取得が困難な場合は、自動テスト（TC-I-1）の結果を間接的な視覚検証として代替記録する。

### Step 3: シナリオ MT-2 — メッセージ送信からAI応答の確認

**前提**: MT-1でモデルが選択された状態

1. テキスト入力欄に任意のメッセージを入力する
2. 送信ボタンをクリックする
3. ストリーミング中にInlineModelSelectorがdisabledになることを確認する
4. AI応答がストリーミングで表示されることを確認する
5. ストリーミング完了後にInlineModelSelectorがenabledに戻ることを確認する

**期待結果**: 手順2〜5がすべて正常に動作する

### Step 4: シナリオ MT-3 — ヘッダーレイアウトの視覚確認

**確認観点（Apple HIG準拠）:**

| 確認項目                                          | 期待                       | 結果     |
| ------------------------------------------------- | -------------------------- | -------- |
| InlineModelSelectorがヘッダー左側に配置されている | 左寄せ配置                 | （記入） |
| 8pxグリッドに基づくスペーシングが確保されている   | gap-2相当の余白            | （記入） |
| ライトモードで視覚的に問題がない                  | 高コントラスト・読みやすい | （記入） |
| ダークモードで視覚的に問題がない                  | Apple システムカラー準拠   | （記入） |
| コントラスト比が4.5:1以上である（テキスト部分）   | WCAG 2.1 AA準拠            | （記入） |

### Step 5: シナリオ MT-4 — モデル未選択時のガイダンス確認

1. LLMGuidanceBannerが表示された状態（モデル未選択）でChatViewを開く
2. LLMGuidanceBannerが表示されていることを目視確認する
3. InlineModelSelectorでモデルを選択する
4. LLMGuidanceBannerが非表示になることを確認する

**期待結果**: 手順2・4がともに正常

### Step 6: 手動テスト結果の記録

```
MT-1（モデル選択操作）: PASS / FAIL
MT-2（メッセージ送信）: PASS / FAIL
MT-3（ヘッダーレイアウト）: PASS / FAIL
MT-4（ガイダンスバナー）: PASS / FAIL
```

## 成果物

| 成果物                             | パス       | 説明                 |
| ---------------------------------- | ---------- | -------------------- |
| 手動テスト結果（本ファイルへ追記） | 本ファイル | MT-1〜MT-4の実施結果 |

**実施結果（実行時に記入）:**

| シナリオ                 | 結果     | 備考     |
| ------------------------ | -------- | -------- |
| MT-1: モデル選択操作     | （記入） | （記入） |
| MT-2: メッセージ送信     | （記入） | （記入） |
| MT-3: ヘッダーレイアウト | （記入） | （記入） |
| MT-4: ガイダンスバナー   | （記入） | （記入） |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 11
```

## 画面カバレッジマトリクス

| 画面/コンポーネント                    | ライトモード  | ダークモード  | 操作確認      |
| -------------------------------------- | ------------- | ------------- | ------------- |
| ChatViewヘッダー + InlineModelSelector | 確認済/未確認 | 確認済/未確認 | 確認済/未確認 |
| モデル選択後のチャット送信             | 確認済/未確認 | 確認済/未確認 | 確認済/未確認 |
| LLMGuidanceBanner表示/非表示           | 確認済/未確認 | 確認済/未確認 | N/A           |
| ストリーミング中のdisabled状態         | 確認済/未確認 | 確認済/未確認 | 確認済/未確認 |

## 完了条件

- [ ] MT-1（モデル選択操作）がPASS
- [ ] MT-2（メッセージ送信・AI応答）がPASS
- [ ] MT-3（ヘッダーレイアウト視覚確認）がPASS
- [ ] MT-4（モデル未選択時ガイダンスバナー）がPASS
- [ ] 結果が成果物テーブルに記録されている

## 次のPhase

[Phase 12: ドキュメント](./phase-12-documentation.md)
