# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 3                                                          |
| Phase名    | 設計レビューゲート                                         |
| 前提Phase  | Phase 2（設計）                                            |
| 後続Phase  | Phase 4（テスト作成）                                      |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

Phase 2 で設計したフィクスチャ構造・検証スクリプト・テスト実行スキルが要件を満たし、skill-creator の出力仕様と整合していることをレビューする。PASS/FAIL 判定を行い、Phase 4 への進行可否を決定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャ構造整合性レビュー

**目的**: フィクスチャ設計が skill-creator の出力仕様と一致しているか検証する

**実行手順**:

1. `outputs/phase-02/fixture-design.md` を読む
2. 以下のチェックリストを検証する：

| チェック項目                                                                                            | 判定 |
| ------------------------------------------------------------------------------------------------------- | ---- |
| complete-skill が skill-creator の全出力ディレクトリ（agents/references/scripts/assets/schemas/）を含む |      |
| complete-skill/SKILL.md が skill-creator の skill-template.md フォーマットに準拠する                    |      |
| complete-skill/agents/\*.md が agent-definition.json スキーマに準拠する                                 |      |
| complete-skill/schemas/\*.json が JSON Schema Draft-07 に準拠する                                       |      |
| complete-skill/scripts/\*.js が EXIT_CODES パターンを含む                                               |      |
| minimal-skill が SKILL.md のみで妥当な構造である                                                        |      |
| partial-skill が agents/ のみ存在する部分構造として妥当である                                           |      |
| invalid-skill の YAML が意図的にパースエラーを起こす設計である                                          |      |
| orchestration-skill の YAML 設定が chain/parallel テンプレートに準拠する                                |      |

3. skill-creator の `validate_structure.js` のロジックと照合し、complete-skill が検証をパスする設計であることを確認する

**期待される成果物**:

- レビューチェックリスト結果

---

### タスク2: 検証スクリプト設計レビュー

**目的**: 検証スクリプトの設計が skill-creator 既存パターンに準拠しているか検証する

**実行手順**:

1. skill-creator の既存スクリプトパターンを確認する：
   - `scripts/utils.js`（共通ユーティリティ）
   - `scripts/validate_all.js`（統合検証）
   - `scripts/validate_structure.js`（構造検証）

2. 以下の設計準拠を確認する：

| 確認項目                                                       | 判定 |
| -------------------------------------------------------------- | ---- |
| utils パターン（EXIT_CODES, getArg, resolvePath）に準拠        |      |
| 各スクリプトの入出力が JSON 形式で統一されている               |      |
| エラーハンドリングが EXIT_CODES で管理されている               |      |
| run-all-validations.js が他スクリプトを child_process で呼出す |      |

**期待される成果物**:

- スクリプト設計レビュー結果

---

### タスク3: skill-fixture-runner 設計レビュー

**目的**: テスト実行スキルの設計が aiworkflow-requirements のスキル構造仕様に準拠しているか検証する

**実行手順**:

1. aiworkflow-requirements の `references/claude-code-skills-structure.md` を確認する
2. skill-fixture-runner の SKILL.md 設計がスキル構造仕様に準拠しているか確認する
3. Progressive Disclosure の設計が適切か確認する

**期待される成果物**:

- スキル設計レビュー結果

---

### タスク4: PASS/FAIL 判定

**目的**: 設計レビューの最終判定を行う

**実行手順**:

1. タスク1〜3 の結果を総合する
2. 以下の判定基準に基づき判定を決定する：

| 判定  | 条件                     | 対応                         |
| ----- | ------------------------ | ---------------------------- |
| PASS  | 全レビュー観点で問題なし | Phase 4（テスト作成）へ進行  |
| MINOR | 軽微な指摘あり           | 指摘対応後 Phase 4 へ進行    |
| MAJOR | 重大な問題あり           | 影響範囲に応じて戻り先を決定 |

3. MAJOR 判定時の戻り先決定基準：

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |
| 両方の問題 | Phase 1（要件定義） |

**期待される成果物**:

- PASS/FAIL 判定結果

---

## 参照資料

| 参照資料                     | パス                                                                                | 内容                         |
| ---------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計書               | `outputs/phase-02/fixture-design.md`                                                | フィクスチャ・スクリプト設計 |
| Phase 1 要件                 | `outputs/phase-01/requirements-definition.md`                                       | 要件定義                     |
| skill-creator 検証スクリプト | `.claude/skills/skill-creator/scripts/validate_structure.js`                        | 検証パターン参考             |
| スキル構造仕様               | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | スキル仕様                   |
| レビューゲート基準           | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`      | PASS/FAIL判定基準            |

---

## 成果物

| 成果物           | パス                                       | 内容         |
| ---------------- | ------------------------------------------ | ------------ |
| 設計レビュー結果 | `outputs/phase-03/design-review-result.md` | レビュー判定 |

---

## 統合テスト連携

**Phase 3 では統合テストの対象外**

レビューゲートのため、統合テストは対象外。

---

## 多角的チェック観点

| 観点               | 確認内容                                                             |
| ------------------ | -------------------------------------------------------------------- |
| 要件整合性         | 設計が Phase 1 の全要件を満たしているか                              |
| skill-creator 互換 | フィクスチャが skill-creator の出力仕様と完全に整合しているか        |
| スクリプト品質     | 検証スクリプトが既存パターンに準拠しているか                         |
| スキル仕様準拠     | skill-fixture-runner が aiworkflow-requirements 仕様に準拠しているか |

---

## 完了条件

- [ ] フィクスチャ構造整合性の全チェック項目が確認されている
- [ ] 検証スクリプト設計が skill-creator パターンに準拠している
- [ ] skill-fixture-runner がスキル構造仕様に準拠している
- [ ] PASS/MINOR/MAJOR 判定が記録されている
- [ ] PASS の場合: Phase 4 への進行が承認されている
- [ ] 設計レビュー結果が outputs/phase-03/ に配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-04-tests.md`
