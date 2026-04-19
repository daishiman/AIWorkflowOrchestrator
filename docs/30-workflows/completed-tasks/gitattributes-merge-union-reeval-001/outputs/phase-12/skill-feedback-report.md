# Phase 12: Skill フィードバックレポート

本タスクを通じて得られた `task-specification-creator` skill および周辺 skill（`aiworkflow-requirements`）への改善提案を記録する。

## 1. 提案サマリ

| ID    | 分類                   | 対象 skill                 | 優先度 |
| ----- | ---------------------- | -------------------------- | ------ |
| FB-01 | テンプレート改善       | task-specification-creator | MEDIUM |
| FB-02 | ワークフロー改善       | task-specification-creator | MEDIUM |
| FB-03 | ドキュメント不整合解消 | aiworkflow-requirements    | LOW    |
| FB-04 | 自動検証補強           | task-specification-creator | LOW    |

## 2. 個別フィードバック

### 2.1 FB-01: 「config-only / NON_VISUAL」タスク向けテンプレートの明示化

**対象**: `task-specification-creator` の 13 phases テンプレート

**背景**:

- 本タスクは `.gitattributes` という「宣言的設定ファイル」の変更で、コードも UI も無かった
- Phase 3 (テスト設計) / Phase 5 (実装) / Phase 6 (Red) / Phase 7 (Green) の TDD サイクルを、MT (manual test) + `git check-attr` 静的検証に読み替える必要があった
- テンプレートが基本的に「コード実装タスク」を前提としており、config-only タスクでは読み替えコストが高い

**提案**:

- テンプレートに `taskType: config-only | code | ui` を導入し、`config-only` 時は:
  - Phase 3 → 「静的 attribute / schema 検証 + MT シナリオ設計」に置換
  - Phase 6/7 → 「Red: conflict 再現 MT / Green: attribute 適用 MT」に置換
  - Phase 11 → MT 証跡を主成果物として位置付け
- 該当タスク例を `references/task-type-config-only-examples.md` に集約
  - 事例: TASK-CONFLICT-PREVENT-001, TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001（本タスク）

**期待効果**: config-only タスク実行時のテンプレート読み替えコスト削減 / Phase 6 (Red) の証跡基準統一

### 2.2 FB-02: Phase 12 Step 2 (interface update) の N/A 判定フローの明文化

**対象**: `task-specification-creator` の Phase 12 Step 2

**背景**:

- 現行テンプレートは「新規インターフェース追加」が前提で、追加が無い場合の **N/A 判定根拠** の書式が曖昧
- 本タスクでは 7 観点 (API / 型 / 定数 / 環境変数 / DB / フォーマット / CLI) でチェックリスト化し、N/A 判定の根拠表を独自に作成した
- 後続の config-only タスクが毎回同じチェックリストを再発明するのは非効率

**提案**:

- Phase 12 Step 2 テンプレートに以下のチェックリスト雛形を標準装備:

  ```
  ### 判定根拠（7 観点チェック）

  | 観点                      | 変更有無 | 根拠 |
  | ------------------------- | -------- | ---- |
  | 公開 API (IPC contract 等) |          |      |
  | 型定義 / TypeScript types |          |      |
  | 定数・設定値              |          |      |
  | 環境変数                  |          |      |
  | データベーススキーマ       |          |      |
  | ファイルフォーマット       |          |      |
  | 新規 CLI / コマンド        |          |      |

  判定: **追加あり / N/A（新規なし）**
  ```

- すべて「なし」なら Step 2 = N/A として即時クローズ可能

**期待効果**: Phase 12 Step 2 の判定時間短縮 / 判定根拠の標準化

### 2.3 FB-03: task-workflow-completed.md の mirror 既存 disparity の整理

**対象**: `aiworkflow-requirements` skill

**背景**:

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` と `.agents/.../task-workflow-completed.md` の間に、本タスク追記分とは別に既存 disparity（後半 20 行程度）が存在
- `diff` の末尾が長大で、本タスクの追記差分検証時にノイズになった

**提案**:

- 別途「mirror 再同期タスク」を立ち上げ、歴史的に生まれた disparity を一括で解消
- その後は merge=union により自動同期が保たれるため、以降 disparity が蓄積しない

**期待効果**: mirror parity 検証コストの低減 / 将来タスクでの diff ノイズ削減

### 2.4 FB-04: `validate-references.js` の mirror parity assertion 追加

**対象**: `task-specification-creator` の Phase 12 自動検証

**背景**:

- 本タスクでは `diff .claude/.../LOGS.md .agents/.../LOGS.md` を手動実行し diff=0 を確認した
- 自動化すれば以降の config-only / ドキュメント系タスクで手順省略できる

**提案**:

- `validate-references.js` に `--mirror-parity` オプションを追加し、`.claude/skills/*/references/*` と `.agents/skills/*/references/*` 対称ファイルペアの diff を自動検証
- Phase 12 完了条件に組み込み

**期待効果**: mirror parity violation の検出漏れ防止 / CI でのゲーティング可能化

## 3. 本タスク固有の学び（skill に反映済みではないが記録）

### 3.1 「glob パターンは Git 側で最後にマッチしたもの勝ち」

- 本タスクで `references/*.md` の上に append-only の個別 glob（`LOGS.md` 等）を配置する構造を採った
- Git の attribute 解決は「同一属性キーでは後勝ち」なので、包括パターン → 個別パターン の順で上書きが機能する
- 今回の case では包括パターンを廃止したため後勝ちに依存していないが、将来 merge driver を追加する際には有用

### 3.2 「manual test の証跡は tmp dir フルログで残すと再現性が高い」

- Phase 11 で `/tmp/gitattr-mt.XXXXXX` に init 済みリポジトリを作り、`git config`/`git merge` の stdout/stderr/終了コードを逐次ログ化した
- 将来の Phase 11 テンプレートに「MT 実行用の tmp dir + full log」の標準書式を提案済み（FB-01 に含まれる）

## 4. フィードバック反映先（提案）

- FB-01, FB-02, FB-04 → `task-specification-creator` の `unassigned-task.md` にタスク化候補として登録
- FB-03 → `aiworkflow-requirements` の `unassigned-task.md` に登録

ただし、これらはすべて本タスクのスコープ外であり、登録作業は別タスクとして切り出すことを推奨する。
