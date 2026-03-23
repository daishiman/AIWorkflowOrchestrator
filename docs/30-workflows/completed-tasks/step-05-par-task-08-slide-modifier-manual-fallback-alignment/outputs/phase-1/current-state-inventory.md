# Phase 1: 現状棚卸しインベントリ

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 1                                                     |
| 作成日   | 2026-03-23                                            |

## 1. 対象ファイル一覧

### Main Process

| ファイル                                               | 責務                              | 状態   |
| ------------------------------------------------------ | --------------------------------- | ------ |
| `apps/desktop/src/main/slide/agent-client.ts`          | Anthropic SDK 直接呼び出し        | legacy |
| `apps/desktop/src/main/slide/modifier-skill.ts`        | HTML 差分検出スキル（Modifier）   | legacy |
| `apps/desktop/src/main/slide/skill-executor.ts`        | integrated/terminal lane 実行分岐 | active |
| `apps/desktop/src/main/settings/slideSettingsStore.ts` | Slide 設定永続化                  | active |
| `apps/desktop/src/main/ipc/slideSettingsHandlers.ts`   | Slide 設定 IPC ハンドラー         | active |

### Renderer

| ファイル                                                           | 責務                    | 状態      |
| ------------------------------------------------------------------ | ----------------------- | --------- |
| `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`               | 4領域UI構成             | partial   |
| `apps/desktop/src/renderer/slide/SkillPhasePanel.tsx`              | フェーズ実行パネル      | active    |
| `apps/desktop/src/renderer/phase11-slide-ai-runtime-alignment.tsx` | Phase 11 alignment 検証 | reference |

## 2. Direct SDK Path の棚卸し

### agent-client.ts（L9, L245-248）

```
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey });
const response = await client.messages.create(...)
```

| 項目       | 現状                                               |
| ---------- | -------------------------------------------------- |
| SDK 利用元 | Main Process 内のみ                                |
| 理由       | Agent SDK 統合タスク未完了のため直接利用           |
| 危険度     | 中（Main Process 内に閉じているため IPC 漏洩なし） |
| 対応方針   | integrated runtime path への移行対象               |

## 3. Silent Fallback の棚卸し

### getApiKey()（agent-client.ts L115-132）

```
safeStorage 復号 → 失敗時に環境変数 ANTHROPIC_API_KEY へ無言 fallback
```

| 項目          | 現状                                               |
| ------------- | -------------------------------------------------- |
| fallback 元   | safeStorage（暗号化済み API key）                  |
| fallback 先   | `process.env.ANTHROPIC_API_KEY`                    |
| 通知          | なし（warning/log なし）                           |
| Renderer 同期 | なし（どの source から取得したか Renderer に不明） |
| 危険度        | 高（P62 暗黙 fallback パターンに該当）             |

## 4. IPC Channel の棚卸し

| Channel 名                      | 状態   | 問題                                  |
| ------------------------------- | ------ | ------------------------------------- |
| `registerSlideIpcHandlers()`    | 未接続 | main index への接続が未完了           |
| legacy channel 名（名称不統一） | 残存   | P65 dead-end namespace パターンに該当 |
| slide 設定系 channel            | active | 正常動作                              |

## 5. UI 4領域の棚卸し（SlideWorkspace.tsx）

| 領域              | 仕様上の責務                     | 実装状態 |
| ----------------- | -------------------------------- | -------- |
| progress row      | フェーズ進捗表示                 | 部分実装 |
| guidance block    | 操作ガイダンス・ブロック理由表示 | 未反映   |
| fallback card     | manual fallback CTA 表示         | 未反映   |
| terminal launcher | terminal handoff 起動ボタン      | 未反映   |

## 6. ドキュメントの棚卸し

| ドキュメント                                                      | Slide/Modifier 関連記述 |
| ----------------------------------------------------------------- | ----------------------- |
| `workflow-ai-runtime-authmode-unification.md` L42-44              | current code drift 記録 |
| `workflow-ai-runtime-execution-responsibility-realignment.md` L48 | legacy lane 分類        |
| `design-audit-matrix.md` L48, 88                                  | Surface 台帳            |
| `ui-ux-realization.md` L78, 181                                   | CTA・screenshot 契約    |

## 7. 既知の follow-up タスク（Task09 再監査結果）

| ID                       | 内容                          |
| ------------------------ | ----------------------------- |
| UT-SLIDE-IMPL-001        | Slide integrated runtime 実装 |
| UT-SLIDE-UI-001          | SlideWorkspace UI 4領域反映   |
| UT-SLIDE-P31-001         | P31 無限ループ対策            |
| UT-SLIDE-HANDOFF-DUP-001 | terminal handoff 重複解消     |
