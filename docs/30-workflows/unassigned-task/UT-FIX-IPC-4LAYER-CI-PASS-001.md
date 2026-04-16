# 未タスク指示書: UT-FIX-IPC-4LAYER-CI-PASS-001

## メタ情報

```yaml
issue_number: 2162
```

| 項目       | 値                                                                 |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | UT-FIX-IPC-4LAYER-CI-PASS-001                                      |
| タスク名   | IPC 4層検証 CI パス化（既知違反20件の解消）                        |
| 由来       | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Phase 12（独立検証にて検出）    |
| ステータス | unassigned                                                         |
| 優先度     | high                                                               |
| 分類       | bug / CI blocking                                                  |
| 規模       | medium                                                             |
| 対応時期   | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 マージ前（CI ブロッカーのため） |
| 作成日     | 2026-04-14                                                         |
| 関連タスク | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001（検証スクリプト実装元）         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 で `scripts/verify-ipc-4layer.cjs` を実装し、`.github/workflows/ci.yml` に `verify-ipc-4layer` ジョブとして追加した。このジョブは `build` ジョブの `needs` に含まれているため、**失敗すると全ビルドがブロックされる**。

### 1.2 問題

現在のコードベースで `node scripts/verify-ipc-4layer.cjs` を実行すると exit code 1 で終了する：

- **Rule-1** (shared → preload 未登録): **12件**
- **Rule-2** (preload → main 未実装): **8件**
- **Rule-3** (renderer → shared/preload 未定義): PASS

CI にマージすると即座に全 PR のビルドが失敗する。

### 1.3 Phase-12 判定との差異

UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 の Phase-12 `unassigned-task-detection.md` は「新規未タスク 0 件」と判定した。理由は「20件の不整合は既存 task family に紐づく」というもの。

しかし独立検証の結果、以下の理由で新規タスクが必要と判断した：

1. **CI がブロックされる**: `build` ジョブの `needs` に含まれており、マージ不可
2. **既存タスクに「CI パス化」の明示的スコープがない**: 個別チャネル修正タスクはあるが、CI 通過を目的としたタスクがない
3. **段階的修正が困難**: allowlist 機構がないため「既知違反は無視して新規違反のみ検出」ができない

---

## 2. 概要

`verify-ipc-4layer.cjs` の既知違反20件を解消し、CI が exit code 0 で通過する状態にする。対応方針は以下の2択：

- **方針A（推奨）**: known-violations allowlist を追加し、既知違反を明示的にスキップ。個別修正は既存タスクファミリーに委ねる
- **方針B**: 20件の不整合を一括修正（shared/preload/main 各層のチャネル定義を同期）

---

## 3. 現状の違反詳細

### Rule-1: shared で定義されたチャネルが preload ホワイトリストに未登録（12件）

| #   | チャネル名                                   | ドメイン      | 既存タスクファミリー             |
| --- | -------------------------------------------- | ------------- | -------------------------------- |
| 1   | `chat:exportSession`                         | Chat export   | chat-history-persistence         |
| 2   | `chat:previewExport`                         | Chat export   | chat-history-persistence         |
| 3   | `fs:writeFile`                               | File I/O      | task-3-1-c-permission-request    |
| 4   | `fs:readFile`                                | File I/O      | task-3-1-c-permission-request    |
| 5   | `skill-creator:start-session`                | Skill Creator | runtime-skill-creator-ipc-wiring |
| 6   | `skill-creator:question-received`            | Skill Creator | runtime-skill-creator-ipc-wiring |
| 7   | `skill-creator:answer`                       | Skill Creator | runtime-skill-creator-ipc-wiring |
| 8   | `skill-creator:session-complete`             | Skill Creator | runtime-skill-creator-ipc-wiring |
| 9   | `skill-creator:session-error`                | Skill Creator | runtime-skill-creator-ipc-wiring |
| 10  | `skill-creator:external-api-config-required` | Skill Creator | runtime-skill-creator-ipc-wiring |
| 11  | `skill-creator:api-configured`               | Skill Creator | runtime-skill-creator-ipc-wiring |
| 12  | `skill-creator:api-test-result`              | Skill Creator | runtime-skill-creator-ipc-wiring |

### Rule-2: preload invoke ホワイトリストのチャネルが main ハンドラに未実装（8件）

| #   | チャネル名                 | ドメイン   | 既存タスクファミリー            |
| --- | -------------------------- | ---------- | ------------------------------- |
| 1   | `auth:start-oauth-flow`    | Auth OAuth | auth-callback-urlscheme         |
| 2   | `auth:test-callback`       | Auth OAuth | auth-callback-urlscheme         |
| 3   | `settings:get`             | Settings   | TASK-8C-A                       |
| 4   | `settings:update`          | Settings   | TASK-8C-A                       |
| 5   | `agent:get-skills`         | Agent      | agent-dashboard-foundation      |
| 6   | `agent:get-skill-detail`   | Agent      | agent-dashboard-foundation      |
| 7   | `agent:execute`            | Agent      | agent-dashboard-foundation      |
| 8   | `agent:permission-respond` | Agent      | TASK-3-1-D-permission-dialog-ui |

---

## 4. 期待される修正

### 方針A: known-violations allowlist（推奨）

`scripts/verify-ipc-4layer.cjs` に allowlist 機構を追加する：

```javascript
// scripts/ipc-4layer-known-violations.json
{
  "rule1": [
    "chat:exportSession",
    "chat:previewExport",
    "fs:writeFile",
    "fs:readFile",
    "skill-creator:start-session",
    "skill-creator:question-received",
    "skill-creator:answer",
    "skill-creator:session-complete",
    "skill-creator:session-error",
    "skill-creator:external-api-config-required",
    "skill-creator:api-configured",
    "skill-creator:api-test-result"
  ],
  "rule2": [
    "auth:start-oauth-flow",
    "auth:test-callback",
    "settings:get",
    "settings:update",
    "agent:get-skills",
    "agent:get-skill-detail",
    "agent:execute",
    "agent:permission-respond"
  ]
}
```

- allowlist に含まれるチャネルは warning 扱い（exit code に影響しない）
- allowlist 外の新規違反は error（exit code 1）
- allowlist から削除する際に対応するチャネル修正が完了していることを確認

### 方針B: 一括修正

20件の不整合を直接修正する。規模が大きいため、ドメイン別にサブタスク化を推奨。

---

## 5. 苦戦箇所（前タスクから引き継ぎ）

### 5.1 IPC 不整合の散在

20件の不整合が chat/fs/skill-creator/auth/settings/agent の6ドメインに散在している。各ドメインは独立した機能領域であり、修正には各ドメインのコンテキスト理解が必要。

### 5.2 既存タスクファミリーとの紐づけの複雑さ

completed-tasks に移動済みのタスクが実装したチャネルでも 4層整合が取れていない。完了済みタスクの修正はスコープ外と判断されがちだが、CI では検出される。

### 5.3 CI 通過と品質のトレードオフ

- allowlist で CI を通過させると、既知違反が放置されるリスク
- 一括修正は規模が大きく、他タスクとのコンフリクトリスク
- 推奨: allowlist + 既存タスクでの段階的修正

### 5.4 CommonJS 形式の制約

`verify-ipc-4layer.cjs` は Node.js 標準のみ依存の CommonJS 形式。TypeScript の型安全性がないため、allowlist 機構追加時はランタイムバリデーションが必要。

---

## 6. 完了条件

- [ ] `node scripts/verify-ipc-4layer.cjs` が exit code 0 で終了する
- [ ] 既知違反は allowlist または直接修正で解消済み
- [ ] 新規違反が追加された場合は exit code 1 で検出可能
- [ ] 既存テスト（113件）が全 PASS
- [ ] allowlist 機構のテストが追加されている（方針A の場合）
- [ ] CI の `verify-ipc-4layer` ジョブが GREEN

---

## 7. 対象ファイル

| ファイル                                                 | 変更内容                                     |
| -------------------------------------------------------- | -------------------------------------------- |
| `scripts/verify-ipc-4layer.cjs`                          | allowlist 読み込み・warning 出力ロジック追加 |
| `scripts/ipc-4layer-known-violations.json`               | 新規作成: 既知違反リスト                     |
| `scripts/__tests__/verify-ipc-4layer/validators.test.ts` | allowlist 関連テスト追加                     |
| `scripts/__tests__/verify-ipc-4layer/e2e.test.ts`        | allowlist 込み E2E テスト追加                |

---

## 8. 関連タスク

| 関係 | タスクID                                    | 説明                      |
| ---- | ------------------------------------------- | ------------------------- |
| 前提 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001          | 検証スクリプト実装元      |
| 関連 | UT-IPC-EXECUTION-CHANNELS-PARITY-001        | 実行チャネル整合          |
| 関連 | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 | Skill Creator IPC 接続    |
| 関連 | TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION    | skill-creator:verify 実装 |

---

_このファイルは UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Phase-12 の独立検証により作成されました。_
_作成日: 2026-04-14_
