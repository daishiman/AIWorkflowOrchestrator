# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト作成                      |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 3: 設計レビュー           |
| 次Phase    | Phase 5: 実装                   |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

IPC チャネルテストとセキュリティテストを先に定義し、fail-first で統合/整理の正しさを検証できるようにする。

## 実行手順

### 0. 既存テストの確認（必須）

```bash
# creatorHandlers の既存テスト
find apps/desktop/src -name "*creatorHandler*test*" -o -name "*creator*handler*test*"

# preload の既存テスト
find apps/desktop/src -name "*skill-creator*test*" -o -name "*channels*test*"

# セキュリティ関連テスト
grep -rn "pathTraversal\|sanitize\|sender" apps/desktop/src/**/*.test.ts
```

## 実行タスク

### Task 1: IPC チャネルルーティングテスト

- **テスト対象**: `creatorHandlers.ts`
- 統合/整理後の全チャネルが正しくルーティングされることを検証する
- Session 系チャネルと Runtime 系チャネルの呼び分けが正しいことを検証する
- 未登録チャネルへのアクセスが適切に拒否されることを検証する

**テスト関数シグネチャ（推奨構造）**:

```typescript
describe("creatorHandlers IPC routing", () => {
  describe("session IPC channels", () => {
    it("should route startSession to session handler", () => {});
    it("should route sendAnswer to session handler", () => {});
    it("should route listSessions to session handler", () => {});
    // ... 全 session チャネル
  });

  describe("runtime IPC channels", () => {
    it("should route planSkill to runtime handler", () => {});
    it("should route executePlan to runtime handler", () => {});
    // ... 全 runtime チャネル
  });

  describe("channel consistency", () => {
    it("should have all channels registered in whitelist", () => {});
    it("should reject unregistered channels", () => {});
  });
});
```

### Task 2: セキュリティテスト

- **テスト対象**: 両経路のセキュリティチェック
- パストラバーサル防止が Session IPC の全チャネルで機能することを検証する
- パストラバーサル防止が Runtime IPC の全チャネルで機能することを検証する
- sender 検証が全ハンドラーに適用されていることを検証する
- コマンドインジェクション防止が機能することを検証する

```typescript
describe("IPC security uniformity", () => {
  describe("path traversal prevention", () => {
    it("should prevent path traversal in session IPC", () => {});
    it("should prevent path traversal in runtime IPC", () => {});
    it("should apply same sanitization to both paths", () => {});
  });

  describe("sender verification", () => {
    it("should verify sender for all session handlers", () => {});
    it("should verify sender for all runtime handlers", () => {});
  });
});
```

### Task 3: preload API surface テスト

- `skill-creator-api.ts` が公開する API が設計通りであることを検証する
- 型安全性が維持されていることを検証する
- contextBridge 経由の公開メソッドが正しいことを検証する

### Task 4: チャネルホワイトリスト整合性テスト

- `channels.ts` のホワイトリストが全ハンドラーと整合していることを検証する
- 孤立チャネル（ホワイトリストにあるがハンドラーがない）が存在しないことを検証する
- 未登録チャネル（ハンドラーがあるがホワイトリストにない）が存在しないことを検証する

## 参照資料

| 資料名          | パス                                           | 説明           |
| --------------- | ---------------------------------------------- | -------------- |
| 設計レビュー    | `outputs/phase-3/design-review-gate.md`        | gate 結果      |
| 設計成果物      | `outputs/phase-2/design-document.md`           | 統合方針と設計 |
| 統合戦略書      | `outputs/phase-2/ipc-unification-strategy.md`  | 方針選択の根拠 |
| creatorHandlers | `apps/desktop/src/main/ipc/creatorHandlers.ts` | テスト対象     |
| channels.ts     | `apps/desktop/src/preload/channels.ts`         | テスト対象     |

### システム仕様（aiworkflow-requirements）

> テスト作成前に必ず以下のシステム仕様を確認し、テスト観点の網羅性を確保してください。

| 参照資料                  | パス                                                                           | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC整合性のテスト観点        |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティテストの網羅基準 |

## 多角的チェック観点

| 観点               | 適用判断                         | 確認内容                                      |
| ------------------ | -------------------------------- | --------------------------------------------- |
| IPC通信            | IPC チャネルテストのため適用     | 全チャネルのルーティングが正しいこと          |
| セキュリティ       | セキュリティテスト作成のため適用 | パストラバーサル防止、sender 検証の均一テスト |
| エラーハンドリング | エラー処理の統一テストのため適用 | 両経路で一貫したエラーレスポンスが返ること    |

## 統合テスト連携

- Phase 10 の最終レビューで AC-1〜AC-7 との対応表を再利用する
- セキュリティ均一性テストを Phase 6 で境界条件追加の起点にする

## 成果物

| 成果物           | パス                             | 説明                                                 |
| ---------------- | -------------------------------- | ---------------------------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | チャネルルーティング・セキュリティ・整合性テスト一覧 |

## 完了条件

- [ ] IPC チャネルルーティングテストが定義されている
- [ ] セキュリティ均一性テストが定義されている
- [ ] preload API surface テストが定義されている
- [ ] チャネルホワイトリスト整合性テストが定義されている
- [ ] AC-1〜AC-7 とテストが対応している
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
