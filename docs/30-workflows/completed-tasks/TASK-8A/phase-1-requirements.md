# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 前提Phase  | なし               |
| 後続Phase  | Phase 2            |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

skill-import-agent-systemの5モジュール（SkillScanner, SkillImportManager, SkillExecutor, PermissionResolver, skillSlice）に対する単体テストの要件を定義し、既存テストとのギャップを特定する。

## 背景

各モジュールの実装は完了済みであり、テストファイルも一部存在する。TASK-8A仕様書では44テストケースが定義されているが、既存テストとの対応関係が不明確なため、ギャップ分析を行い正確な追加テスト範囲を確定する必要がある。

## 実行タスク

### Task 1: 既存テスト監査

**目的**: 既存テストファイルの内容を精査し、TASK-8A仕様の44テストケースとの対応関係を明確にする。

**実行手順**:

1. 以下の5つの既存テストファイルを読み込む：
   - `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`
   - `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`
   - `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
   - `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`
   - `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`
2. 各テストファイルの `describe` / `it` ブロックをすべてリスト化する
3. リスト化したテストケースをTASK-8A仕様の44テストケース（index.mdのテストケース一覧）と1対1で対応付ける
4. 以下の3カテゴリに分類する：
   - **カバー済み**: 既存テストが仕様のテストケースを満たしている
   - **部分カバー**: テストは存在するが仕様の要件を完全には満たしていない
   - **未カバー**: 対応するテストが存在しない
5. 監査結果を `outputs/phase-1/existing-test-audit.md` に出力する

**期待される成果物**:

- `outputs/phase-1/existing-test-audit.md`

### Task 2: ギャップ分析

**目的**: 既存テストと仕様要件のギャップを定量的に分析し、追加が必要なテストケースを特定する。

**実行手順**:

1. Task 1の監査結果から「部分カバー」「未カバー」のテストケースを抽出する
2. 各ギャップに対して以下を記録する：
   - テストケースID（例: SS-01, SIM-03）
   - ギャップの種類（未実装 / アサーション不足 / モック不足）
   - 追加が必要なテストコードの概要（1-2行で記述）
   - 対応する実装ソースファイルの関数名とファイルパス
3. ギャップの優先度を以下の基準で分類する：
   - **P1（必須）**: 正常系の基本動作テスト
   - **P2（重要）**: 異常系・エラーハンドリングテスト
   - **P3（推奨）**: 境界値・エッジケーステスト
4. ギャップ分析結果を `outputs/phase-1/gap-analysis.md` に出力する

**期待される成果物**:

- `outputs/phase-1/gap-analysis.md`

### Task 3: 受け入れ基準定義

**目的**: 本タスク全体の完了を判定するための定量的な受け入れ基準を定義する。

**実行手順**:

1. 以下の受け入れ基準を定義する：
   - **テストケース数**: 44テストケースすべてが実装されていること
   - **テスト通過率**: 全44テストケースが通過すること（0件失敗）
   - **カバレッジ**: 対象5モジュールの Line Coverage 80%以上、Branch Coverage 60%以上、Function Coverage 80%以上
   - **テスト実行時間**: 全テストが10秒以内に完了すること（Vitest設定のtestTimeout: 10000ms以内）
   - **型安全性**: テストファイルに `any` 型の使用がないこと
   - **既存テスト互換性**: 既存テストが1件も失敗しないこと
2. 各基準の計測方法を明記する：
   - テストケース数: `vitest run --reporter=verbose` の出力から確認
   - カバレッジ: `vitest run --coverage` の出力から確認
   - 型安全性: `pnpm --filter @repo/desktop tsc --noEmit` で確認
3. 受け入れ基準を `outputs/phase-1/acceptance-criteria.md` に出力する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

### Task 4: テスト対象モジュール分析

**目的**: 各モジュールの公開APIと内部依存関係を整理し、テスト設計のインプットとする。

**実行手順**:

1. 以下の5モジュールのソースコードを読み込む：
   - `apps/desktop/src/main/services/skill/SkillScanner.ts`
   - `apps/desktop/src/main/services/skill/SkillImportManager.ts`
   - `apps/desktop/src/main/services/skill/SkillExecutor.ts`
   - `apps/desktop/src/main/services/skill/PermissionResolver.ts`
   - `apps/desktop/src/renderer/store/slices/skillSlice.ts`
2. 各モジュールについて以下を記録する：
   - エクスポートされているクラス名・関数名
   - 公開メソッド一覧（引数の型、戻り値の型）
   - 外部依存（import文から抽出）
   - 内部状態（privateフィールド）
3. モジュール間の依存関係図をMermaid形式で記述する
4. 結果を `outputs/phase-1/module-analysis.md` に出力する

**期待される成果物**:

- `outputs/phase-1/module-analysis.md`

## 参照資料

| 参照資料           | パス                                                                      | 説明                               |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------- |
| TASK-8A仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-8a-unit-tests.md` | 元タスク仕様（44テストケース定義） |
| テスト戦略         | aiworkflow-requirements `quality-e2e-testing.md`                          | テストピラミッド・カバレッジ基準   |
| 品質要件           | aiworkflow-requirements `quality-requirements.md`                         | TDD方針・パフォーマンス要件        |
| スキル管理IF       | aiworkflow-requirements `interfaces-agent-sdk-skill.md`                   | IPC・型定義                        |
| Vitest設定         | `apps/desktop/vitest.config.ts`                                           | テスト環境設定                     |
| テストセットアップ | `apps/desktop/src/test/setup.ts`                                          | グローバルモック設定               |

## 成果物

| 成果物             | パス                                     | 説明                                 |
| ------------------ | ---------------------------------------- | ------------------------------------ |
| 既存テスト監査結果 | `outputs/phase-1/existing-test-audit.md` | 既存44テストケースとの対応マッピング |
| ギャップ分析       | `outputs/phase-1/gap-analysis.md`        | 不足テストの特定と優先度付け         |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md` | 定量的完了基準                       |
| モジュール分析     | `outputs/phase-1/module-analysis.md`     | テスト対象のAPI・依存関係整理        |

## 統合テスト連携

- 単体テスト境界とIPC通信テスト境界の切り分けを明確にする
- `SkillExecutor` → `PermissionResolver` 間の連携は単体テストではモックで分離し、統合テスト（TASK-8C）で実際の連携を検証する方針を確認する
- `skillSlice` → `window.electronAPI.skill` 間の通信は単体テストではスタブ化し、IPCテスト（TASK-8B）で実チャネルを検証する

## 完了条件

- [ ] 5つの既存テストファイルの全 `describe`/`it` ブロックがリスト化されている
- [ ] 44テストケースすべてに対して「カバー済み」「部分カバー」「未カバー」の分類が完了している
- [ ] ギャップ分析でP1/P2/P3の優先度が付与されている
- [ ] 受け入れ基準が定量的に定義され、計測方法が明記されている
- [ ] 5モジュールの公開API・依存関係が整理されている
- [ ] 4つの成果物ファイルが `outputs/phase-1/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 1 \
  --artifacts "outputs/phase-1/existing-test-audit.md:既存テスト監査結果,outputs/phase-1/gap-analysis.md:ギャップ分析,outputs/phase-1/acceptance-criteria.md:受け入れ基準,outputs/phase-1/module-analysis.md:モジュール分析"
```

## 依存関係

| 項目      | 内容    |
| --------- | ------- |
| 前提Phase | なし    |
| 後続Phase | Phase 2 |

## 次のPhase

→ [phase-2-design.md](phase-2-design.md)
