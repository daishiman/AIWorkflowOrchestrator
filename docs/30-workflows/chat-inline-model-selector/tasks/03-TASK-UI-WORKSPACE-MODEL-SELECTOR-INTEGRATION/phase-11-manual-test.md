# Phase 11: 手動テスト

## メタ情報

| 項目          | 内容                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 11                                                                                                                            |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                             |
| 作成日        | 2026-03-21                                                                                                                    |
| 担当          | -                                                                                                                             |
| ステータス    | 未着手                                                                                                                        |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-10-final-review.md` |

## 目的

Electronアプリを実際に起動し、WorkspaceChatPanelでのモデル選択操作・チャット送信・compact表示の視覚確認を手動で行う。

## 実行タスク

### 事前準備

```bash
# Electron アプリのビルドと起動
cd apps/desktop
pnpm dev
```

### シナリオ1: WorkspaceChatPanelでのモデル選択操作確認

**目的**: WorkspaceChatPanel上部にInlineModelSelector(compact)が正しく表示・操作できることを確認する

**手順**:

1. アプリを起動してワークスペース画面（WorkspaceView）を開く
2. WorkspaceChatPanelの上部にInlineModelSelectorが表示されていることを確認する
3. InlineModelSelectorをクリックしてドロップダウンを開く
4. プロバイダーを選択する（例: anthropic）
5. モデルを選択する（例: claude-3-5-sonnet）
6. GuidanceBlock（モデル未選択案内）が非表示になることを確認する
7. チャット入力フィールドが有効化されることを確認する

**期待結果**:

- InlineModelSelectorがcompact表示でパネル上部に配置されている
- モデル選択後にGuidanceBlock(variant="blocked")が消える
- チャット入力が有効になる

**実際の結果**: （実行時に記入）

---

### シナリオ2: ワークスペース内チャット送信とAI応答の確認

**目的**: モデル選択後にワークスペース内チャットでAI応答が正常に返ることを確認する

**手順**:

1. シナリオ1でモデルを選択した状態でチャット入力フィールドにメッセージを入力する
2. 送信ボタンをクリック（またはEnterキー）する
3. ストリーミング中にInlineModelSelectorがdisabled（グレーアウト）になることを確認する
4. AI応答が返ってきたらInlineModelSelectorがdisabledから通常状態に戻ることを確認する
5. 応答内容が選択したモデルからのものであることを確認する

**期待結果**:

- チャット送信が正常に行われる
- ストリーミング中はInlineModelSelectorが操作不能になる
- ストリーミング完了後にInlineModelSelectorが操作可能に戻る
- AI応答が正常に表示される

**実際の結果**: （実行時に記入）

---

### シナリオ3: パネルレイアウトの視覚確認（compact表示）

**目的**: InlineModelSelectorのcompact表示がWorkspaceChatPanelのレイアウトを適切に使用していることを視覚確認する

**手順**:

1. WorkspaceChatPanelを表示する
2. InlineModelSelector(compact)がパネル幅に対して適切なサイズで表示されていることを確認する
3. パネルを縦方向にリサイズして、compactレイアウトが維持されることを確認する
4. ライトモード・ダークモードを切り替えて、どちらも視覚的に問題がないことを確認する

**期待結果**:

- InlineModelSelectorがコンパクトに表示され、チャット入力エリアを圧迫していない
- リサイズ後もレイアウトが崩れない
- ライト・ダークモード両方でコントラスト比が適切（WCAG 2.1 AA: 4.5:1以上）

**実際の結果**: （実行時に記入）

---

### シナリオ4: モデル未選択時のガイダンス表示確認

**目的**: モデルが未選択の状態で、GuidanceBlock(variant="blocked")が正しく表示されることを確認する

**手順**:

1. モデルを選択していない状態でWorkspaceChatPanelを表示する（または選択をリセットする）
2. GuidanceBlock(variant="blocked")が表示されていることを確認する
3. チャット入力フィールドが無効化されていることを確認する
4. InlineModelSelectorからモデルを選択して、GuidanceBlockが消えることを確認する

**期待結果**:

- モデル未選択時にGuidanceBlockが表示される
- チャット入力が無効化されている
- モデル選択後にGuidanceBlockが非表示になる

**実際の結果**: （実行時に記入）

---

### テスト結果まとめ

| シナリオ                                    | 結果 | 備考 |
| ------------------------------------------- | ---- | ---- |
| シナリオ1: モデル選択操作確認               | -    | -    |
| シナリオ2: チャット送信・AI応答確認         | -    | -    |
| シナリオ3: パネルレイアウト視覚確認         | -    | -    |
| シナリオ4: モデル未選択時ガイダンス表示確認 | -    | -    |

（Phase 11 実行時に記入）

## 参照資料

### Phase 1-3 ドキュメント

| 資料名                                          | パス                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（WorkspaceChat配置設計 3.2/3.3） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/` （Task 01完了後に参照） |

### 前Phase成果物

| 資料名                | パス                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase 10 最終レビュー | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-10-final-review.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                  | 対策                                                                |
| ---------- | ------------------------------------- | ------------------------------------------------------------------- |
| P53        | CLI環境でのスクリーンショット取得制約 | Electron `webContents.capturePage()` を使用するか、自動テストで代替 |

## 実行手順

1. **事前準備**: アプリをビルドして起動する
2. **シナリオ1〜4の実施**: 上記シナリオを順番に実行し、結果を記録する
3. **テスト結果まとめの記録**: 全シナリオの結果を表に記入する
4. **問題発見時の対応**: 問題が見つかった場合は、影響 Phase（Phase 5 等）へ戻って修正する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                        | パス                                                                                                                         | 説明           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 11 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-11-manual-test.md` | 手動テスト結果 |

## 画面カバレッジマトリクス

| 画面/コンポーネント                               | ライトモード  | ダークモード  | 操作確認      |
| ------------------------------------------------- | ------------- | ------------- | ------------- |
| WorkspaceChatPanel + InlineModelSelector(compact) | 確認済/未確認 | 確認済/未確認 | 確認済/未確認 |
| モデル選択後のチャット入力有効化                  | 確認済/未確認 | 確認済/未確認 | 確認済/未確認 |
| GuidanceBlock表示/非表示連動                      | 確認済/未確認 | 確認済/未確認 | N/A           |
| ストリーミング中のdisabled状態                    | 確認済/未確認 | 確認済/未確認 | 確認済/未確認 |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 11
```

## 完了条件

- [ ] シナリオ1（WorkspaceChatPanelでのモデル選択操作確認）が合格したことを確認した
- [ ] シナリオ2（ワークスペース内チャット送信・AI応答確認）が合格したことを確認した
- [ ] シナリオ3（パネルレイアウト視覚確認・compact表示）が合格したことを確認した
- [ ] シナリオ4（モデル未選択時のガイダンス表示確認）が合格したことを確認した
- [ ] テスト結果まとめテーブルに全シナリオの結果を記入した

## 次のPhase

Phase 12: ドキュメント（`phase-12-documentation.md`）
