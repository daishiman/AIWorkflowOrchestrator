# Phase 9: 品質保証

## メタ情報

| 項目               | 内容                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                      |
| Phase              | 9 / 13                                                                          |
| Phase名称          | 品質保証                                                                        |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）    |
| 作成日             | 2026-02-26                                                                      |
| GitHub Issue       | #910                                                                            |
| 前提Phase          | Phase 8（リファクタリング）完了                                                 |
| 目的               | 定義された品質基準をすべて満たすことを検証する                                  |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/` |

## 目的

Phase 5-8 の成果物が、プロジェクトで定義された品質基準（仕様書構造・スクリプト実行・運用フロー・参照リンク）のすべてを満たすことを統合的に検証する。

## 実行タスク

- **Task 9-1**: 仕様書構造検証 -- 更新した仕様書が required sections を全て含むか
- **Task 9-2**: スクリプト実行検証 -- `quick_validate.js` が正常動作するか
- **Task 9-3**: 運用フロー検証 -- Phase 12 テンプレートのコマンド列が実行可能か
- **Task 9-4**: 参照リンク検証 -- 更新した仕様書内の相互参照リンクが全て有効か
- **Task 9-5**: 品質検証結果レポートの作成

## 参照資料

| 参照資料                     | パス                                                                                                 | 内容                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 実装成果物           | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                      | 実装内容と検証対象範囲   |
| Phase 8 リファクタリング記録 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/refactoring-report.md` | リファクタリング結果     |
| Phase 7 カバレッジレポート   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/`                      | カバレッジ基準値         |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                          | プロジェクト品質基準     |
| スキル更新プロセス仕様       | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`                    | `quick_validate.js` 運用 |
| 教訓集                       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                               | 過去の苦戦箇所と対策     |
| quick_validate.js            | `.claude/skills/skill-creator/scripts/quick_validate.js`                                             | 検証スクリプト正本       |
| spec-update-workflow.md      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                       | 検証コマンド運用の正本   |
| phase-11-12-guide.md         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                          | Phase 11/12 ガイド       |
| コード品質ルール             | `.claude/rules/02-code-quality.md`                                                                   | 曖昧表現禁止・品質基準   |

## 品質ゲート

| 品質項目       | 確認内容                               | 基準      |
| -------------- | -------------------------------------- | --------- |
| 仕様書構造     | 更新した仕様書の必須セクション完備     | 100%      |
| スクリプト実行 | `quick_validate.js` 正常終了           | Error 0件 |
| 参照リンク     | 更新した仕様書内の内部リンク切れ       | 0件       |
| 曖昧表現       | 「基準どおりに」「条件該当時に」「等」 | 0件       |
| テスト成功     | 全テストケース                         | 100% PASS |

## 実行手順

### Task 9-1: 仕様書構造検証

**対象ファイル**:

- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

1. 更新した仕様書が以下の必須セクションを全て含むことを確認する:
   - タイトル（h1）
   - メタ情報（該当する場合）
   - 目的
   - 実行タスク（該当する場合）
   - 実行手順
   - 成果物（該当する場合）

2. セクション見出しの階層が正しいことを確認する（h1 → h2 → h3 の順序）

3. テーブルのフォーマットが Markdown 仕様に準拠していることを確認する

4. 結果を記録する:
   - OK: 全必須セクション完備
   - NG: 不足セクション名と対応方針を記載

### Task 9-2: スクリプト実行検証

1. `quick_validate.js` を全3スキルに対して実行する:

   ```bash
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
   ```

   ```bash
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
   ```

   ```bash
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
   ```

2. 各スキルの実行結果を記録する:
   - 終了コード（0: 成功、非0: 失敗）
   - Error 件数（0件が必須）
   - Warning 件数（記録のみ、Phase 8 で定義した運用ルールに基づき判定）
   - 実行時間

3. Error が1件以上ある場合:
   - エラー内容と該当ファイル・行番号を記録する
   - 即時修正する
   - 修正後、再度検証を実行して Error 0件を確認する

4. 実行ログを `outputs/phase-9/script-execution-log.md` に保存する

### Task 9-3: 運用フロー検証

1. `spec-update-workflow.md` に記載された検証コマンド列をコピー&ペーストで実行する:

   ```bash
   # spec-update-workflow.md の Step 1-G に記載されたコマンドを実行
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
   ```

2. 以下を確認する:
   - コマンドがコピー&ペーストのみで実行可能か（手動修正不要か）
   - 出力が Error / Warning / Pass を一目で識別可能なフォーマットか
   - Phase 12 テンプレートの一括実行用スニペットが正常動作するか

3. `verify-unassigned-links.js` を実行する:

   ```bash
   node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
   ```

4. 実行結果を記録し、正常終了を確認する

### Task 9-4: 参照リンク検証

1. 更新した仕様書内の相互参照リンクを手動確認する:
   - `spec-update-workflow.md` 内の全リンクが有効なパスを指しているか
   - `phase-11-12-guide.md` 内の `spec-update-workflow.md` への参照リンクが正しいアンカーを指しているか
   - Phase 8 で追加した正本参照リンクが全て有効か

2. 曖昧表現の最終検出を実行する:

   ```bash
   grep -rn "基準どおりに\|条件該当時に\|等\b\|状況を見て\|条件別に判断" \
     .claude/skills/task-specification-creator/references/spec-update-workflow.md \
     .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   ```

3. 検出結果が0件であることを確認する
4. 0件でない場合は即時修正し、再検出する

### Task 9-5: 品質検証結果レポート作成

1. `outputs/phase-9/quality-report.md` を以下のテンプレートで作成する:

   ```markdown
   # Phase 9: 品質検証結果レポート

   ## 検証日時

   YYYY-MM-DD HH:MM

   ## 1. 仕様書構造検証

   - 対象ファイル数: N
   - 必須セクション完備率: 100% / NG（不足箇所を記載）

   ## 2. スクリプト実行検証

   | スキル                     | Error | Warning | 実行時間 | 終了コード |
   | -------------------------- | ----- | ------- | -------- | ---------- |
   | skill-creator              | N     | N       | N秒      | 0          |
   | task-specification-creator | N     | N       | N秒      | 0          |
   | aiworkflow-requirements    | N     | N       | N秒      | 0          |

   ## 3. 運用フロー検証

   - コピー&ペースト実行: 成功 / 失敗
   - 出力フォーマット: 識別可能 / 改善必要
   - verify-unassigned-links.js: 正常終了 / エラーあり

   ## 4. 参照リンク検証

   - リンク切れ件数: 0件 / N件
   - 曖昧表現検出: 0件 / N件

   ## 5. テスト成功

   - テスト総数: N
   - PASS数: N
   - FAIL数: 0
   - 所要時間: N秒

   ## 6. 品質ゲート結果サマリ

   | 品質項目       | 基準      | 結果   | 判定  |
   | -------------- | --------- | ------ | ----- |
   | 仕様書構造     | 100%      | (結果) | OK/NG |
   | スクリプト実行 | Error 0件 | (結果) | OK/NG |
   | 参照リンク     | 0件       | (結果) | OK/NG |
   | 曖昧表現       | 0件       | (結果) | OK/NG |
   | テスト成功     | 100% PASS | (結果) | OK/NG |

   ## 7. 総合判定

   - 全品質ゲート通過: YES / NO
   - 未解決事項: (該当する場合)
   ```

2. 全品質ゲートの結果を記入し、総合判定を記録する

## 統合テスト連携【必須】

- `pnpm vitest run` の全テスト PASS
- `pnpm lint` エラー0件
- `pnpm typecheck` エラー0件
- `quick_validate.js` Error 0件（全3スキル）
- 全品質ゲートの結果確認テーブルが `quality-report.md` に記録されていること

## 多角的チェック観点（AIが判断）

| 観点             | 適用 | 確認内容                                   |
| ---------------- | ---- | ------------------------------------------ |
| 仕様書品質       | ○    | 必須セクション完備、曖昧表現0件            |
| スクリプト動作   | ○    | 全3スキルで Error 0件、正常終了            |
| 運用再現性       | ○    | コマンド列がコピー&ペーストで実行可能      |
| 参照リンク整合性 | ○    | 内部リンク切れ0件                          |
| セキュリティ     | --   | 本タスクは読み取り専用の検証であり対象外   |
| UI/UX            | --   | ユーザー向け UI の変更を含まないため対象外 |

## 成果物

| 成果物               | パス                                                                                                   | 内容                     |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------ |
| 品質検証結果レポート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/quality-report.md`       | 品質検証の統合結果       |
| スクリプト実行ログ   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/script-execution-log.md` | 検証スクリプトの実行ログ |

## 完了条件

- [ ] 仕様書構造: 更新した全仕様書で必須セクション完備（100%）
- [ ] スクリプト実行: `quick_validate.js` が全3スキルで Error 0件で正常終了
- [ ] 運用フロー: Phase 12 テンプレートのコマンド列がコピー&ペーストで実行可能
- [ ] 参照リンク: 更新した仕様書内のリンク切れが0件
- [ ] 曖昧表現: 「基準どおりに」「条件該当時に」「等」「状況を見て」「条件別に判断」が0件
- [ ] テスト成功: 全テストケースが PASS（FAIL 数 0）
- [ ] `quality-report.md` に全品質ゲートの結果が記録され、「全品質ゲート通過: YES」である
- [ ] `script-execution-log.md` にスクリプト実行の詳細ログが記録されている
- [ ] **本 Phase 内の全タスク（9-1, 9-2, 9-3, 9-4, 9-5）を100%実行完了**

## サブタスク管理

| サブタスク | 内容                     | 状態   | 備考 |
| ---------- | ------------------------ | ------ | ---- |
| Task 9-1   | 仕様書構造検証           | 未着手 |      |
| Task 9-2   | スクリプト実行検証       | 未着手 |      |
| Task 9-3   | 運用フロー検証           | 未着手 |      |
| Task 9-4   | 参照リンク検証           | 未着手 |      |
| Task 9-5   | 品質検証結果レポート作成 | 未着手 |      |

## タスク100%実行確認【必須】

- [ ] 全タスク（9-1, 9-2, 9-3, 9-4, 9-5）が100%実行完了
- [ ] 各成果物（quality-report.md, script-execution-log.md）が生成されている
- [ ] `artifacts.json` の Phase 9 ステータスが `completed` に更新されている

## 次のPhase

Phase 10: 最終レビューゲート（`phase-10-final-review.md`）に進む。
