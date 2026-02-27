# Phase 10 アーキテクチャ・外部依存レビュー

## メタ情報

| 項目          | 内容                                     |
| ------------- | ---------------------------------------- |
| レビュー日    | 2026-02-27                               |
| 対象タスク    | TASK-9G                                  |
| レビューPhase | 10（再実行）                             |
| レビュー担当  | Claude Code（自動レビュー + テスト実行） |

---

## アーキテクチャチェックリスト

| チェック項目                       | 確認内容                                                  | 結果 |
| ---------------------------------- | --------------------------------------------------------- | :--: |
| ホワイトリスト追加                 | `ALLOWED_INVOKE_CHANNELS` に5チャンネル追加済み           |  OK  |
| ハンドラー登録                     | `registerSkillScheduleHandlers()` で5ハンドラー登録済み   |  OK  |
| ハンドラー解除                     | `unregisterSkillScheduleHandlers()` で5チャンネル解除     |  OK  |
| チャンネル定数（正本と副本の一致） | `IPC_CHANNELS` の定数値と実際のハンドラー登録が一致       |  OK  |
| レイヤー依存方向                   | Renderer -> Preload -> Main の一方向依存                  |  OK  |
| contextBridge経由                  | `safeInvokeUnwrap` -> `ipcRenderer.invoke` 経由           |  OK  |
| 初期化統合                         | `main/ipc/index.ts` で統合済み（Phase 12でパス補正）      |  OK  |
| スケジュール復元                   | `registerAllIpcHandlers` 内で `initialize()` 呼び出し済み |  OK  |

### 指摘事項

#### MINOR-ARCH-01（Phase 12で解消）: 初期化統合パス記述の不一致

- **重要度**: MINOR
- **内容**: Phase 10 出力時点では `main/index.ts` を参照して未統合と判定したが、実実装は `apps/desktop/src/main/ipc/index.ts` に統合済みだった（`registerAllIpcHandlers` で `SkillScheduler.initialize()` 実行）
- **影響**: 実装影響なし。文書上の参照不一致のみ
- **対応**: Phase 12 で `artifacts.json` と仕様書の実装パスを `main/ipc/index.ts` に統一し解消

---

## レイヤー依存方向の確認

```
Renderer
  |
  v (contextBridge / skillAPI.scheduleList() 等)
Preload (skill-api.ts)
  |
  v (ipcRenderer.invoke -> ipcMain.handle)
Main Process
  |
  +-- skillHandlers.ts (IPCハンドラー)
  |     |
  |     +-- SkillScheduler (スケジュール制御)
  |     +-- ScheduleStore (永続化)
  |           |
  |           +-- electron-store (ファイル永続化)
  |
  +-- SkillScheduler
        |
        +-- node-cron (cron式スケジューリング)
        +-- Node.js setTimeout/setInterval (interval/once方式)
        +-- SchedulerSkillExecutor (スキル実行 - DI)
```

- Renderer -> Main の逆方向依存は存在しない
- Main Process 内のサービス層（SkillScheduler, ScheduleStore）がIPCハンドラーから分離されている
- `SchedulerSkillExecutor` インターフェースによりスキル実行の具象依存を抽象化

---

## DI 設計の評価

### SkillScheduler の依存注入

```typescript
export class SkillScheduler {
  constructor(
    scheduleStore: ScheduleStore,
    skillExecutor: SchedulerSkillExecutor,
  ) { ... }
}
```

| DI パターン           | 適用対象               | 評価                                         |
| --------------------- | ---------------------- | -------------------------------------------- |
| Constructor Injection | ScheduleStore          | 生成時に利用可能。適切なパターン選択         |
| Constructor Injection | SchedulerSkillExecutor | インターフェースによる抽象化。テスト容易性高 |

- `SchedulerSkillExecutor` はインターフェースとして定義され、テスト時にモック注入が容易
- ScheduleStore も DI 可能（コンストラクタで注入）
- P34（遅延初期化パターン）は不要（両依存が生成時に利用可能）

### ScheduleStore の依存注入

```typescript
export class ScheduleStore {
  constructor(store?: ElectronStore<ScheduleStoreSchema>) { ... }
}
```

- `store` パラメータがオプショナルであり、テスト時にモック注入可能
- デフォルト値として実際の `ElectronStore` インスタンスが生成される

---

## メモリ管理の評価

### activeJobs Map

| 確認項目         | 状況                                                             | 評価 |
| ---------------- | ---------------------------------------------------------------- | :--: |
| エントリ追加     | `activateSchedule()` で追加                                      |  OK  |
| エントリ削除     | `deactivateSchedule()` で削除                                    |  OK  |
| 重複防止         | `activateSchedule()` 冒頭で既存エントリを `deactivateSchedule()` |  OK  |
| 全エントリクリア | `destroy()` メソッド**未実装**                                   | 指摘 |

### runHistory の上限

- `MAX_RUN_HISTORY = 100` で制限されている
- `addRunResult()` で先頭追加 + `slice(0, MAX_RUN_HISTORY - 1)` でトリミング
- メモリ増大のリスクは限定的

---

## サービス責務分離

| サービス       | 責務                                             | 依存先                                           |
| -------------- | ------------------------------------------------ | ------------------------------------------------ |
| SkillScheduler | タイマー/cron管理、スケジュール実行制御          | ScheduleStore, node-cron, SchedulerSkillExecutor |
| ScheduleStore  | CRUD操作、永続化（electron-store）、実行履歴管理 | electron-store                                   |

- 単一責務原則（SRP）に準拠
- SkillScheduler がストア操作を ScheduleStore に委譲している

---

## node-cron 外部依存リスク評価

| リスク項目         | 確認内容                                                        | 結果 |
| ------------------ | --------------------------------------------------------------- | :--: |
| 既知の脆弱性       | node-cron v4.x はメジャー脆弱性報告なし（npm audit 基準）       |  OK  |
| バージョン固定     | `"node-cron": "^4.2.1"` - キャレット（`^`）で指定、パッチ更新可 | 注記 |
| 型定義の整合       | `"@types/node-cron": "^3.0.11"` - **メジャーバージョン不一致**  | 指摘 |
| フォールバック設計 | node-cron が例外をスローした場合の catch が実装済み             |  OK  |
| メモリ使用量       | cron ジョブ1件あたりの追加メモリは軽微（推定 < 1KB）            |  OK  |

### 指摘事項

#### MINOR-DEP-01: @types/node-cron メジャーバージョン不一致

- **重要度**: MINOR
- **内容**: `node-cron` は v4.2.1（`^4.2.1`）だが、`@types/node-cron` は v3.0.11（`^3.0.11`）。メジャーバージョンが不一致
- **影響**: node-cron v4 で追加/変更されたAPIの型定義が不正確になる可能性がある。ただし、使用しているAPIは `schedule()` と `validate()` のみで、v3/v4 間で互換性あり
- **推奨対応**: `@types/node-cron` を v4.x 対応版に更新する。または、node-cron v4 が自身の型定義を内蔵している場合は `@types/node-cron` を削除する

---

## node-cron 使用箇所の限定性

| 使用API                | 使用箇所                              | 目的             |
| ---------------------- | ------------------------------------- | ---------------- |
| `cron.validate()`      | `SkillScheduler.addSchedule()`        | cron式の事前検証 |
| `cron.schedule()`      | `SkillScheduler.activateSchedule()`   | cronジョブの登録 |
| `ScheduledTask.stop()` | `SkillScheduler.deactivateSchedule()` | cronジョブの停止 |

- node-cron の使用は3つのAPIに限定されており、依存の影響範囲は小さい
- `SchedulerSkillExecutor` インターフェースにより、スキル実行ロジックとスケジューリングロジックが分離されている

---

## 判定

**指摘あり（MINOR x 1）**

- レイヤー依存方向は正しく維持されている（Renderer -> Preload -> Main）
- ホワイトリスト・ハンドラー登録/解除が正しく実装されている
- DI 設計が適切（Constructor Injection + インターフェース抽象化）
- サービス責務分離（SkillScheduler / ScheduleStore）が適切
- メモリ管理: activeJobs の追加/削除は正しく実装。destroy() 未実装は MINOR-SEC-01 で指摘済み
- node-cron 依存はAPIの限定使用で影響範囲が小さい
- `main/index.ts` の初期化統合指摘は Phase 12 で解消済み
- `@types/node-cron` バージョン不一致のみが継続 MINOR 指摘
