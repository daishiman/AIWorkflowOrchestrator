# Phase 1: 要件定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |
| Issue    | #1297                         |

## 目的

既存の `PermissionStore`（V1）を `AllowedToolEntryV2` 型ベースに拡張し、失効ポリシー（session / time_24h / time_7d / permanent）によるスコープ管理、スキル名照合、期限切れ自動削除、セッション終了 IPC を実装する。

## P50チェック: 既実装状態の調査

### 現在の実装状態

| ファイル                                                  | 状態       | 内容                                                              |
| --------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/PermissionStore.ts` | 既存（V1） | `AllowedToolEntry`ベース、スコープ/期限なし                       |
| `packages/shared/src/types/permission-store.ts`           | 既存（V1） | `AllowedToolEntry`, `IPermissionStore`, `PermissionStoreSchema`   |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`  | 既存       | 3ハンドラ（getAllowedTools, revokeTool, clearAll）                |
| `apps/desktop/src/preload/channels.ts`                    | 既存       | `PERMISSION_*` 3チャンネル定義済み                                |
| Phase 5 設計書 `permission-store-interface.ts`            | 設計済み   | `AllowedToolEntryV2`, `PermissionStoreInterface`, `calcExpiresAt` |

### 判定

- **新規実装ではない**: V1→V2 のマイグレーション拡張タスク
- Phase 4-5 は「V1→V2 拡張」モードで実行

## 要件抽出

### 機能要件（FR）

| ID    | 要件                                                                              | 優先度 | 受け入れ基準                                                                                                                             |
| ----- | --------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | `AllowedToolEntryV2` 型を `@repo/shared` にエクスポート                           | 高     | `packages/shared/src/types/permission-store.ts` に型定義が追加され、`import { AllowedToolEntryV2 } from "@repo/shared"` でインポート可能 |
| FR-02 | `PermissionStore.isToolAllowed()` が6分岐フローで判定                             | 高     | (1) エントリなし→false (2) expiresAt未定義→true (3) 期限切れ→削除&false (4) 期限内→true (5) skillName不一致→false (6) 全条件クリア→true  |
| FR-03 | `PermissionStore.allowTool()` が `AllowedToolEntryV2` を受け入れ                  | 高     | `expiryPolicy` に基づき `expiresAt` を自動計算して保存                                                                                   |
| FR-04 | `PermissionStore.revokeSessionEntries()` が `expiryPolicy === "session"` のみ削除 | 高     | permanent/time スコープのエントリは残存                                                                                                  |
| FR-05 | `permission:clear-session` IPC チャンネルの追加                                   | 高     | Renderer→Main で session エントリのクリアをリクエスト可能                                                                                |
| FR-06 | アプリ終了時（`before-quit`）でセッションエントリ自動クリア                       | 高     | `app.on('before-quit')` でクリアが実行される                                                                                             |
| FR-07 | `calcExpiresAt()` 関数の実装                                                      | 高     | session→undefined, time_24h→+86400000ms, time_7d→+604800000ms, permanent→undefined                                                       |
| FR-08 | `electron-store` スキーマに V2 対応                                               | 高     | スキーマバージョン2、`AllowedToolEntryV2[]` 格納、V1→V2 マイグレーション                                                                 |
| FR-09 | `getAllowedTools()` が期限切れエントリを自動削除して返却                          | 中     | 返却前に `expiresAt < Date.now()` のエントリを除去                                                                                       |
| FR-10 | `revokeAll()` が全エントリを削除                                                  | 中     | 設定リセット時の全クリア機能                                                                                                             |

### 非機能要件（NFR）

| ID     | 要件                                         | 優先度 | 受け入れ基準                                                                                             |
| ------ | -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| NFR-01 | V1→V2 後方互換性                             | 高     | V1エントリ（expiresAt/skillName/expiryPolicy 未定義）は「無期限有効・全スキル対象・permanent」として動作 |
| NFR-02 | インメモリキャッシュの O(1) ルックアップ維持 | 中     | `Map<string, AllowedToolEntryV2>` でのツール名引き                                                       |
| NFR-03 | TypeScript 型エラー 0件                      | 高     | `pnpm typecheck` 全 PASS                                                                                 |
| NFR-04 | ESLint エラー 0件                            | 高     | `pnpm lint` 全 PASS                                                                                      |
| NFR-05 | 単体テスト Line Coverage 80%+                | 高     | `permission-store.test.ts` で検証                                                                        |
| NFR-06 | P42準拠 3段バリデーション                    | 高     | IPC ハンドラの全文字列引数に型チェック→空文字列→トリム空文字列を適用                                     |

## スコープ

### 含むもの

1. `AllowedToolEntryV2` / `calcExpiresAt` の共有型定義（`@repo/shared`）
2. `PermissionStore` クラスの V2 拡張（V1 メソッドシグネチャの拡張）
3. `electron-store` スキーマバージョン 2 + V1→V2 マイグレーション
4. `permission:clear-session` IPC チャンネル定義・ハンドラ登録
5. `before-quit` セッション終了フック
6. 単体テスト

### 含まないもの

- `PermissionDialog` コンポーネント実装（TASK-SKILL-LIFECYCLE-08）
- `SafetyGate` との統合（UT-06-003）
- `high × time_24h` テスト追加（UT-06-006）
- `high × time_7d` テスト追加（UT-06-007）

## 依存タスク

| タスクID                | 関係                                 | ステータス |
| ----------------------- | ------------------------------------ | ---------- |
| TASK-SKILL-LIFECYCLE-06 | 前提（型定義・インターフェース設計） | 完了       |
| TASK-SKILL-LIFECYCLE-08 | 後続（PermissionDialog UI）          | 未実施     |
| UT-06-003               | 後続（SafetyGate 統合）              | 未実施     |
| UT-06-006               | 後続（time_24h テスト）              | 未実施     |
| UT-06-007               | 後続（time_7d テスト）               | 未実施     |

## 統合テスト連携

| 判定項目                | 基準 | 備考                       |
| ----------------------- | ---- | -------------------------- |
| ユニットテスト Line     | 80%+ | `permission-store.test.ts` |
| ユニットテスト Branch   | 60%+ | 6分岐フローの全分岐        |
| ユニットテスト Function | 80%+ | 全 public メソッド         |

## 成果物

| 成果物     | パス                              | 説明           |
| ---------- | --------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ドキュメント |

## 完了条件

- [x] 要件抽出（FR/NFR 分類）が完了している
- [x] 受け入れ基準が検証可能な形式で記述されている
- [x] スコープが明確に定義されている
- [x] P50チェック（既実装状態の調査）が実施されている
- [x] 依存タスクが明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
