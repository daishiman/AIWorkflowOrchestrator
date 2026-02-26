# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                                                 |
| --------- | ------------------------------------------------------------------ |
| Phase     | 1                                                                  |
| タスクID  | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                         |
| 機能名    | ut-imp-skill-validation-gate-alignment-001                         |
| 名称      | 要件定義                                                           |
| 目的      | 検証ゲート整合化の機能要件・非機能要件を抽出し、受入基準を定義する |
| 前提Phase | なし（初回Phase）                                                  |
| 次Phase   | Phase 2（設計）                                                    |
| 作成日    | 2026-02-26                                                         |
| GitHub    | #910                                                               |

## 目的

`quick_validate` 検証経路と warning 運用に関する要件を抽出し、受け入れ基準を定義する。

具体的には、`quick_validate.js`（repo配下）と `quick_validate.py`（.codex配下）で実行経路・判定粒度が異なる現状を整理し、「同じ入力なら同じ判定」が再現できる統一要件を定義する。あわせて、Error と Warning の運用ルールを明文化し、Phase 12 検証時の判断コストを削減する。

## 実行タスク

- 現状分析: `quick_validate.js` と `quick_validate.py` の差分を棚卸しする
- 要件抽出: 検証経路統一と warning 運用に関する機能要件・非機能要件を抽出する
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義する
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定する
- warning 分類表の作成: `aiworkflow-requirements` の warning カテゴリを整理する
- 要件定義書の作成: 全成果物を取りまとめる

## 参照資料

| 資料名               | パス                                                                                | 説明                       |
| -------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| 未タスク指示書       | `docs/30-workflows/completed-tasks/task-imp-skill-validation-gate-alignment-001.md` | 元のタスク定義             |
| タスクインデックス   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/index.md`             | タスク全体の背景・スコープ |
| quick_validate.js    | `.claude/skills/skill-creator/scripts/quick_validate.js`                            | 検証コマンド正本（JS版）   |
| quick_validate.py    | `/Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py`           | .codex配下の検証スクリプト |
| spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | Phase 12 検証コマンド運用  |
| phase-11-12-guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`         | Step 1-G / 1-G-4 連携      |
| スキル構造検証仕様   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`  | スキル構造の検証基準       |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`              | 親タスクの苦戦箇所参照     |
| タスク管理台帳       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | 残課題の登録先             |

## 実行手順

### Task 1: 現状分析（quick_validate .js / .py 差分）

1. `quick_validate.js`（repo配下）を実行し、出力を保存する:

   ```bash
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements > /tmp/js-validate-aiworkflow.txt 2>&1
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator > /tmp/js-validate-taskspec.txt 2>&1
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator > /tmp/js-validate-skillcreator.txt 2>&1
   ```

2. `quick_validate.py`（.codex配下）を実行し、出力を保存する:

   ```bash
   python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements --verbose > /tmp/py-validate-aiworkflow.txt 2>&1
   python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator --verbose > /tmp/py-validate-taskspec.txt 2>&1
   python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/skill-creator --verbose > /tmp/py-validate-skillcreator.txt 2>&1
   ```

3. 両スクリプトの出力を比較し、以下の4軸で差異を記録する:
   - **検証項目の差異**: `.js` にあって `.py` にない項目、またはその逆
   - **判定粒度の差異**: 同じ検証項目でも Error / Warning の閾値が異なるか
   - **出力フォーマットの差異**: 出力形式（テキスト / JSON / 終了コード）の違い
   - **実行環境の差異**: Node.js / Python ランタイム要件の違い

4. `aiworkflow-requirements` で発生している warning の種類と件数を分類する:
   - description 未記入警告
   - references リンク切れ警告
   - 構造不備警告
   - その他のカテゴリ

5. `spec-update-workflow.md` の Step 1-G セクションを確認し、現在記載されている検証コマンドが `.py` / `.js` のどちらを指定しているか記録する

6. `phase-11-12-guide.md` の検証関連セクションを確認し、`.py` / `.js` のどちらを指定しているか記録する

### Task 2: 機能要件（FR）の定義

以下の機能要件を要件定義書に記載する:

| FR-ID  | 要件                                                                                         | 優先度 |
| ------ | -------------------------------------------------------------------------------------------- | ------ |
| FR-001 | Phase 12 の検証コマンドとして `quick_validate.js`（repo配下）を正規経路（primary）に指定する | 高     |
| FR-002 | `quick_validate.py`（.codex配下）を補助経路（fallback）として位置付け、使用条件を限定する    | 高     |
| FR-003 | `spec-update-workflow.md` の Step 1-G 検証コマンドを正規経路に統一する                       | 高     |
| FR-004 | `phase-11-12-guide.md` の検証コマンド参照を正規経路に統一する                                | 中     |
| FR-005 | Warning を3段階（許容 / 要監視 / 要対応）に分類するルールを定義する                          | 高     |
| FR-006 | 検証結果の判定基準を「Error 0件で合格、Warning は分類に基づき対応」と明文化する              | 高     |
| FR-007 | `aiworkflow-requirements` の参照リンク Warning に対する運用ルール（許容条件）を定義する      | 中     |

### Task 3: 非機能要件（NFR）の定義

以下の非機能要件を要件定義書に記載する:

| NFR-ID  | 要件                                                                                           | 優先度 |
| ------- | ---------------------------------------------------------------------------------------------- | ------ |
| NFR-001 | 再現性: 同一入力に対して同一の検証結果を出力する（実行環境・タイミングに依存しない）           | 高     |
| NFR-002 | 可読性: 検証結果の出力で Error / Warning / Pass が一目で識別できる                             | 中     |
| NFR-003 | 保守性: 検証ルールの追加・変更が `quick_validate.js` の1ファイルで完結する                     | 中     |
| NFR-004 | 実行速度: 全3スキルの検証が合計30秒以内に完了する                                              | 中     |
| NFR-005 | 後方互換: 既存の `quick_validate.js` の Error 判定を変更しない（Warning の再分類のみ許容する） | 高     |

### Task 4: 受け入れ基準の作成

各要件に対して以下の形式で受け入れ基準を作成する:

| AC-ID  | 受け入れ基準                                                                               | 検証方法                                                                    |
| ------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| AC-001 | `spec-update-workflow.md` の検証コマンドが全て `quick_validate.js` を指定している          | `grep -c "quick_validate.py" spec-update-workflow.md` が 0 を返す           |
| AC-002 | `phase-11-12-guide.md` の検証コマンドが全て `quick_validate.js` を指定している             | `grep -c "quick_validate.py" phase-11-12-guide.md` が 0 を返す              |
| AC-003 | Warning 3段階分類ルールが文書化されている                                                  | `spec-update-workflow.md` に「許容 / 要監視 / 要対応」セクションが存在する  |
| AC-004 | `quick_validate.js` を3スキルに対して実行し、Error 0件で終了する                           | 終了コード 0（SUCCESS）を返す                                               |
| AC-005 | `aiworkflow-requirements` の参照リンク Warning に対する許容条件が明記されている            | `spec-update-workflow.md` に対象 Warning パターンと許容理由が記載されている |
| AC-006 | 同一スキルに `.js` と `.py` を実行した際、Error 判定が一致する（Warning の差異は許容する） | Task 1 の比較結果で Error 項目の一致率 100%                                 |

### Task 5: FR/NFR分類と優先度設定

| 優先度 | 要件                                              | 理由                 |
| ------ | ------------------------------------------------- | -------------------- |
| 高     | FR-001, FR-002, FR-005, FR-006, NFR-001, NFR-005  | タスクの主目的に直結 |
| 中     | FR-003, FR-004, FR-007, NFR-002, NFR-003, NFR-004 | 運用品質の向上       |

### Task 6: warning 分類表の作成

`aiworkflow-requirements` の warning を以下のカテゴリに分類する:

| カテゴリ                  | 分類基準                                                   | 対応方針                         |
| ------------------------- | ---------------------------------------------------------- | -------------------------------- |
| description 未記入警告    | SKILL.md の必須フィールドが未記入                          | 「要対応」— 本Phase内で修正      |
| references リンク切れ警告 | references/ 内のファイルが SKILL.md からリンクされていない | 件数に応じて「許容」or「要監視」 |
| 構造不備警告              | 必須ディレクトリ・ファイルが存在しない                     | 「要対応」— 構造修正が必要       |
| その他                    | 上記に該当しない警告                                       | 個別判断で分類                   |

### Task 7: 要件定義書の作成

1. `outputs/phase-1/requirements-definition.md` を作成する
2. 以下の構成で記載する:
   - 現状調査結果（Task 1 の結果サマリ）
   - 機能要件テーブル（Task 2）
   - 非機能要件テーブル（Task 3）
   - 受入基準テーブル（Task 4）
   - 優先度分類（Task 5）
   - warning 分類表（Task 6）
   - スコープ外の明示（index.md の「含まないもの」を転記）

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                                           |
| ---------------- | ---------------------------------------------------------------------------------- |
| スクリプト実行   | `quick_validate.js` が `node` で正常実行できること                                 |
| ファイルアクセス | 検証対象スキルの `SKILL.md`、`references/` が読み取り可能であること                |
| 出力解釈         | 検証結果のテキスト出力が設計どおりのフォーマットであること                         |
| Phase 間連携     | Phase 2 の設計が全 FR / NFR を網羅しているか、トレーサビリティマトリクスで確認する |
| テストカバレッジ | Phase 4 のテストケースが全 AC をカバーしているか確認する                           |

## 多角的チェック観点

| 観点           | 適用判断 | 理由                                                       |
| -------------- | -------- | ---------------------------------------------------------- |
| セキュリティ   | 非該当   | 検証スクリプトは読み取り専用であり、書き込み操作を行わない |
| UI/UX          | 非該当   | ユーザー向けUIの変更を含まない                             |
| アーキテクチャ | 該当     | 検証経路の統一はスキル基盤のアーキテクチャ決定に相当する   |
| API設計        | 非該当   | IPC / REST API の変更を含まない                            |
| IPC通信        | 非該当   | Main-Renderer間通信の変更を含まない                        |
| 仕様書品質     | 該当     | 仕様書の検証手順自体が改善対象である                       |
| テスト戦略     | 該当     | 検証スクリプトに対するテスト設計が必要                     |
| 運用保守性     | 該当     | Phase 12 検証の判断コスト削減が主目的である                |

## アーキテクチャ層別要件

本タスクはスキル運用の改善であり、Electron アプリの層構造に直接関与しない。ただし、以下の層で間接的な影響がある:

| 層                 | 確認観点                                                 |
| ------------------ | -------------------------------------------------------- |
| スキルスクリプト層 | `quick_validate.js` の入出力仕様、判定ロジック           |
| 仕様書管理層       | `spec-update-workflow.md`、`phase-11-12-guide.md` の更新 |
| 運用ガイド層       | Phase 12 テンプレートへの統合                            |

## 成果物

| 成果物           | パス                                                                                                      | 説明                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 要件定義書       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/requirements-definition.md` | FR / NFR / AC / 現状調査結果を含む要件定義の完成版 |
| 検証経路差分メモ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/validation-path-diff.md`    | .js / .py の4軸差分分析                            |
| warning分類表    | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/warning-classification.md`  | warning カテゴリ分類結果                           |
| 受け入れ基準     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/acceptance-criteria.md`     | AC定義                                             |
| スコープ定義     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/scope-definition.md`        | 実装範囲                                           |

## 完了条件

- [ ] `quick_validate.js` と `.py` の差分が4軸（検証項目/判定粒度/出力形式/実行環境）で整理されている
- [ ] warning が「許容/要監視/要対応」の3カテゴリに分類されている
- [ ] 全要件（FR-001〜007, NFR-001〜005）が抽出されている
- [ ] 各要件に受け入れ基準（AC-001〜006）がある
- [ ] FR/NFRが分類され優先度が設定されている
- [ ] 第三者が差分と分類を同一手順で再確認し、同一結論に到達できる記録になっている
- [ ] スコープ外が明示されている（全 warning の即時ゼロ化、全面再編、無関係スキルの変更）
- [ ] `requirements-definition.md` が `outputs/phase-1/` に作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（spec-update-workflow.md, phase-11-12-guide.md, quick_validate.js の内容把握）
2. 現状分析（quick_validate .js / .py 差分 — 4軸比較）
3. warning 分類表の作成（aiworkflow-requirements の warning カテゴリ整理）
4. 機能要件（FR）の定義
5. 非機能要件（NFR）の定義
6. 受け入れ基準（AC）の作成
7. FR/NFR 分類と優先度設定
8. 成果物の作成・配置（requirements-definition.md 他）
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜7）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json の Phase 1 ステータスが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-skill-validation-gate-alignment-001 --phase 1
```

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）に進む。
