# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| Phase    | 10                                                  |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix   |
| 作成日   | 2026-03-17                                          |
| 前Phase  | [Phase 9: 品質保証](./phase-9-quality-assurance.md) |
| 後Phase  | [Phase 11: 手動テスト](./phase-11-manual-test.md)   |

## 目的

全体品質・整合性を最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、IPC契約整合性・セキュリティ・型安全性・アーキテクチャ・コード品質の5観点で確認する。

## 背景

IPCハンドラーはセキュリティ境界に位置するため、最終レビューでは通常の品質観点に加え、IPC契約の整合性を重点的に検証する。
本タスクで修正した2件の Critical 不整合（SKILL_UPDATE デッドチャンネル / SKILL_GET_DETAIL Preload API 未公開）が完全に解消されていることを確認する。

受入基準との照合:

| ID   | 受入基準                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------- |
| AC-1 | `skill:update` チャンネルに対する `ipcMain.handle()` が登録されている                          |
| AC-2 | `unregisterSkillHandlers()` に `skill:update` の `removeHandler` が含まれている                |
| AC-3 | skill-api.ts に `getDetail()` メソッドが追加され、`SKILL_GET_DETAIL` チャンネルを invoke する  |
| AC-4 | skill-api.ts に `update()` メソッドが追加され、`SKILL_UPDATE` チャンネルを invoke する         |
| AC-5 | 全引数に P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されている |
| AC-6 | IPC契約チェックリスト Phase 1-6 を実施済み                                                     |
| AC-7 | 既存テストが全て PASS                                                                          |
| AC-8 | packages/shared と apps/desktop のチャンネル定数が整合している                                 |

## 参照資料

| 資料名                | パス                                                                                                   | 説明                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| タスク仕様            | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix/index.md` | 受入基準・背景                               |
| セキュリティルール    | `.claude/rules/04-electron-security.md`                                                                | IPC セキュリティ原則                         |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                                                   | P42/P44/P45/P32/P5                           |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                          | Phase 1-6 チェックリスト                     |
| skillHandlers.ts      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                           | Main Process ハンドラー                      |
| skill-api.ts          | `apps/desktop/src/preload/skill-api.ts`                                                                | Preload API 実装                             |
| Phase 2 成果物        | `outputs/phase-2/design.md`                                                                            | Phase 2 で確定した設計・インターフェース定義 |
| Phase 5 成果物        | `outputs/phase-5/implementation-report.md`                                                             | Phase 5 で実装したコードの変更内容           |
| Phase 9 品質結果      | `outputs/phase-9/quality-gate-result.md`                                                               | 品質検証結果                                 |

## 実行タスク

### タスク 1: IPC 契約チェックリスト Phase 5-6 実施

**目的**: IPC契約の整合性を最終確認する（AC-6 対応）

> 参照: `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`

#### Phase 5: Preload → Main 呼び出し整合性確認

| 確認項目                                              | getDetail     | update                   |
| ----------------------------------------------------- | ------------- | ------------------------ |
| Preload の safeInvoke / safeInvokeUnwrap チャンネル名 | -             | -                        |
| Main の ipcMain.handle チャンネル名                   | -             | -                        |
| チャンネル名が一致する                                | -             | -                        |
| Preload が渡す引数の形                                | `{ skillId }` | `{ skillName, updates }` |
| Main ハンドラーが受け取る引数の形                     | `{ skillId }` | `{ skillName, updates }` |
| 引数型が一致する                                      | -             | -                        |
| 引数名のセマンティクスが一致する (P45)                | -             | -                        |

#### Phase 6: unregister 完全性確認

| 確認項目                                                 | 結果 |
| -------------------------------------------------------- | ---- |
| `ipcMain.handle("skill:update", ...)` が登録されている   | -    |
| `ipcMain.removeHandler("skill:update")` が登録されている | -    |
| SKILL_GET_DETAIL の既存 removeHandler が存在する         | -    |
| 二重登録リスクがない (P5)                                | -    |

**確認コマンド**:

```bash
# ハンドラー登録・解除の確認
grep -n "ipcMain.handle\|removeHandler\|SKILL_UPDATE\|SKILL_GET_DETAIL" \
  apps/desktop/src/main/ipc/skillHandlers.ts

# P45 命名確認（update では skillName が使われているか）
grep -n "skillName" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts

# P42 3段バリデーション確認
grep -n "trim\(\)" \
  apps/desktop/src/main/ipc/skillHandlers.ts | grep -i "update\|getDetail"
```

**期待される成果物**:

- `outputs/phase-10/ipc-contract-review.md`

---

### タスク 2: 受入基準照合

**目的**: index.md に記載された受入基準 AC-1〜AC-8 の全達成を確認する

**実行手順**:

1. 各受入基準に対してコードベースを確認する
2. 達成状況を記録する
3. 未達成の場合は対応方針を決定する

**受入基準チェックリスト**:

| ID   | 受入基準                                                                 | 確認方法                                                   | 結果 |
| ---- | ------------------------------------------------------------------------ | ---------------------------------------------------------- | ---- |
| AC-1 | `skill:update` に `ipcMain.handle()` が登録されている                    | skillHandlers.ts を grep                                   | -    |
| AC-2 | `unregisterSkillHandlers()` に `skill:update` の removeHandler がある    | skillHandlers.ts を grep                                   | -    |
| AC-3 | skill-api.ts に `getDetail()` が追加され SKILL_GET_DETAIL を invoke する | skill-api.ts を読む                                        | -    |
| AC-4 | skill-api.ts に `update()` が追加され SKILL_UPDATE を invoke する        | skill-api.ts を読む                                        | -    |
| AC-5 | 全引数に P42 準拠3段バリデーションが適用されている                       | skillHandlers.ts の SKILL_UPDATE / SKILL_GET_DETAIL を確認 | -    |
| AC-6 | IPC契約チェックリスト Phase 1-6 を実施済み                               | タスク 1 の結果を参照                                      | -    |
| AC-7 | 既存テストが全て PASS                                                    | Phase 9 テスト結果を参照                                   | -    |
| AC-8 | packages/shared と apps/desktop のチャンネル定数が整合している           | channels.ts 2ファイルを比較                                | -    |

**期待される成果物**:

- `outputs/phase-10/acceptance-criteria-check.md`

---

### タスク 3: アーキテクチャ整合性レビュー

**目的**: IPC 層のアーキテクチャが正しく構成されていることを確認する

**確認コマンド**:

```bash
# ALLOWED_INVOKE_CHANNELS に SKILL_UPDATE が含まれているか確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" \
  apps/desktop/src/preload/channels.ts

# P32 準拠: 共有チャンネル定数との整合確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" \
  packages/shared/src/ipc/channels.ts

# レイヤー依存方向の確認（Renderer が直接 Node.js を呼んでいないか）
grep -rn "ipcMain\|ipcRenderer" apps/desktop/src/renderer/
```

**アーキテクチャチェックリスト**:

| チェック項目             | 確認内容                                                            | 結果 |
| ------------------------ | ------------------------------------------------------------------- | ---- |
| ホワイトリスト登録       | `ALLOWED_INVOKE_CHANNELS` に SKILL_UPDATE が登録されている          | -    |
| ハンドラー登録           | `registerSkillHandlers()` に SKILL_UPDATE ハンドラが含まれる        | -    |
| ハンドラー解除           | `unregisterSkillHandlers()` に SKILL_UPDATE の removeHandler がある | -    |
| チャンネル定数整合 (P32) | `packages/shared` と `apps/desktop/src/preload` の値が一致する      | -    |
| レイヤー依存方向         | Renderer → Preload → Main の一方向依存が守られている                | -    |
| contextBridge 経由       | getDetail / update が contextBridge 経由で公開されている            | -    |

**期待される成果物**:

- `outputs/phase-10/architecture-review.md`

---

### タスク 4: 型安全性レビュー

**目的**: Preload 型定義と Main ハンドラーの型が完全に整合していることを確認する

**型整合性マトリクス**:

| メソッド    | Preload 引数型                                            | Main 引数型                                               | Preload 戻り値型 | Main 戻り値型 | 整合 |
| ----------- | --------------------------------------------------------- | --------------------------------------------------------- | ---------------- | ------------- | ---- |
| `getDetail` | `skillId: string`                                         | `{ skillId: string }`                                     | `Skill`          | `Skill`       | -    |
| `update`    | `{ skillName: string, updates: Record<string, unknown> }` | `{ skillName: string, updates: Record<string, unknown> }` | `void`           | `void`        | -    |

**P32 チェック（型定義の二箇所同時更新）**:

| ファイル                                | 更新状況 |
| --------------------------------------- | -------- |
| `packages/shared/src/ipc/channels.ts`   | -        |
| `apps/desktop/src/preload/channels.ts`  | -        |
| `apps/desktop/src/preload/skill-api.ts` | -        |

**期待される成果物**:

- `outputs/phase-10/type-safety-review.md`

---

### タスク 5: 最終判定

**目的**: 最終レビュー結果を判定する

**判定基準**:

| 判定     | 条件                                     | 次のアクション                                      |
| -------- | ---------------------------------------- | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                 | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（IPC契約・機能影響）      | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（セキュリティリスク等） | Phase 1 へ戻り要件再確認                            |

**MINOR 判定時の未タスク化手順**:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow-completed-ipc-contract-preload-alignment.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**戻り先決定基準**:

| 問題の種類                        | 戻り先                |
| --------------------------------- | --------------------- |
| IPC 契約不整合（Critical 未解消） | Phase 2（設計）       |
| バリデーション漏れ                | Phase 5（実装）       |
| テスト設計の不足                  | Phase 4（テスト作成） |
| コード品質の問題                  | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| レビュー観点        | 結果 | 指摘事項 |
| ------------------- | ---- | -------- |
| IPC 契約整合性      | -    | -        |
| 受入基準 AC-1〜AC-8 | -    | -        |
| アーキテクチャ      | -    | -        |
| 型安全性            | -    | -        |
| **最終判定**        | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                 | パス                                            | 内容                   |
| ---------------------- | ----------------------------------------------- | ---------------------- |
| IPC 契約レビュー       | `outputs/phase-10/ipc-contract-review.md`       | Phase 5-6 チェック結果 |
| 受入基準照合           | `outputs/phase-10/acceptance-criteria-check.md` | AC-1〜AC-8 達成確認    |
| アーキテクチャレビュー | `outputs/phase-10/architecture-review.md`       | 構成検証結果           |
| 型安全性レビュー       | `outputs/phase-10/type-safety-review.md`        | 型整合性確認結果       |
| 最終判定               | `outputs/phase-10/final-review-result.md`       | 判定結果               |

## 完了条件

- [ ] IPC 契約チェックリスト Phase 5-6 を実施済み
- [ ] 受入基準 AC-1〜AC-8 が全て達成されている
- [ ] アーキテクチャレビューでホワイトリスト・登録/解除が正しい
- [ ] 型安全性レビューで型不整合がない
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR 判定の場合は未タスク仕様書が作成されている

## タスク100%実行確認【必須】

- [ ] **本Phase内の全タスクを100%実行完了**
- [ ] 各タスクの成果物（5ファイル）が生成されている
- [ ] 判定結果が PASS/MINOR であることを確認済み

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 10
```

## 次Phase

Phase 11: 手動テスト（[phase-11-manual-test.md](./phase-11-manual-test.md)）
