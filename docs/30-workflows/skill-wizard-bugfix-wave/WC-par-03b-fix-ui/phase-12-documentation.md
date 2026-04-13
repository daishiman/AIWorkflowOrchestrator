# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 12                                                                      |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 11                                                                |
| 後続Phase  | Phase 13                                                                |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして Phase 12 canonical 6成果物を揃え、
UI整合性修正の current facts をドキュメントへ同期する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件              |
| -------- | --------------------------------------- | --------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可            |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可            |
| C        | `system-spec-update-summary.md`         | Part 2 確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可            |
| E        | `unassigned-task-detection.md`          | D と並列可            |
| F        | `skill-feedback-report.md`              | E と並列可            |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行  |

## 実行タスク（必須6タスク）

- [ ] **タスク1**: 実装ガイド作成（Part 1 中学生向け / Part 2 技術者向けの2パート構成）
- [ ] **タスク2**: システム仕様更新（skill-wizard-bugfix-wave index.md・task-workflow・関連ドキュメント更新）
- [ ] **タスク3**: ドキュメント更新履歴作成
- [ ] **タスク4**: 未タスク検出レポート作成
- [ ] **タスク5**: スキルフィードバックレポート作成
- [ ] **タスク6**: Phase 12 タスク仕様準拠チェック

## 参照資料

| 資料名               | パス                                                                          | 説明               |
| -------------------- | ----------------------------------------------------------------------------- | ------------------ |
| 実装済みファイル     | `packages/shared/src/types/skillCreator.ts`                                   | ドキュメント化対象 |
| 実装済みファイル     | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | ドキュメント化対象 |
| 実装済みファイル     | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | ドキュメント化対象 |
| 実装済みファイル     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | ドキュメント化対象 |
| バグ修正ウェーブ全体 | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                         | 上位レーン仕様書   |
| task-spec 正本       | `.claude/skills/task-specification-creator/SKILL.md`                          | Phase 12 判定基準  |
| system spec 正本     | `.claude/skills/aiworkflow-requirements/SKILL.md`                             | current facts 基準 |
| topic map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                 | 用語・依存の整合   |

## 実行手順

### タスク1: 実装ガイド

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生向け説明

**テーマ**: 「ボタンの色を統一することとタグを複数選べるようにする理由」

- 日常のたとえ話を必ず入れ、`たとえば` を最低1回含める
- カテゴリ選択が「1枚しか選べなかったラベルシール」から「何枚でも貼れるラベルシール」になったことをたとえで説明する
- ProgressBarが「ページ番号」から「実際にどこまで答えたか」を示すようになったことを説明する
- ボタンの色を統一することで「どのボタンが重要か一目でわかる」という価値を説明する

#### Part 2: 技術者向け説明

**テーマ**: UI整合性修正の実装詳細

必須要素:

- `SkillInfoFormData.category`の型変更（`SkillCategory | null` → `SkillCategory[]`）と影響範囲
- `handleCategoryClick`のトグルロジック（追加・解除・空配列維持）
- `currentQuestion`の動的計算（`Math.max(1, answeredCount)`）
- ボタンCSS変数統一（`--status-primary`, `--text-inverse`）
- エラーハンドリング/エッジケース（未選択・再クリック・負荷時の挙動）
- 設定可能なパラメータ/定数（選択数や表示文言など）の一覧
- subpathexportへの影響方針（ルートbarrelには変更なし）
- `artifacts.json`の更新内容

### タスク2: システム仕様更新

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: 完了タスク記録・関連リンク更新

- `docs/30-workflows/skill-wizard-bugfix-wave/index.md`にWave C完了記録を追加する
- `artifacts.json`のstatusを`pending`から`completed`に更新する
- `artifacts.json`と`outputs/artifacts.json`のtitle / type / status / phase artifact名のparityを確認する
- 更新要否の判定理由（current facts / no-op / update）を記録する
- `LOGS.md`を更新する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に Wave C 完了記録を追加し、`.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` を current facts に同期する
- `.claude/skills/task-specification-creator/SKILL.md` / `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- `.claude/skills/task-specification-creator/LOGS.md` / `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に UI 整合性修正セクションを追加する

#### Step 1-B: 実装状況テーブル更新

- `SkillInfoFormData.category`: `SkillCategory | null` → `SkillCategory[]` に変更済みを記録する
- 問題2・3・11・15・16の修正完了を記録する

#### Step 1-C: 関連タスクテーブル更新

- TASK-SW-FIX-UI-001のステータスを`completed`に更新する
- Wave C（TASK-SW-FIX-STATE-DETAIL-001と並列）の完了を記録する

#### Step 2: システム仕様更新

- `SkillInfoFormData.category` の型変更、`handleCategoryClick`、`currentQuestion`、`SkillCreateWizard` の current facts を `system-spec-update-summary.md` に記録する
- `artifacts.json` と `outputs/artifacts.json` の同期結果、no-op / update 判定、更新要否の理由を束ねる
- UI 整合性修正の current facts を state contract として固定する

### タスク3: 更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

```markdown
## 2026-04-12 TASK-SW-FIX-UI-001 完了

- `packages/shared/src/types/skillCreator.ts`:
  `SkillInfoFormData.category` を `SkillCategory | null` から `SkillCategory[]` に変更（問題2）
- `apps/desktop/.../SkillInfoStep.tsx`:
  `handleCategoryClick` をトグル動作に修正（問題15）
  カテゴリ `isSelected` 判定を `includes(value)` に変更
  「次へ」ボタンを CSS変数 `--status-primary` に統一（問題3）
- `apps/desktop/.../ConversationRoundStep.tsx`:
  `currentQuestion` を `Math.max(1, answeredCount)` で動的計算に変更（問題11・16）
- `apps/desktop/.../SkillCreateWizard.tsx`:
  LLMモード「次へ」ボタンを CSS変数 `--status-primary` に統一（問題3）
```

- 変更ファイル一覧、validator結果、current/baseline区別、artifacts同期結果をあわせて記録する

### タスク4: 未タスク検出

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

本タスク実装中に発見した未解決事項・後続タスクの候補を記録する。

0件でも結論を残し、候補がある場合は current facts として記録する。

**検出観点**:

| 項目                            | 内容                                                                      | 優先度 |
| ------------------------------- | ------------------------------------------------------------------------- | ------ |
| カテゴリ選択の最大件数制限      | 現在は上限なし。UX観点で3〜5件程度の上限を設けるか検討                    | 低     |
| カテゴリ解除時のアニメーション  | トグル解除にフェードアニメーションを追加するとUXが向上する                | 低     |
| ProgressBarのアニメーション     | 動的変化にtransitionアニメーションを追加する余地がある（既にCSS定義済み） | 低     |
| SkillCreateWizardの他ボタン確認 | LLMモード以外のボタンに`bg-blue-600`が残存していないか追加確認            | 中     |

### タスク5: スキルフィードバック

**出力先**: `outputs/phase-12/skill-feedback-report.md`

- `category: SkillCategory[]`への変更により、将来的なカテゴリ追加が容易になる
- `handleCategoryClick`のトグルロジックは`??`演算子で`null`→配列変換を行う設計が自然
- `currentQuestion`の`Math.max(1, answeredCount)`はシンプルで理解しやすい
- CSS変数統一により、テーマ変更時に全ボタンが自動的に追従するメンテナンス性が向上した
- subpathexportに閉じた型変更方針により、ルートbarrelへの影響を最小化できた
- 論点→採用思考法→結論の対応表を入れ、30思考法の traceability を残す

### タスク6: Phase 12 タスク仕様準拠チェック

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

全6成果物が揃っていることを確認し、task-specification-creatorとaiworkflow-requirementsの両方に対する準拠を最終確認する。

- canonical filenameの不一致を確認する
- planned wordingが残っていないことを確認する
- `artifacts.json`の2ファイル同期を確認する
- `artifacts.json`と`outputs/artifacts.json`のtitle / type / status / phase artifact名 parity を確認する
- PASS / FAIL と不足点を記録する

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [ ] タスク1: 実装ガイドの2パートが作成されている
- [ ] タスク2: システム仕様更新が完了している
- [ ] タスク3: 更新履歴が記録されている
- [ ] タスク4: 未タスク検出レポートが0件でも作成されている
- [ ] タスク5: スキルフィードバックが0件でも作成されている
- [ ] タスク6: 仕様準拠チェックがPASSである
