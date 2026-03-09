# Phase 8: リファクタリング - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                      |
| --------- | ------------------------- |
| タスクID  | TASK-10A-G                |
| Phase     | 8                         |
| 名称      | リファクタリング          |
| 依存Phase | Phase 7（カバレッジ確認） |
| 次Phase   | Phase 9（品質保証）       |

---

## 目的

Phase 4-7で作成・拡充したテストコードの品質を改善する。テスト結果（PASS/FAIL）を変えずに、可読性・保守性を向上させるリファクタリングを実施する。

---

## リファクタリング対象

| ファイル                              | レイヤー | リファクタリング対象 |
| ------------------------------------- | -------- | -------------------- |
| `skillHandlers.create.test.ts`        | Layer 1  | 対象                 |
| `SkillLifecycle.integration.test.tsx` | Layer 2  | 対象                 |
| `ChatPanel.skill-management.test.tsx` | Layer 3  | 対象外（回帰リスク） |

### Layer 3 除外理由

`ChatPanel.skill-management.test.tsx` は既存テストファイルであり、Phase 4-5で追加した4件のテストケース以外のコードに変更を加えると回帰リスクが発生する。リファクタリング対象はLayer 1とLayer 2の新規テストファイルに限定する。

---

## 実行タスク

- Task 1: Layer 1/2 の重複ヘルパーとテストデータを整理する
- Task 2: describe/it 命名を TC ベースへ揃える
- Task 3: beforeEach/afterEach と共通fixtureの配置を統一する
- Task 4: リファクタリング後の回帰有無を検証する

### Task 1: テストヘルパー関数の抽出

Layer 1とLayer 2で重複するモック設定パターンを共通ヘルパー関数に抽出する。

| 抽出候補                      | 対象レイヤー | 抽出条件                                         |
| ----------------------------- | ------------ | ------------------------------------------------ |
| `createMockEvent`             | Layer 1      | 3箇所以上で同一パターンが使用されている          |
| `createSkillLifecycleHarness` | Layer 2      | state/action/API応答の初期化が複数箇所で重複する |
| `createMockSkillMetadata`     | Layer 2      | テストデータ生成が3箇所以上で重複する            |

抽出手順:

1. 対象テストファイル内の重複パターンを `grep` で特定する
2. ファイル先頭（describe外）にヘルパー関数を定義する
3. 各テストケースからヘルパー関数の呼び出しに置換する
4. テスト実行で全件PASSを確認する

### Task 2: テストデータファクトリの整理

マジックナンバーや文字列リテラルをファイル先頭の定数に集約する。

| 定数化対象                 | 現状                                 | 定数名                  |
| -------------------------- | ------------------------------------ | ----------------------- |
| スキル説明文               | テストケース内にハードコード         | `VALID_DESCRIPTION`     |
| ウィザードオプション       | テストケース内にオブジェクトリテラル | `VALID_OPTIONS`         |
| 作成結果パス               | テストケース内に文字列リテラル       | `CREATED_SKILL_PATH`    |
| エラーコード               | テストケース内に文字列リテラル       | `ERROR_CODE_CREATE`     |
| バリデーションエラーコード | テストケース内に文字列リテラル       | `ERROR_CODE_VALIDATION` |

整理手順:

1. 各テストファイル内のリテラル値を `grep` で列挙する
2. 2箇所以上で使用されるリテラルを定数化する
3. 1箇所のみで使用されるリテラルはインラインのまま維持する（過剰抽象化を回避）
4. テスト実行で全件PASSを確認する

### Task 3: describe/it ブロックの命名改善

テスト内容が名前から一意に特定できるよう、describe/it の文言を改善する。

| 改善基準                                   | 改善前の例         | 改善後の例                                              |
| ------------------------------------------ | ------------------ | ------------------------------------------------------- |
| 検証対象と期待結果を明示する               | `"バリデーション"` | `"description引数のP42準拠3段バリデーション"`           |
| 具体的な入力値と期待動作を含める           | `"エラーケース"`   | `"サービス層例外をCREATE_ERRORコードでラップする"`      |
| テストIDを含めてトレーサビリティを確保する | `"正常系テスト"`   | `"TC-G01-009: 有効な引数でcreateSkillFromWizardに委譲"` |

改善手順:

1. 各テストファイルの `describe`/`it` ブロックの現在の名称を列挙する
2. Phase 2 のテストケース一覧（TC-G01/G02/G03）と突合する
3. テストケースIDを `it` ブロックの先頭に付与する（形式: `"TC-Gxx-nnn: 説明"`）
4. テスト実行で全件PASSを確認する

### Task 4: テスト間共有フィクスチャの整理

`beforeEach` ブロック内で初期化されるフィクスチャの配置と命名を統一する。

| 整理基準                                    | 実施内容                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| モックリセットは `beforeEach` の先頭で実行  | `vi.clearAllMocks()` を `beforeEach` の1行目に配置      |
| Store状態のリセットは `beforeEach` 内で実行 | `mockStoreState = { ... }` をモックリセット後に配置     |
| DOMクリーンアップは `afterEach` で実行      | `cleanup()` を `afterEach` に配置                       |
| 変数命名は `mock` プレフィックスで統一      | `mockSkillService`, `mockElectronAPI`, `mockStoreState` |

---

## リファクタリング原則

| 原則                     | 具体的な制約                                                   |
| ------------------------ | -------------------------------------------------------------- |
| テスト結果不変           | 各Task完了後にテスト実行し、PASS件数が変化しないことを確認する |
| Layer 3 変更禁止         | `ChatPanel.skill-management.test.tsx` の既存コードを変更しない |
| 新規テストケース追加禁止 | リファクタリングPhaseでテストケースを追加しない                |
| テストケース削除禁止     | 既存のテストケースを削除・マージしない                         |
| 外部依存の追加禁止       | 新しいnpmパッケージをテスト用に追加しない                      |

---

## 検証手順

各Task完了後に以下のコマンドを実行し、リファクタリングがテスト結果に影響していないことを確認する。

```bash
# Step 1: Layer 1 テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# Step 2: Layer 2 テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Step 3: Layer 3 テスト実行（回帰確認）
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

各ステップで以下を確認する:

- PASS件数がリファクタリング前と同一
- FAIL件数が0件
- テスト実行時間がリファクタリング前と比較して2倍以上に増加していない

---

## 参照資料

| 参照資料           | パス                                                                                              | 使用セクション         |
| ------------------ | ------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義書 | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`   | FR/NFRとの整合維持     |
| Phase 2 設計書     | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`         | TC/モック設計の原本    |
| Phase 5 成果物     | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md` | Green後のテスト実体    |
| Phase 6 成果物     | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-6-test-expansion.md` | 追加ケース維持         |
| Phase 7 成果物     | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-7-coverage-check.md` | カバレッジ目標維持     |
| テストパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                 | ヘルパー関数設計       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                       | リファクタリング基準   |
| エラー仕様         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                             | エラーコード定数化     |
| タスク運用ルール   | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                        | Phase 8 実行ルール     |
| IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                      | セキュリティテスト命名 |

---

## 成果物

| 成果物                   | パス                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| リファクタリングレポート | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-8/refactoring-report.md` |

---

## 統合テスト連携

| 連携対象 | リファクタリング時の制約                | 検証方法               |
| -------- | --------------------------------------- | ---------------------- |
| Layer 1  | 契約テストの分岐網羅を減らさない        | Phase 7 指標比較       |
| Layer 2  | real composition ハーネス形状を崩さない | Phase 5/9 実行結果比較 |
| Layer 3  | 既存テストファイルへ不要変更しない      | `git diff` と回帰実行  |

### リファクタリングレポート記載内容

| セクション       | 記載内容                                                    |
| ---------------- | ----------------------------------------------------------- |
| 実施サマリ       | 各Taskの実施有無と変更行数                                  |
| ヘルパー関数一覧 | 抽出したヘルパー関数名、引数、戻り値型                      |
| 定数化一覧       | 定数名、旧値、使用箇所数                                    |
| 命名改善一覧     | 変更前後の describe/it 名称                                 |
| テスト実行結果   | 各ステップのPASS/FAIL件数、実行時間（リファクタリング前後） |

---

## 完了条件

- [ ] Task 1（ヘルパー関数抽出）: 重複モック設定が共通関数に抽出されている
- [ ] Task 2（テストデータファクトリ整理）: マジックナンバーが定数化されている
- [ ] Task 3（命名改善）: 全テストケースにTC-Gxx-nnn形式のIDが付与されている
- [ ] Task 4（フィクスチャ整理）: beforeEach/afterEachの構成が統一されている
- [ ] Layer 1 テスト: リファクタリング前と同一のPASS件数（14件）
- [ ] Layer 2 テスト: リファクタリング前と同一のPASS件数（10件）
- [ ] Layer 3 テスト: 既存テストに回帰なし（全件PASS）
- [ ] リファクタリングレポートが作成されている

---

## 次Phase

Phase 9（品質保証）: Lint、TypeCheck、全テスト実行による品質保証を実施する。
