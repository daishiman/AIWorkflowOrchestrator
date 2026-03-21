# Phase 12: ドキュメント

## メタ情報

| 項目          | 内容                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 12                                                                                                                      |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                    |
| 作成日        | 2026-03-21                                                                                                              |
| 担当          | -                                                                                                                       |
| ステータス    | 未着手                                                                                                                  |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-11-manual-test.md` |

## 目的

実装ガイド作成・システム仕様書更新・documentation-changelog 記録・未タスク検出の4つのタスクを完了し、TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT の成果物を仕様書に反映させる。

> **警告**: P1/P25対策 — LOGS.md は `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の2ファイルを両方更新すること。
> **警告**: P4/P51対策 — documentation-changelog への「完了」記載は全 Step 完了後の最後に行うこと。

## 実行タスク

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明（日常例えを必須で含める）

**対象読者**: プログラミング初心者・非エンジニア

**作成内容**: `outputs/phase-12/implementation-guide.md` の Part 1 セクション

**説明すべき概念**:

1. **インラインセレクター（Inline Selector）とは**: 画面の流れを妨げずに選択できる小さなドロップダウン
   - 日常例え: 「テレビのリモコンで使うチャンネルのダイヤル選択のようなもの。テレビの画面を変えなくても、手元のリモコンでサッとチャンネルを変えられる。InlineModelSelector も、別の設定画面に移動せずに、その場で AI モデルを選べる」

2. **プロバイダー（Provider）とモデル（Model）の2段階選択とは**: まずメーカーを選び、次にそのメーカーの製品を選ぶ仕組み
   - 日常例え: 「スマートフォンを選ぶとき、まず『Apple』か『Samsung』かを選び（プロバイダー）、次に『iPhone 15』か『iPhone 16』かを選ぶ（モデル）のと同じ。InlineModelSelector も、まず AI のメーカー（Anthropic、OpenAI 等）を選び、次にそのモデル（Claude、GPT-4 等）を選ぶ」

3. **ヘルスステータスドット（Health Status Dot）とは**: AI サービスの動作状態を色のドットで示す表示
   - 日常例え: 「エレベーターのボタンの横にある小さなランプのようなもの。緑なら『正常動作中』、黄なら『少し混んでいる』、赤なら『故障中』とわかる。InlineModelSelector のドットも、AI が正常なら緑、問題があれば色が変わって知らせてくれる」

4. **compact モード（Compact Mode）とは**: 狭いスペースにも収まるように表示を小さくする設定
   - 日常例え: 「折りたたみ傘と普通の傘のようなもの。どちらも雨をしのげるが、折りたたみ傘はカバンに入れやすいサイズになっている。compact モードは機能はそのままで、表示サイズだけ小さくする」

#### Part 2: 開発者向け実装詳細

**対象読者**: このコードベースを実装・保守するエンジニア

**作成内容**: `outputs/phase-12/implementation-guide.md` の Part 2 セクション

**記述すべき内容**:

1. **コンポーネント構成**
   - `InlineModelSelector.tsx`: メインコンポーネント（molecules/organisms 相当）
   - `SelectorTrigger`: ドロップダウントリガー（atom）
   - `SelectorDropdown`: ドロップダウンコンテンツ（molecule）

2. **Props API**
   - `compact?: boolean`: コンパクト表示切替（デフォルト: false）
   - `className?: string`: 追加 CSS クラス
   - `onSelectionChange?: (selection: { providerId: string; modelId: string }) => void`: 選択変更コールバック
   - `disabled?: boolean`: 無効化（デフォルト: false）
   - `providers?: Provider[]`: プロバイダーリスト（Store 経由取得が優先）

3. **State 管理設計**
   - ドロップダウン開閉: `useState`（ローカル状態）
   - Provider/Model 選択: Zustand 個別セレクタ（P31対策: 合成 Hook 禁止）
   - 外部クリック検知: `useRef` + `useEffect`

4. **デザイントークン定数の構造（P47対策）**
   - `selectorTriggerStyles`: トリガーのスタイル定数（エクスポート済み）
   - `healthDotStyles`: ヘルスドットのスタイル定数（エクスポート済み）

5. **既知の制約**
   - `providers` prop が渡されていない場合は Store（`useLLMProviders()`）から取得する
   - ヘルスステータスは外部から IPC 経由で取得するため、初期状態は `checking` になる

**実装ガイドの出力先**: `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-12/implementation-guide.md`（新規作成）

---

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

> **P43対策**: 更新対象が4ファイル以上の場合は SubAgent を複数に分割（3ファイル以下/エージェント）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書（`arch-ui-components.md` 等）にタスク完了記録を追加する
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（**2ファイル両方**、P1対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

```bash
# LOGS.md の場所を確認
find .claude/skills -name "LOGS.md"
# 2ファイル存在することを確認
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `arch-ui-components.md` の LLM コンポーネントセクションに `InlineModelSelector` を追記する

#### Step 1-C: 関連タスクテーブル

```bash
# 関連仕様書の検索
grep -rn "TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT" .claude/skills/aiworkflow-requirements/references/
grep -rn "InlineModelSelector\|inline-model-selector" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 検索結果の仕様書に完了ステータスを更新する

#### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md 再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] `node generate-index.js` を実行し、topic-map.md を再生成した

#### Step 2: システム仕様更新（新規コンポーネントのため対象）

- [ ] `arch-ui-components.md`: `InlineModelSelector` コンポーネントの仕様を追記する
  - Props インターフェース
  - 内部構成（SelectorTrigger / SelectorDropdown）
  - Store 連携パターン
  - デザイントークン定数のエクスポート構造

---

### Task 3: outputs/phase-12/documentation-changelog.md

> **P4/P51対策**: 全 Step 確認前に「完了」と記載しない。各 Step の実行後に事後記録する。

**出力先**: `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-12/documentation-changelog.md`（新規作成）

**記録内容**:

- Task 1 実装ガイド: 作成したファイルのパスと主な内容
- Task 2 Step 1-A: 更新した LOGS.md / SKILL.md のパスと更新内容
- Task 2 Step 1-B: arch-ui-components.md の更新内容
- Task 2 Step 1-C: 関連仕様書の検索結果と更新内容
- Task 2 Step 1-D: generate-index.js の実行結果（再生成されたファイル数等）
- Task 2 Step 2: システム仕様更新の内容
- Task 4 未タスク検出: 検出件数と対応結果

---

### Task 4: 未タスク検出

> **P3/P38対策**: 0件でも必須。未タスク指示書は `docs/30-workflows/unassigned-task/` に配置すること。

**検出基準**: このタスク実装中に発見した、今回のスコープ外の問題・改善点

**検出候補例**:

- InlineModelSelector を実際のチャット画面（ChatPanel 等）へ組み込むタスク
- ヘルスステータスを IPC 経由で取得する実装タスク
- アクセシビリティ（WCAG 2.1 AA）の詳細な検証タスク

**3ステップを必ず全て実行**:

1. `docs/30-workflows/unassigned-task/<タスク名>.md` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（例: `arch-ui-components.md`）に参照リンクを追加する

**outputs/phase-12/unassigned-task-detection.md の更新**:

```bash
# 既存の outputs/phase-12/unassigned-task-detection.md を確認
find docs/30-workflows/chat-inline-model-selector -name "unassigned-task-detection.md"
```

- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータスを更新する
- [ ] `artifacts.json` の Phase 12 ステータスを更新する（存在する場合）

**P56対策**: 再評価クローズした未タスクがある場合は対応する GitHub Issue を `gh issue close` で同時に Close する。

---

### Task 5: スキルフィードバックレポート作成

- [ ] スキル改善検討を実施
- [ ] 改善点がなくても「改善点なし」としてレポートを作成
- [ ] `outputs/phase-12/skill-feedback-report.md` に出力

## 参照資料

### プロジェクトルール

| 資料名           | パス                                 |
| ---------------- | ------------------------------------ |
| タスク実行ルール | `.claude/rules/05-task-execution.md` |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md` |

### 前Phase成果物

| 資料名              | パス                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-11-manual-test.md` |

### 既知の落とし穴（Phase 12 固有）

| 落とし穴ID | 説明                                                | 対策                                                         |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------ |
| P1/P25     | LOGS.md 2ファイル更新漏れ                           | aiworkflow-requirements と task-specification-creator の両方 |
| P2/P27     | topic-map.md 再生成忘れ                             | `node generate-index.js` を必ず実行する                      |
| P3/P38     | 未タスク管理の3ステップ不完全・配置ディレクトリ誤り | `unassigned-task/` ディレクトリへの配置を確認する            |
| P4/P51     | documentation-changelog への早期「完了」記載        | 全 Step 完了後の最後に記録する                               |
| P43        | サブエージェントの rate limit 中断                  | 更新ファイルを3以下/エージェントに分割する                   |
| P56        | 再評価クローズ時の GitHub Issue Close 漏れ          | クローズ時に `gh issue close` を同時実行する                 |
| P57        | 設計タスクでの仕様書更新先送り                      | worktree 環境でも Phase 12 完了時に実更新する                |
| P59        | 並列エージェントの changelog 件数不整合             | changelog は最後にメインエージェントが統合して記録する       |

## 実行手順

1. **Task 1 の実施**: 実装ガイド Part 1（中学生向け例え）と Part 2（技術者向け）を作成する
2. **Task 2 Step 1-A の実施**: LOGS.md (2ファイル) と SKILL.md (2ファイル) を更新する
3. **Task 2 Step 1-B の実施**: arch-ui-components.md の実装状況テーブルを更新する
4. **Task 2 Step 1-C の実施**: 関連仕様書を検索して更新する
5. **Task 2 Step 1-D の実施**: `node generate-index.js` で topic-map.md を再生成する
6. **Task 2 Step 2 の実施**: arch-ui-components.md のシステム仕様を更新する
7. **Task 3 の実施**: 全 Step の実行結果を outputs/phase-12/documentation-changelog.md に事後記録する
8. **Task 4 の実施**: 未タスクを検出し、3ステップで登録する（0件でも実施・記録する）
9. **最終確認**: `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

## 成果物

| 成果物                        | パス                                                                                                                                          | 説明                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 12 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-12-documentation.md`                     | ドキュメント化計画書                       |
| 実装ガイド                    | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-12/implementation-guide.md`      | Part 1（概念）+ Part 2（技術詳細）         |
| documentation-changelog       | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-12/documentation-changelog.md`   | 全 Step の変更記録                         |
| unassigned-task-detection     | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-12/unassigned-task-detection.md` | 0件でも作成必須                            |
| 更新済みシステム仕様書        | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                                     | InlineModelSelector コンポーネント仕様追記 |
| スキルフィードバックレポート  | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-12/skill-feedback-report.md`     | 改善点なしの場合も作成必須                 |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1（中学生向け例え）を作成した
- [ ] Task 1: 実装ガイド Part 2（技術者向け詳細）を作成した
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/LOGS.md` を更新した
- [ ] Task 2 Step 1-A: `task-specification-creator/LOGS.md` を更新した（**P1対策: 2ファイル両方**）
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/SKILL.md` の変更履歴を更新した
- [ ] Task 2 Step 1-A: `task-specification-creator/SKILL.md` の変更履歴を更新した
- [ ] Task 2 Step 1-B: arch-ui-components.md の LLM コンポーネントセクションを更新した
- [ ] Task 2 Step 1-C: 関連仕様書を検索し、必要な更新を行った
- [ ] Task 2 Step 1-D: `node generate-index.js` を実行し、topic-map.md を再生成した（**P2対策**）
- [ ] Task 2 Step 2: arch-ui-components.md に InlineModelSelector のシステム仕様を追記した
- [ ] Task 3: outputs/phase-12/documentation-changelog.md に全 Step の実行結果を事後記録した（**P4対策: 完了は最後**）
- [ ] Task 4: outputs/phase-12/unassigned-task-detection.md を作成した（**0件でも必須**）
- [ ] Task 4: 未タスクを3ステップで登録した（指示書作成 → task-workflow登録 → 仕様書リンク追加）
- [ ] `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認した（**P51対策**）
- [ ] Task 5: スキルフィードバックレポートを作成した（改善点なしの場合も必須）

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 12
```

## 次のPhase

Phase 13: 完了（`phase-13-pr-creation.md`）
