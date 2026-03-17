# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                                    |
| -------- | ----------------------------------------------------- |
| Phase    | 9                                                     |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                  |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix     |
| 作成日   | 2026-03-17                                            |
| 前Phase  | [Phase 8: リファクタリング](./phase-8-refactoring.md) |
| 後Phase  | [Phase 10: 最終レビュー](./phase-10-final-review.md)  |

## 目的

静的解析・型チェック・セキュリティ検証・テスト実行の4観点からコード品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

IPCハンドラーはセキュリティ境界に位置するため、通常の品質検証に加えてセキュリティ固有の検証が必須である。
本タスクでは以下を重点的に検証する:

- SKILL_UPDATE ハンドラの登録・unregister が正しいこと
- SKILL_GET_DETAIL / SKILL_UPDATE Preload API が contextBridge 経由で公開されていること
- P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全引数に適用されていること
- P45 準拠の命名統一（skillId ではなく skillName）が徹底されていること

## 参照資料

| 資料名             | パス                                         | 説明                     |
| ------------------ | -------------------------------------------- | ------------------------ |
| コード品質ルール   | `.claude/rules/02-code-quality.md`           | カバレッジ基準・型安全   |
| セキュリティルール | `.claude/rules/04-electron-security.md`      | IPC セキュリティ原則     |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`         | P42/P45/P32/P5 の詳細    |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts` | Main Process ハンドラー  |
| skill-api.ts       | `apps/desktop/src/preload/skill-api.ts`      | Preload API 実装         |
| channels.ts        | `apps/desktop/src/preload/channels.ts`       | チャンネルホワイトリスト |
| shared channels    | `packages/shared/src/ipc/channels.ts`        | 共有チャンネル定数       |

## 実行タスク

### タスク 1: Lint 検証

**目的**: ESLint ルールへの準拠を確認する

**実行手順**:

1. ESLint を実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行して確認する

**コマンド**:

```bash
# desktop パッケージの Lint 実行
pnpm --filter @repo/desktop lint

# 自動修正
pnpm --filter @repo/desktop lint --fix

# shared パッケージも確認
pnpm --filter @repo/shared lint
```

**検証対象ファイル**:

| ファイル                                     | 確認項目                                          |
| -------------------------------------------- | ------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | SKILL_UPDATE ハンドラ追加部分の Lint クリア       |
| `apps/desktop/src/preload/skill-api.ts`      | getDetail / update メソッド追加部分の Lint クリア |
| `apps/desktop/src/preload/channels.ts`       | ホワイトリスト確認部分の Lint クリア              |
| `packages/shared/src/ipc/channels.ts`        | 共有チャンネル定数の Lint クリア                  |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク 2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認する

**実行手順**:

1. TypeScript コンパイラを実行する
2. 型エラーを確認する
3. Preload 型定義と Main ハンドラー引数型の整合を確認する
4. P32 準拠で2箇所（`packages/shared` と `apps/desktop/src/preload`）が同期していることを確認する

**コマンド**:

```bash
# desktop パッケージ型チェック
pnpm --filter @repo/desktop typecheck

# shared パッケージ型チェック
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                    | 確認内容                                                                   |
| ------------------------------- | -------------------------------------------------------------------------- |
| getDetail の引数型              | `skillId: string` が Main ハンドラーと一致する                             |
| getDetail の戻り値型            | `Skill \| null`（または `unknown`）が Main ハンドラーの戻り値と一致する    |
| update の引数型                 | `skillName: string, updates: Record<string, unknown>` が Main と一致する   |
| update の戻り値型               | `void` または `Promise<void>` が Main ハンドラーと一致する                 |
| SKILL_GET_DETAIL チャンネル定数 | `packages/shared` と `apps/desktop/src/preload/channels.ts` の値が一致する |
| SKILL_UPDATE チャンネル定数     | `packages/shared` と `apps/desktop/src/preload/channels.ts` の値が一致する |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク 3: セキュリティ検証（IPC引数バリデーション完全性）

**目的**: IPCハンドラーのセキュリティ要件が全て満たされていることを確認する

**実行手順**:

1. SKILL_UPDATE ハンドラで P42 準拠の3段バリデーションが実施されていることを確認する
2. SKILL_GET_DETAIL ハンドラで3段バリデーションが実施されていることを確認する
3. P45 準拠で引数名が `skillName`（`skillId` ではない）であることを確認する
4. `unregisterSkillHandlers()` に `skill:update` の `ipcMain.removeHandler()` が含まれていることを確認する
5. チャンネル名がハードコード文字列ではなく `IPC_CHANNELS` 定数で参照されていることを確認する

**P42 バリデーション確認コマンド**:

```bash
# SKILL_UPDATE ハンドラの3段バリデーションを確認
grep -n "trim\|typeof\|VALIDATION_ERROR" apps/desktop/src/main/ipc/skillHandlers.ts \
  | grep -A3 -B3 "skill:update\|SKILL_UPDATE"

# スペースのみ入力テストが含まれているか確認
grep -rn '\"   \"\|trim.*===.*\"\"\|空白' \
  apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts
```

**P45 命名確認コマンド**:

```bash
# skillId という命名が残っていないか確認（命名統一検証）
grep -n "skillId" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts
```

**ハードコード文字列検出コマンド**:

```bash
# safeInvoke でハードコード文字列が使われていないか確認
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**unregister 確認コマンド**:

```bash
# skill:update の removeHandler が登録されているか確認
grep -n "removeHandler\|unregister" apps/desktop/src/main/ipc/skillHandlers.ts \
  | grep -i "update"
```

**セキュリティチェックリスト**:

| チャンネル        | 3段バリデーション(P42) | 命名統一(P45) | IPC_CHANNELS 定数参照 | unregister 登録 |
| ----------------- | ---------------------- | ------------- | --------------------- | --------------- |
| `skill:update`    | -                      | -             | -                     | -               |
| `skill:getDetail` | -                      | -             | -                     | -               |

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク 4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. SKILL_UPDATE ハンドラのテストを実行する
2. SKILL_GET_DETAIL / update Preload API のテストを実行する
3. カバレッジレポートを確認する
4. カバレッジ基準との照合を行う
5. 基準未達の場合は Phase 6 に戻る

**コマンド**:

```bash
# SKILL_UPDATE ハンドラのテスト実行
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  --reporter=verbose

# Preload API（getDetail / update）のテスト実行
cd apps/desktop && pnpm vitest run \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  --reporter=verbose

# カバレッジ付きで実行
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  --coverage --reporter=verbose
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク 5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク 1〜4 の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] SKILL_UPDATE ハンドラの全テストが PASS
- [ ] getDetail / update Preload API の全テストが PASS
- [ ] 既存テスト（skillHandlers 全体）が引き続き PASS

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ（IPC引数バリデーション完全性）

- [ ] SKILL_UPDATE ハンドラで P42 準拠の3段バリデーション実施確認済み
- [ ] SKILL_GET_DETAIL ハンドラで P42 準拠の3段バリデーション実施確認済み
- [ ] P45 準拠の命名統一（skillName）確認済み
- [ ] `unregisterSkillHandlers()` に `skill:update` の removeHandler が含まれる確認済み
- [ ] ハードコード文字列なし（IPC_CHANNELS 定数参照）確認済み

#### 判定結果

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lint レポート        | `outputs/phase-9/lint-report.md`          | Lint 結果        |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定         |

## 完了条件

- [ ] Lint エラーがない
- [ ] 型エラーがない
- [ ] セキュリティレビューが完了している（P42/P45/unregister/ハードコード文字列 全確認済み）
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲートの全項目をパスしている

## タスク100%実行確認【必須】

- [ ] **本Phase内の全タスクを100%実行完了**
- [ ] 各タスクの成果物（5ファイル）が生成されている
- [ ] 品質ゲート全項目 PASS を確認済み

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 9
```

## 次Phase

Phase 10: 最終レビュー（[phase-10-final-review.md](./phase-10-final-review.md)）
