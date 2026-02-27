# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001              |
| Phase        | 10                                                       |
| Phase名      | 最終レビューゲート                                       |
| 前提Phase    | Phase 9（品質保証）                                      |
| 後続Phase    | Phase 11（手動テスト検証）                               |
| ステータス   | 完了（2026-02-27）                                       |
| 作成日       | 2026-02-27                                               |
| 機能名       | ut-imp-quick-validate-empty-field-guard-001              |
| Issue        | #913                                                     |
| 対象ファイル | `.claude/skills/skill-creator/scripts/quick_validate.js` |

---

## 目的

Phase 1〜9 の全成果物を横断的にレビューし、要件充足・設計整合性・テスト網羅性・P42 準拠を最終検証する。
判定結果（PASS/MINOR/MAJOR/CRITICAL）に基づき、Phase 11 への進行可否を決定する。

## 背景

最終レビューゲートは開発フェーズ全体の品質を保証する最後のチェックポイントである。
本タスクは小規模バグ修正（P42 準拠 3 段バリデーション追加）であるが、レビュー観点の網羅性は省略しない。
MINOR 指摘が検出された場合は、05-task-execution.md の規定に従い**全て**未タスク仕様書に変換する（省略不可）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク 10-1: 要件トレーサビリティ確認

**目的**: Phase 1 で定義した全要件が実装・テストされていることを確認する

**実行手順**:

1. Phase 1 の要件定義（`outputs/phase-1/` 配下）を読み込む
2. 各要件に対応する実装箇所を特定する
3. 各要件に対応するテストケースを特定する
4. 未実装・未テストの要件があれば記録する

**トレーサビリティマトリクス**:

| 要件ID  | 要件内容                                                   | 実装箇所                      | テストケース         | 状態 |
| ------- | ---------------------------------------------------------- | ----------------------------- | -------------------- | ---- |
| REQ-001 | `name` が未定義の場合 `addError()` で報告する              | `validateSkill()` 140行目付近 | Phase 5/6 追加テスト | -    |
| REQ-002 | `name` が非文字列の場合 `addError()` で報告する            | `validateSkill()` 140行目付近 | Phase 5/6 追加テスト | -    |
| REQ-003 | `name` が空文字列の場合 `addError()` で報告する            | `validateSkill()` 140行目付近 | Phase 5/6 追加テスト | -    |
| REQ-004 | `name` がスペースのみの場合 `addError()` で報告する        | `validateSkill()` 140行目付近 | Phase 5/6 追加テスト | -    |
| REQ-005 | `description` が未定義の場合 `addError()` で報告する       | `validateSkill()` 158行目付近 | Phase 5/6 追加テスト | -    |
| REQ-006 | `description` が非文字列の場合 `addError()` で報告する     | `validateSkill()` 158行目付近 | Phase 5/6 追加テスト | -    |
| REQ-007 | `description` が空文字列の場合 `addError()` で報告する     | `validateSkill()` 158行目付近 | Phase 5/6 追加テスト | -    |
| REQ-008 | `description` がスペースのみの場合 `addError()` で報告する | `validateSkill()` 158行目付近 | Phase 5/6 追加テスト | -    |
| REQ-009 | 既存の正常なスキル検証が回帰しない                         | 全体                          | TC-RG-001〜TC-RG-007 | -    |
| REQ-010 | `.toLowerCase()` でランタイムエラーが発生しない            | `validateSkill()` 185行目     | Phase 5/6 追加テスト | -    |

**期待される成果物**:

- `outputs/phase-10/traceability-matrix.md`

---

### タスク 10-2: 設計整合性確認

**目的**: Phase 2 の設計と Phase 5/8 の実装が整合していることを確認する

**実行手順**:

1. Phase 2 の設計仕様（`outputs/phase-2/` 配下）を読み込む
2. `quick_validate.js` の実装と比較する
3. 差異がある場合はその理由と妥当性を記録する

**確認観点**:

| 観点                    | 確認内容                                                         | 結果 |
| ----------------------- | ---------------------------------------------------------------- | ---- |
| バリデーション順序      | typeof → 空文字列 → trim 空文字列 の 3 段階順序が設計通りか      | -    |
| エラーメッセージ形式    | 設計で定義したメッセージ形式が実装に反映されているか             | -    |
| 既存ロジックへの影響    | 既存の name/description 検証ロジックが設計通りに保持されているか | -    |
| ヘルパー関数（Phase 8） | Phase 8 で抽出したヘルパー関数が設計方針と整合しているか         | -    |

**期待される成果物**:

- `outputs/phase-10/design-implementation-alignment.md`

---

### タスク 10-3: P42 準拠検証

**目的**: 実装された 3 段バリデーションが P42（`.trim()` バリデーション漏れ防止）に完全準拠していることを確認する

**実行手順**:

1. `quick_validate.js` の name/description 検証コードを読み込む
2. 以下の P42 準拠チェックリストに基づき各項目を確認する
3. 非準拠箇所があれば MAJOR 判定とする

**P42 準拠チェックリスト**:

| チェック項目                                                        | name | description | 結果 |
| ------------------------------------------------------------------- | ---- | ----------- | ---- |
| 第 1 段: `typeof value === "string"` チェックがある                 | -    | -           | -    |
| 第 2 段: `value === ""` チェックがある（または falsy チェック）     | -    | -           | -    |
| 第 3 段: `value.trim() === ""` チェックがある                       | -    | -           | -    |
| 3 段チェックの順序が正しい（typeof → 空文字列 → trim）              | -    | -           | -    |
| 非文字列入力（数値、オブジェクト、配列、boolean）でクラッシュしない | -    | -           | -    |
| エラーメッセージが仕様どおりの文言で出力される                      | -    | -           | -    |

**判定基準**:

- 6 項目全て OK → PASS
- 1 項目でも NG → MAJOR（Phase 5 へ戻りバリデーション修正）

**期待される成果物**:

- `outputs/phase-10/p42-compliance-verification.md`

---

### タスク 10-4: テスト網羅性最終確認

**目的**: Phase 7 のカバレッジ結果を踏まえ、テストの網羅性を最終確認する

**実行手順**:

1. Phase 7 のカバレッジ確認結果（`outputs/phase-7/` 配下）を読み込む
2. 以下の観点でテスト網羅性を確認する
3. 不足があれば MINOR/MAJOR 判定の根拠とする

**確認観点**:

| 観点             | 確認内容                                           | 結果 |
| ---------------- | -------------------------------------------------- | ---- |
| 正常系カバレッジ | 有効な name/description での検証が通る             | -    |
| 異常系カバレッジ | 全ての不正入力パターンがテストされている           | -    |
| 境界値カバレッジ | 空文字列・スペースのみ・1 文字の各境界値テストあり | -    |
| リグレッション   | 既存テスト（TC-RG-\*）が全て PASS している         | -    |
| エッジケース     | BOM 付き UTF-8 等の特殊入力テストあり              | -    |

**テストカバレッジサマリー**:

| 指標              | 基準 | 実績 | 判定 |
| ----------------- | ---- | ---- | ---- |
| Line Coverage     | 80%  | -    | -    |
| Branch Coverage   | 60%  | -    | -    |
| Function Coverage | 80%  | -    | -    |

**期待される成果物**:

- `outputs/phase-10/test-coverage-summary.md`

---

### タスク 10-5: ドキュメント完全性確認

**目的**: Phase 1〜9 の必要な成果物が全て存在し、内容が最新であることを確認する

**実行手順**:

1. 各 Phase の成果物ディレクトリを確認する
2. 必須成果物の存在を確認する
3. 不足があれば記録する

**ドキュメントチェックリスト**:

| Phase | 成果物ディレクトリ | 必須ファイル数 | 存在 | 最新 |
| ----- | ------------------ | -------------- | ---- | ---- |
| 1     | `outputs/phase-1/` | -              | -    | -    |
| 2     | `outputs/phase-2/` | -              | -    | -    |
| 3     | `outputs/phase-3/` | -              | -    | -    |
| 4     | `outputs/phase-4/` | -              | -    | -    |
| 5     | `outputs/phase-5/` | -              | -    | -    |
| 6     | `outputs/phase-6/` | -              | -    | -    |
| 7     | `outputs/phase-7/` | -              | -    | -    |
| 8     | `outputs/phase-8/` | 4              | -    | -    |
| 9     | `outputs/phase-9/` | 5              | -    | -    |

**期待される成果物**:

- `outputs/phase-10/documentation-checklist.md`

---

### タスク 10-6: 最終判定

**目的**: タスク 10-1〜10-5 の結果を統合し、最終判定を決定する

**実行手順**:

1. タスク 10-1〜10-5 の結果を統合する
2. 検出された問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. MINOR の場合は未タスク仕様書に変換する（省略不可）

**判定基準**:

| 判定     | 条件                                       | 次のアクション                                  |
| -------- | ------------------------------------------ | ----------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                   | Phase 11 へ進行                                 |
| MINOR    | 軽微な指摘あり（機能影響なし）             | 全指摘を未タスク仕様書に変換後、Phase 11 へ進行 |
| MAJOR    | 重大な問題あり（P42 非準拠、テスト不足等） | 影響範囲に応じて Phase 5 または Phase 8 へ戻る  |
| CRITICAL | 致命的な問題あり（要件の根本的な誤り）     | Phase 1 へ戻りユーザーと要件を再確認            |

**MINOR 判定時の必須対応**（05-task-execution.md 準拠）:

1. 全ての MINOR 指摘を未タスク仕様書に変換する
2. `unassigned-task/` に指示書を作成する
3. `task-workflow.md` 残課題テーブルに登録する
4. 関連仕様書に参照リンクを追加する

**戻り先決定基準**:

| 問題の種類                      | 戻り先                |
| ------------------------------- | --------------------- |
| 要件の漏れ・誤り                | Phase 1（要件定義）   |
| 設計と実装の不整合              | Phase 2（設計）       |
| テスト設計の不足                | Phase 4（テスト作成） |
| P42 非準拠・実装バグ            | Phase 5（実装）       |
| コード品質問題（Lint エラー等） | Phase 8（リファクタ） |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料           | パス                                                                                                      | 内容           |
| ------------------ | --------------------------------------------------------------------------------------------------------- | -------------- |
| 対象ファイル       | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                  | 実装コード     |
| テストファイル     | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                   | テストコード   |
| Phase 1 要件定義   | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-1/`          | 要件成果物     |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-2/`          | 設計成果物     |
| Phase 5 実装       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-5-implementation.md` | 実装仕様       |
| Phase 7 カバレッジ | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-7/`          | カバレッジ結果 |
| Phase 9 品質ゲート | `outputs/phase-9/`                                                                                        | 品質結果       |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容                     |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| P42 準拠ルール            | `.claude/rules/06-known-pitfalls.md#P42`                                         | 3段バリデーション規約    |
| task-workflow-rules       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`       | レビュー判定・品質ゲート |
| quality-requirements      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`      | 品質基準・カバレッジ基準 |
| error-handling            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | Validation Error分類     |
| security-input-validation | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力検証要件             |
| development-guidelines    | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`    | 開発規約                 |

---

## 多角的チェック観点

| 観点               | 該当/非該当 | 判断理由                                         |
| ------------------ | ----------- | ------------------------------------------------ |
| セキュリティ       | **該当**    | P42 準拠（不正入力でのクラッシュ防止）の最終確認 |
| UI/UX              | 非該当      | CLI 出力のみ。Renderer/コンポーネント変更なし    |
| アーキテクチャ     | 非該当      | 単一ファイル修正。レイヤー変更なし               |
| API 設計           | 非該当      | IPC/REST API 変更なし                            |
| データ整合性       | 非該当      | DB/ストア変更なし                                |
| エラーハンドリング | **該当**    | エラーメッセージの一貫性・適切性の最終確認       |
| パフォーマンス     | 非該当      | 小規模修正のため計測不要                         |
| アクセシビリティ   | 非該当      | UI 実装なし                                      |
| テスタビリティ     | **該当**    | テスト網羅性・カバレッジ基準達成の最終確認       |

---

## 成果物

| 成果物                     | パス                                                  | 内容                       |
| -------------------------- | ----------------------------------------------------- | -------------------------- |
| トレーサビリティマトリクス | `outputs/phase-10/traceability-matrix.md`             | 要件追跡結果               |
| 設計整合性確認             | `outputs/phase-10/design-implementation-alignment.md` | 設計 vs 実装の照合         |
| P42 準拠検証               | `outputs/phase-10/p42-compliance-verification.md`     | 3 段バリデーション準拠確認 |
| テストカバレッジサマリー   | `outputs/phase-10/test-coverage-summary.md`           | カバレッジ最終確認         |
| ドキュメントチェックリスト | `outputs/phase-10/documentation-checklist.md`         | 成果物存在確認             |
| 最終判定結果               | `outputs/phase-10/final-review-result.md`             | PASS/MINOR/MAJOR 判定      |

---

## 統合テスト連携【必須】

> 最終レビューで統合テスト結果を確認する

| レビュー項目 | 確認内容                                                  |
| ------------ | --------------------------------------------------------- |
| 全テスト結果 | ユニットテスト・統合テスト・リグレッションテスト全て PASS |
| カバレッジ   | Line 80%+、Branch 60%+、Function 80%+ を達成              |
| P42 準拠     | 3 段バリデーションが name/description 両方に実装          |

---

## レビュー結果判定

### 判定フロー

```
タスク 10-1〜10-5 の結果を集約
  ↓
問題を重要度別に分類
  ↓
┌─ 問題なし → PASS → Phase 11 へ
├─ 軽微な指摘のみ → MINOR → 未タスク変換後 Phase 11 へ
├─ 重大な問題あり → MAJOR → Phase 5 or 8 へ戻る
└─ 致命的な問題 → CRITICAL → Phase 1 へ戻る
```

---

## 完了条件

- [ ] トレーサビリティマトリクスで全要件（REQ-001〜REQ-010）がカバーされている
- [ ] 設計と実装が整合している
- [ ] P42 準拠チェックリスト全項目 OK
- [ ] テストカバレッジ目標を達成している
- [ ] Phase 1〜9 の必要なドキュメントが全て揃っている
- [ ] 最終判定が PASS または MINOR である

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスク（6 タスク）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物（6 ファイル）が全て生成されていることを確認
- [ ] 判定結果が PASS/MINOR であることを確認
- [ ] MINOR 判定の場合、全指摘が未タスク仕様書に変換されていることを確認

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-11-manual-test.md`
