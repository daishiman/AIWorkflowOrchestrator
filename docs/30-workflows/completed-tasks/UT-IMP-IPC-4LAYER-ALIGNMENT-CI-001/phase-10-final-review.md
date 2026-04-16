# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 10                                 |
| Phase名    | 最終レビューゲート                 |
| 前提Phase  | Phase 9                            |
| 後続Phase  | Phase 11                           |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

Phase 1〜9 の全成果物が acceptance criteria（AC-1〜AC-8）を充足しているかを最終照合し、blocker の有無を判定する。PASS の場合は Phase 11 へ進行し、MAJOR/CRITICAL の場合は戻り先 Phase を確定して是正を行う。

## 背景

IPC 4層整合検証スクリプトの実装・テスト・品質保証が完了した Phase 9 時点で、要件定義（Phase 1）から品質保証（Phase 9）までの全成果物が一貫性を保っていることを確認する最終ゲートである。Phase 10 を通過しない限り、手動テスト（Phase 11）へ進行できない。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-10/` 配下の成果物へ記録する。

### タスク1: 受け入れ基準最終照合

**目的**: AC-1〜AC-8 の全項目が充足されていることを最終確認する

**実行手順**:

1. Phase 1 で定義した AC-1〜AC-8 の一覧を取得する
2. 各 AC に対する証拠（テスト結果、コード確認、CI定義確認）を収集する
3. 照合テーブルに判定結果（PASS/FAIL）と証拠を記録する

**受け入れ基準照合テーブル**:

| AC番号 | 基準                                                                | 確認方法                                 | 判定    |
| ------ | ------------------------------------------------------------------- | ---------------------------------------- | ------- |
| AC-1   | `scripts/verify-ipc-4layer.js` が存在し実行可能                     | `node scripts/verify-ipc-4layer.js` 実行 | pending |
| AC-2   | shared→preload 未登録チャネルを検出してエラー出力                   | ユニットテスト結果（Phase 7）            | pending |
| AC-3   | preload→main 未実装チャネルを検出してエラー出力                     | ユニットテスト結果（Phase 7）            | pending |
| AC-4   | renderer→shared 未定義チャネルを検出してエラー出力                  | ユニットテスト結果（Phase 7）            | pending |
| AC-5   | 全チャネル整合時に exit code 0 で正常終了                           | ユニットテスト結果 + 実行確認            | pending |
| AC-6   | 不整合時に exit code 1 で CI 失敗                                   | ユニットテスト結果 + 実行確認            | pending |
| AC-7   | GitHub Actions ワークフローに検証ステップが組み込まれている         | `.github/workflows/` 定義確認            | pending |
| AC-8   | `scripts/verify-ipc-4layer.js` のユニットテストが存在し全件パスする | `vitest run` 結果（Phase 9）             | pending |

**期待される成果物**:

- AC 検証記録（`outputs/phase-10/final-review-result.md` 内に含む）

---

### タスク2: Phase 横断成果物一貫性チェック

**目的**: Phase 1〜9 の成果物間に矛盾・欠損がないことを確認する

**実行手順**:

1. 各 Phase の主要成果物の存在を確認する
2. Phase 間の整合性（要件→設計→実装→テスト→品質）を検証する
3. MINOR 指摘（Phase 3、Phase 9）の追跡状況を確認する

**Phase 横断チェックテーブル**:

| Phase | 主な成果物                 | 一貫性確認項目                                          | 判定    |
| ----- | -------------------------- | ------------------------------------------------------- | ------- |
| 1     | requirements-definition.md | FR-1〜FR-6、NFR-1〜NFR-4 が設計・実装に反映されているか | pending |
| 2     | architecture-design.md     | モジュール構成が実装コードと一致しているか              | pending |
| 3     | gate-decision.md           | MINOR 指摘が追跡・解消されているか                      | pending |
| 4     | テスト仕様                 | テストケースが AC-1〜AC-8 をカバーしているか            | pending |
| 5     | verify-ipc-4layer.js       | 実装が設計どおりのモジュール構成であるか                | pending |
| 6     | 追加テスト                 | エッジケーステストが追加されているか                    | pending |
| 7     | カバレッジ結果             | カバレッジ目標が達成されているか                        | pending |
| 8     | リファクタリングログ       | 変更なし or Before/After 記録済みか                     | pending |
| 9     | quality-report.md          | 品質ゲート全項目 PASS か                                | pending |

**期待される成果物**:

- Phase 横断チェック結果（`outputs/phase-10/final-review-result.md` 内に含む）

---

### タスク3: コードレビュー観点チェック

**目的**: 検証スクリプトのコード品質を最終確認する

**実行手順**:

1. 正規表現パターンが4層の実際のコードパターンに一致していることを確認する
2. エラーメッセージが人間可読で十分な情報を含んでいることを確認する
3. Node.js 単体で実行可能（外部依存なし: NFR-2）であることを確認する
4. 実行時間が 30 秒以内（NFR-1）であることを確認する

**期待される成果物**:

- コードレビュー結果（`outputs/phase-10/final-review-result.md` 内に含む）

---

### タスク4: 総合判定と是正アクション計画

**目的**: PASS/MINOR/MAJOR/CRITICAL の判定を確定し、必要に応じて是正計画を策定する

**実行手順**:

1. タスク1〜3 の結果を集約する
2. レビュー結果判定テーブルに基づき総合判定を確定する
3. MINOR 以上の指摘がある場合は是正アクション計画を策定する
4. リリース準備チェックリストを作成する

**期待される成果物**:

- 最終レビュー結果（`outputs/phase-10/final-review-result.md`）
- 是正アクション計画（`outputs/phase-10/corrective-action-plan.md`）
- リリース準備チェックリスト（`outputs/phase-10/release-readiness-checklist.md`）

---

## レビュー結果判定テーブル

| 判定     | 条件                                                                   | 次のアクション                                |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| PASS     | AC-1〜AC-8 全充足 + Phase 横断チェック全 PASS + コードレビュー問題なし | Phase 11 へ進行                               |
| MINOR    | 軽微な指摘あり（機能に影響なし、Phase 12 で解消可能）                  | Phase 11 へ進行（MINOR 未タスク化を同時実施） |
| MAJOR    | AC 充足不足 or 設計・実装上の重大問題あり                              | 戻り先決定基準に従い該当 Phase へ戻る         |
| CRITICAL | 要件の再定義が必要な致命的問題あり                                     | Phase 1 へ戻りユーザー確認                    |

## 戻り先決定基準テーブル

| 問題の種類                       | 戻り先                | 説明                                                     |
| -------------------------------- | --------------------- | -------------------------------------------------------- |
| 要件の問題（FR/NFR/AC の欠陥）   | Phase 1（要件定義）   | 機能要件・非機能要件・受け入れ基準の修正が必要           |
| 設計の問題（アーキテクチャ欠陥） | Phase 2（設計）       | モジュール構成・検証アルゴリズム・CI統合設計の修正が必要 |
| テストの問題（カバレッジ不足）   | Phase 4（テスト作成） | テストケース追加・テストデータ修正が必要                 |
| 実装の問題（バグ・不具合）       | Phase 5（実装）       | 検証スクリプト・正規表現・レポーターの修正が必要         |
| 品質の問題（品質基準未達）       | Phase 8（リファクタ） | コード品質・パフォーマンス改善が必要                     |

---

## 参照資料

| 参照資料                   | パス                                               | 内容                                       |
| -------------------------- | -------------------------------------------------- | ------------------------------------------ |
| Phase 1 要件定義書         | `outputs/phase-1/requirements-definition.md`       | FR-1〜FR-6、NFR-1〜NFR-4                   |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`           | AC-1〜AC-8                                 |
| Phase 1 仕様マッピング     | `outputs/phase-1/spec-extraction-map.md`           | aiworkflow 仕様とcurrent code anchorの対応 |
| Phase 1 トレーサビリティ   | `outputs/phase-1/traceability-matrix.md`           | 要件-仕様対応表                            |
| Phase 1 既存資産棚卸し     | `outputs/phase-1/asset-inventory.md`               | 既存検証機能マッピング                     |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | モジュール構成                             |
| Phase 2 検証アルゴリズム   | `outputs/phase-2/validation-algorithm-design.md`   | 検証ロジック                               |
| Phase 2 CI統合設計         | `outputs/phase-2/ci-integration-design.md`         | GitHub Actions 統合                        |
| Phase 2 テスト戦略         | `outputs/phase-2/test-strategy.md`                 | テスト方針                                 |
| Phase 2 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 依存関係表                                 |
| Phase 3 設計レビュー結果   | `outputs/phase-3/design-review-result.md`          | レビュー記録                               |
| Phase 3 ゲート判定         | `outputs/phase-3/gate-decision.md`                 | Go/No-Go 判定                              |
| Phase 3 矛盾チェック表     | `outputs/phase-3/contradiction-checklist.md`       | 矛盾・漏れ検査結果                         |
| Phase 9 品質レポート       | `outputs/phase-9/quality-report.md`                | 品質ゲート結果                             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料    | パス                                                                                                                      | 内容                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| IPC命名監査 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン |
| IPC契約監査 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ |

---

## 成果物

| 成果物                     | パス                                              | 内容                                   |
| -------------------------- | ------------------------------------------------- | -------------------------------------- |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`         | AC 照合・Phase 横断チェック・総合判定  |
| 是正アクション計画         | `outputs/phase-10/corrective-action-plan.md`      | MINOR/MAJOR 指摘の是正タスク（該当時） |
| リリース準備チェックリスト | `outputs/phase-10/release-readiness-checklist.md` | Phase 11 進行前の最終確認リスト        |

---

## 統合テスト連携（Phase 1〜11は必須）

- AC 充足確認: AC-2〜AC-6 の検証はユニットテスト結果（Phase 7/9）を証拠として使用する
- CI 統合確認: AC-7 の検証は GitHub Actions ワークフロー定義ファイルの存在と構文を確認する
- 既存スクリプト共存: `check-ipc-contracts.ts` と `verify-ipc-4layer.js` が同一 CI パイプラインで共存動作することを確認する

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] AC-1〜AC-8 の全項目に対して PASS/FAIL 判定が記録されている
- [ ] Phase 1〜9 の横断チェックが全項目完了している
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が確定している
- [ ] MINOR 指摘がある場合は未タスク化が完了している
- [ ] MAJOR/CRITICAL の場合は戻り先と是正計画が確定している
- [ ] `outputs/phase-10/final-review-result.md` が作成済み
- [ ] `outputs/phase-10/corrective-action-plan.md` が作成済み
- [ ] `outputs/phase-10/release-readiness-checklist.md` が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む（PASS または MINOR の場合）、該当 Phase へ戻る（MAJOR/CRITICAL の場合）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- タスク1 受け入れ基準最終照合: {{result}}
- タスク2 Phase横断成果物一貫性チェック: {{result}}
- タスク3 コードレビュー観点チェック: {{result}}
- タスク4 総合判定と是正アクション計画: {{result}}

### 総合判定結果

- 判定: {{PASS/MINOR/MAJOR/CRITICAL}}
- 是正タスク: {{あり/なし}}
- 戻り先Phase: {{なし/Phase N}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-11-manual-test.md`

PASS または MINOR の場合のみ Phase 11 へ進行可能。MAJOR/CRITICAL の場合は戻り先決定基準テーブルに従い該当 Phase へ戻る。
