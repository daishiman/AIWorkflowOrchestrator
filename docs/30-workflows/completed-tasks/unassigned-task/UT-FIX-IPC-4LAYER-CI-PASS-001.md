# 完了記録: UT-FIX-IPC-4LAYER-CI-PASS-001

## メタ情報

```yaml
issue_number: 2162
```

| 項目       | 値                                                              |
| ---------- | --------------------------------------------------------------- |
| タスクID   | UT-FIX-IPC-4LAYER-CI-PASS-001                                   |
| タスク名   | IPC 4層検証 CI パス化（既知違反20件の解消）                     |
| 由来       | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Phase 12（独立検証にて検出） |
| ステータス | completed                                                       |
| 優先度     | high                                                            |
| 分類       | bugfix / CI blocking                                            |
| 規模       | medium                                                          |
| 対応時期   | 対応済み（CI ブロッカー解消）                                   |
| 作成日     | 2026-04-14                                                      |
| 完了日     | 2026-04-15                                                      |
| 関連タスク | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001（検証スクリプト実装元）      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 で `scripts/verify-ipc-4layer.cjs` を実装し、`.github/workflows/ci.yml` に `verify-ipc-4layer` ジョブとして追加した。このジョブは `build` ジョブの `needs` に含まれているため、**失敗すると全ビルドがブロックされる**。

### 1.2 問題

このファイル作成当時（2026-04-14）、コードベースで `node scripts/verify-ipc-4layer.cjs` を実行すると exit code 1 で終了していた：

- **Rule-1** (shared → preload 未登録): **12件**
- **Rule-2** (preload → main 未実装): **8件**
- **Rule-3** (renderer → shared/preload 未定義): PASS

CI にマージすると即座に全 PR のビルドが失敗する。

**現状（2026-04-15）**:

- `node scripts/verify-ipc-4layer.cjs` は exit code 0
- Rule-1 / Rule-2 / Rule-3 はすべて PASS

### 1.3 Phase-12 判定との差異

UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 の Phase-12 `unassigned-task-detection.md` は「新規未タスク 0 件」と判定した。理由は「20件の不整合は既存 task family に紐づく」というもの。

独立検証により当時は以下の理由で未タスク化が必要と判断したが、現在は後述の修正により解消済み：

1. **CI がブロックされる**: `build` ジョブの `needs` に含まれており、マージ不可
2. **既存タスクに「CI パス化」の明示的スコープがない**: 個別チャネル修正タスクはあるが、CI 通過を目的としたタスクがない
3. **段階的修正が困難**: allowlist 機構がないため「既知違反は無視して新規違反のみ検出」ができない

---

## 2. 概要

`verify-ipc-4layer.cjs` の既知違反（当時 20 件）を解消し、CI が exit code 0 で通過する状態にする。

**実施した対応（完了）**:

- **Rule-1（12件）**: preload whitelist に不足チャネルを追加（`UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001`）
- **Rule-2（8件）**: main ハンドラ未実装チャネルを実装（`UT-FIX-IPC-MAIN-HANDLER-IMPL-001`）

実行確認（2026-04-15）:

```bash
node scripts/verify-ipc-4layer.cjs
```

結果: Rule-1 / Rule-2 / Rule-3 すべて PASS（exit code 0）

---

## 3. 以前の違反詳細（参考・解消済み）

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

## 4. 実施した修正（完了）

### 方針: 直接修正（allowlist は未採用）

当初は allowlist も検討したが、今回は既知違反を直接修正することで CI パス化を達成した。

実装の分割:

- `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001`: Rule-1（shared→preload）を解消
- `UT-FIX-IPC-MAIN-HANDLER-IMPL-001`: Rule-2（preload→main）を解消

---

## 5. 当時の論点（参考）

### 5.1 IPC 不整合の散在

20件の不整合が chat/fs/skill-creator/auth/settings/agent の6ドメインに散在している。各ドメインは独立した機能領域であり、修正には各ドメインのコンテキスト理解が必要。

### 5.2 既存タスクファミリーとの紐づけの複雑さ

completed-tasks に移動済みのタスクが実装したチャネルでも 4層整合が取れていない。完了済みタスクの修正はスコープ外と判断されがちだが、CI では検出される。

### 5.3 CI 通過と品質のトレードオフ

- allowlist で CI を通過させると、既知違反が放置されるリスク
- 直接修正は作業量が増えるが、4層整合性を正の状態に戻しやすい
- 今回は直接修正を採用して完了

### 5.4 CommonJS 形式の制約

`verify-ipc-4layer.cjs` は Node.js 標準のみ依存の CommonJS 形式。TypeScript の型安全性がないため、allowlist 機構追加時はランタイムバリデーションが必要。

---

## 6. 完了条件

- [x] `node scripts/verify-ipc-4layer.cjs` が exit code 0 で終了する
- [x] 既知違反（当時 20 件）は直接修正により解消済み
- [x] 新規違反が追加された場合は exit code 1 で検出可能（既存の検証仕様どおり）
- [x] 既存テストが全 PASS（件数は変動しうるため数は固定しない）
- [x] CI の `verify-ipc-4layer` ジョブが GREEN（前提: 同等の変更がマージされていること）

---

## 7. 対象ファイル

| ファイル                               | 変更内容                                      |
| -------------------------------------- | --------------------------------------------- |
| `scripts/verify-ipc-4layer.cjs`        | 検証スクリプト（Rule-1/2/3 の判定根拠）       |
| `apps/desktop/src/preload/channels.ts` | Rule-1 解消（shared 定義の whitelist 反映）   |
| `apps/desktop/src/main/ipc/*`          | Rule-2 解消（preload invoke の handler 実装） |

---

## 8. 関連タスク

| 関係 | タスクID                                    | 説明                      |
| ---- | ------------------------------------------- | ------------------------- |
| 前提 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001          | 検証スクリプト実装元      |
| 対応 | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001         | Rule-1 修正（preload 側） |
| 対応 | UT-FIX-IPC-MAIN-HANDLER-IMPL-001            | Rule-2 修正（main 側）    |
| 関連 | UT-IPC-EXECUTION-CHANNELS-PARITY-001        | 実行チャネル整合          |
| 関連 | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 | Skill Creator IPC 接続    |
| 関連 | TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION    | skill-creator:verify 実装 |

---

_このファイルは UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Phase-12 の独立検証により作成されました。_
_作成日: 2026-04-14_
