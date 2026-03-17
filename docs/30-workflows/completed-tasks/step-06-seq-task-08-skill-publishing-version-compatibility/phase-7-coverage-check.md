# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 7                            |
| Phase名    | カバレッジ確認               |
| 前提Phase  | Phase 6（テスト拡充）        |
| 後続Phase  | Phase 8（リファクタリング）  |
| ステータス | 完了（2026-03-17 再監査）    |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

## 目的

Phase 4+6 のテスト仕様が Phase 2 の設計の全 concern を網羅しているか確認し、カバレッジマトリクスを作成する。未検証箇所を洗い出し、追加テスト仕様の要否を判定する。カバレッジ基準（Function Coverage 80%以上、Branch Coverage 60%以上）を設計タスクの文脈で「テスト仕様の concern 網羅率」として読み替える。

## 背景

設計タスクにおける Phase 7 は「テスト仕様の網羅性確認」フェーズである。Phase 4 で基本テスト、Phase 6 で境界ケース・異常系を追加した。Phase 7 では Phase 2 の 5 つの設計 concern（公開レベル/互換性/Skill Center/配布操作/公開判定）と Phase 5 の全 TypeScript 型フィールドを横断し、テスト仕様での検証対象から漏れているものを特定する。カバレッジ不足が発見された場合は Phase 6 に戻って追加テスト仕様を作成する。

## 実行タスク

### タスク1: concern × テストケースマッピングマトリクス作成

**目的**: 5 つの設計 concern と Phase 4+6 のテストケースが完全にマッピングされているかを確認するマトリクスを作成する。

**実行手順**:

1. concern × テストケースのカバレッジマトリクスを作成する（以下の形式で `outputs/phase-7/coverage-matrix.md` に記録する）:

   | concern                              | Phase 4 テストケース数 | Phase 6 テストケース数 | 合計 | カバー率 | ギャップ |
   | ------------------------------------ | ---------------------- | ---------------------- | ---- | -------- | -------- |
   | 公開レベルメタデータ                 | （計測値を記入）       | （計測値を記入）       |      |          |          |
   | 互換性チェック（semver/schema）      | （計測値を記入）       | （計測値を記入）       |      |          |          |
   | Skill Center フロー                  | （計測値を記入）       | （計測値を記入）       |      |          |          |
   | 配布操作（import/export/fork/share） | （計測値を記入）       | （計測値を記入）       |      |          |          |
   | 公開判定ロジック                     | （計測値を記入）       | （計測値を記入）       |      |          |          |

2. カバー率の計算方法を定義する:
   - 分子: テスト仕様で検証対象として明記されているサブ concern の数
   - 分母: Phase 2 の設計書に記載された各 concern の構成要素（型フィールド・フロー分岐・マトリクス行）の総数
   - 合格基準: 全 concern のカバー率が 80% 以上

3. ギャップとして記録する項目の判定基準:
   - Phase 2 の設計書に記載されているが、Phase 4+6 のテスト仕様で検証対象になっていない項目
   - 具体的な期待値が定義されていないテストケース（「確認する」のみで期待値未記載のもの）

4. カバレッジ確認コマンド（concern × テスト仕様のカウント手順）:

   ```bash
   # Phase 4 テスト仕様のテストケース数をカウント（箇条書きのテストケース行を集計）
   grep -c "正常系\|異常系\|境界値\|を確認$\|を返す" outputs/phase-4/*.md

   # Phase 6 拡充テスト仕様のテストケース数をカウント
   grep -c "正常系\|異常系\|境界\|を確認$\|を返す" outputs/phase-6/*.md

   # Phase 2 設計書の concern 構成要素（型フィールド・フロー分岐）の総数を確認
   # 各設計書の構成要素を個別に確認する
   grep -c "^   - \|^      - " outputs/phase-2/*.md
   ```

   上記コマンドの実行結果をカバレッジマトリクスの分子・分母として記録すること。outputs/phase-2/ の設計書が未生成の場合は `phase-2-design.md` の各タスクの実行手順の箇条書きをカウントする。

**期待される成果物**: `outputs/phase-7/coverage-matrix.md`

---

### タスク2: 依存エッジカバレッジ確認

**目的**: Task05/06/07 との契約境界がテスト仕様でカバーされているかを確認する。

**実行手順**:

1. Task05（利用導線）との契約境界確認:
   - `importSkill()` の呼び出し元として Task05 の利用導線が想定されているか
   - Phase 4 または Phase 6 のテスト仕様に「Task05 からの import 呼び出し」パターンが含まれているか
   - 未カバーの場合: `dependency-edge-coverage.md` の「追加必要テスト」欄に記載

2. Task06（安全性ゲート）との契約境界確認:
   - Phase 4 のモックA-D（SafetyGateResult の4種類）が Phase 2 の判定マトリクスの全ケースをカバーしているか
   - `SafetyGateStatus: "pending"` 状態での公開試行テストが定義されているか（Phase 4 では `"approved"` と `"rejected"` のみの場合ギャップ）
   - `criticalFindings > 0` かつ `safetyStatus: "approved"` という矛盾状態のテストが定義されているか

3. Task07（観測指標）との契約境界確認:
   - Phase 4 のモックX-W（ObservabilityMetrics の4種類）が Phase 2 の判定マトリクスの全ケースをカバーしているか
   - `feedbackScore: 0`（データなし）の場合に判定がどのパスを通るかのテストが定義されているか
   - `successRate: 0` と `feedbackScore: 0` が同時の場合（新規公開スキル）のテストが定義されているか

4. 各境界の確認結果を以下の形式で記録する:

   | 依存タスク | 契約境界                        | カバーされているか | 不足テスト仕様（ある場合） |
   | ---------- | ------------------------------- | ------------------ | -------------------------- |
   | Task05     | import 呼び出しパターン         | YES / NO           |                            |
   | Task06     | SafetyGateResult 全値セット     | YES / NO           |                            |
   | Task07     | ObservabilityMetrics 全値セット | YES / NO           |                            |

**期待される成果物**: `outputs/phase-7/dependency-edge-coverage.md`

---

### タスク3: 型定義カバレッジ確認

**目的**: Phase 5 で確定した全 TypeScript 型の全フィールドがテスト仕様でバリデーション対象になっているかを確認する。

**実行手順**:

1. `SkillPublishingMetadata` のフィールドカバレッジを確認する:
   - 必須フィールド（`name`, `description`, `version`, `visibility`）に対して P42準拠3段バリデーション（型チェック→空文字列→trim空文字列）が Phase 4 で定義されているか
   - visibility 別の条件付き必須フィールド（`teamId`, `license` 等）に対するバリデーションが定義されているか
   - 任意フィールド（`repository`）の省略パスが定義されているか

2. `CompatibilityCheckResult` のフィールドカバレッジを確認する:
   - `level` の全3値（`"compatible"`, `"minor-incompatible"`, `"breaking"`）が各フィールドの設定パスでテストされているか
   - `breakingChanges` が空配列のケースと非空配列のケースの両方が定義されているか
   - `suggestedBump` の全3値（`"major"`, `"minor"`, `"patch"`）が対応する `level` との組み合わせでテストされているか

3. `PublishReadiness` のフィールドカバレッジを確認する:
   - 全4ステータス（`"auto-approved"`, `"review-required"`, `"manual-approval-required"`, `"blocked"`）がテストされているか
   - `reasons` フィールドが `"review-required"`, `"manual-approval-required"`, `"blocked"` のケースで非空であることがテストされているか

4. フィールドカバレッジを以下の形式で記録する:

   | 型名                     | 総フィールド数 | テスト対象フィールド数 | カバー率 | 未カバーフィールド |
   | ------------------------ | -------------- | ---------------------- | -------- | ------------------ |
   | SkillPublishingMetadata  | （計測値）     | （計測値）             |          |                    |
   | CompatibilityCheckResult | （計測値）     | （計測値）             |          |                    |
   | PublishReadiness         | （計測値）     | （計測値）             |          |                    |
   | SafetyGateResult         | （計測値）     | （計測値）             |          |                    |
   | ObservabilityMetrics     | （計測値）     | （計測値）             |          |                    |

**期待される成果物**: `outputs/phase-7/type-coverage.md`

---

### タスク4: 未検証箇所リスト作成とカバレッジ判定

**目的**: タスク1〜3 の確認結果を集約し、未検証箇所を優先度付きでリスト化し、Phase 6 に戻る必要があるかを判定する。

**実行手順**:

1. 未検証箇所を以下の形式でリスト化する:

   | #   | 未検証箇所                   | concern カテゴリ | 優先度 | 追加テスト仕様の必要性 | 判定 |
   | --- | ---------------------------- | ---------------- | ------ | ---------------------- | ---- |
   | 1   | （タスク1-3 で発見した項目） |                  |        |                        |      |

2. 優先度の判定基準:
   - 高: セキュリティ・認証・破壊的変更に関わる未検証箇所
   - 中: 正常系のカバー率が 80% 未満の concern
   - 低: 任意フィールドや省略パスの未検証箇所

3. Phase 6 へ戻る判定基準（以下のいずれかを満たす場合は Phase 6 に戻る）:
   - concern カバー率が 80% 未満の項目が 1 つ以上存在する
   - 高優先度の未検証箇所が 1 つ以上存在する
   - Task06/07 との契約境界で「NO」の項目が 1 つ以上存在する

4. Phase 6 に戻る場合の差し戻し記録:
   - 追加すべきテスト仕様の具体的な内容を `uncovered-areas.md` に記載する
   - Phase 6 の担当エージェントが `outputs/phase-6/` に追加ファイルを作成できるよう、テストケースのアウトラインを記述する

5. Phase 6 に戻らない（カバレッジ充足）の場合:
   - `uncovered-areas.md` に「未検証箇所 0 件 / Phase 8 へ進行可」と記録する

**期待される成果物**: `outputs/phase-7/uncovered-areas.md`

## 参照資料

| 参照資料                   | パス                                                | 内容                     |
| -------------------------- | --------------------------------------------------- | ------------------------ |
| Phase 1 要件定義           | `./phase-1-requirements.md`                         | 受入基準・機能要件       |
| Phase 2 設計               | `./phase-2-design.md`                               | 5 つの設計書（総括）     |
| Phase 2 公開レベル設計     | `outputs/phase-2/publishing-metadata-design.md`     | concern分母: 公開レベル  |
| Phase 2 互換性チェック設計 | `outputs/phase-2/compatibility-check-design.md`     | concern分母: 互換性      |
| Phase 2 Skill Center 設計  | `outputs/phase-2/skill-center-flow-design.md`       | concern分母: フロー      |
| Phase 2 配布操作設計       | `outputs/phase-2/distribution-operations-design.md` | concern分母: 配布操作    |
| Phase 2 公開判定設計       | `outputs/phase-2/publish-readiness-design.md`       | concern分母: 公開判定    |
| Phase 4 テスト仕様         | `./phase-4-test-creation.md`                        | 基本テストケース         |
| Phase 5 型定義確定書       | `./phase-5-implementation.md`                       | 全型定義と全フィールド   |
| Phase 6 拡充テスト仕様     | `./phase-6-test-expansion.md`                       | 境界ケース・異常系テスト |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容         |
| -------------------------- | --------------------------------------------------------------------------------- | ------------ |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | 公開前安全性 |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型定義       |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`    | 教訓         |

## 統合テスト連携

| カバレッジ確認結果                  | Phase 8 以降への影響                                                    |
| ----------------------------------- | ----------------------------------------------------------------------- |
| カバレッジ充足（全concern 80%以上） | Phase 8（リファクタリング）に進行                                       |
| カバレッジ不足                      | Phase 6 に差し戻し → 追加テスト仕様作成後に Phase 7 を再実施            |
| 高優先度未検証箇所あり              | Phase 6 に差し戻し（セキュリティ関連は必ず解消してから Phase 8 に進む） |

## 成果物

| 成果物                   | パス                                          | 内容                                    |
| ------------------------ | --------------------------------------------- | --------------------------------------- |
| カバレッジマトリクス     | `outputs/phase-7/coverage-matrix.md`          | concern × テストケース 網羅率マトリクス |
| 依存エッジカバレッジ確認 | `outputs/phase-7/dependency-edge-coverage.md` | Task05/06/07 との契約境界カバレッジ     |
| 型定義カバレッジ確認     | `outputs/phase-7/type-coverage.md`            | 全型フィールドの検証対象可否マトリクス  |
| 未検証箇所リスト         | `outputs/phase-7/uncovered-areas.md`          | 優先度付き未検証箇所リストと Phase 判定 |

## 完了条件

- [ ] 4 つの成果物ファイルが `outputs/phase-7/` 配下に作成されている
- [ ] カバレッジマトリクスが 5 concern 全ての行を含んでいる
- [ ] **AC-1対応**: 公開レベルメタデータ concern のカバー率が 80% 以上である（遷移条件・権限マトリクスのテスト網羅確認）
- [ ] **AC-2対応**: 互換性チェック concern のカバー率が 80% 以上である（semver/schema/依存バージョン制約のテスト網羅確認）
- [ ] **AC-3対応**: 公開判定ロジック concern のカバー率が 80% 以上であり、Task06/07 との契約境界が全て YES である
- [ ] **AC-4対応**: Skill Center フロー concern と配布操作 concern のカバー率がそれぞれ 80% 以上である
- [ ] Phase 5 で確定した 5 つの型（SkillPublishingMetadata/CompatibilityCheckResult/PublishReadiness/SafetyGateResult/ObservabilityMetrics）の全フィールドについてカバー率が記録されており、各型 80% 以上である
- [ ] カバレッジ確認コマンド（grep による計測）を実行し、その結果がカバレッジマトリクスの数値と一致していること
- [ ] Phase 6 への差し戻し判定（戻る/戻らない）が明示的に記録されている
- [ ] 02-code-quality.md 禁止表現（条件・基準が不明確な修飾語）が 0 件である

## タスク100%実行確認【必須】

| #   | 確認項目                                   | 確認方法                                                       | 合否基準                                               |
| --- | ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | 4 つの成果物ファイルが存在する             | `ls outputs/phase-7/` で 4 ファイルを確認                      | 4 ファイル全て存在する                                 |
| 2   | カバレッジマトリクスが 5 concern を含む    | `coverage-matrix.md` の行数（ヘッダ除く）が 5 以上であるか確認 | 5 行以上存在する                                       |
| 3   | 型カバレッジが 5 型を含む                  | `type-coverage.md` に 5 型全ての行が存在するか確認             | 5 型全ての行が存在する                                 |
| 4   | Phase 6 差し戻し判定が明示されている       | `uncovered-areas.md` の最終行に判定結果が記載されているか確認  | 「Phase 6 戻り」または「Phase 8 進行」が明記されている |
| 5   | 依存エッジカバレッジが Task05/06/07 を含む | `dependency-edge-coverage.md` に 3 タスクの行が存在するか確認  | 3 タスク全ての行が存在する                             |

---

## 多角的チェック観点（AIが判断）

- カバレッジマトリクスが Phase 2 の設計対象トポロジー（5 concern）と1対1で対応しているか
- 型定義カバレッジが Phase 5 で確定した全型の全フィールドを対象にしているか
- 依存エッジカバレッジが Task05/06/07 の契約境界を全て含んでいるか
- Phase 6 への差し戻し判定基準が明確か（カバー率80%未満 = 差し戻し）
- 未検証箇所リストが具体的なテストケースの追加方針を含んでいるか

---

## サブタスク管理

| #   | タスク名                                       | ステータス | 完了基準                                  |
| --- | ---------------------------------------------- | ---------- | ----------------------------------------- |
| 1   | concern x テストケースマッピングマトリクス作成 | 完了       | 5 concern 全てのカバー率が数値で記録      |
| 2   | 依存エッジカバレッジ確認                       | 完了       | Task05/06/07 の全契約境界が YES/NO で判定 |
| 3   | 型定義カバレッジ確認                           | 完了       | 5型の全フィールドのカバー率が記録         |
| 4   | 未検証箇所リスト作成とカバレッジ判定           | 完了       | Phase 6 差し戻し判定が明示                |

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む（カバレッジ充足の場合）。不足の場合は Phase 6 へ戻る

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（concern x テストケースマッピングマトリクス作成）: （結果を記録）
- タスク2（依存エッジカバレッジ確認）: （結果を記録）
- タスク3（型定義カバレッジ確認）: （結果を記録）
- タスク4（未検証箇所リスト作成とカバレッジ判定）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

### カバレッジ充足の場合

Phase 8（リファクタリング）: `./phase-8-refactoring.md`

Phase 5 で確定した型定義・インターフェースの設計品質（命名統一性、型の粒度、拡張性）を評価し、Phase 8 リファクタリングで改善する。

### カバレッジ不足の場合

Phase 6（テスト拡充）に戻る: `./phase-6-test-expansion.md`

`uncovered-areas.md` に記載した追加テストケースのアウトラインを元に、`outputs/phase-6/` に追加テスト仕様ファイルを作成し、Phase 7 を再実施する。
