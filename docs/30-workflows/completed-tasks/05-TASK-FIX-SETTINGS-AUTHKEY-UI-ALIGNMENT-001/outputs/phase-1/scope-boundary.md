# Phase 1: スコープ境界 - TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| Phase    | 1 - 要件定義                               |
| 作成日   | 2026-03-06                                 |

## 実施対象（スコープ内）

### S-IN-1: authKey管理UIコンポーネントの新規作成

- SettingsView 内に authKey 専用の入力・保存・削除セクションを追加する
- Atomic Design に従い、AuthKeySection コンポーネントとして実装する
- 配置先: `apps/desktop/src/renderer/components/settings/` 配下

### S-IN-2: 4状態表示ロジックの実装

- `auth-key:exists` の応答に `source` フィールドを追加（`"stored"` | `"env"` | `"none"`）
- Renderer 側で4状態（保存済み / 環境変数fallback / 未設定 / 確認失敗）を判定・表示するロジックを実装
- `authKeyHandlers.ts` の `auth-key:exists` ハンドラの応答形式を拡張

### S-IN-3: SettingsView への統合

- AuthModeSelector で「APIキー認証」選択時に AuthKeySection を条件付き表示
- キー保存/削除後の `auth-mode:status` 再取得とステータス表示の連動更新
- 既存の SettingsView レイアウトへの自然な統合

### S-IN-4: 単体テスト・結合テストの作成

- AuthKeySection コンポーネントのテスト（4状態表示、操作、a11y）
- `auth-key:exists` ハンドラの `source` フィールド追加に対するテスト
- SettingsView 統合テスト（条件付き表示、状態連動）

### S-IN-5: Preload 型定義の更新

- `auth-key:exists` の応答型に `source` フィールドを追加
- `apps/desktop/src/preload/types.ts` および関連型定義の更新
- 後方互換性の維持（`exists: boolean` は変更しない）

## 非スコープ（実施対象外）

### S-OUT-1: ApiKeysSection（汎用プロバイダーAPIキー用）の変更

- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/` は LLM プロバイダー（OpenAI、Google 等）のAPIキー管理を担当する別責務のコンポーネントであり、本タスクでは変更しない
- 理由: authKey（Anthropic 認証キー）と汎用プロバイダーAPIキーは管理ドメインが異なる

### S-OUT-2: AuthModeService#getStatus() のロジック変更

- `AuthModeService#getStatus()` が `authKeyService.hasKey()`（保存済みキーのみ）で判定しているロジック自体は変更しない
- 理由: `getStatus()` は認証モード全体のステータスを返す責務であり、環境変数fallback の判定は `auth-key:exists` の責務として分離されている。UIレイヤーで両方の情報を組み合わせて4状態を表示することで対処する
- 将来的な統合は別タスクとして検討可能

### S-OUT-3: 環境変数 `ANTHROPIC_API_KEY` の設定UI

- 環境変数の設定・変更・削除を行うUIは本タスクのスコープ外とする
- 理由: 環境変数はOS/シェルレベルの設定であり、Electronアプリ内で管理する範囲を超える。本タスクでは環境変数の存在を検出して状態表示に反映するのみとする

### S-OUT-4: APIキーのサーバーサイドバリデーション（Anthropic API への疎通確認）

- 入力されたAPIキーが実際にAnthropic APIで有効かどうかをサーバーに問い合わせるリアルタイムバリデーションは本タスクのスコープ外とする
- 理由: ネットワーク依存の検証は別途非同期フローとして設計する必要があり、本タスクの複雑度を超える。既存の `authKeyAPI.validate()` の活用は将来タスクで検討する

### S-OUT-5: 認証モード切替の自動化（APIキー保存時の自動モード切替）

- APIキーを保存した際に自動的に認証モードを「APIキー認証」に切り替える機能は実装しない
- 理由: 認証モードの切替はユーザーの明示的な操作とすべきであり、暗黙の状態変更はUXの混乱を招く可能性がある

## スコープ判定の根拠

```
              [AuthModeSelector]
                    |
         モード選択: api-key
                    |
                    v
    +-------------------------------+
    | AuthKeySection (新規: S-IN-1) |  <-- 本タスクのスコープ
    | - 入力フィールド              |
    | - 保存/削除ボタン             |
    | - 4状態表示 (S-IN-2)          |
    +-------------------------------+
                    |
         IPC: authKeyAPI.set/delete/exists
                    |
                    v
    +-------------------------------+
    | authKeyHandlers.ts            |  <-- source フィールド追加 (S-IN-2)
    | auth-key:exists 応答拡張      |
    +-------------------------------+
                    |
                    v
    +-------------------------------+
    | AuthModeService#getStatus()   |  <-- 変更なし (S-OUT-2)
    +-------------------------------+
```
