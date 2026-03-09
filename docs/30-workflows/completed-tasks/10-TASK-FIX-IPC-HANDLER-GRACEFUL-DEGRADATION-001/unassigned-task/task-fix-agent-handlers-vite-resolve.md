# agentHandlers テスト Vite 依存解決エラー修正 - タスク指示書

## メタ情報

```yaml
issue_number: 1090
```

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001                            |
| タスク名     | agentHandlers テスト Vite resolvePackageEntry エラー修正          |
| 分類         | バグ修正                                                          |
| 対象機能     | IPC agentHandlers テスト                                          |
| 優先度       | 中                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 Phase 9（品質検証） |
| 発見日       | 2026-03-08                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

IPC テストスイート全体実行時に、`apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts` の 16テストが全て失敗する。Vite の内部モジュール解決（`resolvePackageEntry`）でエラーが発生しており、テストの実行自体が不可能。他の 41 テストファイル（1067テスト）は全て PASS しているため、agentHandlers 固有の問題。

### 1.2 問題点・課題

- `agentHandlers.test.ts` の 16テスト全てが `resolvePackageEntry` エラーで失敗
- Vite 5.4.21 のモジュール解決ロジックでパッケージエントリポイントの解決に失敗
- テスト環境で Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) の依存解決が正しく行われていない可能性
- P40（モノレポテスト実行ディレクトリ依存）の派生パターンの可能性

### 1.3 放置した場合の影響

- IPC テストスイートの信頼性低下（16テストが常時失敗 → テスト結果のノイズ）
- 新規 IPC テスト追加時に、既存失敗との混同で変更起因の失敗を見逃すリスク（S-GD-4 と同じ状況が再発）
- agentHandlers の回帰テストが機能しなくなり、エージェント関連の不具合検出が遅れる

---

## 2. 何を達成するか（What）

### 2.1 目的

`agentHandlers.test.ts` の 16テストを全て PASS させ、IPC テストスイート全体（42ファイル、1083テスト）の完全 PASS を実現する。

### 2.2 最終ゴール

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.test.ts` が 16/16 PASS
- IPC テストスイート全体（42ファイル）が 0 failures

### 2.3 スコープ

#### 含むもの

- `agentHandlers.test.ts` の Vite 依存解決エラーの根本原因調査
- テストファイルまたは Vitest 設定の修正
- `@anthropic-ai/claude-agent-sdk` のモック設定確認・修正

#### 含まないもの

- agentHandlers.ts の実装変更（テスト修正のみ）
- 他のテストファイルの修正
- Vite 本体のバージョンアップ

### 2.4 成果物

| 成果物                 | パス                                                        |
| ---------------------- | ----------------------------------------------------------- |
| 修正済みテストファイル | `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts` |
| 必要に応じてモック設定 | `apps/desktop/src/main/ipc/__tests__/__mocks__/`            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm install` が完了していること
- Node.js バージョンが `.node-version` と一致していること（P7 対策）

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- Vitest のモジュールモック（`vi.mock`）
- Vite のモジュール解決ロジック（`resolvePackageEntry`, `tryNodeResolve`）
- Claude Agent SDK の型定義と exports

### 3.4 推奨アプローチ

1. エラーの `resolvePackageEntry` が解決しようとしているパッケージを特定
2. `@anthropic-ai/claude-agent-sdk` の `package.json` exports フィールドを確認
3. テストファイルの `vi.mock` 設定でパッケージのモック化が不完全な箇所を修正
4. P40 対策として、テスト実行はパッケージディレクトリから行う

---

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                             | 発見経緯                                                                                             | 解決策                                                                                           | 教訓                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 既存テスト失敗との混同（S-GD-4） | IPC テストスイート全体実行時に 16テスト失敗を検出したが、Graceful Degradation の変更とは無関係だった | テストファイルを `--testPathPattern` で絞って実行し、変更起因の失敗と既存失敗を分離する          | IPC テスト追加時は対象ファイルのみを先に実行する     |
| P40 テスト実行ディレクトリ依存   | モノレポ環境で `apps/desktop/vitest.config.ts` の設定が読み込まれない                                | `cd apps/desktop && pnpm vitest run` または `pnpm --filter @repo/desktop exec vitest run` で実行 | テスト実行は常に対象パッケージのディレクトリから行う |

---

## 4. 実行手順

### Phase構成

小規模タスクのため、Phase 1-13 の簡略構成（Phase 4-5-9 中心）。

### Phase 4: テスト修正（TDD: Red → Green）

#### 目的

agentHandlers.test.ts の Vite 依存解決エラーを修正する

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.test.ts` でエラー詳細を確認
2. エラースタックトレースから解決対象パッケージを特定
3. `vi.mock` の設定を確認し、モック化が不完全な箇所を修正
4. 修正後に 16/16 PASS を確認

#### 成果物

- 修正済み `agentHandlers.test.ts`

#### 完了条件

- 16テスト全て PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `agentHandlers.test.ts` の 16テストが全て PASS
- [ ] IPC テストスイート全体（42ファイル）が failures = 0

### 品質要件

- [ ] 修正が他のテストファイルに影響しないこと
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/` で全 PASS

### ドキュメント要件

- [ ] 修正内容を `lessons-learned.md` に記録（根本原因と解決策）

---

## 6. 検証方法

### テストケース

| TC-ID | 観点                   | 手順                                                                                       | 期待結果          |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------ | ----------------- |
| TC-01 | agentHandlers 全テスト | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.test.ts` | 16/16 PASS        |
| TC-02 | IPC テスト全体回帰     | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/`                      | 42ファイル全 PASS |

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                                                           |
| --------------------------- | ------ | -------- | -------------------------------------------------------------- |
| SDK バージョン不一致        | 中     | 中       | `package.json` の SDK バージョンと `node_modules` の実体を突合 |
| P7 ネイティブバイナリ不一致 | 中     | 低       | `pnpm store prune && pnpm install --force` で再構築            |
| モック設定の過不足          | 低     | 中       | 最小限のモック変更に留め、回帰テストで確認                     |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                   | パス                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| IPC テスト設計         | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                 |
| 落とし穴 P7            | `.claude/rules/06-known-pitfalls.md#P7`                                               |
| 落とし穴 P40           | `.claude/rules/06-known-pitfalls.md#P40`                                              |
| lessons-learned S-GD-4 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                |
| 親タスク               | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/` |

---

## 9. 備考

### 発見時のエラーログ

```
resolvePackageEntry vite/dist/node/chunks/dep-BK3b2jBa.js:46635:3
tryNodeResolve vite/dist/node/chunks/dep-BK3b2jBa.js:46451:16
ResolveIdContext.resolveId vite/dist/node/chunks/dep-BK3b2jBa.js:46201:19
PluginContainer.resolveId vite/dist/node/chunks/dep-BK3b2jBa.js:49018:17
```

### 補足事項

- ベースブランチ（main）でも同じエラーが再現するか確認することで、変更起因でないことを証明可能
- Claude Agent SDK の正式統合（TASK-9B-I）後に導入された依存関係が原因の可能性がある
