# Phase 1: 要件定義書

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

## 1. 現状調査結果

### 1.1 trackEvent.ts 現状実装

- **ファイルパス**: `apps/desktop/src/renderer/utils/trackEvent.ts`
- **現状**: renderer-local の no-op / `console.info` スタブ
- **dev環境**: `console.info("[trackEvent]", eventName, payload)` を出力
- **prod環境**: 完全な no-op（何も送信されない）
- **TODO位置**: L44付近 `// 将来: execution-centric 基盤とは独立した sink に差し替える`

### 1.2 計装ポイント（SkillCreateWizard.tsx）

| イベント名                          | 行番号      | ペイロード                                     |
| ----------------------------------- | ----------- | ---------------------------------------------- |
| `skill_wizard_started`              | 411         | `{}`                                           |
| `skill_wizard_step1_completed`      | 507         | `{ method, skippedAtQuestion }`                |
| `skill_wizard_generation_completed` | 548         | `{ method, category, hasExternalIntegration }` |
| `skill_wizard_next_action`          | 824/830/836 | `{ action }`                                   |

計装ポイント合計: 5箇所（`skill_skeleton_quality_feedback` も SkillWizardEvents に定義済み）

### 1.3 既存 IPC 構造

- **IPCチャネル定義**: `apps/desktop/src/preload/channels.ts`
- **ホワイトリスト**: `ALLOWED_INVOKE_CHANNELS` に登録必須
- **Preload パターン**: `safeInvoke(channel, payload)` → `invokeWithTimeout` 経由
- **ハンドラー登録**: `register*Handlers()` パターン、`apps/desktop/src/main/ipc/` 配下
- **禁止**: `ipcRenderer.on` 直接使用、Preload API 経由必須

### 1.4 CSP設定

- Electron Renderer プロセスはブラウザと同様のCSP制限下
- **IPC経由アプローチ**: Renderer→Main プロセスへ委譲することでCSP制限を回避
- Main プロセスは Node.js 環境のためCSP制限なし、HTTP送信が可能

### 1.5 プライバシー設定ストア

- 既存プライバシー設定APIは発見されず
- **対応**: `STORE_GET`/`STORE_SET` チャネルを経由してオプトアウト設定を管理する
- **フォールバック**: 設定が未設定の場合は送信許可（デフォルト opt-in）

### 1.6 命名規則

- IPC チャネル: `<namespace>:<action>` 形式（例: `analytics:send`）
- ハンドラー: `register<Feature>Handlers()` 関数形式
- ファイル名: camelCase（例: `analyticsHandler.ts`）
- Preload API: `<feature>API` 形式（例: `analyticsAPI`）

## 2. analytics provider 選定

### 2.1 比較検討

| Provider            | CSP対応     | 外部依存 | 評価  |
| ------------------- | ----------- | -------- | ----- |
| Amplitude SDK       | CSP調整必要 | 中       | △     |
| Mixpanel SDK        | CSP調整必要 | 中       | △     |
| PostHog             | CSP調整必要 | 大       | △     |
| **IPC経由カスタム** | **不要**    | **なし** | **◎** |

### 2.2 選定結果: IPC経由カスタム実装

**理由**:

1. CSP制限を完全回避（Renderer→IPC→Main→HTTP）
2. 外部SDKへの依存なし（追加パッケージ不要）
3. 既存IPCパターンとの整合性が高い
4. オフラインキューをMain側で管理可能
5. 将来的な provider 変更が Main 側のみで完結

**アーキテクチャ**:

```
Renderer: analyticsAdapter.send()
    → window.analyticsAPI.send() [Preload経由]
    → IPC: "analytics:send"
    → Main: analyticsHandler.ts
    → ログ/ファイル保存（将来: HTTP送信）
```

## 3. IPC設計前提

- **チャネル名候補**: `"analytics:send"`
- **`ALLOWED_INVOKE_CHANNELS`追加必須**: `IPC_CHANNELS.ANALYTICS_SEND`
- **Preload API名**: `window.analyticsAPI`（既存パターンとの衝突なし）
- **禁止**: `ipcRenderer.on` 直接使用

## 4. 機能要件（FR）

| ID    | 要件                                                                |
| ----- | ------------------------------------------------------------------- |
| FR-01 | `analyticsAdapter.ts` が analytics 送信を抽象化する                 |
| FR-02 | `trackEvent.ts` の内部 sink が `analyticsAdapter.send()` を呼び出す |
| FR-03 | Renderer→IPC→Main のデータフローで外部分析基盤へ送信                |
| FR-04 | オフライン時イベントをキュー（上限500件・TTL7日）に保持             |
| FR-05 | オプトアウト設定参照（StoreGet経由）し、送信前に確認                |
| FR-06 | `ALLOWED_INVOKE_CHANNELS` に `analytics:send` を追加                |
| FR-07 | 初期化失敗時は no-op にフォールバック（エラーをスローしない）       |

## 5. 非機能要件（NFR）

| ID     | 要件                                                                      |
| ------ | ------------------------------------------------------------------------- |
| NFR-01 | `trackEvent` 公開APIシグネチャ不変（後方互換性）                          |
| NFR-02 | `SkillCreateWizard.tsx` 計装ポイントへの変更不要                          |
| NFR-03 | Electron セキュリティポリシー（CSP・webSecurity）を維持または強化         |
| NFR-04 | `pnpm --filter @repo/desktop add` でSDK追加する場合のみ                   |
| NFR-05 | オフラインキューのメモリ使用量が適切な上限内（500件×平均1KB = 500KB以下） |

## 6. スコープ

### 含むもの

- `analyticsAdapter.ts` の新規作成
- `trackEvent.ts` の sink 差し替え
- `analyticsHandler.ts` の新規作成（Main IPC ハンドラー）
- `channels.ts` への `ANALYTICS_SEND` チャネル追加
- Preload `index.ts` への `analyticsAPI` 追加
- オフライン時イベントキューイング実装
- オプトアウト設定との連動実装

### 含まないもの

- `SkillWizardEvents` 型定義の変更
- analytics ダッシュボード UI・集計機能
- `SkillAnalytics` / `AnalyticsStore` との統合

---

_生成日: 2026-04-11 / Phase 1 完了_
