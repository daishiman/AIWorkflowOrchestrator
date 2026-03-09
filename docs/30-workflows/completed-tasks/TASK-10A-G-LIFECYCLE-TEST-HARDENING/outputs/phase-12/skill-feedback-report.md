# スキルフィードバックレポート - TASK-10A-G

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | TASK-10A-G |
| Phase    | 12         |
| 記録日   | 2026-03-09 |

---

## 1. テンプレート改善

### 1-1: Phase 4 テスト仕様書のテストケースID命名規則の明示

- **現状**: テストケースIDの命名形式（TC-Gxx-nnn）は Phase 1 要件定義で NFR-G02-3 として定義したが、Phase 4 テスト仕様書テンプレートには命名規則の具体例が含まれていなかった
- **改善案**: Phase 4 テンプレートに「テストケースID命名規則」セクションを追加し、`TC-{タスク略称}{2桁連番}-{3桁通番}` の形式を明示する
- **影響度**: 低（今回は Phase 1 で定義済みだったため問題なし）

### 1-2: Phase 7 カバレッジレポートの「対象範囲」と「ファイル全体」の区別テンプレート化

- **現状**: skillHandlers.ts のように大規模ファイルの一部のみをスコープとする場合、「対象範囲のカバレッジ」と「ファイル全体のカバレッジ」の2つを報告する必要がある。Phase 7 テンプレートにはこの区別が明記されていなかった
- **改善案**: Phase 7 テンプレートに「スコープ限定カバレッジ」セクションを追加し、対象範囲（行番号）、対象範囲カバレッジ、ファイル全体カバレッジの3項目を必須化する
- **影響度**: 高（TASK-10A-G では `96.9/88.9/100` を feature 全体値と誤読しやすかった）

### 1-3: 成果物命名ドリフトの確認

- **確認結果**: 全 Phase の成果物ファイル名が仕様書の定義と一致していることを確認。命名ドリフトなし
  - phase-1/requirements-summary.md
  - phase-2/design-summary.md
  - phase-3/design-review-result.md
  - phase-4/test-red-result.md
  - phase-5/test-green-result.md
  - phase-6/test-expansion-result.md
  - phase-7/coverage-report.md
  - phase-8/refactoring-report.md
  - phase-9/quality-report.md
  - phase-10/final-review-report.md
  - phase-11/manual-test-result.md

---

## 2. ワークフロー改善

### 2-1: テスト専用タスクにおける Phase 5 と Phase 4 の境界明確化

- **現状**: テスト専用タスク（プロダクションコード変更なし）では Phase 4（テスト作成 = Red）と Phase 5（実装 = Green）の区別が曖昧になりやすい。テストが最初から Green になる可能性がある
- **改善案**: テスト専用タスクでは Phase 4 を「テスト設計・スケルトン作成（Red 確認はスキップ可）」、Phase 5 を「テスト実装・Green 確認」として再定義するガイドラインを追加する
- **影響度**: 中（テスト専用タスクの Phase 4/5 で混乱が発生しうる）

### 2-2: validate-phase-output / verify-all-specs での機械検知追加余地

- **確認結果**: 以下の観点を機械検知に追加できる可能性がある
  1. **テストケースID形式チェック**: テストファイル内の `it(` / `test(` 記述から TC-xxx-nnn 形式のIDが付与されているか検証
  2. **planned wording 検知**: `実行予定` `後続タスクで実施` `並列エージェントにて実行予定` を Phase 12 成果物で警告
  3. **カバレッジスコープ明示**: `coverage-report.md` に `対象範囲` と `ファイル全体` の両表があるか検証
  4. **Phase 12 チェックリスト完全性**: documentation-changelog.md の全 Step にチェックマークが付いているか検証
- **影響度**: 低（現状は手動確認で対応可能）

---

## 3. 仕様抽出導線

### 3-1: testing-component-patterns.md への到達経路

- **経路**: `aiworkflow-requirements/references/testing-component-patterns.md` は topic-map.md のセクション「テストコンポーネントパターン」から直接到達可能
- **評価**: 迷いなく到達できた。セクション17（TASK-10A-G planning guide）が Phase 2 設計時の主要参照先として機能した

### 3-2: arch-state-management.md への到達経路

- **経路**: Store 駆動ライフサイクルの設計には `arch-state-management.md` の skillSlice セクションを参照した
- **評価**: topic-map.md から到達可能だが、「スキルライフサイクル」というキーワードでは直接ヒットしない。keywords.json にエントリがあることで補完された

### 3-3: 既知の落とし穴（06-known-pitfalls.md）への到達経路

- **経路**: P9, P31, P39, P40, P41, P42, P48 の各 Pitfall は `.claude/rules/06-known-pitfalls.md` で直接参照
- **評価**: Phase 1 要件定義で必要な Pitfall を網羅的に特定でき、テスト設計に反映できた。導線に問題なし

### 3-4: screenshot script の並列実行制約

- **経路**: `apps/desktop/scripts/capture-*.mjs` を直接利用
- **評価**: 代表UI撮影自体はできたが、複数 script が固定ポート `5173` を共有しており、完全並列実行で競合した
- **改善案**: `--port` 指定を共通化するか、Phase 11 ガイドで「capture script は直列実行」を canonical rule として明記する

---

## 4. 総合評価

| 観点             | 評価         | 備考                                                                |
| ---------------- | ------------ | ------------------------------------------------------------------- |
| テンプレート品質 | 良好         | 命名ドリフトなし。Phase 7 テンプレートに改善余地あり（1-2）         |
| ワークフロー効率 | 良好         | テスト専用タスクの Phase 4/5 境界に改善余地あり（2-1）              |
| 仕様抽出導線     | 良好         | topic-map.md + keywords.json の組み合わせで目的の仕様に到達可能     |
| 機械検知の充実度 | 改善余地あり | planned wording / coverage scope / screenshot port 競合の検知が有用 |
