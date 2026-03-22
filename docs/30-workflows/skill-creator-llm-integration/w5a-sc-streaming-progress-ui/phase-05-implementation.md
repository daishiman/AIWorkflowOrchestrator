# Phase 5: 実装

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 5                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

Phase 4 で作成したテストを Green にするため、GenerateStep UI改修・SKILL_CREATOR_PROGRESS リスナー・エラーハンドリングUI・キャンセル機能を実装する。

## 実行タスク

1. **Zustand `generationProgress` スライス実装**
   - `stage` / `percent` / `message` / `previewContent` / `error` の状態管理
   - 個別セレクタ: `useGenerationStage()` / `useGenerationPercent()` / `useGenerationMessage()` / `useGenerationPreview()` / `useGenerationError()`
   - P31対策: 合成Hookの `useEffect` 依存配列への混入を避ける

2. **`useGenerationProgress` カスタムHook実装**
   - `SKILL_CREATOR_PROGRESS` リスナー登録（P5対策: クリーンアップで解除）
   - 進捗データを受け取り Zustand に反映する
   - React StrictMode 対応（二重登録ガード）

3. **`GenerateStep.tsx` UI改修**
   - プログレスバー実装（`percent` 値に応じた幅変化）
   - 4段階ステップ表示（アイコン + テキスト）
   - リアルタイムプレビューパネル（`previewContent` が存在する場合）
   - Apple HIG 準拠のスタイリング（Tailwind CSS）

4. **エラーハンドリングUI実装**
   - `API_KEY_NOT_SET`: 設定画面へのリンクボタン付きエラーカード
   - `LLM_ERROR`: リトライボタン付きエラーカード
   - `NETWORK_ERROR`: オフライン表示カード

5. **キャンセル機能実装**
   - `useCancelGeneration` Hook（AbortController 管理）
   - キャンセルボタン（生成中のみ表示）
   - IPC `skill-creator:cancel` 送信
   - キャンセル後の状態リセット + ウィザード先頭に戻る処理

## 参照資料

- Phase 4 テストファイル（実装の正解仕様）
- Phase 2 設計書: `phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md` (P5, P31, P48)
- `apps/desktop/src/preload/skill-creator-api.ts`

## 成果物

- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（改修）
- `apps/desktop/src/renderer/hooks/useGenerationProgress.ts`（新規）
- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`（新規）
- `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`（新規）

## 完了条件

- [ ] Zustand `generationProgressSlice` が実装され、個別セレクタが全て定義されている
- [ ] `useGenerationProgress` Hook がリスナー登録とクリーンアップを正しく実装している（P5対策）
- [ ] GenerateStep にプログレスバーと4段階ステップ表示が実装されている
- [ ] 3種類のエラーUIが実装されている
- [ ] キャンセルボタンと `useCancelGeneration` Hook が実装されている
- [ ] Phase 4 で作成した全テストが Green になっている
- [ ] `pnpm typecheck` が通過している

## 次のPhase

Phase 6: テスト拡充
