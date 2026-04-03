# [#1769] "[TASK-AGENT-PERM-MODE] AgentPermissionMode 永続化と preload/main IPC 対応"

## メタ情報

```yaml
task_id: TASK-AGENT-PERM-MODE
task_name: AgentPermissionMode 永続化と preload/main IPC 対応
category: 改善
target_feature: AgentView permission mode persistence
priority: 低
scale: 小規模
status: 未実施
source_phase: agentview-permission-api-fix Phase 12 unassigned-task-detection（2026-03-30）
created_date: 2026-03-30
dependencies: [agentview-permission-api-fix]
spec_path: docs/30-workflows/unassigned-task/task-agent-perm-mode.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`AgentPermissionMode` は現状 `AgentView` の local state のみで保持している。画面を閉じると選択状態が失われ、セッションを跨いだ再利用ができない。

### 1.2 問題点・課題

- `default` / `acceptEdits` / `bypassPermissions` / `plan` の選択が再訪時に維持されない
- UI 上は設定項目に見えるが、保存されないため期待と実態がずれる
- preload / main / persistence 層に mode 契約が存在せず、今後の機能拡張時に drift が起きやすい

### 1.3 放置した場合の影響

- ユーザー体験が毎回初期化される
- mode 永続化を前提にした設計やガイドが書きづらい
- permission 設定責務が AgentView に閉じたままになり、settings 系 contract と乖離する

---

## 2. 何を達成するか（What）

### 2.1 目的

`AgentPermissionMode` を preload/main IPC 経由で保存・再取得できるようにし、AgentView 再訪時も選択状態を維持する。

### 2.2 最終ゴール

- preload に `getMode` / `setMode` 相当の API が追加される
- main process 側で mode が永続化される
- AgentView 初回表示時に保存済み mode が反映される

### 2.3 スコープ

#### 含むもの

- preload contract 追加
- main IPC ハンドラ追加
- 永続化先の選定と保存
- AgentView 初期読込・変更処理の接続

#### 含まないもの

- permission tool list 永続化方式の全面再設計
- Approval / Safety Gate の新規 policy 導入

---

## 3. 実行手順

1. `window.permissionAPI` の current contract を確認する
2. mode 取得/更新 API の TypeScript interface を追加する
3. preload expose と main handler を実装する
4. AgentView で初期値読込 + 変更保存を接続する
5. typecheck / test / workflow docs を更新する

---

## 4. 完了条件チェックリスト

- [ ] `AgentPermissionMode` が永続化される
- [ ] AgentView 再訪時に前回選択値が表示される
- [ ] preload/types/main IPC が同一 contract で揃う
- [ ] 実装ガイドと system spec に反映される

---

## 5. 参照情報

- `docs/30-workflows/agentview-permission-api-fix/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/src/renderer/views/AgentView/index.tsx`
- `apps/desktop/src/preload/types.ts`
