# Slide Runtime Alignment 実装収束 - タスク指示書

## メタ情報

```yaml
issue_number: 1363
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-SLIDE-IMPL-001                                          |
| タスク名     | Slide Runtime Alignment 実装収束                           |
| 分類         | 実装                                                       |
| 対象機能     | slide-ai-runtime-alignment                                 |
| 優先度       | 高                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 Phase 11/12 再監査 |
| 発見日       | 2026-03-19                                                 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task 09 で slide runtime/auth-mode alignment の正本仕様は確定したが、現行コードは legacy slide path のまま残っている。

### 1.2 問題点・課題

- `registerSlideIpcHandlers()` が Main IPC index へ未接続。
- `agent-client.ts` が `@anthropic-ai/sdk` / `safeStorage` / `electron-store` / env fallback を直接利用。
- `modifier-skill.ts` が独立実装として残り、`skill-executor.ts` と責務が分散。
- IPC チャネル名と reverse-sync semantics が正本契約と不一致。

### 1.3 放置した場合の影響

- slide surface だけ runtime/auth-mode foundation から外れ続ける。
- 正本仕様と現行コードの drift が拡大する。
- Phase 11 の visual audit を live current build で再検証できない。

## 2. 何を達成するか（What）

### 2.1 目的

slide Main/Renderer 経路を RuntimeResolver 基盤へ統合し、legacy slide path を canonical contract へ寄せる。

### 2.2 最終ゴール

- slide IPC が canonical 12チャネルへ統一される。
- `agent-client.ts` / `modifier-skill.ts` の legacy path が整理される。
- slide runtime が `integrated` / `handoff` の正本 contract を返せる。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/index.ts` への slide handler 登録
- `apps/desktop/src/main/slide/` 配下の RuntimeResolver 統合
- canonical channel rename と preload / renderer / main 同期
- `packages/shared/src/slide/types.ts` と slide store 契約の整合

#### 含まないもの

- SlideWorkspace の見た目改善全般
- 既存 unrelated workflow の IPC 整理

### 2.4 成果物

- slide runtime 実装差分
- 関連テスト
- live current build での再撮影可能状態

## 3. どのように実行するか（How）

### 3.1 前提条件

- task 09 の Phase 1-12 成果物が最新であること
- `workflow-ai-runtime-authmode-unification.md` と `api-ipc-system-core.md` が task 09 追補済みであること

### 3.2 依存タスク

- TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001（spec_created）

### 3.3 必要な知識

- Electron IPC
- RuntimeResolver / handoffGuidance contract
- slide sync / reverse-sync workflow

### 3.4 推奨アプローチ

- channel 定数化を先に行い、preload / renderer / main を同 wave で置換する
- RuntimeResolver と handoff contract を先に通し、SDK 直呼びを後から除去する

## 4. 実行手順

### Phase構成

- Phase A: Main IPC 接続
- Phase B: RuntimeResolver 統合
- Phase C: legacy path 廃止
- Phase D: テストと再撮影

### Phase A: Main IPC 接続

1. `registerSlideIpcHandlers()` を `apps/desktop/src/main/ipc/index.ts` へ登録する。
2. slide IPC チャネルを定数へ集約する。
3. preload / renderer 参照を同じ定数群へ寄せる。

### Phase B: RuntimeResolver 統合

1. `skill-executor.ts` に RuntimeResolver と handoffGuidance を統合する。
2. `validateIpcSender -> P42 -> path guard -> business` の順序で handler を整理する。
3. `manualSync` の実処理を reverse-sync 契約へ揃える。

### Phase C: legacy path 廃止

1. `agent-client.ts` の direct SDK / env fallback を除去する。
2. `modifier-skill.ts` の責務を `skill-executor.ts` 側へ統合する。
3. `packages/shared/src/slide/types.ts` と store 契約を正本へ揃える。

### Phase D: テストと再撮影

1. slide IPC / runtime / store / UI の targeted test を追加する。
2. live current build で Phase 11 screenshot を再取得する。
3. task 09 workflow の Phase 11/12 validator を再実行する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] slide handler が Main IPC index へ登録されている
- [ ] RuntimeResolver と handoffGuidance が slide path で動作する
- [ ] canonical channel 名へ統一されている

### 品質要件

- [ ] direct SDK / env fallback が slide path から除去されている
- [ ] validateIpcSender / P42 / path guard の順序が守られている
- [ ] live current build の screenshot で再監査できる

### ドキュメント要件

- [ ] task 09 workflow の Phase 11/12 成果物が再同期されている
- [ ] aiworkflow-requirements 正本の drift 記述を実装済み状態へ更新している

## 6. 検証方法

### テストケース

- slide invoke 6チャネルの request/response 契約
- handoff と integrated の分岐
- reverse-sync / error / progress の push event

### 検証手順

1. targeted vitest を実行する。
2. `pnpm --filter @repo/desktop typecheck` を実行する。
3. Phase 11 screenshot を live current build で再取得する。
4. task 09 workflow validator を再実行する。

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                     |
| --------------------------------------------- | ------ | -------- | -------------------------------------------------------- |
| preload / renderer / main の rename 漏れ      | 高     | 中       | channel 定数化後に 3 層を同 wave 更新する                |
| RuntimeResolver 導入で既存 sync path が壊れる | 高     | 中       | integrated/handoff を分けた targeted test を先に追加する |
| esbuild 環境不整合で再撮影できない            | 中     | 中       | worktree 依存の native binary 整合を先に確認する         |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` — canonical set / artifact inventory
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-advanced.md` — modifier 契約正本
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md` — UI 4領域設計正本
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md` — slideSlice 設計正本
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` — Task09 教訓

### 参考資料

- `apps/desktop/src/main/slide/ipc-handlers.ts`
- `apps/desktop/src/main/slide/skill-executor.ts`
- `apps/desktop/src/main/slide/agent-client.ts`
- `apps/desktop/src/main/slide/modifier-skill.ts`

## 9. 備考

task 09 の Phase 11 再監査では Blocker ではなく Note として整理したが、実装収束の優先度は最上位に近い。UI 実装タスクと分離しつつ、runtime/auth-mode contract の正本回復を先行させる。

## 10. 苦戦箇所・実装上の注意点（教訓）

### 10.1 agent-client.ts の3重問題

設計段階で agent-client.ts が Direct SDK import (L9)、electron-store 直読み (L99,117)、env fallback (L127) の3重問題を抱えていることが判明。さらに L163 に「シミュレーション実装」というコメントがあるが実際は SDK を直呼びしており、コメントと実態が乖離していた。

**教訓**: runtime 経路の棚卸しでは、コメントを信用せず実際のコードパスを file:line で追跡すること。

### 10.2 modifier-skill.ts の孤立

modifier-skill.ts の `createModifierSkill()` は定義されているが呼び出し元がゼロだった。skill-executor.ts の `phase === "modifier"` 分岐が実質的に同じ役割を果たしており、二重実装が発生していた。

**教訓**: 新規モジュール追加前に、既存モジュールに同等のロジックがないか `grep -rn` で確認すること。

### 10.3 IPC チャネル名の invoke/push 衝突

`slide:sync-status` がinvoke（Renderer→Main）とpush（Main→Renderer）の両方で使われる設計になりかけた。push 側を `slide:sync-status-changed` に分離して衝突を回避した。

**教訓**: IPC チャネル名を設計する際は、invoke（双方向RPC）と push（一方向通知）を命名規則で明示的に区別すること。push 側に `-changed` サフィックスを付与するパターンを標準化する。

### 10.4 SyncStatus 型の正本差異

正本仕様（api-ipc-system-core.md）では `"idle" | "syncing" | "synced" | "error"` だが、現行実装（types.ts）では `"synced" | "out-of-sync" | "syncing" | "error"` と定義されていた。`out-of-sync` vs `idle` の差異を Phase 2 で発見し統一設計を行った。

**教訓**: 正本仕様書と実装コードの型定義は Phase 1 の初期段階で照合すること。特にユニオン型のメンバー名は grep だけでは差異を見逃しやすい。

### 10.5 validateIpcSender 全チャネル未実装

slide 系 IPC ハンドラ全6本に validateIpcSender が未実装だった。slideSettings 系は既に実装済み（156テスト、94.30% Coverage）だったが、slide sync 系は完全に漏れていた。

**教訓**: 新規 IPC ハンドラ追加時は `security-electron-ipc-core.md` のチェックリストを必ず実施すること。
