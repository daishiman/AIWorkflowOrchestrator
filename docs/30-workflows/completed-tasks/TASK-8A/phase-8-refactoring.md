# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 8                  |
| Phase名    | リファクタリング   |
| 前提Phase  | Phase 7            |
| 後続Phase  | Phase 9            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

テストコードの品質を改善し、保守性・可読性を向上させる。TDD Refactor Phaseとして、テストの振る舞い（Green状態）を維持しながらコード品質を改善する。

## 背景

Phase 4-6でテストケースを追加した結果、テストファイル内に重複パターンやインライン定数の散在が生じている可能性がある。リファクタリングにより、テストコードの保守コストを下げる。

## 実行タスク

### Task 1: テストコード重複分析

**目的**: 5つのテストファイル内の重複パターンを特定する。

**実行手順**:

1. 以下の5テストファイルを読み込む：
   - `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`
   - `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`
   - `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
   - `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`
   - `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`
2. 以下の重複パターンを検出する：
   - **モックセットアップの重複**: 同一のモック設定が複数の `describe` / `it` ブロックに記述されている
   - **テストデータの重複**: 同一のオブジェクトリテラルが複数箇所に記述されている
   - **アサーションパターンの重複**: 同一構造のアサーションが繰り返されている
3. 重複箇所のファイルパスと行番号を記録する
4. 結果を `outputs/phase-8/refactoring-log.md` に出力する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

### Task 2: テストデータの整理

**目的**: テストファイル内の散在するテストデータを整理する。

**実行手順**:

1. Task 1で特定した重複テストデータを確認する
2. 以下のリファクタリングを適用する：
   - **テストファイル冒頭に定数を集約**: 同一テストファイル内で2回以上使用されるオブジェクトリテラルを `const` として冒頭に抽出する
   - **ファクトリ関数の導入**: 3回以上使用され、かつ微小な差異があるデータについては、ファクトリ関数（`createMockXxx(overrides?)` パターン）を各テストファイル内に定義する
   - **ファイルベースフィクスチャの活用**: 大きなテストデータ（SKILL.md内容等）は既存の `__fixtures__/` ディレクトリを活用する
3. リファクタリング後に全テストが通過することを確認する：
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
4. 変更内容を `outputs/phase-8/refactoring-log.md` に追記する

**期待される成果物**:

- 各テストファイル（更新）

### Task 3: テスト構造の整理

**目的**: `describe` / `it` のネスト構造を整理し可読性を向上させる。

**実行手順**:

1. 各テストファイルの `describe` / `it` 構造を確認する
2. 以下の基準で整理する：
   - **describeのネスト**: 最大2段階まで（クラス名 > メソッド名）
   - **itの命名**: `should + 動詞 + 期待結果` の形式（例: `should return empty array when directory does not exist`）
   - **テストの独立性**: 各 `it` ブロックが他の `it` ブロックの結果に依存しないこと
   - **beforeEach / afterEach**: 各 `describe` 内で必要最小限の setup/teardown を行うこと
3. リファクタリング後に全テストが通過することを確認する
4. 変更内容を `outputs/phase-8/refactoring-log.md` に追記する

**期待される成果物**:

- 各テストファイル（更新）

## 参照資料

| 参照資料           | パス                                              | 説明                   |
| ------------------ | ------------------------------------------------- | ---------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`              | リファクタリング前基準 |
| 既存テストパターン | `apps/desktop/src/main/services/skill/__tests__/` | 参考パターン           |
| 品質基準           | aiworkflow-requirements `quality-requirements.md` | テスト品質基準         |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物         |

## 成果物

| 成果物               | パス                                 | 説明                   |
| -------------------- | ------------------------------------ | ---------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 重複分析・改善内容記録 |

## 統合テスト連携

- リファクタリングで抽出したファクトリ関数のうち、統合テスト（TASK-8B, TASK-8C）で流用可能なものがあれば記録する
- テスト構造の整理が統合テストファイルの命名規則と一貫していることを確認する

## 完了条件

- [ ] 5テストファイルの重複パターンが分析されている
- [ ] テストデータの重複が整理されている（定数化またはファクトリ関数化）
- [ ] describe/itの構造が整理されている
- [ ] リファクタリング後に全テストが通過している
- [ ] カバレッジがPhase 7の結果と同等以上である（リファクタリングでカバレッジが低下していない）
- [ ] リファクタリング記録が `outputs/phase-8/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 8 \
  --artifacts "outputs/phase-8/refactoring-log.md:リファクタリング記録"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | Phase 7 |
| 後続Phase | Phase 9 |

## 次のPhase

→ [phase-9-quality-assurance.md](phase-9-quality-assurance.md)
