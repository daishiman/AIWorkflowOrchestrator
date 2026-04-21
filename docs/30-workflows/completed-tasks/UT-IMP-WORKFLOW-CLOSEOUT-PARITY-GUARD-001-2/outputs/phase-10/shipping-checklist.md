# Phase 10: 出荷準備チェックリスト

## タスク情報

- **タスクID**: UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001
- **作成日**: 2026-04-20
- **Phase 10 総合判定**: PASS

---

## Phase 11 進行可否チェックリスト

### 品質ゲート

| #     | チェック項目                          | 結果 | 証跡                             |
| ----- | ------------------------------------- | ---- | -------------------------------- |
| QG-01 | 全テスト42件PASS                      | PASS | Phase 9 9-1: 42/42 PASS          |
| QG-02 | validator read-only確認               | PASS | Phase 9 9-2: write API使用なし   |
| QG-03 | mirror parity差分0（3ファイル）       | PASS | Phase 9 9-3: 全diff OK           |
| QG-04 | dogfooding PARITY_OK（Phase 9完了後） | PASS | Phase 9 9-4: exit=0, drift 0件   |
| QG-05 | dogfooding PARITY_OK（Phase 10最終）  | PASS | Phase 10 10-2: exit=0, drift 0件 |

### AC達成確認

| #     | AC                               | 達成状況     | Phase 11での確認要否 |
| ----- | -------------------------------- | ------------ | -------------------- |
| AC-01 | AC-1: validator exit code契約    | PASS         | 手動テストで再確認   |
| AC-02 | AC-2: drift レポート構造化出力   | PASS         | 手動テストで再確認   |
| AC-03 | AC-3: verify-all-specs.js 組込み | PASS         | 手動テストで再確認   |
| AC-04 | AC-4: complete-phase.js 同値更新 | PASS         | 手動テストで再確認   |
| AC-05 | AC-5: checklist 反映             | PASS         | 目視確認             |
| AC-06 | AC-6: 両skill教訓還流            | 条件付きPASS | Phase 12で実施       |
| AC-07 | AC-7: 遡及修正なし               | PASS         | 手動テストで再確認   |

**Phase 11 進行可否: PROCEED（進行可）**

---

## Phase 12 への引継事項

### 必須対応事項

#### T-01: AC-6 両skill教訓還流（最重要）

- **内容**: `task-specification-creator` と `aiworkflow-requirements` の両skillに本guardの知見を還流する
- **具体的な作業**:
  - `task-specification-creator` の SKILL.md / LOGS / reference に `validate-closeout-parity` の使い方を追記
  - `aiworkflow-requirements` の reference に parity guard の仕組みを追記
  - `lessons-learned-current-2026-04.md` に `L-CLOSEOUT-PARITY-001` を採番・記録
  - `.agents/` ミラーを同期
- **成果物**: `outputs/phase-12/skill-feedback-report.md`

#### T-02: Phase 12 completion checklist 実行

- **内容**: `phase-12-completion-checklist.md` の全項目を実行し、PARITY_OKを得ること
- **具体的な作業**:
  - `validate-closeout-parity.js --workflow <本ワークフロー>` を実行
  - PARITY_OK を確認してから完了処理を行う
  - bypass（`--skip-parity-check`等）は厳禁

#### T-03: implementation-guide 作成

- **内容**: 本タスクで実装した仕組みの利用ガイドを作成する
- **対象読者**: 他ワークフローでparity guardを活用する開発者
- **成果物**: `outputs/phase-12/implementation-guide.md`

#### T-04: system-spec更新サマリー作成

- **内容**: 本タスクで変更した設計仕様の変更サマリーを記録する
- **成果物**: `outputs/phase-12/system-spec-update-summary.md`

### 参考情報

#### 実装ファイル（Phase 5で作成・Phase 8でリファクタリング済み）

| ファイル                                                                        | 説明                       |
| ------------------------------------------------------------------------------- | -------------------------- |
| `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` | parity validator本体       |
| `.claude/skills/task-specification-creator/scripts/complete-phase.js`           | S1〜S4同値更新スクリプト   |
| `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`         | parity validator組込み済み |

#### テストファイル

| ファイル                                               | テスト数 |
| ------------------------------------------------------ | -------- |
| `__tests__/validate-closeout-parity.test.js`           | 20       |
| `__tests__/complete-phase.parity.test.js`              | 10       |
| `__tests__/verify-all-specs.parity.test.js`            | 7        |
| `__tests__/checklist-gate.parity.test.js`              | 3        |
| `__tests__/no-retroactive-modification.parity.test.js` | 2        |

#### 関連ドキュメント

| ドキュメント         | 場所                                          |
| -------------------- | --------------------------------------------- |
| 要件定義書           | `outputs/phase-1/requirements.md`             |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`      |
| drift baseline       | `outputs/phase-1/drift-inventory.md`          |
| 設計書（parity算法） | `outputs/phase-2/parity-algorithm-design.md`  |
| トレーサビリティ     | `outputs/phase-7/traceability-matrix.md`      |
| 品質保証レポート     | `outputs/phase-9/quality-assurance-report.md` |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     |

---

## 注意事項

1. Phase 11（手動テスト）では実際にvalidatorを対話的に実行し、AC-1〜AC-5、AC-7を目視確認すること
2. Phase 12でAC-6を完了させることがこのタスクの最後の未達ACを解消する唯一の手順
3. `.agents/`ミラーとの同期は常に維持すること（Phase 12の作業でも同様）
4. `--no-verify`オプションやparity bypass用フラグは一切使用禁止
