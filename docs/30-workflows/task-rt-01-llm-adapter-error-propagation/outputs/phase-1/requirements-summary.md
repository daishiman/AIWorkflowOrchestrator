# Phase 1: 要件定義サマリー - TASK-RT-01

## タスク概要

LLMAdapter 初期化が失敗した場合に、そのエラー状態を IPC 経由で Renderer に即時公開し、
ユーザーが次のアクション（APIキー設定・リトライ・問い合わせ）を取れるよう UI に適切なエラー表示を追加する。

## 解決する問題

1. `setLLMAdapterFailed()` 呼び出し後の Renderer 側への通知パスが未整備
2. `skill-creator:get-adapter-status` IPC チャネルが未定義
3. `LLMAdapterErrorBanner` コンポーネントが未実装
4. `SkillLifecyclePanel` に LLMAdapter エラー表示の統合がない

## 解決策

pull（`skill-creator:get-adapter-status` invoke）+ push（`skill-creator:adapter-status-changed` on）の組み合わせで、
Renderer がアダプタ状態をリアルタイムに把握できるようにする。

## 受入条件（AC-1〜AC-8）

- **AC-1**: `ANTHROPIC_API_KEY` 未設定または無効値でアプリを起動したとき、`SkillLifecyclePanel` 上部にエラーバナーが表示される
- **AC-2**: エラーバナーには actionable なメッセージ（「APIキーを設定してください」等）が含まれる
- **AC-3**: `skill-creator:get-adapter-status` を invoke すると `{ status: LLMAdapterStatus, failureReason: string | null }` が返る
- **AC-4**: `setLLMAdapterFailed()` が呼ばれたタイミングで `skill-creator:adapter-status-changed` push イベントが Renderer に届く
- **AC-5**: UI は `"ready"` / `"initializing"` / `"failed"` の 3 状態を正しく表示・切り替えられる
- **AC-6**: 正常な API キー設定時（status が `"ready"`）にはエラーバナーが表示されない
- **AC-7**: 全 TypeScript 型チェックが通る
- **AC-8**: 新規追加テストが全て PASS する

## スコープ境界

### 含む

- IPC チャネル 2本の追加（get-adapter-status, adapter-status-changed）
- `RuntimeSkillCreatorFacade` への `onAdapterStatusChanged` コールバック追加
- IPC ハンドラ + push ワイヤリング
- `LLMAdapterErrorBanner` コンポーネント新規作成
- `useLLMAdapterStatus` フック新規作成
- `SkillLifecyclePanel` への統合

### 含まない

- APIキー設定 UI（TASK-RT-04）
- SkillCreateWizard への統合
- execute()/improve() のアダプタガード
- LLMAdapterFactory の retry logic
