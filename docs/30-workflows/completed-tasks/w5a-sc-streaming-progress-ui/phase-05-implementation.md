# Phase 5: 実装

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| Phase名    | 実装                             |
| タスクID   | TASK-SC-07-STREAMING-PROGRESS-UI |
| 機能名     | w5a-sc-streaming-progress-ui     |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | 未実施                           |
| 作成日     | 2026-03-22                       |

## 目的

Phase 4 で作成したテストを Green にするため、GenerateStep UI改修・SKILL_CREATOR_PROGRESS リスナー・エラーハンドリングUI・キャンセル機能を実装する。

## 背景

Phase 4 でTDDの「Red」フェーズとして作成されたテストに対し、本Phaseでは「Green」フェーズとして実装を行う。テストが定義する期待動作を満たす最小限の実装を行い、全テストをパスさせることが目標となる。

## 実行タスク

### タスク1: Zustand `generationProgress` スライス実装

**目的**: 進捗状態を管理するZustandスライスを実装し、個別セレクタを提供する

**実行手順**:

1. `generationProgressSlice.ts` に `stage` / `percent` / `message` / `previewContent` / `error` の状態管理を実装する
2. 個別セレクタを定義する: `useGenerationStage()` / `useGenerationPercent()` / `useGenerationMessage()` / `useGenerationPreview()` / `useGenerationError()`
3. P31（Zustand無限ループ）対策: 個別セレクタ使用、合成Hook依存回避
4. P48（useShallow）: filter/mapの派生セレクタにuseShallow適用

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`

### タスク2: `useStreamingProgress` カスタムHook実装

**目的**: IPC経由の進捗イベントを受信し、Zustandストアに反映するHookを実装する

**実行手順**:

1. `SKILL_CREATOR_PROGRESS` リスナー登録を実装する
2. P5（リスナー二重登録防止）対策: useEffectクリーンアップでリスナー解除必須
3. 進捗データを受け取り Zustand に反映する処理を実装する
4. React StrictMode 対応（二重登録ガード）を実装する

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

### タスク3: `GenerateStep.tsx` UI改修

**目的**: 進捗表示・ステップ表示・プレビューパネルを含むUIを実装する

**実行手順**:

1. プログレスバー実装（`percent` 値に応じた幅変化）
2. 4段階ステップ表示（アイコン + テキスト: planning / generating-skill / generating-agents / validating）
3. リアルタイムプレビューパネル（`previewContent` が存在する場合）
4. Apple HIG 準拠のスタイリング（Tailwind CSS）

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（改修）

### タスク4: エラーハンドリングUI実装

**目的**: 3種類のエラーパターンに応じたUIを実装する

**実行手順**:

1. `API_KEY_NOT_SET`: 設定画面へのリンクボタン付きエラーカードを実装する
2. `LLM_ERROR`: リトライボタン付きエラーカードを実装する
3. `NETWORK_ERROR`: オフライン表示カードを実装する

**期待される成果物**:

- `GenerateStep.tsx` 内にエラーハンドリングUIが組み込まれている

### タスク5: キャンセル機能実装

**目的**: 生成処理のキャンセル機能を実装する

**実行手順**:

1. `useCancelGeneration` Hook（AbortController 管理）を実装する
2. キャンセルボタン（生成中のみ表示）を実装する
3. IPC `skill-creator:cancel` 送信処理を実装する
4. キャンセル後の状態リセット + ウィザード先頭に戻る処理を実装する

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

## 参照資料

| 参照資料                  | パス                                                                                | 内容                     |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| Phase 4 テストファイル    | `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx` | 実装の正解仕様（テスト） |
| Phase 4 Hookテスト        | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`            | Hook実装の正解仕様       |
| Phase 2 設計書            | `docs/30-workflows/w5a-sc-streaming-progress-ui/phase-02-design.md`                 | UI設計仕様               |
| skill-creator preload API | `apps/desktop/src/preload/skill-creator-api.ts`                                     | IPC API定義              |

## 成果物

| 成果物                      | パス                                                                 | 内容                               |
| --------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| GenerateStep UI             | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | UI改修（進捗・エラー・キャンセル） |
| useStreamingProgress Hook   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | 進捗リスナーHook（新規）           |
| useCancelGeneration Hook    | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`             | キャンセルHook（新規）             |
| generationProgress スライス | `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | Zustandスライス（新規）            |

## 統合テスト連携

本Phaseで確認すべき統合テスト観点:

- Zustandスライスとカスタムhookの連携が正しく動作すること
- IPC `SKILL_CREATOR_PROGRESS` リスナーが実際のpreload APIと整合すること
- GenerateStepコンポーネントがZustandストアから正しく状態を取得できること
- キャンセルIPC `skill-creator:cancel` がpreload APIの型定義と一致すること

## 完了条件

- [ ] Zustand `generationProgressSlice` が実装され、個別セレクタが全て定義されている
- [ ] `useStreamingProgress` Hook がリスナー登録とクリーンアップを正しく実装している（P5対策）
- [ ] GenerateStep にプログレスバーと4段階ステップ表示が実装されている
- [ ] 3種類のエラーUIが実装されている
- [ ] キャンセルボタンと `useCancelGeneration` Hook が実装されている
- [ ] Phase 4 で作成した全テストが Green になっている
- [ ] `pnpm typecheck` が通過している
- [ ] AC-3（進捗ストリーミング）の基本動作がテストで確認できていること
- [ ] AC-6（エラーメッセージ）の3パターンがテストで確認できていること

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

## TDD検証

### TDD サイクル確認

テスト実行コマンド:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx src/renderer/hooks/__tests__/useStreamingProgress.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク           | 結果 | 備考 |
| ---------------- | ---- | ---- |
| （実行後に記入） |      |      |

- 良かった点:
- 問題点:
- 改善提案:
- 次Phaseへの引き継ぎ事項:

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 6: テスト拡充

`docs/30-workflows/w5a-sc-streaming-progress-ui/phase-06-test-coverage.md`
