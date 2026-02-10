# TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT - タスク指示書

## メタ情報

```yaml
issue_number: 757
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT |
| タスク名     | Updater/AgentHandler の IPC チャネル名定数化 |
| 分類         | リファクタリング / セキュリティ              |
| 対象機能     | Electron IPC 通信                            |
| 優先度       | 中（セキュリティ原則準拠）                   |
| 見積もり規模 | 小規模（1-2時間）                            |
| ステータス   | 未実施                                       |
| 発見元       | TASK-FIX-12-1-IPC-HARDCODE-FIX Phase 12      |
| 発見日       | 2026-02-09                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-12-1 で SkillExecutor.ts の IPC チャネル名ハードコード問題を修正した際、同様のパターンが他のファイル（updater.ts、agent-handler.ts）にも存在することが判明した。

### 1.2 問題点・課題

| ファイル                                       | ハードコード箇所数 | 対象チャンネル                                                                                                                                       |
| ---------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/updater.ts`             | 5箇所              | `"updater:check"`, `"updater:download"`, `"updater:install"`, `"updater:get-version"`, `"updater:status"`                                            |
| `apps/desktop/src/main/agent/agent-handler.ts` | 7箇所              | `"agent:query"`, `"agent:getStatus"`, `"agent:createSession"`, `"agent:resumeSession"`, `"agent:destroySession"`, `"agent:abort"`, `"agent:message"` |

### 1.2.1 重大: チャネル名不整合問題（UT-FIX-5-3検証で発見）

| 層      | ファイル               | チャネル名                             | 備考           |
| ------- | ---------------------- | -------------------------------------- | -------------- |
| Preload | `channels.ts:142`      | `AGENT_GET_STATUS: "agent:get-status"` | ケバブケース   |
| Main    | `agent-handler.ts:161` | `"agent:getStatus"`                    | キャメルケース |

**影響**: `agentSDKAPI.getStatus()` のIPC通信が成立しない（Main側ハンドラに到達しない）

**対応**: 本タスクでチャネル名定数化と同時に命名を統一する

### 1.3 放置した場合の影響

1. **セキュリティ原則違反**: `.claude/rules/04-electron-security.md` の「ハードコード文字列でチャンネル名を指定しない」ルールに違反したまま
2. **保守性低下**: チャンネル名変更時に複数ファイルを手動で修正する必要がある
3. **タイポリスク**: 文字列リテラルの誤記がコンパイル時に検出されない

---

## 2. 何を達成するか（What）

### 2.1 目的

Updater と AgentHandler のすべての IPC チャンネル名を定数参照に変更し、セキュリティ原則に準拠させる。

### 2.2 最終ゴール

- `updater.ts` の5箇所のハードコードが `UPDATER_CHANNELS.*` 定数参照に変更されている
- `agent-handler.ts` の7箇所のハードコードが `AGENT_CHANNELS.*` 定数参照に変更されている
- 既存のテストがすべて PASS する

### 2.3 スコープ

**含むもの**:

- `packages/shared/src/ipc/channels.ts` への定数追加
- `updater.ts` のハードコード置換
- `agent-handler.ts` のハードコード置換
- テスト動作確認

**含まないもの**:

- 他のファイルのハードコード修正（別タスクで対応）
- テストコードのリファクタリング
- ホワイトリスト更新（既に登録済みの場合）

### 2.4 成果物

| 成果物           | パス                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| 定数定義         | `packages/shared/src/ipc/channels.ts`                                          |
| 修正済みファイル | `apps/desktop/src/main/updater.ts`                                             |
| 修正済みファイル | `apps/desktop/src/main/agent/agent-handler.ts`                                 |
| 実装ガイド       | `docs/30-workflows/task-fix-12-2-.../outputs/phase-12/implementation-guide.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-12-1 が完了していること（参考パターンとして利用可能）
- `@repo/shared` がビルド可能な状態であること

### 3.2 依存タスク

| タスクID                       | 関係 | 状況 |
| ------------------------------ | ---- | ---- |
| TASK-FIX-12-1-IPC-HARDCODE-FIX | 参考 | 完了 |
| TASK-FIX-4-1-IPC-CONSOLIDATION | 先行 | 完了 |

### 3.3 必要な知識

| 知識領域                  | 参照先                                               |
| ------------------------- | ---------------------------------------------------- |
| IPC セキュリティ原則      | `.claude/rules/04-electron-security.md`              |
| IPC チャンネル設計        | `references/security-skill-ipc.md`                   |
| 実装パターン              | `references/architecture-implementation-patterns.md` |
| 苦戦箇所（TASK-FIX-12-1） | `references/patterns.md#ipc--electron`               |

### 3.4 システム仕様書参照

| 観点           | 参照先                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------- |
| IPC設計        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       |
| セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 3.5 実装課題と解決策（TASK-FIX-12-1 からの学び）

| 課題                            | 解決策                                                                    |
| ------------------------------- | ------------------------------------------------------------------------- |
| ハードコード箇所の検出漏れ      | `grep -rn '"updater:\|"agent:' apps/desktop/src/main/` で全箇所を事前検出 |
| 定数定義の重複リスク            | `@repo/shared/src/ipc/channels.ts` を正本として一元管理                   |
| ホワイトリスト更新漏れ          | 新規チャンネル追加時は `ALLOWED_INVOKE_CHANNELS` も更新                   |
| テスト間状態リーク              | `mockReturnValueOnce()` 使用 + `beforeEach` でリセット                    |
| Phase 12 ドキュメント同期漏れ   | 05-task-execution.md チェックリストを機械的に消化                         |
| SKILL.md 変更履歴更新漏れ (P23) | LOGS.md 更新時に SKILL.md 変更履歴も必ず更新                              |
| 関連ファイル調査不足 (P24)      | 修正パターン検出後、`grep` で全ファイル横断検索を実施                     |

### 3.6 推奨アプローチ

```
Phase 1: 要件定義
  ↓
Phase 2: 設計（定数構造決定）
  ↓
Phase 3: 設計レビュー
  ↓
Phase 4: テスト作成
  ↓
Phase 5: 実装（定数追加 → ハードコード置換）
  ↓
Phase 6-7: テスト拡充・カバレッジ確認
  ↓
Phase 8-9: リファクタリング・品質保証
  ↓
Phase 10: 最終レビュー
  ↓
Phase 11: 手動テスト
  ↓
Phase 12: ドキュメント更新
  ↓
Phase 13: PR作成
```

---

## 4. 実行手順

### Phase 1: 要件定義

**目的**: ハードコード箇所の完全な特定と変更スコープの確定

**手順**:

1. `grep -rn '"updater:' apps/desktop/src/main/` でハードコード箇所を列挙
2. `grep -rn '"agent:' apps/desktop/src/main/` でハードコード箇所を列挙
3. 各チャンネルの用途（handle/on/send）を整理

**成果物**: `outputs/phase-1/requirements.md`

**完了条件**:

- [ ] ハードコード箇所の一覧が作成されている
- [ ] 各チャンネルの用途が明記されている

### Phase 2: 設計

**目的**: 定数構造と変更方針の決定

**手順**:

1. `UPDATER_CHANNELS` と `AGENT_CHANNELS` の型定義を設計
2. 既存の `SKILL_CHANNELS` パターンに準拠した構造を採用

**成果物**: `outputs/phase-2/design.md`

**完了条件**:

- [ ] 定数構造が設計されている
- [ ] 既存パターンとの整合性が確認されている

### Phase 5: 実装

**目的**: 定数追加とハードコード置換

**手順**:

1. `packages/shared/src/ipc/channels.ts` に定数追加:

   ```typescript
   export const UPDATER_CHANNELS = {
     CHECK: "updater:check",
     DOWNLOAD: "updater:download",
     INSTALL: "updater:install",
     GET_VERSION: "updater:get-version",
     STATUS: "updater:status",
   } as const;

   export const AGENT_CHANNELS = {
     QUERY: "agent:query",
     GET_STATUS: "agent:getStatus",
     CREATE_SESSION: "agent:createSession",
     RESUME_SESSION: "agent:resumeSession",
     DESTROY_SESSION: "agent:destroySession",
     ABORT: "agent:abort",
     MESSAGE: "agent:message",
   } as const;
   ```

2. `updater.ts` のハードコードを定数参照に置換
3. `agent-handler.ts` のハードコードを定数参照に置換
4. `pnpm --filter @repo/shared build` を実行

**成果物**: 修正済みファイル

**完了条件**:

- [ ] 定数が追加されている
- [ ] ハードコードが定数参照に変更されている
- [ ] ビルドが成功する

### Phase 12: ドキュメント更新

**目的**: 実装内容のドキュメント化

**手順**:

1. 実装ガイド作成（Part 1: 中学生レベル / Part 2: 技術者向け）
2. システム仕様書更新:
   - `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` に UPDATER_CHANNELS/AGENT_CHANNELS 追加
   - LOGS.md × 2 ファイル更新
   - SKILL.md 変更履歴更新（P23 防止）
   - topic-map.md 再生成
3. documentation-changelog.md 作成
4. 未タスク検出レポート作成

**成果物**: `outputs/phase-12/` 配下

**完了条件**:

- [ ] 実装ガイド Part 1/Part 2 が作成されている
- [ ] LOGS.md が 2 ファイル両方更新されている
- [ ] SKILL.md 変更履歴が更新されている
- [ ] topic-map.md が再生成されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `updater.ts` のハードコード 5 箇所が定数参照に変更されている
- [ ] `agent-handler.ts` のハードコード 7 箇所が定数参照に変更されている
- [ ] `packages/shared/src/ipc/channels.ts` に定数が追加されている

### 品質要件

- [ ] 既存テストがすべて PASS する
- [ ] 型チェック（`pnpm typecheck`）が PASS する
- [ ] Lint チェック（`pnpm lint`）が PASS する

### ドキュメント要件

- [ ] 実装ガイドが作成されている
- [ ] LOGS.md × 2 ファイルが更新されている
- [ ] SKILL.md 変更履歴が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID  | 検証項目                                  | 期待結果                  |
| ------ | ----------------------------------------- | ------------------------- |
| TC-001 | updater.ts でハードコードがないこと       | grep で 0 件              |
| TC-002 | agent-handler.ts でハードコードがないこと | grep で 0 件              |
| TC-003 | 定数が正しくエクスポートされている        | import 成功、型エラーなし |
| TC-004 | 既存テストが PASS する                    | 全テスト PASS             |

### 検証手順

```bash
# ハードコード残存確認
grep -rn '"updater:' apps/desktop/src/main/updater.ts
grep -rn '"agent:' apps/desktop/src/main/agent/agent-handler.ts

# ビルド確認
pnpm --filter @repo/shared build

# テスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm typecheck
```

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                            |
| ----------------------------- | ------ | -------- | ----------------------------------------------- |
| 定数名の命名不整合            | 中     | 低       | 既存 SKILL_CHANNELS パターンに準拠              |
| ホワイトリスト更新漏れ        | 高     | 中       | 新規チャンネル追加時にチェックリスト確認        |
| テスト間状態リーク            | 中     | 中       | mockReturnValueOnce + beforeEach リセット       |
| Phase 12 ドキュメント同期漏れ | 中     | 高       | 05-task-execution.md チェックリストを機械的消化 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                         | 用途                           |
| ---------------------------------------------------- | ------------------------------ |
| `.claude/rules/04-electron-security.md`              | IPC セキュリティ原則           |
| `.claude/rules/06-known-pitfalls.md`                 | P23, P24 の教訓                |
| `references/patterns.md`                             | IPC チャンネル名定数化パターン |
| `references/architecture-implementation-patterns.md` | 実装パターン                   |

### 参考資料

| 資料                                        | 用途               |
| ------------------------------------------- | ------------------ |
| TASK-FIX-12-1-IPC-HARDCODE-FIX 実装ガイド   | 類似タスクの実装例 |
| TASK-FIX-4-1-IPC-CONSOLIDATION ワークフロー | IPC 統合パターン   |

---

## 9. 備考

### TASK-FIX-12-1 での苦戦箇所（実装者への注意）

1. **SKILL.md 変更履歴更新漏れ (P23)**: LOGS.md を更新しただけで完了と誤認しやすい。SKILL.md の変更履歴テーブルも必ず更新すること。

2. **関連ファイル調査不足 (P24)**: 修正対象ファイルだけでなく、同様のパターンを持つ他ファイルも `grep` で横断検索すること。

3. **未タスク配置ディレクトリの誤り**: 未タスク仕様書は常に `docs/30-workflows/unassigned-task/` に配置する。個別タスクディレクトリ配下には配置しない。

4. **Phase 12 全 Step 確認前の早期完了記載**: documentation-changelog.md に「完了」と記載する前に、Step 1-A〜1-D + Step 2 のすべてを確認すること。

### 変更履歴

| 日付       | 変更内容                                   |
| ---------- | ------------------------------------------ |
| 2026-02-09 | 初版作成                                   |
| 2026-02-09 | テンプレート準拠化、苦戦箇所セクション追加 |
