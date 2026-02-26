# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目               | 内容                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                                            |
| Phase              | 5 / 13                                                                                                |
| Phase名称          | 実装（TDD: Green）                                                                                    |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）                          |
| 作成日             | 2026-02-26                                                                                            |
| GitHub Issue       | #910                                                                                                  |
| 前提Phase          | Phase 4（テスト作成: Red フェーズ完了）                                                               |
| 目的               | Phase 2 の設計に基づき、検証経路統一と warning 運用ルールを実装し、Phase 4 のテストを全て PASS させる |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                       |

## 目的

本タスクは運用改善タスクであるため、「実装」は以下を含む:

1. 検証経路統一ルールの仕様書作成（`spec-update-workflow.md` と `phase-11-12-guide.md` への反映）
2. warning 運用ルールの文書化（3段階分類ルールの明文化）
3. Phase 12 テンプレートへの統合（`phase-templates.md` Phase 12 セクションへの検証コマンド列埋め込み）
4. 必要に応じた `quick_validate.js` の仕様改善案定義（大規模 reference スキル向け）

## 実行タスク

- **Task 5-1**: 検証経路統一ルール実装 -- `spec-update-workflow.md` と `phase-11-12-guide.md` への実行経路ルール追記
- **Task 5-2**: warning 運用ルール実装 -- warning 分類基準と対応アクションの文書化
- **Task 5-3**: Phase 12 テンプレート統合 -- 検証コマンド列のテンプレート埋め込み
- **Task 5-4**: `quick_validate.js` 改善案定義 -- 大規模スキル向けの仕様改善案の文書化（条件該当時に）
- **Task 5-5**: 実装サマリーの作成

## 参照資料

| 参照資料                | パス                                                                                   | 内容                                             |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Phase 1 要件定義書      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-1-requirements.md` | FR-001〜FR-007, NFR-001〜NFR-005, AC-001〜AC-006 |
| Phase 2 設計書          | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-2-design.md`       | 経路優先順位・Warning 3段階分類設計              |
| Phase 4 テスト仕様書    | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-4/`        | テストケース一覧・テスト設計                     |
| spec-update-workflow.md | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Phase 12 検証コマンド運用（変更対象）            |
| phase-11-12-guide.md    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | Phase 11/12 ガイド（変更対象）                   |
| phase-templates.md      | `.claude/skills/task-specification-creator/references/phase-templates.md`              | Phase テンプレート（変更対象）                   |
| quick_validate.js       | `.claude/skills/skill-creator/scripts/quick_validate.js`                               | 検証スクリプト正本（参照/改善案対象）            |
| スキル構造検証仕様      | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`     | スキル構造の検証基準                             |
| 教訓集                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                 | 過去の苦戦箇所と対策                             |
| 元の未タスク指示書      | `docs/30-workflows/completed-tasks/task-imp-skill-validation-gate-alignment-001.md`    | タスク背景・スコープ                             |

## 実行手順

### Task 5-1: 検証経路統一ルール実装

1. `spec-update-workflow.md` に検証実行経路ルールセクションを追加する:

   **変更対象**: Step 1-G（スキル検証コマンド）セクション

   **Before（現在の記載）:**

   ```bash
   python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
     .claude/skills/aiworkflow-requirements --verbose
   ```

   **After（正規経路に統一）:**

   ```bash
   # 正規経路（primary）: quick_validate.js
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
   ```

2. fallback 経路の使用条件を同セクション内に追記する:
   - Node.js ランタイムが利用不可の場合のみ `.py` を使用する
   - Python 3.10 以上がインストールされている場合のみ fallback を使用する
   - fallback 使用時は Phase 12 成果物に「fallback 経路を使用した」旨を明記する

3. 検証コマンドの参照を全箇所で `quick_validate.js` に統一する:
   - `grep -rn "quick_validate.py" .claude/skills/task-specification-creator/` で残存箇所を検出し、全て `.js` に置換する

4. 使い分けルールを記載する:
   - Node.js（v18以上）が利用可能な場合は Primary（`.js`）を使用する
   - Node.js が利用不可の場合は Fallback（`.py`）を使用し、結果に「Fallback経路」と注記する
   - 両方の結果が異なる場合は `.js` の結果を正本とし、差分を未タスクとして記録する

### Task 5-2: warning 運用ルール実装

1. `spec-update-workflow.md` の Step 1-G 検証コマンド直後に「検証結果の判定基準」サブセクションを追加する:

   **追加内容:**
   - 合否判定基準: Error 0件で合格、Warning は3段階分類に基づき対応

   - Warning 3段階分類テーブル:

     | 分類   | 定義                                                                   | 対応方針                                   | 具体例                                                              |
     | ------ | ---------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
     | 許容   | 運用上避けられない Warning で、修正コストが高く機能影響がない          | 件数を記録し、増加傾向がないことを確認する | `aiworkflow-requirements` の大量 reference ファイルの参照リンク警告 |
     | 要監視 | 新規に発生した Warning で、放置すると品質低下の兆候となる              | 次回 Phase 12 までに対応方針を決定する     | 新規追加した reference ファイルが SKILL.md からリンクされていない   |
     | 要対応 | 機能やスキル構造の正確性に影響する Warning で、本Phase内での修正が必要 | 本Phase（または直後のPhase）内で修正する   | agents/\*.md の必須セクション不足、name とディレクトリ名の不一致    |

   - Warning 分類の判定フロー:

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

2. `aiworkflow-requirements` 固有の許容条件を記載する:
   - `references/` 配下のファイル数が50以上のスキルでは、全ファイルを SKILL.md からリンクすることが実運用上困難である
   - 許容条件: `resource-map.md` または `topic-map.md` からリンクされていれば「許容」とする
   - 許容条件に該当しない未リンクファイルは「要監視」に分類する

### Task 5-3: Phase 12 テンプレート統合

1. `phase-11-12-guide.md` の Phase 12 手順内のスキル検証コマンド参照を更新する:
   - `quick_validate.py` への参照を `quick_validate.js` に置換する
   - 検証結果の読み方ガイド（Error / Warning の識別方法）を追加する
   - Warning 分類の詳細ルールは `spec-update-workflow.md` への参照リンクとする（重複記述を回避）

2. `phase-templates.md` の Phase 12 セクションに検証コマンド列を統合する:
   - スキル検証ステップとして正規経路コマンドを記載する
   - 判定基準への参照リンクを追加する

3. `spec-update-workflow.md` との重複を回避する設計:
   - `phase-11-12-guide.md` にはコマンド実行方法と結果の読み方を記載する
   - Warning 分類の詳細ルールは `spec-update-workflow.md` への参照リンクとする
   - コマンド全文は `spec-update-workflow.md` に集約し、`phase-11-12-guide.md` では「`spec-update-workflow.md` Step 1-G を参照」と記載する

### Task 5-4: `quick_validate.js` 改善案定義

1. Phase 2 設計書で推奨された案A（要約表示）について、実装可否を判断する:

   | 判断基準                         | 評価結果     |
   | -------------------------------- | ------------ |
   | 本タスクのスコープ内で実装可能か | 判断して記載 |
   | 既存の Error 判定に影響するか    | 判断して記載 |
   | 後方互換性が維持されるか         | 判断して記載 |

2. 実装が本タスクのスコープを超える場合は未タスク化する:
   - 未タスク指示書を `docs/30-workflows/unassigned-task/` に作成する
   - `task-workflow.md` の残課題テーブルに登録する

3. `outputs/phase-5/validation-command-reference.md` に検証コマンドリファレンスを作成する:
   - 正規経路コマンドの完全なコマンドライン
   - 各オプションの説明
   - 出力フォーマットの説明
   - Error / Warning の一覧と各項目の意味

### Task 5-5: 実装サマリーの作成

1. `outputs/phase-5/implementation-summary.md` を作成する:
   - 変更した仕様書の一覧とその変更内容
   - Phase 2 設計からの乖離がある場合はその内容と理由
   - Phase 4 テストケースの PASS/FAIL 状態
   - 未タスク化した項目（もしあれば）

## 設計変更記録

Phase 2 設計からの乖離がある場合は、以下の形式で記録する:

| 設計項目             | Phase 2 設計 | 実装時の変更       | 変更理由         |
| -------------------- | ------------ | ------------------ | ---------------- |
| （変更があれば記載） | （設計内容） | （実際の実装内容） | （変更した理由） |

## 統合テスト連携【必須】

- Phase 4 で定義した全テストケースに対して PASS 状態を確認する
- 仕様書変更後に `quick_validate.js` を3スキルに対して実行し、Error 0件を確認する（AC-004）
- `grep -c "quick_validate.py" spec-update-workflow.md` が 0 を返すことを確認する（AC-001）
- `grep -c "quick_validate.py" phase-11-12-guide.md` が 0 を返すことを確認する（AC-002）
- Warning 3段階分類ルールのセクションが `spec-update-workflow.md` に存在することを確認する（AC-003）

## 多角的チェック観点（AIが判断）

| 観点                  | 適用 | 確認内容                                                                                     |
| --------------------- | ---- | -------------------------------------------------------------------------------------------- |
| 仕様書品質            | ○    | 変更した仕様書が自己完結性を維持し、既存構造を壊していないこと                               |
| 後方互換性            | ○    | 既存の `quick_validate.js` の Error 判定が変更されていないこと（NFR-005）                    |
| 運用保守性            | ○    | Warning 分類の判定フローが運用者にとって再現可能であること                                   |
| テスト可能性          | ○    | Phase 4 のテストケースが全て PASS すること                                                   |
| スコープ制御          | ○    | 仕様書の変更が最小限に留まり、既存構造を壊していないこと                                     |
| P11 対策              | ○    | 大量編集後は `git diff --stat` で変更ファイル数を確認、PostToolUse Hook の Edit 失敗に備える |
| セキュリティ          | --   | 検証スクリプトは読み取り専用であり、認証・認可の変更を含まない                               |
| UI/UX                 | --   | ユーザー向けUIの変更を含まない                                                               |
| Electron セキュリティ | --   | 本タスクは Electron IPC を含まない                                                           |

## 実装時の注意事項

- 既存のスキル検証フロー（`verify-unassigned-links`, `audit-unassigned-tasks`）との互換性を維持する
- warning ゼロ化に踏み込まない（スコープ外）
- 仕様書の変更は最小限に留め、既存構造を壊さない
- `quick_validate.js` のコード変更は本タスクのスコープに含まない（改善案の文書化のみ）
- 変更対象の仕様書は事前に `git diff` で変更量を確認し、過大な変更になっていないか検証する

## 成果物

| 成果物                   | パス                                                                                                           | 説明                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 実装サマリー             | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/implementation-summary.md`       | 変更一覧・設計乖離・テスト結果                 |
| 検証コマンドリファレンス | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/validation-command-reference.md` | 正規経路コマンド・オプション・出力フォーマット |
| 更新済み仕様書           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                 | Step 1-G 検証経路統一 + Warning 運用ルール     |
| 更新済み仕様書           | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                    | 検証コマンド参照の統一                         |
| 更新済み仕様書           | `.claude/skills/task-specification-creator/references/phase-templates.md`                                      | Phase 12 テンプレートへの統合                  |

## 完了条件

- [ ] Phase 4 テストケースが全て PASS（Green 状態）
- [ ] `spec-update-workflow.md` の Step 1-G が `quick_validate.js` に統一されている（FR-001, FR-003）
- [ ] `phase-11-12-guide.md` の検証コマンド参照が `quick_validate.js` に統一されている（FR-004）
- [ ] `grep -c "quick_validate.py" spec-update-workflow.md` が 0 を返す（AC-001）
- [ ] `grep -c "quick_validate.py" phase-11-12-guide.md` が 0 を返す（AC-002）
- [ ] Warning 3段階分類ルール（許容/要監視/要対応）が文書化されている（FR-005, AC-003）
- [ ] 検証結果の判定基準が「Error 0件で合格」と明文化されている（FR-006）
- [ ] `aiworkflow-requirements` の参照リンク Warning に対する許容条件が明記されている（FR-007, AC-005）
- [ ] `quick_validate.js` を3スキルに対して実行し、Error 0件で終了する（AC-004）
- [ ] 既存の Error 判定が変更されていない（NFR-005）
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている
- [ ] `outputs/phase-5/validation-command-reference.md` が作成されている
- [ ] `artifacts.json` の Phase 5 ステータスが `completed` に更新されている

## サブタスク管理

| サブタスク | 内容                         | 状態   | 成果物                                |
| ---------- | ---------------------------- | ------ | ------------------------------------- |
| Task 5-1   | 検証経路統一ルール実装       | 未着手 | spec-update-workflow.md 更新          |
| Task 5-2   | warning 運用ルール実装       | 未着手 | Warning 分類セクション追加            |
| Task 5-3   | Phase 12 テンプレート統合    | 未着手 | phase-11-12-guide.md + templates 更新 |
| Task 5-4   | quick_validate.js 改善案定義 | 未着手 | validation-command-reference.md       |
| Task 5-5   | 実装サマリー作成             | 未着手 | implementation-summary.md             |

## タスク100%実行確認【必須】

- [ ] 全タスク（5-1, 5-2, 5-3, 5-4, 5-5）が100%実行完了
- [ ] 変更した仕様書の一覧が実装サマリーに記載されている
- [ ] Phase 4 テストケースの PASS/FAIL 結果が記録されている
- [ ] `artifacts.json` が更新されている

## 次のPhase

Phase 6: テスト拡充 -- Phase 5 の実装に対してテストを拡充し、要件網羅率を高める。
