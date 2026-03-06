# Phase 1: 要件定義 - TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| Phase      | 1 - 要件定義                               |
| 作成日     | 2026-03-06                                 |
| ステータス | 完了                                       |

## 1. 背景と問題

### 1.1 現状の問題

SettingsView において、AuthModeSelector で認証モードを「APIキー認証」に切り替えた後、APIキー（authKey）を入力・保存・削除するための専用UIが存在しない。ユーザーはモードを切り替えることはできるが、肝心のキーを設定する手段がSettingsView上にない。

加えて、以下の2つの判定ロジックの差分がUIで説明されていない:

- **`auth-mode:status`（AuthModeService#getStatus）**: `authKeyService.hasKey()` のみを参照し、保存済みキーの有無だけで判定する
- **`auth-key:exists`（authKeyHandlers.ts）**: `hasStoredKey || hasEnvKey`（環境変数 `ANTHROPIC_API_KEY` のfallback含む）で判定する

この差分により、環境変数でキーが設定されている場合、preflight（`auth-key:exists` 使用）はパスするが、`auth-mode:status` は「キー未設定」と報告する矛盾が発生する。

### 1.2 影響範囲

| コンポーネント                                      | 影響                                        |
| --------------------------------------------------- | ------------------------------------------- |
| `SettingsView` (`apps/desktop/src/renderer/views/`) | authKey入力UIの追加が必要                   |
| `AuthModeSelector`                                  | モード切替後の連動表示                      |
| `authKeyHandlers.ts`（Main Process）                | `auth-key:exists` の判定結果をUIに伝達      |
| `AuthModeService#getStatus()`                       | 4状態の判定ロジック整合                     |
| `skillExecutionAuthPreflight`                       | preflight判定との一貫性                     |
| `authKeyApi.ts`（Preload）                          | 既存API（set/exists/validate/delete）の活用 |

## 2. 機能要件

### FR-1: authKey専用入力セクションの追加

SettingsView に、APIキー認証モード選択時に表示される authKey 管理セクションを追加する。

- **FR-1.1**: AuthModeSelector で「APIキー認証」を選択した場合にのみ、authKey管理セクションを表示する
- **FR-1.2**: authKey管理セクションは以下の操作を提供する:
  - キーの入力フィールド（パスワード型、マスク表示）
  - 保存ボタン（`authKeyAPI.set()` を呼び出す）
  - 削除ボタン（`authKeyAPI.delete()` を呼び出す、保存済みキーが存在する場合のみ活性化）
  - バリデーション結果のフィードバック表示
- **FR-1.3**: キー保存成功後、`auth-mode:status` を再取得してステータス表示を更新する

### FR-2: 4状態の明示表示

authKey の状態を以下の4パターンで明示的にユーザーへ表示する。

| 状態ID | 状態名           | 条件                                            | 表示内容                                                     |
| ------ | ---------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| S1     | 保存済み         | `hasStoredKey === true`                         | 保存済みキーが有効であることを示すステータス                 |
| S2     | 環境変数fallback | `hasStoredKey === false && hasEnvKey === true`  | 環境変数からキーが検出されている旨と、保存キーがない旨の説明 |
| S3     | 未設定           | `hasStoredKey === false && hasEnvKey === false` | キーが未設定であり、入力が必要であることのガイダンス         |
| S4     | 確認失敗         | 存在確認でエラーが発生                          | エラーメッセージとリトライの案内                             |

- **FR-2.1**: 状態表示はアイコン+テキストの組み合わせで視覚的に区別する
- **FR-2.2**: S2（環境変数fallback）の場合、「preflight はパスするが、保存済みキーは存在しない」ことを明示する
- **FR-2.3**: S3（未設定）の場合、キー入力フィールドにフォーカスを誘導するガイダンスを表示する

### FR-3: `auth-key:exists` の判定内訳取得

- **FR-3.1**: `auth-key:exists` の応答に `source` フィールド（`"stored"` | `"env"` | `"none"`）を追加し、判定の根拠をRendererに伝達する
- **FR-3.2**: 既存の `exists()` API の後方互換性を維持する（`exists` フィールドは boolean のまま）

### FR-4: preflight との整合性保証

- **FR-4.1**: SettingsView の状態表示が S1 または S2 の場合、preflight（`auth-key:exists`）もパスすることを保証する
- **FR-4.2**: SettingsView の状態表示が S3 の場合、preflight は失敗することを保証する
- **FR-4.3**: 状態表示とpreflight判定の一貫性を、単体テストで検証する

## 3. 非機能要件

### NFR-1: セキュリティ

- **NFR-1.1**: 入力されたAPIキーの生値をRendererのメモリに永続的に保持しない。保存操作完了後、入力フィールドをクリアする
- **NFR-1.2**: APIキーの値をconsole.log、デバッグログ、エラーメッセージに含めない
- **NFR-1.3**: APIキーの入力フィールドは `type="password"` を使用し、デフォルトでマスク表示する
- **NFR-1.4**: APIキーの保存・削除はMain Process経由のIPC通信で行う（Rendererから直接ストレージにアクセスしない）

### NFR-2: アクセシビリティ（WCAG 2.1 AA）

- **NFR-2.1**: authKey管理セクションの全要素に適切なARIAラベルを付与する
- **NFR-2.2**: キーボード操作のみで全機能にアクセス可能とする（Tab移動、Enter送信、Escape取消）
- **NFR-2.3**: コントラスト比は通常テキスト4.5:1以上、UI部品3:1以上を維持する
- **NFR-2.4**: 状態表示（S1-S4）は色だけでなくアイコンとテキストを併用して情報を伝達する
- **NFR-2.5**: エラー・成功のフィードバックは `aria-live="polite"` で通知する

### NFR-3: パフォーマンス

- **NFR-3.1**: authKey管理セクションの初期表示は200ms以内に完了する
- **NFR-3.2**: キー保存・削除操作のフィードバック表示は500ms以内に完了する
- **NFR-3.3**: 不要な再レンダリングを防止するため、状態管理は個別セレクタ（P31準拠）で行う

### NFR-4: 保守性

- **NFR-4.1**: 新規コンポーネントはAtomic Design原則に従い、適切な粒度で分割する
- **NFR-4.2**: 既存の `authKeyAPI`（Preload）を再利用し、新規IPCチャネルの追加を最小化する
- **NFR-4.3**: テストカバレッジはLine 80%以上、Branch 60%以上を維持する

## 4. 制約事項

- 既存の `authKeyAPI`（`set` / `exists` / `validate` / `delete`）のインターフェースは後方互換を維持する
- AuthModeSelector の既存機能（モード切替）には変更を加えない
- ApiKeysSection（汎用プロバイダーAPIキー用）は本タスクのスコープ外とし、変更しない

## 5. 参照資料

| 資料                                 | パス                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| authKeyHandlers（IPC定義）           | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                    |
| AuthModeService（ステータス判定）    | `apps/desktop/src/main/services/auth/AuthModeService.ts`          |
| authKeyApi（Preload API）            | `apps/desktop/src/preload/authKeyApi.ts`                          |
| AuthModeSelector（UIコンポーネント） | `apps/desktop/src/renderer/components/settings/AuthModeSelector/` |
| SettingsView                         | `apps/desktop/src/renderer/views/SettingsView/`                   |
| IPC チャネル定義                     | `apps/desktop/src/preload/channels.ts`                            |
