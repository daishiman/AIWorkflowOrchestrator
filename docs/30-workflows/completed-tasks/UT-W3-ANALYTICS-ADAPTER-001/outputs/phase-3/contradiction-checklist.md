# Phase 3: 矛盾チェックリスト

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

## CSP整合性

- [x] IPC経由アプローチ: Renderer→Main間のみでCSP制限なし
- [x] Preload API経由（`ipcRenderer.on` 直接使用なし）
- [x] `ALLOWED_INVOKE_CHANNELS` に `analytics:send` 追加を設計に明記
- [x] webSecurity緩和なし

## Breaking Change確認

- [x] `trackEvent<K>(eventName: K, payload: SkillWizardEvents[K]): void` シグネチャ不変
- [x] `SkillCreateWizard.tsx` の5計装ポイントへの変更不要
- [x] `SkillWizardEvents` 型定義変更なし
- [x] 既存 `trackEvent.test.ts` への影響なし（sink変更はテスト対象外）

## フォールバック設計確認

- [x] 初期化失敗時 no-op フォールバック（`send: () => {}` 等）
- [x] エラーをスローしない（try/catch でラップ）
- [x] オプトアウト時も no-op（送信スキップ）
- [x] フォールバック後の状態一貫性（キューは空のまま継続）

## オフラインキュー設計確認

- [x] ストレージ: in-memory（Renderer側）
- [x] 上限件数: 500件
- [x] TTL: 7日
- [x] FIFO（古いものから破棄）

## オプトアウト設計確認

- [x] Store経由（`STORE_GET` チャネル）で設定取得
- [x] デフォルト: opt-in（`false` = 送信許可）
- [x] 取得失敗時: no-op（安全側）

## テスト戦略確認

- [x] TDD Red前提（テストファイル先行作成）
- [x] `vi.stubGlobal("window")` 禁止（`Object.defineProperty` 使用）
- [x] カバレッジ目標: analyticsAdapter.ts 90%+, trackEvent.ts 100%

## IPC命名規則確認

- [x] `analytics:send` → `namespace:action` パターンと一致
- [x] `analyticsAPI` → `<feature>API` パターンと一致
- [x] `registerAnalyticsHandlers` → `register*Handlers` パターンと一致

---

_生成日: 2026-04-11 / Phase 3 完了_
