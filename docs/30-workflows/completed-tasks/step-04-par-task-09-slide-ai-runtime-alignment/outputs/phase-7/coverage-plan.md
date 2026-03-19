# Phase 7 カバレッジ計画

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 7 - カバレッジ確認                      |
| 作成日   | 2026-03-19                              |

## 概要

Phase 5 実装 + Phase 6 回帰テスト追加後のカバレッジ目標と計測方法を定義する。
カバレッジ基準は `02-code-quality.md` に準拠する。

---

## カバレッジ基準（02-code-quality.md 準拠）

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## ファイル別カバレッジ目標

### Main Process（`apps/desktop/src/main/slide/`）

| ファイル            | Line目標 | Branch目標 | Function目標 | 備考                                       |
| ------------------- | -------- | ---------- | ------------ | ------------------------------------------ |
| `skill-executor.ts` | 80%      | 60%        | 80%          | RuntimeResolver/IAuthKeyService 分岐を含む |
| `ipc-handlers.ts`   | 80%      | 60%        | 80%          | validateIpcSender + P42 分岐               |
| `sync-manager.ts`   | 80%      | 60%        | 80%          | timeout/abort パスを含む                   |
| `file-watcher.ts`   | 80%      | 60%        | 80%          | start/stop ライフサイクル                  |

### Renderer（`apps/desktop/src/renderer/slide/`）

| ファイル                 | Line目標 | Branch目標 | Function目標 | 備考                |
| ------------------------ | -------- | ---------- | ------------ | ------------------- |
| `SlideWorkspace.tsx`     | 80%      | 60%        | 80%          | 4コンポーネント統合 |
| `SlideSyncCard.tsx`      | 80%      | 60%        | 80%          | -                   |
| `SlideProgressRow.tsx`   | 80%      | 60%        | 80%          | -                   |
| `SlideWatchStatus.tsx`   | 80%      | 60%        | 80%          | 4状態分岐           |
| `SlideGuidanceBlock.tsx` | 80%      | 60%        | 80%          | isHandoff 分岐      |

### Zustand Store（`apps/desktop/src/renderer/store/slices/`）

| ファイル        | Line目標 | Branch目標 | Function目標 | 備考                           |
| --------------- | -------- | ---------- | ------------ | ------------------------------ |
| `slideSlice.ts` | 90%      | 70%        | 90%          | 新設ファイル（推奨基準を適用） |

---

## v8 カバレッジプロバイダの注意事項（P41対策）

### インライン Arrow Function のカウント問題

v8 カバレッジプロバイダは、オブジェクトリテラル内のインライン arrow function を独立した関数としてカウントする。
これにより Function Coverage が予想外に低下する場合がある。

```typescript
// P41: v8 がこれを独立した関数としてカウントする
if (!validateIpcSender(event, mainWindow, {
  getAllowedWindows: () => [mainWindow], // ← これ
})) { ... }
```

**対策**: セキュリティテストで `getAllowedWindows` コールバックが実際に呼ばれることを検証する:

```typescript
// TC-04-07 での対応（Phase 4 テストマトリクスより）
expect(
  mockValidateIpcSender.mock.calls[0][2].getAllowedWindows(),
).toBeDefined();
```

### 誤検知が起きやすいパターン

以下のパターンは v8 で独立した関数としてカウントされるため、テストで明示的に呼び出す必要がある:

```typescript
// ① validateIpcSender のオプション内コールバック
validateIpcSender(event, win, { getAllowedWindows: () => [win] });

// ② イベントリスナー内のインライン関数
fileWatcher.onHtmlChange = async (path) => { ... };

// ③ Promise コンストラクタ内のコールバック
new Promise((resolve, reject) => { ... });
```

---

## カバレッジ計測コマンド

### 推奨: パッケージディレクトリから実行（P40対策）

```bash
# ❌ プロジェクトルートからの実行（vitest.config.ts が適用されない可能性）
# pnpm vitest run --coverage apps/desktop/src/main/slide/

# ✅ パッケージディレクトリから実行（P40対策）
cd apps/desktop && pnpm vitest run --coverage src/main/slide/ src/renderer/slide/
```

### 別の実行方法（pnpm --filter 使用）

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/slide/ \
  src/renderer/slide/ \
  src/renderer/store/slices/slideSlice.ts
```

### カバレッジ出力先

```
apps/desktop/coverage/
  ├── index.html          # HTML レポート
  ├── lcov.info           # LCOV 形式
  └── coverage-summary.json
```

---

## カバレッジ未達時の対応フロー

```
Phase 7 計測
  ↓
目標未達（Line < 80% など）
  ↓
Phase 6 に戻る → 不足ケースのテスト追加
  ↓
Phase 7 再計測
  ↓
全目標達成 → Phase 8 へ
```

### 未達が起きやすい箇所と対策

| 未達パターン                                | 原因                         | 対策テストケース                               |
| ------------------------------------------- | ---------------------------- | ---------------------------------------------- |
| `ipc-handlers.ts` Function Coverage 低下    | P41: inline callback 未実行  | TC-04-07 で `getAllowedWindows()` 明示呼び出し |
| `skill-executor.ts` Branch Coverage 低下    | handoff/error パスの未テスト | TC-04-02, TC-04-03                             |
| `sync-manager.ts` Branch Coverage 低下      | timeout/abort パスの未テスト | TC-06-02, TC-06-03                             |
| `slideSlice.ts` Line Coverage 低下          | IPC リスナーの未テスト       | TC-04-11                                       |
| `SlideWatchStatus.tsx` Branch Coverage 低下 | 4状態のうち一部が未テスト    | TC-04-10                                       |

---

## Phase 7 完了条件チェックリスト

- [ ] `cd apps/desktop && pnpm vitest run --coverage src/main/slide/ src/renderer/slide/` が正常完了
- [ ] `skill-executor.ts`: Line 80%以上 / Branch 60%以上 / Function 80%以上
- [ ] `ipc-handlers.ts`: Line 80%以上 / Branch 60%以上 / Function 80%以上
- [ ] `sync-manager.ts`: Line 80%以上 / Branch 60%以上 / Function 80%以上
- [ ] `file-watcher.ts`: Line 80%以上 / Branch 60%以上 / Function 80%以上
- [ ] `SlideWorkspace.tsx` 含む UI コンポーネント群: Line 80%以上 / Branch 60%以上 / Function 80%以上
- [ ] `slideSlice.ts`: Line 90%以上 / Branch 70%以上 / Function 90%以上（新設ファイル推奨基準）
- [ ] カバレッジレポート（`coverage/coverage-summary.json`）を Phase 9 品質検証に添付
