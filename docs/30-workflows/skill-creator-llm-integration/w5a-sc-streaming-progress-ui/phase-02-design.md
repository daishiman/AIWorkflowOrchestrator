# Phase 2: 設計

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 2                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

GenerateStep UI改修とストリーミング進捗表示の詳細設計を行う。P5（リスナー二重登録）・P31（Zustand無限ループ）・P48（useShallow適用）を考慮した安全な実装方針を策定する。

## 実行タスク

1. **GenerateStep UI改修設計**
   - プログレスバーコンポーネントの設計（0〜100% / 4段階ステップ表示）
   - ステップ表示UI（構造計画中 / SKILL.md 生成中 / agents 生成中 / バリデーション中）
   - リアルタイムプレビュー表示（生成されたSKILL.mdの冒頭を表示）
   - Apple HIG 準拠のビジュアルデザイン方針

2. **`SKILL_CREATOR_PROGRESS` リスナー設計**
   - P5（リスナー二重登録）防止: `useEffect` のクリーンアップでリスナー解除
   - Zustand `generationProgress` スライス設計
     - `stage`: `'planning' | 'generating-skill' | 'generating-agents' | 'validating' | 'done' | 'error'`
     - `percent`: `number` (0-100)
     - `message`: `string`
     - `previewContent`: `string | null`
   - P31対策: 個別セレクタ（`useGenerationStage()` 等）を設計

3. **エラー表示設計**
   - `API_KEY_NOT_SET` → 設定画面誘導リンク付きエラーUI
   - `LLM_ERROR`（レートリミット等）→ リトライボタン付きエラーUI
   - `NETWORK_ERROR` → オフライン表示（再接続待機UI）
   - エラーコードとUIコンポーネントの対応表

4. **キャンセル設計**
   - `AbortController` をカスタムHookで管理
   - キャンセルボタンの表示タイミング（生成開始後、done/error以前）
   - IPC経由キャンセル送信: `skill-creator:cancel`チャンネル
   - キャンセル後のUI: 「キャンセルしました」メッセージ → ウィザード先頭に戻る

5. **カスタムHook設計**
   - `useGenerationProgress()`: 進捗状態管理Hook
   - `useCancelGeneration()`: キャンセル操作Hook

## 参照資料

- Phase 1 要件定義書: `phase-01-requirements.md`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `.claude/rules/06-known-pitfalls.md` (P5, P31, P48)
- `.claude/rules/03-state-management.md`
- `.claude/rules/01-architecture.md` (Apple HIG カラーパレット)

## 成果物

- GenerateStep UI設計図（コンポーネント構成）
- Zustand `generationProgress` スライス型定義
- カスタムHookインターフェース定義
- エラーコードとUIコンポーネントの対応表
- IPC チャンネル一覧（`SKILL_CREATOR_PROGRESS`, `skill-creator:cancel`）

## 完了条件

- [ ] GenerateStep UI改修のコンポーネント構成が図示されている
- [ ] Zustand スライスの型定義（stage / percent / message / previewContent）が確定している
- [ ] P5対策（クリーンアップでリスナー解除）の実装方針が明示されている
- [ ] P31対策（個別セレクタ設計）が明示されている
- [ ] P48（useShallow適用箇所）が特定されている
- [ ] 3種類のエラーUIコンポーネント設計が完了している
- [ ] キャンセルフロー（AbortController → IPC送信 → UI戻し）が設計されている

## 次のPhase

Phase 3: 設計レビュー
