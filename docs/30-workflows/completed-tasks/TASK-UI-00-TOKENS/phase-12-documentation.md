# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 12                |
| 機能名 | TASK-UI-00-TOKENS |
| 作成日 | 2026-02-22        |

## 目的

実装した内容（tokens.cssのlight/darkテーマ定義、マイクロインタラクション変数、renderWithThemeテストヘルパー）をシステムドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 参照資料

| 資料名                | パス                                                                        | 説明                        |
| --------------------- | --------------------------------------------------------------------------- | --------------------------- |
| 最終レビュー          | `outputs/phase-10/final-review-result.md`                                   | Phase 10成果物              |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`                                    | Phase 11成果物              |
| 仕様更新ワークフロー  | `references/spec-update-workflow.md`                                        | Task 2の詳細手順            |
| 更新履歴テンプレート  | `references/documentation-changelog-template.md`                            | Task 3のテンプレート        |
| 未タスクガイドライン  | `references/unassigned-task-guidelines.md`                                  | Task 4の判断基準            |
| UI/UXデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`  | 更新対象仕様書              |
| タスク運用仕様        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 完了記録・未タスク連携仕様  |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート・検証記録基準    |
| アーキテクチャルール  | `.claude/rules/01-architecture.md`                                          | Apple HIG準拠カラーパレット |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                        | P1-P4, P25-P29対策          |
| 要件定義書            | `outputs/phase-1/requirements-definition.md`                                | Phase 1 成果物              |
| アーキテクチャ設計書  | `outputs/phase-2/architecture-design.md`                                    | Phase 2 成果物              |
| tokens.css更新済み    | `apps/desktop/src/renderer/styles/tokens.css`                               | Phase 5 成果物              |
| リファクタリングログ  | `outputs/phase-8/refactoring-log.md`                                        | Phase 8 成果物              |
| 品質レポート          | `outputs/phase-9/quality-report.md`                                         | Phase 9 成果物              |

- 依存Phase成果物参照: `phase-1-*`、`phase-2-*`、`phase-5-*`、`phase-6-*`、`phase-7-*`、`phase-8-*`、`phase-9-*`、`phase-10-*`、`phase-11-*`

## 事前チェック: 既知の落とし穴確認【必須】

Phase 12で頻出する漏れパターンを事前に確認する。

| Pitfall ID | 内容                                     | 対策                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------ |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の両方を更新 |
| P2         | topic-map.md 再生成忘れ                  | `node generate-index.js` を実行                                    |
| P3         | 未タスク管理の3ステップ不完全            | ①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップ実行     |
| P4         | documentation-changelog への早期「完了」 | 全Step完了前に「完了」と記載しない                                 |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1と同一対策を明示的に再確認                                       |
| P26        | システム仕様書更新遅延                   | Phase 12完了時点で仕様書を更新する（PRマージを待たない）           |
| P27        | topic-map.md再生成トリガー判断ミス       | 仕様書に変更があれば必ず再生成                                     |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」レポートを作成                       |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.mdと合わせてSKILL.mdも更新                                    |

## 実行タスク

- 実装ガイド作成: Part 1/Part 2 の2層で実装内容を文書化する
- システムドキュメント更新: spec-update-workflow 準拠で仕様更新を完了する
- 未タスク検出と記録: 未実施タスクを0件時も含めてレポート化する

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート     | 対象読者                 | 内容                                                 |
| ---------- | ------------------------ | ---------------------------------------------------- |
| **Part 1** | **初学者・中学生レベル** | **概念説明（日常の例え話、専門用語なし）**           |
| **Part 2** | **開発者・技術者**       | **技術的詳細（CSS変数設計・API・TypeScript型定義）** |

#### Part 1（中学生レベル）の記載内容

- **テーマカラーとは何か**:
  - 「部屋の照明切替」の例え:
    - 昼間は明るい白い照明（lightテーマ）で本を読みやすくする
    - 夜は暖色の間接照明（darkテーマ）で目に優しくする
    - 照明のスイッチを切り替えるだけで、部屋の雰囲気が一瞬で変わる
  - テーマ切替は「照明スイッチ」と同じ。ボタン1つで画面全体の色が変わる

- **マイクロインタラクションとは何か**:
  - 「ボタンを押した時の手応え」の例え:
    - エレベーターのボタンを押すと光る → 押したことが分かる
    - ゲームのコントローラーが振動する → 反応があったことが分かる
  - 画面のボタンにマウスを載せた時の微妙な変化が「ちゃんと反応してるよ」のサイン

- **テストヘルパーとは何か**:
  - 「着せ替え人形で服を試す」の例え:
    - 新しい服（コンポーネント）が3種類の体型（テーマ）全てに合うか確認する道具
    - 1つずつ着替えなくても、3パターン一気にチェックできる

#### Part 2（技術者レベル）の記載内容

- **CSS変数設計**:
  - `:root`（kanagawa-dragon）、`[data-theme="light"]`、`[data-theme="dark"]` の3レイヤー構成
  - Apple HIG System Colors準拠のカラーパレット定義
  - セマンティックトークン（`--color-bg`, `--color-text`, `--color-accent`等）

- **マイクロインタラクション変数**:
  - `--interaction-hover-scale`: `1.02`（ホバー時微拡大）
  - `--interaction-active-scale`: `0.97`（押下時微縮小）
  - `--interaction-duration`: `200ms`（トランジション時間）
  - `--interaction-easing`: `cubic-bezier(0.4, 0, 0.2, 1)`（イージング）
  - `@keyframes success-bounce` / `@keyframes error-shake` の定義

- **renderWithTheme API**:

  ```typescript
  renderWithTheme(ui: ReactElement, options?: { theme?: 'light' | 'dark' | 'kanagawa-dragon' })
  renderWithAllThemes(ui: ReactElement)
  ```

- **テスト戦略**:
  - テーマ横断テストのパターン（`renderWithAllThemes` で3テーマ一括テスト）
  - CSS変数の存在確認テスト
  - テーマ切替テスト

**成果物パス**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システムドキュメント更新【必須】

spec-update-workflow.md 準拠で実施する。

#### Step 1-A: タスク完了記録

| 更新対象                               | 更新内容                                    |
| -------------------------------------- | ------------------------------------------- |
| 該当仕様書（ui-ux-design-system.md等） | TASK-UI-00-TOKENS 完了記録追加              |
| `aiworkflow-requirements/LOGS.md`      | タスク完了エントリ追加                      |
| `task-specification-creator/LOGS.md`   | タスク完了エントリ追加（**2ファイル両方**） |
| `aiworkflow-requirements/SKILL.md`     | 変更履歴テーブル更新                        |
| `task-specification-creator/SKILL.md`  | 変更履歴テーブル更新                        |

**P1/P25対策**: LOGS.mdは**必ず2ファイル**更新すること。
**P29対策**: SKILL.mdの変更履歴テーブルも**必ず**更新すること。

#### Step 1-B: 実装状況テーブル更新

| 更新対象                 | 更新内容                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `ui-ux-design-system.md` | デザイントークン定義セクションのステータスを「実装済み」に更新 |

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-UI-00-TOKENS" .claude/skills/*/references/
```

検出された全仕様書の関連タスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成

```bash
node generate-index.js
```

**P2/P27対策**: 仕様書にセクション変更（追加・削除・更新）がある場合は**必ず**再生成する。

#### Step 2: システム仕様更新

以下の仕様書を更新する（該当する場合のみ）:

| 更新対象仕様書                  | 更新内容                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| `ui-ux-design-system.md`        | デザイントークンセクションにlight/darkテーマ変数定義を追加 |
| `ui-ux-components.md`（該当時） | renderWithThemeテストヘルパーの記載追加                    |

**P26対策**: PRマージを待たず、Phase 12完了時点で仕様書を更新する。

---

### Task 3: documentation-changelog.md 作成【必須】

| 記載項目          | 内容                               |
| ----------------- | ---------------------------------- |
| 変更日            | 2026-02-22                         |
| タスクID          | TASK-UI-00-TOKENS                  |
| Step 1-A 完了状況 | 各ファイルの更新結果を詳細記録     |
| Step 1-B 完了状況 | テーブル更新結果を記録             |
| Step 1-C 完了状況 | grep結果と更新結果を記録           |
| Step 1-D 完了状況 | topic-map.md再生成の実行結果を記録 |
| Step 2 完了状況   | 仕様書更新の詳細結果を記録         |
| Task 4 完了状況   | 未タスク検出結果を記録             |
| Task 5 完了状況   | スキルフィードバック結果を記録     |

**P4対策**: 全Step/Task の結果確認が完了するまで「完了」と記載しない。各Stepの結果を逐次記録する。

**成果物パス**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出【必須】

未タスクレポートを作成する。0件でも必須。

#### 検出候補

| 候補                                | 根拠                                                                                                              | 判定         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------ |
| settingsSliceテーマ固定解除         | 現在テーマはsettingsSliceで`kanagawa-dragon`固定の可能性がある。light/darkテーマの動的切替にはslice側の対応が必要 | 未タスク候補 |
| Tailwind CSS カスタムプロパティ統合 | tokens.cssの変数をTailwindのtheme設定に反映する作業                                                               | 未タスク候補 |

#### 未タスク管理3ステップ（P3対策）

検出した未タスクは以下の3ステップを**全て**完了すること:

1. `unassigned-task/` に指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

**成果物パス**:

- `outputs/phase-12/unassigned-task-report.md`
- `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート作成【必須】

**P28対策**: 改善点がなくても「改善点なし」としてレポートを作成する。

| 検討項目                 | 内容                                               |
| ------------------------ | -------------------------------------------------- |
| ワークフロー改善点       | デザイントークンタスクの効率的な進め方に関する知見 |
| スキルテンプレート改善点 | CSS変数定義タスク向けのPhaseテンプレート改善案     |
| ツーリング改善点         | テーマ切替の自動テスト改善案                       |

**成果物パス**: `outputs/phase-12/skill-feedback-report.md`

---

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先               |
| ---------------- | --------------------------------------------- | -------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件 |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、完了条件 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 実行タスク、完了条件 |

## 実行手順

| Step | 内容                                                  | 実行方式 |
| ---- | ----------------------------------------------------- | -------- |
| 1    | Task 1: 実装ガイド（Part 1/Part 2）を作成する         | 直列     |
| 2    | Task 2: Step 1-A〜1-D と Step 2 を順に実施する        | 直列     |
| 3    | Task 3: documentation-changelog を更新する            | 直列     |
| 4    | Task 4: 未タスク検出レポートを作成する（0件でも出力） | 直列     |
| 5    | Task 5: スキルフィードバックレポートを作成する        | 直列     |
| 6    | 漏れやすいポイントテーブルの全項目を確認する          | 直列     |

## 漏れやすいポイントテーブル【最終確認用】

| Pitfall ID | 確認項目                                                                      | チェック |
| ---------- | ----------------------------------------------------------------------------- | -------- |
| P1         | LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）更新 | [ ]      |
| P2         | topic-map.md を `node generate-index.js` で再生成                             | [ ]      |
| P27        | topic-map.md 再生成トリガーを「変更あり」で判断（追加・削除・更新全て）       | [ ]      |
| P29        | SKILL.md 変更履歴テーブル（2ファイル）更新                                    | [ ]      |
| P3         | 未タスク3ステップ（指示書 → 残課題テーブル → 関連仕様書リンク）全完了         | [ ]      |
| P4         | 全Step完了後に初めて「完了」記載                                              | [ ]      |
| P28        | スキルフィードバックレポート作成済み                                          | [ ]      |

## 成果物

| 成果物               | パス                                            | 説明                        |
| -------------------- | ----------------------------------------------- | --------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2 構成        |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 全Step結果記録              |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスク一覧と3ステップ状態 |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`    | 未タスク詳細                |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善提案                    |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1 中学生レベル + Part 2 技術者レベル）が作成されている
- [ ] Task 2 Step 1-A: LOGS.md **2ファイル** + SKILL.md **2ファイル** + 該当仕様書が更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている
- [ ] Task 2 Step 1-C: `grep -rn "TASK-UI-00-TOKENS"` で検出された全仕様書が更新されている
- [ ] Task 2 Step 1-D: `node generate-index.js` でtopic-map.mdが再生成されている
- [ ] Task 2 Step 2: ui-ux-design-system.md のデザイントークンセクションが更新されている
- [ ] Task 3: documentation-changelog.md に全Step/Task結果が記録されている
- [ ] Task 4: 未タスクレポートが作成されている（0件でもレポート必須）
- [ ] Task 4: 検出した未タスクの3ステップ（指示書・残課題テーブル・関連仕様書リンク）が全完了
- [ ] Task 5: スキルフィードバックレポートが作成されている
- [ ] 漏れやすいポイントテーブルの全項目がチェック済み
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

[Phase 13: PR作成](phase-13-pr-creation.md)
