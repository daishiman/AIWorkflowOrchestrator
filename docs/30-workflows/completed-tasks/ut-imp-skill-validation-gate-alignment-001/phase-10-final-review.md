# Phase 10: 最終レビューゲート

## メタ情報

| 項目               | 内容                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                       |
| Phase              | 10 / 13                                                                          |
| Phase名称          | 最終レビューゲート                                                               |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）     |
| 作成日             | 2026-02-26                                                                       |
| GitHub Issue       | #910                                                                             |
| 前提Phase          | Phase 9（品質保証）完了                                                          |
| 目的               | 実装完了後、全体的な品質・整合性を検証する                                       |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/` |

## 目的

Phase 1-9 の全成果物を対象に、要件充足・設計整合性・実装品質・運用適合性の多角的観点でレビューを行い、PASS / MINOR / MAJOR / CRITICAL のゲート判定を下す。

## 判定基準

| 判定     | 条件                                     | 対応                                               |
| -------- | ---------------------------------------- | -------------------------------------------------- |
| PASS     | 全観点（7項目）で問題なし                | Phase 11 へ進行                                    |
| MINOR    | 軽微な指摘あり（機能影響なし）           | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（統一漏れ、ルール未定義） | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 致命的な問題あり（既存ワークフロー破壊） | Phase 1 へ戻りユーザーと要件を再確認               |

## 実行タスク

- **Task 10-1**: 要件充足度レビュー -- Phase 1 の全要件（FR-1~7, NFR-1~5）が実現されているか
- **Task 10-2**: 設計整合性レビュー -- Phase 2 設計と実装（Phase 5）の整合性
- **Task 10-3**: テスト網羅性レビュー -- Phase 4/6 テストケースの要件カバレッジ
- **Task 10-4**: 仕様書品質レビュー -- 曖昧表現なし、参照リンク有効
- **Task 10-5**: 運用再現性レビュー -- 検証手順を別のセッションで再現できるか
- **Task 10-6**: スコープ制御レビュー -- Warning ゼロ化に踏み込んでいないか
- **Task 10-7**: 既存フロー互換レビュー -- `spec-update-workflow` / `phase-11-12-guide` の既存機能を壊していないか

## 参照資料

| 参照資料                | パス                                                                                                      | 内容                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件定義        | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-1-requirements.md`                    | 受入基準の正本          |
| Phase 1 要件定義書      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-1/requirements-definition.md` | FR / NFR / AC           |
| Phase 2 設計            | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-2-design.md`                          | 設計方針の正本          |
| Phase 2 設計書          | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/design-document.md`         | 詳細設計                |
| Phase 4 テスト仕様      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/`                           | テストケース一覧        |
| Phase 5 実装成果物      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                           | 実装内容・運用ルール    |
| Phase 9 品質レポート    | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/quality-report.md`          | 品質検証の統合結果      |
| spec-update-workflow.md | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                            | 検証コマンド運用の正本  |
| phase-11-12-guide.md    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                               | Phase 11/12 ガイド      |
| 実装パターン仕様        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`               | Phase 12 再発防止観点   |
| 教訓集                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                    | 過去の苦戦箇所と対策    |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                               | 品質基準                |
| タスク実行ルール        | `.claude/rules/05-task-execution.md`                                                                      | Phase 12 チェックリスト |

## 実行手順

### Task 10-1: 要件充足度レビュー

**レビュー観点**: Phase 1 の全要件（FR-001~FR-007, NFR-001~NFR-005）が実現されているか

1. Phase 1 の要件定義書（`outputs/phase-1/requirements-definition.md`）を開く
2. 各機能要件について充足状況を確認する:

   | FR-ID  | 要件                                                    | 確認方法                                                                  |
   | ------ | ------------------------------------------------------- | ------------------------------------------------------------------------- |
   | FR-001 | `quick_validate.js` を正規経路に指定                    | `spec-update-workflow.md` の Step 1-G で `.js` が指定されていることを確認 |
   | FR-002 | `.py` を補助経路として限定                              | 使用条件が明記されていることを確認                                        |
   | FR-003 | `spec-update-workflow.md` の検証コマンド統一            | 全検証コマンドが `quick_validate.js` を参照していることを確認             |
   | FR-004 | `phase-11-12-guide.md` の検証コマンド統一               | 全検証コマンド参照が `quick_validate.js` であることを確認                 |
   | FR-005 | Warning 3段階分類ルールの定義                           | 許容 / 要監視 / 要対応の定義と具体例が記載されていることを確認            |
   | FR-006 | 判定基準の明文化                                        | 「Error 0件で合格」のルールが記載されていることを確認                     |
   | FR-007 | `aiworkflow-requirements` の参照リンク Warning 許容条件 | 許容条件が明記されていることを確認                                        |

3. 各非機能要件について充足状況を確認する:

   | NFR-ID  | 要件     | 確認方法                                                           |
   | ------- | -------- | ------------------------------------------------------------------ |
   | NFR-001 | 再現性   | 同一入力で同一結果が出ることを2回実行で検証                        |
   | NFR-002 | 可読性   | 出力で Error / Warning / Pass が一目で識別可能か視覚確認           |
   | NFR-003 | 保守性   | 検証ルールの変更が `quick_validate.js` の1ファイルで完結するか確認 |
   | NFR-004 | 実行速度 | 全3スキルの合計実行時間が30秒以内であることを計測                  |
   | NFR-005 | 後方互換 | 既存の Error 判定が変更されていないことを確認                      |

4. 未充足の要件がある場合:
   - 1項目でも未充足 → MAJOR（影響する Phase に戻る）

### Task 10-2: 設計整合性レビュー

**レビュー観点**: Phase 2 設計と実装（Phase 5）の整合性

1. Phase 2 設計書（`outputs/phase-2/design-document.md`）を開く
2. 以下の設計項目と実装の整合性を確認する:
   - 検証経路優先順位（primary / fallback）が設計通りに実装されているか
   - Warning 3段階分類の判定フローが設計通りに仕様書に反映されているか
   - `spec-update-workflow.md` の Before/After 差分が設計書の記載と一致しているか
   - `phase-11-12-guide.md` の重複回避方針が設計通りに適用されているか
3. 設計からの逸脱がある場合:
   - 意図的な逸脱 → 逸脱理由が文書化されていれば OK
   - 無断の逸脱 → MAJOR（Phase 2 に戻る）

### Task 10-3: テスト網羅性レビュー

**レビュー観点**: Phase 4/6 テストケースの要件カバレッジ

1. Phase 4 のテストケース一覧（`outputs/phase-4/test-cases.md`）を開く
2. 各受入基準（AC-001~AC-006）に対してテストケースが存在するか確認する:

   | AC-ID  | 受入基準                                    | テスト存在 |
   | ------ | ------------------------------------------- | ---------- |
   | AC-001 | `spec-update-workflow.md` の `.py` 参照 0件 | 確認       |
   | AC-002 | `phase-11-12-guide.md` の `.py` 参照 0件    | 確認       |
   | AC-003 | Warning 3段階分類ルールが文書化済み         | 確認       |
   | AC-004 | 全3スキルで Error 0件                       | 確認       |
   | AC-005 | 参照リンク Warning の許容条件が明記済み     | 確認       |
   | AC-006 | `.js` と `.py` の Error 判定一致            | 確認       |

3. テストカバレッジが不足している場合:
   - テスト数の過不足を記録する
   - 不足がある場合は MINOR（未タスク仕様書に変換して Phase 11 へ）

### Task 10-4: 仕様書品質レビュー

**レビュー観点**: 曖昧表現なし、参照リンク有効

1. 曖昧表現の最終検出を実行する:
   ```bash
   grep -rn "基準どおりに\|条件該当時に\|等\b\|状況を見て\|条件別に判断" \
     .claude/skills/task-specification-creator/references/spec-update-workflow.md \
     .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   ```
2. 検出結果が0件であることを確認する
3. 更新した仕様書内の全参照リンクが有効なパスを指していることを確認する
4. 曖昧表現が1件以上 → MINOR（未タスク仕様書に変換して Phase 11 へ）
5. 参照リンク切れが1件以上 → MINOR（未タスク仕様書に変換して Phase 11 へ）

### Task 10-5: 運用再現性レビュー

**レビュー観点**: 検証手順を別のセッションで再現できるか

1. `spec-update-workflow.md` の検証コマンドセクションを、以下の条件で再現テストする:
   - 新規ターミナルセッションで実行する
   - コマンドをドキュメントからコピー&ペーストのみで実行する
   - 手動での引数修正やパス調整が不要であることを確認する

2. 以下を検証する:
   - コマンドの実行パスが相対パスではなくリポジトリルートからの相対パスで記載されているか
   - 前提条件（カレントディレクトリ、環境変数）が明記されているか
   - 出力の読み方（Error / Warning の識別方法）が記載されているか

3. 再現不可能な手順がある場合:
   - 手順の不備内容を記録する
   - 自己完結性が欠如 → MAJOR（Phase 2 に戻る）
   - 軽微な表現不足 → MINOR（未タスク仕様書に変換して Phase 11 へ）

### Task 10-6: スコープ制御レビュー

**レビュー観点**: Warning ゼロ化に踏み込んでいないか

1. Phase 5 の実装変更が以下のスコープ外事項に踏み込んでいないか確認する:
   - **スコープ外1**: 全 Warning の即時ゼロ化（Warning は分類・ルール化のみが対象）
   - **スコープ外2**: スキル構造の全面再編（既存構造の維持が前提）
   - **スコープ外3**: 無関係なスキルの変更（対象は skill-creator / task-specification-creator / aiworkflow-requirements のみ）

2. 変更差分を確認する:

   ```bash
   git diff main -- .claude/skills/
   ```

   - 上記3スキル以外のファイルが変更されていないことを確認する
   - Warning を直接修正している箇所がないことを確認する（ルール定義・分類のみが許容される変更）

3. スコープ逸脱がある場合:
   - Warning の直接修正（ゼロ化目的） → MAJOR（Phase 1 に戻りスコープを再確認）
   - 対象外スキルの変更 → MAJOR（変更を取り消す）

### Task 10-7: 既存フロー互換レビュー

**レビュー観点**: `spec-update-workflow` / `phase-11-12-guide` の既存機能を壊していないか

1. 以下のファイルの変更差分を確認する:

   ```bash
   git diff main -- .claude/skills/task-specification-creator/references/spec-update-workflow.md
   git diff main -- .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   ```

2. 以下を検証する:
   - 既存の Step 1-A ~ Step 1-D の手順が維持されているか（削除・改変がないか）
   - Phase 12 の必須チェックリスト（`05-task-execution.md` に記載）との整合性が維持されているか
   - 新規追加された検証ステップが、既存ステップとの実行順序で矛盾しないか

3. `.claude/rules/05-task-execution.md` の Phase 12 チェックリストと照合する:
   - Step 1-A（タスク完了記録）が維持されているか
   - Step 1-B（実装状況テーブル）が維持されているか
   - Step 1-C（関連タスクテーブル）が維持されているか
   - Step 1-D（topic-map.md 再生成）が維持されているか

4. 判定基準:
   - 既存手順が全て維持され、新規ステップが追加のみ → OK
   - 既存手順の一部が変更されているが、意図的かつ文書化済み → OK（変更理由の記録を確認）
   - 既存手順が無断で削除・改変 → MAJOR（Phase 2 に戻る）

### Task 10-8: ゲート判定と結果レポート作成

1. Task 10-1 ~ 10-7 の結果を集約し、ゲート判定を行う

2. `outputs/phase-10/final-review-result.md` を以下のテンプレートで作成する:

   ```markdown
   # Phase 10: 最終レビュー結果

   ## レビュー日時

   YYYY-MM-DD HH:MM

   ## レビュー観点別結果

   ### 1. 要件充足度

   - 判定: OK / NG
   - FR 充足: N/7
   - NFR 充足: N/5
   - 詳細: (具体的な確認結果)

   ### 2. 設計整合性

   - 判定: OK / NG
   - 詳細: (具体的な確認結果)

   ### 3. テスト網羅性

   - 判定: OK / NG
   - AC カバレッジ: N/6
   - 詳細: (具体的な確認結果)

   ### 4. 仕様書品質

   - 判定: OK / NG
   - 曖昧表現: N件
   - リンク切れ: N件
   - 詳細: (具体的な確認結果)

   ### 5. 運用再現性

   - 判定: OK / NG
   - 詳細: (具体的な確認結果)

   ### 6. スコープ制御

   - 判定: OK / NG
   - 詳細: (具体的な確認結果)

   ### 7. 既存フロー互換

   - 判定: OK / NG
   - 詳細: (具体的な確認結果)

   ## 指摘事項

   | #   | 観点     | 重要度               | 内容       | 対応       |
   | --- | -------- | -------------------- | ---------- | ---------- |
   | 1   | (観点名) | MINOR/MAJOR/CRITICAL | (指摘内容) | (対応方針) |

   ## ゲート判定

   - **総合判定**: PASS / MINOR / MAJOR / CRITICAL
   - **次Phase**: Phase 11 / Phase N（差し戻し先）
   - **MINOR指摘の未タスク化**: (該当する場合、未タスク仕様書のパスを記載)
   ```

3. MINOR 判定の場合の**必須対応**（省略不可）:
   - 各 MINOR 指摘を未タスク仕様書に変換する
   - 未タスク仕様書を `docs/30-workflows/unassigned-task/` に配置する
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
   - 関連仕様書に参照リンクを追加する
   - 上記3ステップ（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）全完了後、Phase 11 へ進行する

4. MINOR 指摘がある場合、`outputs/phase-10/minor-issues.md` を作成する:

   ```markdown
   # Phase 10: MINOR 指摘一覧

   ## 指摘一覧

   | #   | 指摘内容   | 未タスク仕様書パス                                | task-workflow.md 登録 | 関連仕様書リンク |
   | --- | ---------- | ------------------------------------------------- | --------------------- | ---------------- |
   | 1   | (指摘内容) | `docs/30-workflows/unassigned-task/ut-xxx-001.md` | 完了 / 未完了         | 完了 / 未完了    |

   ## 3ステップ完了確認

   - [ ] 全指摘の未タスク仕様書が `unassigned-task/` に作成されている
   - [ ] 全指摘が `task-workflow.md` の残課題テーブルに登録されている
   - [ ] 全指摘の関連仕様書に参照リンクが追加されている
   ```

## 統合テスト連携【必須】

- Phase 9 の品質レポートの「全品質ゲート通過: YES」を前提条件とする
- 全テスト結果、カバレッジ報告の最終確認
- ゲート判定で MAJOR / CRITICAL の場合、差し戻し先 Phase の再実行後に Phase 9 → Phase 10 を再通過する

## 多角的チェック観点（AIが判断）

| 観点           | 適用 | 確認内容                                                |
| -------------- | ---- | ------------------------------------------------------- |
| 要件充足度     | ○    | FR-001~FR-007, NFR-001~NFR-005 の全項目が実現されている |
| 設計整合性     | ○    | Phase 2 設計書と Phase 5 実装に逸脱がない               |
| テスト網羅性   | ○    | AC-001~AC-006 の全項目にテストケースが存在する          |
| 仕様書品質     | ○    | 曖昧表現0件、参照リンク切れ0件                          |
| 運用再現性     | ○    | 検証手順がコピー&ペーストで再現可能                     |
| スコープ制御   | ○    | Warning ゼロ化に踏み込んでいない                        |
| 既存フロー互換 | ○    | Step 1-A ~ Step 1-D が維持されている                    |
| セキュリティ   | --   | 本タスクは読み取り専用の仕様書改善であり対象外          |
| UI/UX          | --   | ユーザー向け UI の変更を含まないため対象外              |

## 成果物

| 成果物           | パス                                                                                                   | 内容                           |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------ |
| 最終レビュー結果 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/final-review-result.md` | レビュー結果・ゲート判定       |
| MINOR 指摘一覧   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/minor-issues.md`        | MINOR 指摘一覧（該当する場合） |

## 完了条件

- [ ] Task 10-1: 要件充足度 -- FR-001~FR-007 と NFR-001~NFR-005 の全項目が充足確認済み
- [ ] Task 10-2: 設計整合性 -- Phase 2 設計書と Phase 5 実装の整合性が確認済み
- [ ] Task 10-3: テスト網羅性 -- AC-001~AC-006 の全項目にテストケースが存在
- [ ] Task 10-4: 仕様書品質 -- 曖昧表現0件、参照リンク切れ0件
- [ ] Task 10-5: 運用再現性 -- 検証手順がコピー&ペーストで再現可能
- [ ] Task 10-6: スコープ制御 -- Warning ゼロ化に踏み込んでいない、対象外スキル未変更
- [ ] Task 10-7: 既存フロー互換 -- Step 1-A ~ Step 1-D が維持され、Phase 12 チェックリストと整合
- [ ] Task 10-8: ゲート判定（PASS / MINOR / MAJOR / CRITICAL）が `final-review-result.md` に記録されている
- [ ] MINOR 指摘がある場合: 全指摘が未タスク仕様書に変換済み（3ステップ完了: 指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）
- [ ] MAJOR/CRITICAL 指摘がある場合: 差し戻し先 Phase が明記されている
- [ ] **本 Phase 内の全タスク（10-1 ~ 10-8）を100%実行完了**

## サブタスク管理

| サブタスク | 内容                         | 状態   | 備考 |
| ---------- | ---------------------------- | ------ | ---- |
| Task 10-1  | 要件充足度レビュー           | 未着手 |      |
| Task 10-2  | 設計整合性レビュー           | 未着手 |      |
| Task 10-3  | テスト網羅性レビュー         | 未着手 |      |
| Task 10-4  | 仕様書品質レビュー           | 未着手 |      |
| Task 10-5  | 運用再現性レビュー           | 未着手 |      |
| Task 10-6  | スコープ制御レビュー         | 未着手 |      |
| Task 10-7  | 既存フロー互換レビュー       | 未着手 |      |
| Task 10-8  | ゲート判定・結果レポート作成 | 未着手 |      |

## タスク100%実行確認【必須】

- [ ] 全タスク（10-1 ~ 10-8）が100%実行完了
- [ ] 各成果物（final-review-result.md, minor-issues.md（該当時））が生成されている
- [ ] `artifacts.json` の Phase 10 ステータスが `completed` に更新されている

## 次のPhase

- **PASS / MINOR 判定**: Phase 11: 手動テスト検証（`phase-11-manual-test.md`）に進む
- **MAJOR 判定**: 指摘内容に応じて Phase 1-5 のいずれかに戻る
- **CRITICAL 判定**: Phase 1 へ戻りユーザーと要件を再確認する
