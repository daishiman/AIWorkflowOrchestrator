# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                                    |
| -------- | ----------------------------------------------------- |
| Phase    | 11                                                    |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                  |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix     |
| 作成日   | 2026-03-17                                            |
| 前Phase  | [Phase 10: 最終レビュー](./phase-10-final-review.md)  |
| 後Phase  | [Phase 12: ドキュメント](./phase-12-documentation.md) |

## 目的

Electron 実環境およびユニットテスト結果を用いて、SKILL_UPDATE ハンドラと SKILL_GET_DETAIL / SKILL_UPDATE Preload API の動作を検証する。
DevTools コンソールから実際の IPC 呼び出しを行い、応答を確認する。

## 背景

IPC タスクであるため、Main Process と Renderer Process の境界における実際のプロセス間通信の動作を確認する必要がある。
ユニットテストでは検証できない実環境固有の動作（contextBridge 経由の呼び出し、エラーサニタイズの実際の出力等）を確認する。

### 制限事項（P53 対策）

- CLI 環境ではスクリーンショット取得が困難な場合がある
- その場合は DevTools コンソールの出力をテキストで記録し、代替とする
- 代替判断は実施時に決定し、`outputs/phase-11/manual-test-result.md` に理由を記録する

### 検証方法

| 方法                            | 対象                              | 優先度 |
| ------------------------------- | --------------------------------- | ------ |
| DevTools コンソール直接呼び出し | getDetail / update の各チャンネル | 高     |
| ユニットテスト結果の確認        | 全テストケース                    | 高     |
| コードリーディング              | バリデーション・エラー処理の確認  | 中     |

## 参照資料

| 参照資料              | パス                                                                                   | 用途                          |
| --------------------- | -------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 10 最終レビュー | `phase-10-final-review.md`                                                             | 手動検証対象の確定            |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`          | IPC契約観点の監査             |
| Security IPC 仕様     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`           | エラーサニタイズ/公開面の確認 |
| 実装コード            | `apps/desktop/src/main/ipc/skillHandlers.ts` / `apps/desktop/src/preload/skill-api.ts` | 検証対象の実体確認            |

## 実行タスク

### タスク 1: 自動テストの実行確認

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**コマンド**:

```bash
# SKILL_UPDATE ハンドラテスト
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  --reporter=verbose

# Preload API（getDetail / update）テスト
cd apps/desktop && pnpm vitest run \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  --reporter=verbose

# 全 skillHandlers テストが引き続き PASS することを確認
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers \
  --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク 2: IPC/API タスク — DevTools での応答確認

**目的**: 実 Electron 環境で getDetail / update チャンネルの応答を確認する

**テストケーステーブル**:

| TC-ID  | チャンネル      | 操作内容                                                                           | 前提条件              | 期待結果                                  |
| ------ | --------------- | ---------------------------------------------------------------------------------- | --------------------- | ----------------------------------------- |
| TC-001 | skill:getDetail | `window.electronAPI.skill.getDetail("test-skill")` を実行                          | test-skill が存在する | スキル詳細オブジェクトが返る              |
| TC-002 | skill:getDetail | 存在しないスキルID: `getDetail("nonexistent-skill")` を実行                        | スキルが存在しない    | `null` が返る                             |
| TC-003 | skill:getDetail | 空文字列引数: `getDetail("")` を実行                                               | 任意                  | VALIDATION_ERROR が返る                   |
| TC-004 | skill:getDetail | スペースのみ引数: `getDetail("   ")` を実行（P42 テスト）                          | 任意                  | VALIDATION_ERROR が返る（スペースを拒否） |
| TC-005 | skill:update    | `window.electronAPI.skill.update("test-skill", { description: "updated" })` を実行 | test-skill が存在する | 更新が成功する                            |
| TC-006 | skill:update    | 空文字列スキル名: `update("", { description: "x" })` を実行                        | 任意                  | VALIDATION_ERROR が返る                   |
| TC-007 | skill:update    | スペースのみスキル名: `update("   ", { description: "x" })` を実行（P42 テスト）   | 任意                  | VALIDATION_ERROR が返る（スペースを拒否） |
| TC-008 | skill:update    | updates が null: `update("test-skill", null)` を実行                               | 任意                  | VALIDATION_ERROR が返る                   |

**実行手順（TC-001）**:

1. Electron アプリを起動する
2. DevTools（Cmd+Option+I）を開く
3. Console タブで以下を実行する:
   ```javascript
   await window.electronAPI.skill.getDetail("test-skill");
   ```
4. レスポンスがスキル詳細オブジェクト（`name`, `description` 等を含むオブジェクト）であることを確認する

**実行手順（TC-004 / TC-007 — P42 テスト）**:

```javascript
// スペースのみ引数でバリデーションが発動することを確認（P42準拠テスト）
await window.electronAPI.skill.getDetail("   ");
// 期待: { code: "VALIDATION_ERROR", ... } または例外

await window.electronAPI.skill.update("   ", { description: "x" });
// 期待: { code: "VALIDATION_ERROR", ... } または例外
```

**スクリーンショット推奨**:

- TC-001 の正常応答
- TC-004 の VALIDATION_ERROR 応答（P42 動作確認）
- TC-007 の VALIDATION_ERROR 応答（P42 動作確認）

> P53 対策: スクリーンショットが取得できない場合は、DevTools コンソールの出力テキストをコピーして記録する

**期待される成果物**:

- `outputs/phase-11/devtools-test-result.md`

---

### タスク 3: エラーハンドリング確認

**目的**: エラーレスポンスがサニタイズされており、内部情報が漏洩しないことを確認する

**テストケーステーブル**:

| TC-ID  | 操作内容                                                                 | 確認項目                                  |
| ------ | ------------------------------------------------------------------------ | ----------------------------------------- |
| TC-009 | 存在しないスキルへの update を実行する                                   | エラーメッセージに内部パスが含まれない    |
| TC-010 | 不正な updates オブジェクト（配列等）を渡す                              | VALIDATION_ERROR が返り内部情報が漏れない |
| TC-011 | `window.electronAPI.skill.getDetail` が `undefined` でないことを確認する | contextBridge 経由で公開されている        |
| TC-012 | `window.electronAPI.skill.update` が `undefined` でないことを確認する    | contextBridge 経由で公開されている        |

**DevTools 確認コマンド**:

```javascript
// TC-011: getDetail が公開されているか確認
typeof window.electronAPI.skill.getDetail; // "function" であること

// TC-012: update が公開されているか確認
typeof window.electronAPI.skill.update; // "function" であること

// TC-009: エラーサニタイズ確認
try {
  await window.electronAPI.skill.update("nonexistent-skill-xyz", { x: 1 });
} catch (e) {
  console.log(e); // パス情報が含まれないか確認
}
```

**期待される成果物**:

- `outputs/phase-11/error-handling-result.md`

---

### タスク 4: 発見課題の記録

**目的**: テスト中に発見した課題を記録する

**実行手順**:

1. タスク 1〜3 で発見した問題を記録する
2. 問題の重要度を分類する
3. 対応方針を決定する

**課題分類**:

| 重要度   | 基準                       | 対応             |
| -------- | -------------------------- | ---------------- |
| 致命的   | 機能が使用できない         | 即時修正         |
| 重大     | 一部機能に影響             | 本フェーズで修正 |
| 軽微     | 使用に支障なし             | Phase 12 で記録  |
| 改善提案 | より良くするためのアイデア | Phase 12 で記録  |

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                 | パス                                        | 内容                                       |
| ---------------------- | ------------------------------------------- | ------------------------------------------ |
| 自動テスト結果         | `outputs/phase-11/auto-test-result.md`      | テスト実行結果                             |
| DevTools テスト結果    | `outputs/phase-11/devtools-test-result.md`  | IPC/API 応答確認（スクリーンショット含む） |
| エラーハンドリング結果 | `outputs/phase-11/error-handling-result.md` | エラーサニタイズ・公開確認                 |
| 発見課題               | `outputs/phase-11/discovered-issues.md`     | 課題一覧（0件でも記録必須）                |

## 完了条件

- [ ] 自動テストが全てパスしている
- [ ] DevTools でのテスト TC-001〜TC-008 が全て確認済み
- [ ] P42 テスト（TC-004, TC-007）でスペースのみ入力が拒否されることを確認済み
- [ ] getDetail / update が `window.electronAPI.skill` 経由で公開されていることを確認済み（TC-011, TC-012）
- [ ] エラーレスポンスに内部パス情報が含まれないことを確認済み（TC-009, TC-010）
- [ ] 発見課題が記録されている（0件でも記録必須）

## タスク100%実行確認【必須】

- [ ] **本Phase内の全タスクを100%実行完了**
- [ ] 各タスクの成果物（4ファイル）が生成されている

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 11
```

## 次Phase

Phase 12: ドキュメント（[phase-12-documentation.md](./phase-12-documentation.md)）
