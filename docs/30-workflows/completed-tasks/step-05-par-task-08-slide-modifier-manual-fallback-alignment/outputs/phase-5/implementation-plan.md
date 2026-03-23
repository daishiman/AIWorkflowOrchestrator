# Phase 5: 実装計画

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 5                                                     |
| 作成日   | 2026-03-23                                            |
| 前提     | Phase 3 ゲート判定 PASS（MINOR MN-01 追跡中）         |

## 1. 設計タスクにおける実装計画の位置づけ

本タスクは設計タスクであり、プロダクションコードの変更は行わない。
本 Phase 5 は以下の2つの目的を持つ:

1. **MN-01 解決**: SlideCapabilityDTO 用 IPC channel の設計を明示（Phase 3 ゲートの MINOR 完了条件）
2. **後続実装タスクの実装順序定義**: UT-SLIDE-IMPL-001 / UT-SLIDE-UI-001 が参照する実装ロードマップ

## 2. MN-01 対応: SlideCapabilityDTO 用 IPC Channel 設計

### MN-01 完了条件の確認

> Phase 3 gate-decision.md MN-01:
> 「SlideCapabilityDTO の IPC channel 設計を Phase 5 implementation-plan で明示すること」

### IPC Channel 定義

| Channel 名                 | 方向            | Handler 種別       | ペイロード型         |
| -------------------------- | --------------- | ------------------ | -------------------- |
| `slide:capability:get`     | Renderer → Main | `ipcMain.handle`   | `void`               |
| `slide:capability:changed` | Main → Renderer | `webContents.send` | `SlideCapabilityDTO` |

### Channel 名の命名根拠

- `slide:capability:get`: slide namespace + capability ドメイン + CRUD 動詞（get）
- `slide:capability:changed`: push 通知パターン（changed suffix）で Main からの非同期通知を表す
- `slide:settings:*` との一貫性を維持（同一 slide namespace 内）

### Preload allowlist への追加

```typescript
// apps/desktop/src/preload/ipc-channels.ts（実装タスクで追加）
export const IPC_CHANNELS = {
  // 既存チャンネル...
  SLIDE_CAPABILITY_GET: "slide:capability:get",
  SLIDE_CAPABILITY_CHANGED: "slide:capability:changed",
} as const;
```

### 型定義の配置先

```
packages/shared/src/slide/types.ts  ← SlideCapabilityDTO, SlideUIStatus の共有型
apps/desktop/src/preload/types.ts   ← Preload 層の型宣言（P32 対策: 2ファイル同時更新）
```

### P65 対策: Dead-end namespace 防止

新規 channel `slide:capability:*` は既存の `slide:settings:*` handlers に相乗りせず、
専用の handler 登録関数 `registerSlideCapabilityHandlers()` として分離する。
ただし main index への登録は既存の `registerSlideIpcHandlers()` から呼び出す（namespace の入口を増やさない）:

```typescript
// apps/desktop/src/main/handlers/slide-handlers.ts（実装タスクで追加）
export function registerSlideIpcHandlers(
  slideService: SlideService,
  mainWindow: BrowserWindow,
): void {
  registerSlideSettingsHandlers(slideService); // 既存
  registerSlideCapabilityHandlers(slideService, mainWindow); // 新規追加
}
```

## 3. 実装順序定義（後続実装タスク向けロードマップ）

### Phase Gate 付き実装順序

下表は design-summary.md Concern C の cleanup 順序テーブルを Phase Gate 付きで展開したもの。

| 順序 | 実装内容                                     | 担当タスク               | 前提 Gate                     | 完了条件                                      |
| ---- | -------------------------------------------- | ------------------------ | ----------------------------- | --------------------------------------------- |
| 1    | SlideUIStatus 型 + Reducer の実装            | UT-SLIDE-IMPL-001        | Task08 Phase 5 完了（本文書） | V-07, V-08 テストが全件 PASS                  |
| 2    | SlideCapabilityDTO 型の実装                  | UT-SLIDE-IMPL-001        | 順序1 完了                    | V-10 テストが全件 PASS                        |
| 3    | IPC handler 実装（capability get/changed）   | UT-SLIDE-IMPL-001        | 順序2 完了                    | `slide:capability:get` handler が応答する     |
| 4    | ModifierResponse 拡張（optional フィールド） | UT-SLIDE-IMPL-001        | 順序1 完了                    | V-09 テストが全件 PASS                        |
| 5    | skill-executor.ts lane 分岐の実装            | UT-SLIDE-IMPL-001        | 順序1, 2 完了                 | V-11 テストが全件 PASS                        |
| 6    | SlideWorkspace.tsx UI 4領域の実装            | UT-SLIDE-UI-001          | 順序3, 4, 5 完了              | UX-07 screenshot 契約を充足                   |
| 7    | agent-client.ts → SDK adapter 移行           | UT-SLIDE-IMPL-001        | 順序6 完了 + Task09 承認      | direct SDK path が agent-client.ts から消える |
| 8    | silent fallback の明示化                     | UT-SLIDE-IMPL-001        | 順序7 完了                    | apiKeySource が全パスで正しく報告される       |
| 9    | terminal handoff 重複解消                    | UT-SLIDE-HANDOFF-DUP-001 | 順序6 完了 + Task05 完了      | TerminalHandoffCard が1箇所からのみ呼ばれる   |

### 並列実行可能な順序

```
順序1（Reducer）
   ├─→ 順序2（DTO）→ 順序3（IPC handler）
   └─→ 順序4（ModifierResponse 拡張）
         └─→ 順序5（lane 分岐）
                └─→ 順序6（UI 実装）
                      ├─→ 順序7（SDK 移行）→ 順序8（fallback 明示）
                      └─→ 順序9（handoff 重複解消）
```

順序1は全ての起点であり、UT-SLIDE-IMPL-001 Phase 4 で最初に着手する。

## 4. 禁止事項（再発防止ルール）

以下は設計審議で確定した実装時の禁止事項。後続実装タスクの Phase 2 に転記すること。

### 禁止事項1: silent fallback の再発

| 禁止パターン                                     | 代替実装                                              | 参照 Pitfall |
| ------------------------------------------------ | ----------------------------------------------------- | ------------ |
| API key を取得できない場合に無言でフォールバック | `apiKeySource="none"` + `blockedReason` を DTO に設定 | P62          |
| degraded 状態から自動的に再試行する              | `INVALID_TRANSITION` エラーを throw                   | V-08         |
| env fallback 時に警告ログを出さない              | `logger.warn("apiKeySource:env fallback detected")`   | P62          |

### 禁止事項2: ローカル判定の禁止

| 禁止パターン                                    | 代替実装                                  |
| ----------------------------------------------- | ----------------------------------------- |
| Renderer で lane 判定を行う                     | Main Process の SlideCapabilityDTO を参照 |
| IPC を経由せず window 変数で capability を渡す  | `slide:capability:get` IPC を使用         |
| SlideWorkspace.tsx 内に lane 判定ロジックを書く | Store セレクタ経由で capability を取得    |

### 禁止事項3: no-op パターンの再発（P65 対策）

| 禁止パターン                                       | 代替実装                                           |
| -------------------------------------------------- | -------------------------------------------------- |
| `creator:*` のような dead-end namespace を追加する | 既存 `slide:*` namespace 内に channel を追加       |
| Preload allowlist に追加せずに handler を登録する  | allowlist → handler → Renderer 呼び出しの3点セット |
| handler を登録したが main index から接続していない | `registerSlideIpcHandlers()` から必ず呼び出す      |

### 禁止事項4: 禁止アクションの実装（ManualBoundary 準拠）

```typescript
// 絶対禁止: manual lane での自動送信
if (lane === "manual") {
  autoSendToAgent(payload); // NEVER DO THIS
}

// 絶対禁止: hidden injection
const processedInput = injectHiddenContext(userInput); // NEVER DO THIS

// 絶対禁止: silent retry
if (status === "degraded") {
  scheduleRetry(); // NEVER DO THIS
}
```

## 5. MN-01 完了確認

| MN-01 完了条件                                       | 充足状態   |
| ---------------------------------------------------- | ---------- |
| implementation-plan.md に channel 名が記載されている | 充足（§2） |
| Preload allowlist への追加方法が明示されている       | 充足（§2） |
| 型定義の配置先が明示されている                       | 充足（§2） |
| P65 対策（dead-end namespace 防止）が明示されている  | 充足（§2） |

MN-01 は本文書の作成をもって完了とする。
