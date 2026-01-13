# テスト仕様書 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 4 - テスト作成（TDD: Red）              |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## テスト戦略

### テストの特性

今回の修正は `packages/shared/package.json` への依存関係追加のみであり、コードの変更は発生しない。
そのため、テスト戦略は以下に焦点を当てる:

1. **依存関係解決テスト**: SDK がnode_modulesに正しくインストールされるか
2. **ビルドテスト**: electron-vite build が正常完了するか
3. **ランタイムテスト**: ビルド後のアプリが正常起動するか
4. **既存テスト維持**: 既存の AgentClient テストが引き続きパスするか

### テストレベル

| レベル         | 適用範囲                    | 自動化 |
| -------------- | --------------------------- | ------ |
| ユニット       | 既存 AgentClient テスト維持 | ○      |
| 統合           | SDK モジュール解決確認      | ○      |
| E2E            | アプリ起動確認              | △      |
| 検証スクリプト | 依存関係確認                | ○      |

---

## テストケース一覧

### 1. 依存関係解決テスト

| ID     | テストケース                             | 期待結果               |
| ------ | ---------------------------------------- | ---------------------- |
| DEP-01 | pnpm install 後にSDKがnode_modulesに存在 | ディレクトリが存在     |
| DEP-02 | pnpm ls でSDKがリストされる              | バージョンが表示される |
| DEP-03 | packages/shared/package.json に依存記載  | SDK エントリが存在     |

### 2. ビルドテスト

| ID     | テストケース                           | 期待結果                 |
| ------ | -------------------------------------- | ------------------------ |
| BLD-01 | pnpm --filter @repo/shared build 成功  | 終了コード 0             |
| BLD-02 | pnpm --filter @repo/desktop build 成功 | 終了コード 0             |
| BLD-03 | ビルド成果物が生成される               | out/main/index.js が存在 |

### 3. ランタイムテスト

| ID     | テストケース          | 期待結果                  |
| ------ | --------------------- | ------------------------- |
| RUN-01 | devモードでアプリ起動 | ERR_MODULE_NOT_FOUND なし |
| RUN-02 | ビルド後アプリ起動    | ERR_MODULE_NOT_FOUND なし |

### 4. 既存テスト維持

| ID     | テストケース                | 期待結果     |
| ------ | --------------------------- | ------------ |
| EXT-01 | AgentClient ユニットテスト  | 全テストパス |
| EXT-02 | AgentHandler ユニットテスト | 全テストパス |
| EXT-03 | packages/shared テスト全体  | 全テストパス |
| EXT-04 | apps/desktop テスト全体     | 全テストパス |

---

## テストカバレッジ目標

### 対象範囲

今回の修正はpackage.jsonの変更のみであり、コードカバレッジの対象は既存コード。

| 指標              | 最低基準 | 推奨基準 | 備考           |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | 既存基準を維持 |
| Branch Coverage   | 60%      | 70%      | 既存基準を維持 |
| Function Coverage | 80%      | 90%      | 既存基準を維持 |

### 重点カバレッジ対象

| ファイル                                       | 目標カバレッジ |
| ---------------------------------------------- | -------------- |
| `packages/shared/src/agent/agent-client.ts`    | 90%以上        |
| `apps/desktop/src/main/agent/agent-handler.ts` | 80%以上        |

---

## TDD Red状態の定義

### 修正前の状態

| 検証項目                                      | 修正前の状態 |
| --------------------------------------------- | ------------ |
| `node_modules/@anthropic-ai/claude-agent-sdk` | 存在しない   |
| `pnpm --filter @repo/desktop dev`             | 起動時エラー |
| 依存関係検証スクリプト                        | 失敗         |

### 修正後の期待状態

| 検証項目                                      | 修正後の状態 |
| --------------------------------------------- | ------------ |
| `node_modules/@anthropic-ai/claude-agent-sdk` | 存在する     |
| `pnpm --filter @repo/desktop dev`             | 正常起動     |
| 依存関係検証スクリプト                        | 成功         |

---

## テスト実行コマンド

```bash
# 既存ユニットテスト
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# 依存関係検証（Phase 5実装後に実行）
./scripts/verify-sdk-dependency.sh

# ビルド検証
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build

# 手動起動確認
pnpm --filter @repo/desktop dev
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
