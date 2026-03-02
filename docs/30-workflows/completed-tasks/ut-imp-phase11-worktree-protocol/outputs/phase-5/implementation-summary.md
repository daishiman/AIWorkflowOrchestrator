# Phase 5 実装サマリー

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL      |
| 作成日     | 2026-03-01                            |
| Phase      | 5（実装）                             |
| 依存成果物 | `outputs/phase-4/test-case-design.md` |
| TDD方針    | Red → Green → Refactor                |

---

## 実装ファイル一覧（10ファイル）

| No  | ファイルパス                                                           | 種別      | 説明                                   |
| --- | ---------------------------------------------------------------------- | --------- | -------------------------------------- |
| 1   | `apps/desktop/src/main/utils/worktree-detector.ts`                     | 実装      | Worktree環境判定ユーティリティ         |
| 2   | `apps/desktop/src/main/utils/deferred-tests-parser.ts`                 | 実装      | deferred-tests.md Markdownパーサー     |
| 3   | `apps/desktop/src/main/utils/test-layer-classifier.ts`                 | 実装      | テストLayer分類器                      |
| 4   | `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`      | テスト    | worktree-detector テスト（23件）       |
| 5   | `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts`  | テスト    | deferred-tests-parser テスト（17件）   |
| 6   | `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts`  | テスト    | test-layer-classifier テスト（11件）   |
| 7   | `apps/desktop/src/main/utils/__tests__/worktree-protocol-flow.test.ts` | テスト    | 3ユーティリティ統合フローテスト（6件） |
| 8   | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                            | E2Eテスト | skill:remove IPC E2E（8件）            |
| 9   | `apps/desktop/e2e/ipc-skill-import.spec.ts`                            | E2Eテスト | skill:import IPC E2E（8件）            |
| 10  | `apps/desktop/e2e/helpers/electron-app.ts`                             | ヘルパー  | Electron起動/終了/IPC呼び出し共通化    |

---

## 実装ポイント

### Task 1: worktree-detector 実装

- `.git` ファイルの `gitdir:` 解析を共通化する `readGitDir()` を追加。
- 公開API: `isWorktreeEnvironment()`, `getMainRepoPath()`, `getWorktreeName()`。
- POSIX/OS依存区切りの双方で `/.git/worktrees/` を解釈できるように実装。

### Task 2: deferred-tests-parser 実装

- `parseDeferredTests()` で Markdown テーブルを厳密にパース。
- `ParseError` / `DeferredTestsNotFoundError` を定義。
- 解消判定は `完了` / `対応不要` / `対象外` を完了扱いに統一。

### Task 3: test-layer-classifier 実装

- `classifyTestLayer()` で Layer 1/2/3 を判定。
- `canRunInWorktree()` で Worktree 実行可否を単純化（Layer 1/2 のみ実行可）。

### Task 4: テスト群の拡充

- ユニット/統合テスト合計57件を追加（4ファイル）。
- E2Eテスト16件を追加（2ファイル）。
- Electron起動と Preload API 呼び出しを共通ヘルパーへ集約。

---

## テストケース数（実測）

| ファイル                         | ケース数 |
| -------------------------------- | -------- |
| `worktree-detector.test.ts`      | 23       |
| `deferred-tests-parser.test.ts`  | 17       |
| `test-layer-classifier.test.ts`  | 11       |
| `worktree-protocol-flow.test.ts` | 6        |
| `ipc-skill-remove.spec.ts`       | 8        |
| `ipc-skill-import.spec.ts`       | 8        |
| **合計（ユニット/統合）**        | **57**   |
| **合計（E2E）**                  | **16**   |

---

## 実行検証メモ

- 試行コマンド:  
  `pnpm --filter @repo/desktop exec vitest run src/main/utils/__tests__/worktree-detector.test.ts src/main/utils/__tests__/deferred-tests-parser.test.ts src/main/utils/__tests__/test-layer-classifier.test.ts src/main/utils/__tests__/worktree-protocol-flow.test.ts`
- 結果: 実行環境の optional dependency 欠落（`@rollup/rollup-darwin-x64`）で Vitest 起動エラー。
- 影響: 本サマリーでは「ケース数」と「実装反映状況」を確定し、テスト実行再確認は依存解決後の再実施が必要。

---

## E2Eテスト状態

| テストファイル             | ケース数 | 実行環境              | Worktreeでの扱い    |
| -------------------------- | -------- | --------------------- | ------------------- |
| `ipc-skill-remove.spec.ts` | 8        | CI / メインリポジトリ | deferred（Layer 3） |
| `ipc-skill-import.spec.ts` | 8        | CI / メインリポジトリ | deferred（Layer 3） |

E2E（Layer 3）は Worktree では実行しない方針とし、`deferred-tests.md` で追跡する。

---

## 次Phase

Phase 6（テスト拡充）でカバレッジ確認を実施し、不足ケースを追加する。
