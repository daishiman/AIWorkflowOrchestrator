# Phase 2: 設計

## メタ情報

| 項目      | 値                                                                      |
| --------- | ----------------------------------------------------------------------- |
| Phase     | 2                                                                       |
| タスクID  | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                              |
| 機能名    | ut-imp-skill-validation-gate-alignment-001                              |
| 名称      | 設計                                                                    |
| 目的      | 検証経路統一方針と Warning 運用ルールのアーキテクチャ・反映先を設計する |
| 前提Phase | Phase 1（要件定義）完了                                                 |
| 次Phase   | Phase 3（設計レビューゲート）                                           |
| 作成日    | 2026-02-26                                                              |
| GitHub    | #910                                                                    |

## 目的

検証経路と warning 運用の統一方針を設計する。

Phase 1 で定義した FR / NFR / AC に基づき、正規経路と補助経路の使い分け、Warning 3段階分類の具体ルール、および仕様書への反映設計を行う。`quick_validate.js` の大規模 reference スキル向け改善案も設計対象に含める。

## 実行タスク

- 検証経路の階層設計: primary（`.js`）/ fallback（`.py`）の使い分けルールを策定する
- warning 運用方針設計: Error/Warning の分離基準とアクションを定義する
- Phase 12 統合設計: `spec-update-workflow.md` と `phase-11-12-guide.md` への反映方法を設計する
- `quick_validate.js` 改善案設計: `references/` が50ファイル以上のスキルを対象に改善案を設計する
- トレーサビリティマトリクス作成: 設計項目と FR/NFR の対応関係を明文化する
- 設計書の作成: 全設計内容を取りまとめる

## 参照資料

| 資料名               | パス                                                                                                      | 説明                         |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義書   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/requirements-definition.md` | FR / NFR / AC                |
| 検証経路差分メモ     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/validation-path-diff.md`    | .js / .py 差分分析           |
| warning分類表        | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/warning-classification.md`  | warning カテゴリ分類結果     |
| タスクインデックス   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/index.md`                                   | タスク全体の背景・スコープ   |
| quick_validate.js    | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                  | 検証スクリプト正本           |
| spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                            | Phase 12 検証コマンド運用    |
| phase-11-12-guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                               | Phase 11/12 ガイド           |
| スキル構造検証仕様   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`                        | スキル構造の検証基準         |
| スキル更新プロセス   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`                         | `quick_validate.js` 正規運用 |
| 実装パターン仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`               | Phase 12 準拠確認チェーン    |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                    | 過去の苦戦箇所と対策         |
| タスク管理台帳       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                      | 残課題の登録先               |

## 実行手順

### Task 1: 検証経路の階層設計

1. 以下の2経路の役割と優先順位を設計する:

   | 経路     | スクリプト                                                                                               | 優先度  | 使用条件                                         |
   | -------- | -------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
   | primary  | `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-path>`                               | 第1優先 | 通常の Phase 12 検証で使用する                   |
   | fallback | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path> --verbose` | 第2優先 | `.js` 実行環境が利用不可の場合に限定して使用する |

2. 正規経路の統一コマンドフォーマットを定義する:

   ```bash
   # 正規経路: quick_validate.js（全3スキルを順次実行）
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
   ```

3. fallback 使用条件を限定する:
   - Node.js ランタイムが利用不可の場合のみ
   - `python3` コマンドが存在し、Python 3.10 以上がインストールされている場合のみ
   - fallback 使用時は「fallback 経路を使用した」旨を Phase 12 成果物に明記する

4. 経路選択フローチャートを設計する:

   ```
   Phase 12 検証開始
     ├─ Node.js (node) が利用可能か？
     │   ├─ YES → primary 経路を使用
     │   └─ NO → fallback 条件チェック
     │       ├─ python3 が利用可能か？
     │       │   ├─ YES → fallback 経路を使用（成果物に明記）
     │       │   └─ NO → 検証スキップ（理由を記録）
   ```

### Task 2: Warning 3段階分類ルールの詳細設計

1. Warning を以下の3段階に分類する:

   | 分類   | 定義                                                                   | 対応方針                                   | 具体例                                                              |
   | ------ | ---------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
   | 許容   | 運用上避けられない Warning で、修正コストが高く機能影響がない          | 件数を記録し、増加傾向がないことを確認する | `aiworkflow-requirements` の大量 reference ファイルの参照リンク警告 |
   | 要監視 | 新規に発生した Warning で、放置すると品質低下の兆候となる              | 次回 Phase 12 までに対応方針を決定する     | 新規追加した reference ファイルが SKILL.md からリンクされていない   |
   | 要対応 | 機能やスキル構造の正確性に影響する Warning で、本Phase内での修正が必要 | 本Phase（または直後のPhase）内で修正する   | agents/\*.md の必須セクション不足、name とディレクトリ名の不一致    |

2. 分類の判定フローを設計する:

   ```
   Warning 発生
     ├─ Phase 5 以前から存在する既知 Warning か？
     │   ├─ YES → 「許容」に分類（件数のみ記録）
     │   └─ NO → 新規 Warning として次へ
     │
     ├─ 機能やスキル構造の正確性に影響するか？
     │   ├─ YES → 「要対応」に分類（本Phase内で修正）
     │   └─ NO → 「要監視」に分類（次回までに対応方針決定）
   ```

3. `aiworkflow-requirements` 固有の許容条件を設計する:
   - `references/` 配下のファイル数が50以上のスキルでは、全ファイルを SKILL.md からリンクすることが実運用上困難である
   - 許容条件: `references/` 内のファイルのうち、SKILL.md の「Trigger」「Anchors」「references セクション」のいずれかからリンクされていないファイルについて、`resource-map.md` または `topic-map.md` からリンクされていれば「許容」とする
   - 許容条件に該当しない未リンクファイルは「要監視」に分類する

4. Warning 運用ルールのフォーマットを設計する:

   | 項目         | 記載内容                           |
   | ------------ | ---------------------------------- |
   | 検証日       | 検証実行日（YYYY-MM-DD 形式）      |
   | 対象スキル   | 検証対象のスキルパス               |
   | Error 件数   | 0件でなければ不合格                |
   | Warning 合計 | 全 Warning の合計件数              |
   | 許容         | 件数と代表的なパターン             |
   | 要監視       | 件数と各 Warning の詳細            |
   | 要対応       | 件数と各 Warning の詳細 + 対応予定 |
   | 前回比       | 前回検証との差分（増減件数）       |

### Task 3: `spec-update-workflow.md` への反映設計

1. 変更対象セクションを特定する:
   - **Step 1-G（検証コマンド）**: `quick_validate.py` 参照を `quick_validate.js` に置換する
   - **検証コマンド実行手順**: 正規経路のコマンドフォーマットに統一する
   - **新規追加セクション**: Warning 運用ルール（3段階分類テーブル + 判定フロー）

2. 変更前後の差分を設計書に記載する（Before / After 形式）:

   **Before（Step 1-G 検証コマンド）:**

   ```bash
   python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
     .claude/skills/aiworkflow-requirements --verbose
   ```

   **After（Step 1-G 検証コマンド）:**

   ```bash
   node .claude/skills/skill-creator/scripts/quick_validate.js \
     .claude/skills/aiworkflow-requirements
   ```

3. Warning 運用ルールの挿入位置を決定する:
   - Step 1-G の検証コマンド直後に「検証結果の判定基準」サブセクションとして挿入する
   - 判定基準の内容: Error 0件で合格、Warning は3段階分類に基づき対応

### Task 4: `phase-11-12-guide.md` への反映設計

1. 変更対象セクションを特定する:
   - Phase 12 手順内のスキル検証コマンド参照を `quick_validate.js` に置換する
   - 検証結果の読み方ガイド（Error / Warning の識別方法）を追加する

2. `spec-update-workflow.md` との重複を回避する設計:
   - `phase-11-12-guide.md` にはコマンド実行方法と結果の読み方を記載する
   - Warning 分類の詳細ルールは `spec-update-workflow.md` への参照リンクとする
   - 重複記述のパターン: コマンド全文は `spec-update-workflow.md` に集約し、`phase-11-12-guide.md` では「`spec-update-workflow.md` Step 1-G を参照」と記載する

### Task 5: `quick_validate.js` 改善案設計（大規模 reference スキル向け）

1. 現状の課題を整理する:
   - `aiworkflow-requirements` は `references/` 配下に50ファイル以上を持つ
   - 全ファイルに対して SKILL.md からのリンクチェックを行うと、大量の Warning が発生する
   - 実際の異常（Error）が Warning の海に埋もれて識別困難になる

2. 改善案を設計する（実装は Phase 5 で判断）:

   | 改善案             | 内容                                                                          | メリット                       | デメリット                          |
   | ------------------ | ----------------------------------------------------------------------------- | ------------------------------ | ----------------------------------- |
   | A: 要約表示        | Warning を種別ごとにグループ化し、「参照リンク警告: N件」のように要約表示する | 出力の可読性が大幅に向上する   | 個別の Warning 特定に追加操作が必要 |
   | B: --strict モード | デフォルトで Warning を抑制し、`--strict` オプションで全件表示する            | 通常実行時のノイズがゼロになる | オプション追加の実装コスト          |
   | C: 除外設定        | `.skillvalidaterc` 等の設定ファイルで許容 Warning パターンを指定する          | スキルごとのカスタマイズが可能 | 設定ファイルの管理コスト            |

3. 推奨案を決定する:
   - **推奨: 案A（要約表示）** -- 実装コストが低く、全スキルに統一適用できるため
   - Phase 5 で実装可否を判断し、実装が本タスクのスコープを超える場合は未タスク化する

### Task 6: トレーサビリティマトリクス作成

設計項目と FR/NFR の対応関係を以下のマトリクスで整理する:

| 設計項目                       | FR-001 | FR-002 | FR-003 | FR-004 | FR-005 | FR-006 | FR-007 | NFR-001 | NFR-002 | NFR-003 | NFR-004 | NFR-005 |
| ------------------------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------- | ------- | ------- | ------- | ------- |
| 検証経路 primary/fallback 定義 | x      | x      |        |        |        |        |        | x       |         |         |         |         |
| 正規コマンドフォーマット       | x      |        | x      | x      |        |        |        |         |         |         |         |         |
| Warning 3段階分類ルール        |        |        |        |        | x      | x      | x      |         | x       |         |         | x       |
| spec-update-workflow 変更設計  |        |        | x      |        | x      | x      |        |         |         |         |         |         |
| phase-11-12-guide 変更設計     |        |        |        | x      |        |        |        |         |         |         |         |         |
| quick_validate.js 改善案       |        |        |        |        |        |        | x      |         | x       | x       | x       |         |

### Task 7: 設計書の作成

1. `outputs/phase-2/design-document.md` を作成する
2. 以下の構成で記載する:
   - 検証経路優先順位テーブル（Task 1）
   - Warning 3段階分類ルール + 判定フロー（Task 2）
   - `spec-update-workflow.md` 変更設計（Task 3 -- Before/After 差分）
   - `phase-11-12-guide.md` 変更設計（Task 4 -- 重複回避方針）
   - `quick_validate.js` 改善設計（Task 5 -- 推奨案の根拠）
   - FR / NFR トレーサビリティマトリクス（Task 6）

## 統合テスト連携

| 接続要件カテゴリ   | 記載内容                                                                               |
| ------------------ | -------------------------------------------------------------------------------------- |
| FR カバレッジ      | 設計書のトレーサビリティマトリクスで全 FR-001〜FR-007 がカバーされていることを確認する |
| AC 充足            | Warning 3段階分類ルールが AC-003 / AC-005 を満たす設計になっていることを確認する       |
| コマンド実行可能性 | 設計した検証コマンド列がスクリプト実行で再現できる設計になっていること                 |
| テストケース導出   | Phase 4 のテストケース設計時に、各設計項目からテスト可能な検証ポイントを導出する       |

## 多角的チェック観点

| 観点           | 適用判断 | 理由                                                                 |
| -------------- | -------- | -------------------------------------------------------------------- |
| セキュリティ   | 非該当   | 検証スクリプトは読み取り専用であり、認証・認可の変更を含まない       |
| UI/UX          | 非該当   | ユーザー向けUIの変更を含まない                                       |
| アーキテクチャ | 該当     | primary / fallback の2経路アーキテクチャを設計している               |
| API設計        | 非該当   | IPC / REST API の変更を含まない                                      |
| IPC通信        | 非該当   | Main-Renderer間通信の変更を含まない                                  |
| 仕様書品質     | 該当     | `spec-update-workflow.md` と `phase-11-12-guide.md` の変更設計を含む |
| テスト戦略     | 該当     | Warning 分類ルールのテスト可能性を設計段階で検証する必要がある       |
| 運用保守性     | 該当     | Warning 分類の判定フローが運用者にとって再現可能か確認する必要がある |

## 成果物

| 成果物                   | パス                                                                                                         | 説明                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 設計書                   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/design-document.md`            | 経路優先順位・Warning分類・仕様書変更設計・トレーサビリティマトリクス |
| 検証経路統一方針         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/validation-policy-design.md`   | primary/fallback の使い分けルール                                     |
| warning運用ルール設計    | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/warning-operation-rules.md`    | Warning 3段階分類の詳細設計                                           |
| Phase 12統合設計         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/phase12-integration-design.md` | spec-update-workflow / phase-11-12-guide への反映設計                 |
| quick_validate改善案設計 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/quick-validate-improvement.md` | 大規模 reference スキル向け改善案（任意）                             |

## 完了条件

- [ ] 正規経路（primary: `.js`）と補助経路（fallback: `.py`）の使い分け条件が定義されている
- [ ] 経路選択フローチャートが設計されている
- [ ] Warning 3段階分類（許容 / 要監視 / 要対応）の定義・具体例・判定フローが記載されている
- [ ] `aiworkflow-requirements` 固有の許容条件（大量 reference に対する緩和ルール）が設計されている
- [ ] Warning 運用ルールの記録フォーマットが設計されている
- [ ] `spec-update-workflow.md` の変更箇所と Before/After 差分が設計書に記載されている
- [ ] `phase-11-12-guide.md` の変更箇所と重複回避方針が設計書に記載されている
- [ ] `quick_validate.js` 改善案（要約表示 / strict モード / 除外設定）の比較と推奨案が記載されている
- [ ] FR / NFR トレーサビリティマトリクスで全 FR / NFR がカバーされている
- [ ] 設計内容が Phase 1 要件（FR-001〜007, NFR-001〜005）と整合している
- [ ] `design-document.md` が `outputs/phase-2/` に作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1 成果物の確認（requirements-definition.md, validation-path-diff.md, warning-classification.md）
2. 検証経路の階層設計（primary/fallback 定義 + フローチャート）
3. Warning 3段階分類ルールの詳細設計（分類定義 + 判定フロー + 許容条件）
4. `spec-update-workflow.md` への反映設計（Before/After 差分）
5. `phase-11-12-guide.md` への反映設計（重複回避方針）
6. `quick_validate.js` 改善案設計（3案比較 + 推奨案決定）
7. トレーサビリティマトリクス作成（設計項目 vs FR/NFR）
8. 設計書の作成・配置（design-document.md 他）
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜7）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json の Phase 2 ステータスが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-skill-validation-gate-alignment-001 --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート（`phase-3-design-review.md`）に進む。
