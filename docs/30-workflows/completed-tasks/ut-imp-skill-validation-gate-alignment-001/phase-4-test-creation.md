# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目               | 内容                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                                              |
| Phase              | 4 / 13                                                                                                  |
| Phase名称          | テスト作成（TDD: Red）                                                                                  |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）                            |
| 作成日             | 2026-02-26                                                                                              |
| GitHub Issue       | #910                                                                                                    |
| 前提Phase          | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビューゲート: PASS）                               |
| 目的               | Phase 5 の実装に先行して、検証スクリプトの動作確認テストと warning 分類ロジックのテストを設計・作成する |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/`                         |

## 目的

本タスクは運用改善タスクであるため、「テスト」は検証スクリプトの動作確認テストとして実施する。`quick_validate.js` の検証ロジックに対して TDD Red フェーズのテストを作成し、Phase 5 で実装する検証経路統一ルール・warning 分類機能の受入基準をテストケースとして定義する。

## 実行タスク

- **Task 4-1**: テストシナリオ設計 -- 統一された検証コマンドの期待動作をテストケースとして定義する
- **Task 4-2**: 検証スクリプトテスト -- `quick_validate.js` 単体の正常系・異常系テストケース設計
- **Task 4-3**: 運用フローテスト -- Phase 12 検証手順の実行可能性テスト設計
- **Task 4-4**: warning 分類テスト -- warning 出力が設計どおりに分類されるかのテスト設計
- **Task 4-5**: テスト仕様書・テストケース一覧の文書化

## 参照資料

| 参照資料           | パス                                                                                   | 内容                                             |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Phase 1 成果物     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/`        | 要件定義・受入基準                               |
| Phase 2 成果物     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/`        | 統一方針設計・warning 分類基準                   |
| Phase 3 成果物     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-3/`        | 設計レビュー結果                                 |
| Phase 1 要件定義書 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-1-requirements.md` | FR-001〜FR-007, NFR-001〜NFR-005, AC-001〜AC-006 |
| Phase 2 設計書     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-2-design.md`       | 経路優先順位・Warning 3段階分類設計              |
| quick_validate.js  | `.claude/skills/skill-creator/scripts/quick_validate.js`                               | 検証スクリプト正本（テスト対象）                 |
| utils.js           | `.claude/skills/skill-creator/scripts/utils.js`                                        | 共通ユーティリティ（依存モジュール）             |
| スキル構造検証仕様 | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`     | スキル構造の検証基準                             |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                     | TDD原則・カバレッジ基準                          |
| 元の未タスク指示書 | `docs/30-workflows/completed-tasks/task-imp-skill-validation-gate-alignment-001.md`    | タスク背景・スコープ                             |

## 実行手順

### Task 4-1: テストシナリオ設計

1. Phase 1 の要件（FR-001〜FR-007, NFR-001〜NFR-005）から検証シナリオを導出する:

   | シナリオID | 要件    | シナリオ                                                  | 期待結果                                    |
   | ---------- | ------- | --------------------------------------------------------- | ------------------------------------------- |
   | TS-001     | FR-001  | `spec-update-workflow.md` の検証コマンドが `.js` を指定   | `quick_validate.py` への参照が0件           |
   | TS-002     | FR-002  | `.py` の使用条件が fallback 限定として記載                | Node.js 不可時のみ `.py` を使用する旨が明記 |
   | TS-003     | FR-003  | Step 1-G の検証コマンドが正規経路に統一                   | `quick_validate.js` のコマンドのみ記載      |
   | TS-004     | FR-004  | `phase-11-12-guide.md` の参照が正規経路に統一             | `quick_validate.py` への参照が0件           |
   | TS-005     | FR-005  | Warning が3段階（許容/要監視/要対応）に分類される         | 分類ルールが文書化されている                |
   | TS-006     | FR-006  | 検証結果判定基準が明文化                                  | Error 0件で合格と明記                       |
   | TS-007     | FR-007  | `aiworkflow-requirements` の参照リンク Warning の許容条件 | 許容条件と理由が記載                        |
   | TS-008     | NFR-001 | 同一入力に対して同一結果                                  | 2回実行して出力が一致                       |
   | TS-009     | NFR-002 | Error / Warning / Pass が出力で一目で識別可能             | 各 severity が区別できるフォーマット        |
   | TS-010     | NFR-004 | 全3スキルの検証が合計30秒以内                             | 実行時間 < 30秒                             |
   | TS-011     | NFR-005 | 既存の Error 判定が変更されていない                       | 既存 Error パターンの判定結果が変わらない   |

2. 受入基準（AC-001〜AC-006）に対するテストシナリオを追加する:

   | シナリオID | AC     | シナリオ                                     | 検証方法                                   |
   | ---------- | ------ | -------------------------------------------- | ------------------------------------------ |
   | TS-AC-001  | AC-001 | `spec-update-workflow.md` に `.py` 参照が0件 | `grep -c "quick_validate.py"` が 0 を返す  |
   | TS-AC-002  | AC-002 | `phase-11-12-guide.md` に `.py` 参照が0件    | `grep -c "quick_validate.py"` が 0 を返す  |
   | TS-AC-003  | AC-003 | Warning 3段階分類ルールが文書化              | 「許容/要監視/要対応」セクションの存在確認 |
   | TS-AC-004  | AC-004 | 3スキルに `.js` 実行して Error 0件           | 終了コード 0（SUCCESS）                    |
   | TS-AC-005  | AC-005 | 参照リンク Warning の許容条件が明記          | 対象 Warning パターンと許容理由の記載確認  |
   | TS-AC-006  | AC-006 | `.js` と `.py` で Error 判定が一致           | Error 項目の一致率 100%                    |

### Task 4-2: 検証スクリプトテスト（`quick_validate.js` 単体）

1. `quick_validate.js` の `validateSkill()` 関数が検証する8項目を列挙し、各項目に正常系テストを作成する:
   - (1) SKILL.md の存在確認
   - (2) 行数制限（500行以内）
   - (3) YAML frontmatter の有効性
   - (4) name フィールド（ハイフンケース、最大64文字）
   - (5) description フィールド（1024文字以内、角括弧禁止）
   - (6) description 内の Anchors / Trigger 存在確認
   - (7) 不要な補助ドキュメント（README.md 等）の除外確認
   - (8) references/ ファイルの SKILL.md リンク確認

2. 正常入力テストケース:
   - `quick_validate.js` を正常スキルに対して実行した場合 → Error 0件

3. 異常入力テストケース:

   | テストID | 検証項目            | 異常入力                                             | 期待結果    |
   | -------- | ------------------- | ---------------------------------------------------- | ----------- |
   | TC-E-001 | SKILL.md 存在       | SKILL.md が存在しないディレクトリ                    | Error 1件   |
   | TC-E-002 | 行数制限            | 501行の SKILL.md                                     | Error 1件   |
   | TC-E-003 | YAML frontmatter    | frontmatter なし（`---` で囲まれたブロックなし）     | Error 1件   |
   | TC-E-004 | name 長さ           | 65文字の name                                        | Error 1件   |
   | TC-E-005 | name 形式           | `MySkill`（キャメルケース）                          | Error 1件   |
   | TC-E-006 | name 不一致         | name がディレクトリ名と異なる                        | Warning 1件 |
   | TC-E-007 | description 長さ    | 1025文字の description                               | Error 1件   |
   | TC-E-008 | description 角括弧  | `<script>` を含む description                        | Error 1件   |
   | TC-E-009 | Anchors 未記載      | Anchors も箇条書き記号も含まない description         | Warning 1件 |
   | TC-E-010 | Trigger 未記載      | Trigger も `use when` も含まない description         | Warning 1件 |
   | TC-E-011 | 補助ドキュメント    | README.md が存在するスキル                           | Error 1件   |
   | TC-E-012 | references 未リンク | references/ にファイルがあるが SKILL.md にリンクなし | Warning 1件 |

4. 境界値テストケース:

   | テストID | 検証項目         | 境界値入力               | 期待結果 |
   | -------- | ---------------- | ------------------------ | -------- |
   | TC-B-001 | 行数制限         | ちょうど500行の SKILL.md | パス     |
   | TC-B-002 | name 長さ        | ちょうど64文字の name    | パス     |
   | TC-B-003 | description 長さ | ちょうど1024文字         | パス     |

5. `quick_validate.js` を意図的に壊したスキルに対して実行 → 期待エラー検出の確認

6. テストファイルを `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js` に配置する

7. テスト用フィクスチャ（模擬スキルディレクトリ）を `__tests__/fixtures/` 配下に作成する:
   - `valid-skill/` -- 全検証項目をパスする正常なスキルディレクトリ
   - `no-skill-md/` -- SKILL.md なし
   - `over-limit/` -- 501行 SKILL.md
   - `no-frontmatter/` -- frontmatter なし SKILL.md
   - `invalid-name/` -- 不正な name
   - `forbidden-files/` -- README.md が存在
   - `unlinked-refs/` -- references/ にリンクされていないファイル
   - `boundary-500-lines/` -- ちょうど500行
   - `boundary-64-name/` -- ちょうど64文字 name
   - `boundary-1024-desc/` -- ちょうど1024文字 description

### Task 4-3: 運用フローテスト設計

1. Phase 12 テンプレートのコマンド列をそのまま実行して完走するかのテスト:

   | テストID  | テスト名                     | 実行内容                                                   | 期待結果                  |
   | --------- | ---------------------------- | ---------------------------------------------------------- | ------------------------- |
   | TC-OP-001 | 正規経路コマンド完走         | 正規経路の3スキル連続実行コマンドをそのまま実行する        | 全コマンドが正常終了する  |
   | TC-OP-002 | 検証結果の解釈一意性         | 検証結果出力を手順書の判定基準で分類し、判定が一意に決まる | 曖昧な判定が0件           |
   | TC-OP-003 | fallback 経路の動作確認      | `.py` スクリプトが存在し、Python 3.10+ で実行可能          | fallback が正常終了する   |
   | TC-OP-004 | Error / Warning の識別可能性 | 出力を目視で確認し、Error と Warning が視覚的に区別できる  | severity が一目で識別可能 |

2. 検証結果の解釈が手順書で一意に決定できるかの確認テスト:
   - Warning が発生した場合に「許容/要監視/要対応」のいずれに分類されるかが手順書で一意に判定できる

### Task 4-4: warning 分類テスト設計

1. Phase 2 で設計した warning 3段階分類基準に基づくテストを作成する:

   | テストID  | 分類カテゴリ      | 判定条件（入力例）                                           | 期待分類         |
   | --------- | ----------------- | ------------------------------------------------------------ | ---------------- |
   | TC-WC-001 | Error（即時対応） | SKILL.md 不在、name 形式不正、description 角括弧含有         | `error`          |
   | TC-WC-002 | Warning-要対応    | name とディレクトリ名の不一致                                | `warning-action` |
   | TC-WC-003 | Warning-許容      | references/ の未リンクファイル（大規模スキルで既知のノイズ） | `warning-known`  |
   | TC-WC-004 | Warning-許容      | Anchors / Trigger 記載漏れの可能性（代替表現で記載あり）     | `warning-known`  |

2. warning 出力が severity レベルで分類されているか確認するテスト:
   - `errors.length`, `warnings.length`, `passed.length` の集計が正確であること

3. warning 0件のスキル（クリーン状態）のテスト:
   - `valid-skill/` に対する実行で warning 0件を確認

4. warning 100件超のスキル（`aiworkflow-requirements` レベル）のテスト:
   - 大量の references/ を持つスキルに対する実行で出力が破綻しないことを確認

5. `.js` のみ存在、`.py` のみ存在、両方存在の経路テスト:
   - 実行環境の可用性に応じた経路選択が正しいことを確認

### Task 4-5: テスト仕様書の文書化

1. `outputs/phase-4/test-specification.md` を作成する -- テスト設計方針・テストアーキテクチャ・フィクスチャ構成を記載

2. `outputs/phase-4/test-cases.md` を作成する -- 全テストケースを以下のテーブル形式で列挙:

   | テストID | テスト名 | 入力条件 | 期待結果 | カテゴリ | 対応する要件/検証項目 |
   | -------- | -------- | -------- | -------- | -------- | --------------------- |

3. `outputs/phase-4/validation-script-test-design.md` を作成する -- 検証スクリプト固有のテスト設計

4. テストケース総数を正確にカウントして記載する

## 統合テスト連携【必須】

- Phase 4 で作成するテストは `quick_validate.js` の `validateSkill()` 関数レベルの単体テストが中心
- 統合テスト（複数スキルディレクトリに対する一括検証 + 運用フロー確認）は Phase 6 で追加する
- テストフィクスチャは Phase 6 でも再利用するため、`__tests__/fixtures/` に集約配置する
- スクリプト実行テスト + 出力解釈テストを組み合わせた統合シナリオを定義する

## 多角的チェック観点（AIが判断）

| 観点                  | 適用 | 確認内容                                                                |
| --------------------- | ---- | ----------------------------------------------------------------------- |
| セキュリティ          | ○    | テストフィクスチャにパストラバーサル攻撃パターンを含めない              |
| テスト設計            | ○    | 各テストケースが独立して実行可能（テスト間で状態を共有しない: P9 対策） |
| テスト環境            | ○    | Node.js ESM 環境でテストが実行可能であることを確認                      |
| 境界値                | ○    | 500行/64文字/1024文字の境界値を必ずテスト                               |
| コード品質            | ○    | テストコード自体が Lint・Prettier のルールに準拠                        |
| 要件トレーサビリティ  | ○    | 全 FR/NFR/AC に対してテストケースが存在することを確認                   |
| UI/UX                 | --   | 本Phase はテストコード作成のため UI/UX は対象外                         |
| アーキテクチャ        | --   | テスト配置は既存の `__tests__/` 規約に従う                              |
| Electron セキュリティ | --   | 本タスクは Electron IPC を含まない                                      |

## 成果物

| 成果物                   | パス                                                                                                            | 説明                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| テスト仕様書             | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/test-specification.md`            | テスト設計方針・アーキテクチャ・フィクスチャ |
| テストケース一覧         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/test-cases.md`                    | 全テストケースのテーブル                     |
| 検証スクリプトテスト設計 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/validation-script-test-design.md` | 検証スクリプト固有のテスト設計               |
| テストコード             | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                         | Vitest テストファイル                        |
| テストフィクスチャ       | `.claude/skills/skill-creator/scripts/__tests__/fixtures/`                                                      | 模擬スキルディレクトリ群                     |

## 完了条件

- [ ] `quick_validate.test.js` が作成されている
- [ ] 正常系テストが8検証項目すべてに対して存在する（Task 4-2）
- [ ] 異常系テストが12パターン以上存在する（Task 4-2 テーブルの全行）
- [ ] 境界値テストが3パターン存在する（500行/64文字/1024文字）
- [ ] 運用フローテストが4パターン存在する（Task 4-3）
- [ ] warning 分類テストが4カテゴリ分存在する（Task 4-4）
- [ ] テストフィクスチャが `__tests__/fixtures/` に10ディレクトリ以上配置されている
- [ ] `outputs/phase-4/test-specification.md` が作成されている
- [ ] `outputs/phase-4/test-cases.md` が作成され、全テストケースが列挙されている
- [ ] `outputs/phase-4/validation-script-test-design.md` が作成されている
- [ ] テストを実行すると全件 **FAIL** する（TDD Red: 実装前のため）
- [ ] `artifacts.json` の Phase 4 ステータスが `completed` に更新されている

## サブタスク管理

| サブタスク | 内容                 | 状態   | 成果物                                |
| ---------- | -------------------- | ------ | ------------------------------------- |
| Task 4-1   | テストシナリオ設計   | 未着手 | テストシナリオテーブル                |
| Task 4-2   | 検証スクリプトテスト | 未着手 | テストコード + フィクスチャ           |
| Task 4-3   | 運用フローテスト     | 未着手 | 運用フローテスト設計                  |
| Task 4-4   | warning 分類テスト   | 未着手 | warning 分類テストケース              |
| Task 4-5   | テスト仕様書文書化   | 未着手 | test-specification.md + test-cases.md |

## タスク100%実行確認【必須】

- [ ] 全タスク（4-1, 4-2, 4-3, 4-4, 4-5）が100%実行完了
- [ ] 各成果物（テストコード、フィクスチャ、仕様書3件）が生成されている
- [ ] `artifacts.json` が更新されている

## 次のPhase

Phase 5: 実装（TDD: Green）-- テストをパスさせるための実装（検証経路統一ルール・warning 運用ルールの文書化）を行う。
