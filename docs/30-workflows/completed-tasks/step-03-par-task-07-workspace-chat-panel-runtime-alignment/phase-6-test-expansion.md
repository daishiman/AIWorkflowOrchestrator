# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 6                                            |
| Phase名    | テスト拡充                                   |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）       |
| 後続Phase  | Phase 7（カバレッジ確認）                    |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 更新日     | 2026-03-17                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Phase 4 の基本テストでカバーしきれない回帰リスク・境界値・組み合わせパターンを追加し、stream / context / conversation の信頼性を高める。

## 実行タスク

### T6-1: 回帰拡張テストケース

stream 中断、file remove、mention 選択、unsupported capability のエッジケースを追加する。

### T6-2: 境界値拡張テストケース

selected config 未同期、conversation 未作成、stale stream のエッジケースを追加する。

### T6-3: compact UX テストケース

compact 幅でのレイアウト切替・keyboard 到達性を追加する。

### T6-4: transcript 共有テストケース

transcript provenance chip の表示・自動共有禁止を検証するテストを追加する。

## 追加テストマトリクス

### 回帰拡張（T6-1）

| ID   | テストケース                                     | 検証対象                 | 期待結果                                    | 優先度 |
| ---- | ------------------------------------------------ | ------------------------ | ------------------------------------------- | ------ |
| E-01 | stream 中に file remove しても streaming 継続    | removeSelectedFile       | isStreaming=true が維持される               | High   |
| E-02 | stream 完了後に file remove で chips 更新        | removeSelectedFile       | selectedFiles から削除される                | Medium |
| E-03 | mention 選択後すぐに sendMessage                 | insertMention -> send    | context block に mention ファイルが含まれる | High   |
| E-04 | mention 候補 0 件で dropdown 非表示              | empty candidates         | mention.isOpen=false                        | Medium |
| E-05 | unsupported capability で CTA 非活性             | guidance-only capability | 送信ボタン disabled、guidance block 表示    | High   |
| E-06 | terminal-handoff capability で handoff card 表示 | terminal-handoff         | HandoffCard コンポーネントが表示される      | High   |
| E-07 | stream error 後に再送信で成功                    | error recovery           | errorMessage クリア、新しい stream 開始     | High   |
| E-08 | 連続 cancel で state が安定                      | double cancel            | isStreaming=false 維持、例外なし            | Medium |

### 境界値拡張（T6-2）

| ID   | テストケース                                       | 検証対象              | 期待結果                                        | 優先度 |
| ---- | -------------------------------------------------- | --------------------- | ----------------------------------------------- | ------ |
| E-09 | selectedProviderId=null で modelId からの推論      | inferProviderId       | provider が modelId prefix から正しく推論される | Medium |
| E-10 | selectedModelId 変更中に stream 開始               | config race condition | 変更前の modelId で stream 開始される           | High   |
| E-11 | conversation 未作成状態で addMessage               | ensureConversation    | conversation create が先に呼ばれる              | High   |
| E-12 | stale stream（requestId が古い）の chunk を無視    | isStreamingRef guard  | 古い chunk が messages に追加されない           | High   |
| E-13 | selectedFiles が空で buildFileContextBlock         | empty context         | contextBlock=""、stream は正常に開始            | Medium |
| E-14 | selectedFiles が 3 件超で最初の 3 件のみ使用       | file count limit      | 4 件目以降は contextBlock に含まれない          | Medium |
| E-15 | input が 32 文字超で conversation title が切り詰め | title truncation      | title.length <= 32                              | Low    |

### compact UX テスト（T6-3）

| ID   | テストケース                             | 検証対象       | 期待結果                                   | 優先度 |
| ---- | ---------------------------------------- | -------------- | ------------------------------------------ | ------ |
| E-16 | panel 幅 360px 以下で compact レイアウト | ResizeObserver | compact CSS クラスが適用される             | High   |
| E-17 | panel 幅 361px 以上で通常レイアウト      | ResizeObserver | compact CSS クラスが除去される             | High   |
| E-18 | compact 幅で Tab キーで全 CTA 到達       | keyboard a11y  | Tab 順序で chips -> actions -> send に到達 | High   |
| E-19 | compact 幅で suggestion bubbles が縦並び | layout switch  | flex-direction: column が適用される        | Medium |

### transcript 共有テスト（T6-4）

| ID   | テストケース                             | 検証対象                 | 期待結果                                          | 優先度 |
| ---- | ---------------------------------------- | ------------------------ | ------------------------------------------------- | ------ |
| E-20 | transcript chip 表示で provenance ラベル | TranscriptProvenanceChip | 「Terminal transcript から添付」表示              | High   |
| E-21 | transcript chip と file chip の視覚区別  | chip color scheme        | 異なる色系統で表示される                          | Medium |
| E-22 | transcript の自動 message 化が行われない | auto-share prohibition   | user 操作なしで messages に transcript が入らない | High   |

## テスト追加時の注意事項

| 注意事項                      | 対策                                                  |
| ----------------------------- | ----------------------------------------------------- |
| P9: テスト間 state リーク     | 新規テストでも beforeEach で mock リセットを確認する  |
| P13: タイマーテスト無限ループ | ResizeObserver mock は advanceTimersByTime で制御する |
| P39: happy-dom userEvent      | 全新規テストで fireEvent + act(async) を使用する      |
| P41: インライン関数カバレッジ | callback 内部の分岐を個別テストで網羅する             |
| P48: useShallow 未適用        | 派生セレクタのテストで無限ループしないことを確認する  |

## 参照資料

| 参照資料                   | パス                                                                                | 内容                             |
| -------------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| Phase 4（テスト作成）      | `phase-4-test-creation.md`                                                          | 基本テストケースを確認する       |
| Phase 5（実装）            | `phase-5-implementation.md`                                                         | 実装済み変更点を確認する         |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | UI 回帰対象を確認する            |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | controller の分岐を確認する      |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | 永続化回帰点を確認する           |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | stream / cancel 回帰点を確認する |

## 統合テスト連携

stream、context、conversation、unsupported capability guidance、compact UX、transcript 共有の回帰を一体で広げる。Phase 4 基本テスト + Phase 6 拡張テストの合計で Phase 7 カバレッジ基準を満たすことを目標とする。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 実行手順

### ステップ1: Phase 5 実装のテスト PASS 確認

`cd apps/desktop && pnpm vitest run` で Phase 4 + Phase 5 のテストが全て Green であることを確認する。

### ステップ2: カバレッジ現状の取得

`cd apps/desktop && pnpm vitest run --coverage` で現在のカバレッジを取得し、不足領域を特定する。

### ステップ3: T6-1 ~ T6-4 のテストケース追加

優先度 High のケースから順に追加し、各ケースが Green であることを確認する。

### ステップ4: 全テスト Green 確認

`cd apps/desktop && pnpm vitest run` で Phase 4 + Phase 6 の全テストが Green であることを確認する。

### ステップ5: 成果物と完了条件の確認

回帰計画が全ケースをカバーしていることを確認する。

## 成果物

| 成果物       | パス                                 | 内容                                  |
| ------------ | ------------------------------------ | ------------------------------------- |
| 回帰計画     | `outputs/phase-6/regression-plan.md` | 追加テストケースと優先度を整理する    |
| テストコード | 既存テストファイルへの追記           | E-01 〜 E-22 のテストコードを追加する |

## 完了条件

- [ ] stream 中断・再送信の回帰ケース（E-01, E-07, E-08）が追加されている
- [ ] file context の境界値ケース（E-13, E-14）が追加されている
- [ ] conversation の境界値ケース（E-11, E-12, E-15）が追加されている
- [ ] access capability の分岐ケース（E-05, E-06）が追加されている
- [ ] compact UX のレイアウト切替ケース（E-16, E-17）が追加されている
- [ ] transcript 共有の禁止事項ケース（E-22）が追加されている
- [ ] 全テスト（Phase 4 + Phase 6）が Green
- [ ] 優先度 High のケースが全て実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 内容                        | 依存         | ステータス  |
| ---------- | --------------------------- | ------------ | ----------- |
| T6-1       | 回帰拡張テストケース        | Phase 5 完了 | not_started |
| T6-2       | 境界値拡張テストケース      | Phase 5 完了 | not_started |
| T6-3       | compact UX テストケース     | T6-1         | not_started |
| T6-4       | transcript 共有テストケース | T6-1         | not_started |

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] T6-1 ~ T6-4 の全サブタスクが完了している
- [ ] 回帰計画成果物が作成されている
- [ ] E-01 〜 E-22 のうち優先度 High が全て実装されている
- [ ] 完了条件の全チェックボックスが true である
- [ ] 本Phase内の全タスクを100%実行完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
ls -la outputs/phase-6/regression-plan.md
cd apps/desktop && pnpm vitest run 2>&1 | tail -5
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/WorkspaceView/ 2>&1 | tail -10
```

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
