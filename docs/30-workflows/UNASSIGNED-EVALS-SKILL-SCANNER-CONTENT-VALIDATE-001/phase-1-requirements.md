# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 1                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| タスク名   | SkillScanner EVALS.json 内容バリデーション追加      |
| 前提Phase  | -                                                   |
| 後続Phase  | Phase 2                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的・背景

`apps/desktop/src/main/services/skill/SkillScanner.ts` は `scanOtherFiles()` メソッドで EVALS.json の**存在とファイルサイズ**のみを確認しており、ファイルの中身（JSON構造・必須キー・スキーマ整合性）を一切検査していない。

この問題により以下が発生している：

1. **空オブジェクト `{}`** を含む EVALS.json もバリデーション済みとしてリストに乗せてしまう
2. **破損 JSON**（構文エラー）の EVALS.json もサイズが 0 以外であれば valid 扱いになる
3. **必須キー欠落**（`skill_name`・`current_level`・`metrics` 等）の EVALS.json も素通りする
4. camelCase / snake_case 両方の方言を許容するか否かの**ポリシーが未定義**のまま

本タスクでは `SkillScanner.ts` に内容バリデーションフックを追加し、上記問題を解消する。また、既存3テスト（`with-evals` / `with-all-others` / `with-sized-evals`）の契約を「中身を期待しない」から「バリデーション結果を持つ」へ更新する。

## SubAgent チーム編成

| SubAgent   | 関心ごと               | 主担当                                                              | 並列/直列              |
| ---------- | ---------------------- | ------------------------------------------------------------------- | ---------------------- |
| SubAgent-A | SkillScanner 責務分析  | `scanOtherFiles()` の現状コード・`SkillOtherFile` 型の確認          | 並列（B・C と同時）    |
| SubAgent-B | バリデーション設計調査 | 既存 EVALS.json サンプル収集・camelCase/snake_case 両方言の実態調査 | 並列（A・C と同時）    |
| SubAgent-C | テスト契約設計         | 既存3テストケースの「何を期待しているか」を記録・更新方針の策定     | 並列（A・B と同時）    |
| SubAgent-D | 統合監査               | A・B・C の成果物を統合し矛盾チェック・受け入れ基準最終確定を実施    | 直列（A・B・C 完了後） |

## 実行タスク

### Step 0: P50 チェック（前提確認）

```bash
# 現ブランチの状態確認
git log --oneline -10

# 依存タスク UNASSIGNED-EVALS-VALIDATOR-GUARD-001 の状態確認（存在する場合）
git log --oneline --all | grep -i "evals-validator"

# 現状のテスト通過率を記録
pnpm --filter @repo/desktop test SkillScanner
```

### Step 1: SkillScanner 責務分析（SubAgent-A 担当）

- `apps/desktop/src/main/services/skill/SkillScanner.ts` の `scanOtherFiles()` メソッド（L398-412）を読み込む
- `SkillOtherFile` 型（`@repo/shared`）の定義を確認し、現在の `size` フィールドがバリデーション結果を持てるかを確認する
- `OTHER_FILES` 定数（L36-43）の構造と `type: "evals"` の扱いを記録する
- `buildSkillMetadata()` の `otherFiles` への渡し方を確認する

```bash
# SkillOtherFile 型の確認
grep -rn "SkillOtherFile" apps/desktop/src/main/services/skill/
grep -rn "SkillOtherFile" packages/shared/
```

### Step 2: バリデーション設計調査（SubAgent-B 担当）

- 実在する EVALS.json ファイルを複数収集し、スキーマを分析する
  - `.agents/skills/skill-creator/EVALS.json`（snake_case 方言）
  - `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`（snake_case 方言）
- camelCase 方言（`skillName`, `currentLevel`, `totalUsageCount`）が実際に存在するか確認する
- 必須キーのセットを決定する（最低限のバリデーションに必要なキー群）

```bash
find . -name "EVALS.json" | head -10 | xargs cat 2>/dev/null
```

### Step 3: テスト契約設計（SubAgent-C 担当）

- 既存3テストケースの実装を読み込み、現在の契約を記録する
  - `with-evals`（L974-999 付近）: EVALS.json の存在確認のみ
  - `with-all-others`（L1055-1086 付近）: 3ファイル同時検出
  - `with-sized-evals`（L1088-1113 付近）: size フィールドの確認
- 内容バリデーション追加後に各テストが「どう変わるべきか」を列挙する
- 新規追加すべきテストケース（空`{}`・破損JSON・必須キー欠落）の一覧を作成する

### Step 4: 統合・受け入れ基準確定（SubAgent-D 担当）

- A・B・C の成果物を統合し、以下を確定する
  - `SkillOtherFile` 型への追加フィールド（`evalsValidation?: EvalsValidationResult`）
  - バリデーション関数のシグネチャ候補
  - camelCase/snake_case 両許容ポリシーのコメント文案
  - 受け入れ基準 AC-1〜AC-N の最終版

## 参照資料

| 資料名                      | パス                                                                              | 用途                     |
| --------------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| SkillScanner 実装           | `apps/desktop/src/main/services/skill/SkillScanner.ts`                            | 現状コード確認           |
| SkillScanner テスト         | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`             | 既存3テスト契約確認      |
| SkillOtherFile 型定義       | `packages/shared/`（grep で特定）                                                 | 型拡張の検討             |
| EVALS.json サンプル（実物） | `.agents/skills/skill-creator/EVALS.json`                                         | スキーマ分析             |
| EVALS.json フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` | snake_case 方言確認      |
| GitHub Issue #2329          | CLOSED                                                                            | タスク背景・スコープ確認 |

## 実行手順

1. SubAgent-A・B・C を並列起動する（Step 1・2・3 を同時実施）
2. 各 SubAgent の成果物を `outputs/phase-1/` に出力する
3. SubAgent-D が統合監査を実施し、受け入れ基準を確定する
4. 完了条件チェックリストを全てチェックする

## 統合テスト連携

Phase 1 は調査・分析フェーズであるため、コード変更は行わない。
調査終了時点で `pnpm --filter @repo/desktop test SkillScanner` を実行し、既存テストが全て PASS していることを確認・記録する。

## 多角的チェック観点（20思考法）

| #   | 思考法         | SkillScanner バリデーション追加への適用                                                         |
| --- | -------------- | ----------------------------------------------------------------------------------------------- |
| 1   | 逆算思考       | Phase 5（実装）で「内容バリデーション済み EVALS.json のみリストに載る」を実現するには何が必要か |
| 2   | 最悪ケース思考 | 空 `{}`・破損 JSON・必須キー欠落が全て valid 扱いになった場合の downstream 影響                 |
| 3   | 分解思考       | バリデーションを「パース」「必須キー確認」「方言判定」「結果返却」に分解して設計する            |
| 4   | 抽象化思考     | `SkillOtherFile` に `evalsValidation` を追加するか、別の戻り値型を設計するか                    |
| 5   | 具体化思考     | 実際の EVALS.json サンプル（skill-creator）でバリデーションが通るか確認する                     |
| 6   | 対比思考       | camelCase 方言 vs snake_case 方言の差分を具体的にリストアップする                               |
| 7   | システム思考   | SkillScanner → SkillService → UI への伝播経路でバリデーション結果がどう使われるか               |
| 8   | 制約思考       | スコープ外（共通バリデーター実装・fixture 移行・UI 文言リデザイン）を守ること                   |
| 9   | 優先順位思考   | 破損 JSON > 空 `{}` > 必須キー欠落 の順で影響が大きいか評価する                                 |
| 10  | ユーザー視点   | SkillScanner を使う上位サービスが期待する戻り値の変化を把握する                                 |
| 11  | 失敗学思考     | 現状テストが「中身を期待しない」契約のままだと何が起きるか                                      |
| 12  | 類推思考       | `parseFrontmatter()` での YAML パースエラーハンドリングを EVALS.json に適用できるか             |
| 13  | 帰納思考       | 複数の EVALS.json サンプルから「必須キー」を帰納的に確定する                                    |
| 14  | 演繹思考       | EVALS.json の目的（スキルレベル評価）から「最低限必要なフィールド」を演繹する                   |
| 15  | 仮説検証思考   | 「camelCase 方言の EVALS.json は実在する」という仮説を検証する                                  |
| 16  | 全体最適思考   | バリデーション失敗スキルをリストから除外 vs 警告付きで残す、どちらが全体最適か                  |
| 17  | 局所最適思考   | `scanOtherFiles()` 内の最小変更でバリデーションを追加できる箇所を特定する                       |
| 18  | 時系列思考     | 先行タスク完了前に本タスクを開始した場合のリスクを評価する                                      |
| 19  | 多様性思考     | EVALS.json を持つスキル vs 持たないスキルの両方を正しく処理できるか                             |
| 20  | メタ認知思考   | Phase 1 で「何がわからないか」を明確にしてから Phase 2 に進む                                   |

## 成果物

| 成果物                  | パス                                       | 説明                                                        |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| コード棚卸し結果        | `outputs/phase-1/code-audit.md`            | `scanOtherFiles()` 現状・`SkillOtherFile` 型の確認結果      |
| EVALS.json スキーマ分析 | `outputs/phase-1/evals-schema-analysis.md` | 実在サンプルから帰納したキー一覧・camelCase/snake_case 差分 |
| テスト契約現状記録      | `outputs/phase-1/test-contract-audit.md`   | 既存3テストの「何を期待しているか」の現状記録               |
| 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`   | AC-1〜AC-N の最終版                                         |
| P50 チェック結果        | `outputs/phase-1/p50-check-result.md`      | 現状テスト PASS 確認ログ                                    |

## 完了条件

- [ ] P50 チェックコマンドを実行し、現状テストが PASS していることを確認した
- [ ] `scanOtherFiles()` の現状実装（存在確認のみ）を記録した
- [ ] `SkillOtherFile` 型の定義を確認した
- [ ] 実在する EVALS.json ファイルを3件以上収集しスキーマを分析した
- [ ] camelCase / snake_case 両方言の実態を確認した
- [ ] 既存3テスト（`with-evals`・`with-all-others`・`with-sized-evals`）の現在の契約を記録した
- [ ] 受け入れ基準 AC-1〜AC-N を確定した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク 100% 実行確認【必須】

- [ ] SubAgent-A（SkillScanner 責務分析）完了
- [ ] SubAgent-B（バリデーション設計調査）完了
- [ ] SubAgent-C（テスト契約設計）完了
- [ ] SubAgent-D（統合監査）完了
- [ ] 全 Step（Step 0〜4）が完了していること
- [ ] 成果物が `outputs/phase-1/` に全件出力されていること
- [ ] 既存テストが PASS していること
- [ ] Phase 2 への進行可否が判定されていること

## 次のPhase

Phase 2: 設計
