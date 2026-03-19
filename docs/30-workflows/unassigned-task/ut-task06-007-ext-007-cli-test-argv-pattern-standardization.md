# UT-TASK06-007-EXT-007: CLI スクリプトテスト process.argv[1] パス解決パターン標準化 - タスク指示書

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-TASK06-007-EXT-007                                           |
| タスク名     | CLI スクリプトテスト process.argv[1] パス解決パターン標準化     |
| 分類         | テスト基盤改善                                                  |
| 対象機能     | apps/desktop/scripts/ 配下の CLI スクリプト全般                 |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | UT-TASK06-007 Phase 7 main() テスト実装セッション（2026-03-19） |
| 発見日       | 2026-03-19                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-TASK06-007 の実装セッションで、`check-ipc-contracts.ts` の `main()` 関数テストにおいて以下の3つの苦戦箇所が発生した:

1. **process.argv[1] 二重パス問題（P40 CLI 派生）**: vitest から `main()` を呼ぶと `process.argv[1]` が vitest のパスになり、`path.join(process.cwd(), "apps", "desktop", "scripts")` にフォールバック。cwd が既に `apps/desktop` の場合、二重パス `apps/desktop/apps/desktop/scripts` が生成されファイルが見つからない

2. **vi.mock("fs") の describe 内配置制約**: ESM モジュールを対象とするテストで `vi.mock("fs")` を describe 内に配置すると、`import * as fs from "fs"` とは別の参照になりモック不適用

3. **カバレッジ改善の障壁**: CLI エントリポイント `main()` はファイル I/O + exit code 設定を含み、Line Coverage 74.49% の主因だった

### 1.2 問題点・課題

これらの問題は `check-ipc-contracts.ts` 固有ではなく、`apps/desktop/scripts/` 配下の他の CLI スクリプト（今後作成されるもの含む）でも再発する汎用的なパターンである。現在の解決策（`process.argv[1]` を `beforeEach` で固定）は各テストファイルで個別に実装されており、標準化されていない。

### 1.3 放置した場合の影響

- 新規 CLI スクリプト作成のたびに同じ苦戦箇所に遭遇する
- テスト作成者が `process.argv[1]` パス問題を知らず、カバレッジが低いままリリースされるリスク
- `vi.mock("fs")` の配置ミスによるテスト不安定性が再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

CLI スクリプトテストの `process.argv[1]` パス解決パターンをユーティリティとして標準化し、今後のスクリプト開発で再利用可能にする。

### 2.2 最終ゴール

1. `scripts/__tests__/test-helpers.ts` にヘルパー関数を作成
2. `check-ipc-contracts.test.ts` が当ヘルパーを使用するようリファクタリング
3. `CONTRIBUTING.md` または lessons-learned に CLI テストパターンを文書化

### 2.3 スコープ

#### 含むもの

- `setupCliTestArgv(scriptPath: string)` ヘルパー関数の作成
- `restoreCliTestArgv()` クリーンアップ関数の作成
- 既存 `check-ipc-contracts.test.ts` のリファクタリング（ヘルパー使用に変更）
- テストパターンの文書化

#### 含まないもの

- 他の CLI スクリプトのテスト作成（将来タスク）
- `vi.mock("fs")` のトップレベル配置強制（ESLint ルール化は別タスク）

---

## 3. どう実施するか（How）

### 3.1 技術方針

```typescript
// scripts/__tests__/test-helpers.ts
export function setupCliTestArgv(scriptRelPath: string): () => void {
  const original = process.argv[1];
  process.argv[1] = require("path").resolve(__dirname, scriptRelPath);
  return () => {
    process.argv[1] = original;
    process.exitCode = undefined;
  };
}
```

### 3.2 実装ステップ

1. `scripts/__tests__/test-helpers.ts` を作成
2. `check-ipc-contracts.test.ts` の `beforeEach` / `afterEach` をヘルパーに置換
3. テスト全 PASS 確認
4. パターンの文書化

### 3.3 テスト方針

- 既存 49 テストが全 PASS を維持
- ヘルパー自体のテスト: パス解決が正しく行われること

---

## 4. 苦戦箇所（Lessons Learned from UT-TASK06-007）

### 4.1 苦戦箇所の詳細

| #   | 苦戦箇所                            | 解決策                                             | 標準ルール                                          |
| --- | ----------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| 1   | process.argv[1] 二重パス（P40派生） | beforeEach でスクリプト絶対パスに固定              | CLI テストは process.argv[1] を対象スクリプトに固定 |
| 2   | vi.mock("fs") describe 内配置       | fs モックを諦めパス制御+実ファイル統合テストに変更 | vi.mock はファイルトップレベルに配置                |
| 3   | main() カバレッジ 74.49%            | process.argv[1] 固定+統合テスト5件で 94.94% に     | CLI エントリのテストは統合テスト形式で              |
| 4   | esbuild worktree 不一致（P7派生）   | pnpm store prune && pnpm install --force           | worktree 作成後は --force 再インストール            |

### 4.2 同種課題の簡潔解決手順

1. worktree 作成後は `pnpm store prune && pnpm install --force`
2. CLI テストの `beforeEach` で `process.argv[1]` をスクリプト絶対パスに固定、`afterEach` で復元
3. `vi.mock("fs")` はファイルトップレベル。describe 内配置は ESM モジュールへの適用保証なし
4. `main()` カバレッジは「パス制御＋実ファイル統合テスト」で達成

---

## 5. 参照資料

| 資料名                       | パス                                                                                                                      | 説明                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 対象テスト                   | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                                              | パターン適用元                |
| 苦戦箇所記録                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                                | v1.3.0: 苦戦箇所1-4           |
| IPC drift detection パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md` | main() テストパス解決パターン |
| P40 Pitfall                  | `.claude/rules/06-known-pitfalls.md`                                                                                      | テスト実行ディレクトリ依存    |

---

## 6. 完了条件

- [ ] `scripts/__tests__/test-helpers.ts` が作成されている
- [ ] `setupCliTestArgv` / `restoreCliTestArgv` が実装されている
- [ ] `check-ipc-contracts.test.ts` がヘルパーを使用するようリファクタリングされている
- [ ] 全テスト PASS
- [ ] パターンが lessons-learned または CONTRIBUTING に文書化されている
