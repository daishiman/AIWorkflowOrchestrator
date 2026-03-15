# Phase 13: PR作成（設計成果物パッケージング）

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 13                                                       |
| Phase名    | PR作成（設計成果物パッケージング）                       |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                  |
| タスク名   | 作成済みスキルを使う主導線                               |
| 機能名     | created-skill-usage-journey                              |
| 前提Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| 後続Phase  | なし（本タスクの最終Phase）                              |
| ステータス | not_started                                              |
| 作成日     | 2026-03-15                                               |

## 目的

本タスクは「設計タイプ」であるため、Phase 13 は実装コードの PR ではなく、**設計成果物（仕様書群）の最終パッケージング**として実施する。Phase 1-12 の全成果物が揃い、品質基準を満たした状態であることを確認した上で、設計仕様書ブランチの PR 本文を生成する。

## 実行タスク

- タスク1: 全 Phase 成果物の最終確認（Phase 1-12 の outputs ファイル存在確認 + artifacts.json 更新）
- タスク2: PR 本文の生成（Summary / Test Plan / 変更ファイル一覧）
- タスク3: コミット前チェックリスト（ファイル存在確認・リンク整合性）
- タスク4: ブランチ名・PR タイトルの確認

## 参照資料

| 参照資料                 | パス                                                                                                                         | 説明                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)                                                                         | 受入基準 AC-1〜AC-4                |
| Phase 2 設計             | [phase-2-design.md](./phase-2-design.md)                                                                                     | コンポーネント・状態管理・IPC 設計 |
| Phase 3 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)                                                                       | ゲート判定・MINOR 指摘一覧         |
| Phase 5 実装             | [phase-5-implementation.md](./phase-5-implementation.md)                                                                     | outputs 確定結果                   |
| Phase 6 テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)                                                                     | 失敗系/境界値ケース                |
| Phase 7 カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)                                                                     | カバレッジギャップ                 |
| Phase 8 リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)                                                                           | 用語統一・参照正規化               |
| Phase 9 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)                                                               | 品質判定・リンク検証               |
| Phase 10 最終レビュー    | [phase-10-final-review.md](./phase-10-final-review.md)                                                                       | 最終ゲート判定                     |
| Phase 11 手動テスト      | [phase-11-manual-test.md](./phase-11-manual-test.md)                                                                         | ウォークスルー結果・総合判定       |
| Phase 12 ドキュメント    | [phase-12-documentation.md](./phase-12-documentation.md)                                                                     | 実装ガイド・システム仕様書更新記録 |
| Task01 画面責務          | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 依存タスク成果物確認               |
| Task04 ゲート設計        | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | 依存タスク成果物確認               |
| index.md                 | [index.md](./index.md)                                                                                                       | タスク全体概要・Phase 一覧         |

## 実行手順

---

### タスク1: 全 Phase 成果物の最終確認

#### ステップ1-1: Phase 別ファイル存在確認

以下のコマンドで全 Phase の仕様書ファイルが揃っていることを確認する。

```bash
ls -1 docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-*.md
```

| Phase | ファイル名                   | 存在確認 |
| ----- | ---------------------------- | -------- |
| 1     | phase-1-requirements.md      | 未確認   |
| 2     | phase-2-design.md            | 未確認   |
| 3     | phase-3-design-review.md     | 未確認   |
| 4     | phase-4-test-creation.md     | 未確認   |
| 5     | phase-5-implementation.md    | 未確認   |
| 6     | phase-6-test-expansion.md    | 未確認   |
| 7     | phase-7-coverage-check.md    | 未確認   |
| 8     | phase-8-refactoring.md       | 未確認   |
| 9     | phase-9-quality-assurance.md | 未確認   |
| 10    | phase-10-final-review.md     | 未確認   |
| 11    | phase-11-manual-test.md      | 未確認   |
| 12    | phase-12-documentation.md    | 未確認   |
| 13    | phase-13-pr-creation.md      | 未確認   |

#### ステップ1-2: outputs ディレクトリの成果物確認

```bash
find docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/ -name "*.md" | sort
```

| outputs パス                                    | 必須 | 存在確認 |
| ----------------------------------------------- | ---- | -------- |
| `outputs/phase-11/walkthrough-scenario-a.md`    | Yes  | 未確認   |
| `outputs/phase-11/walkthrough-scenario-b.md`    | Yes  | 未確認   |
| `outputs/phase-11/walkthrough-scenario-c.md`    | Yes  | 未確認   |
| `outputs/phase-11/walkthrough-feedback-loop.md` | Yes  | 未確認   |
| `outputs/phase-11/walkthrough-edge-cases.md`    | Yes  | 未確認   |
| `outputs/phase-11/manual-test-report.md`        | Yes  | 未確認   |
| `outputs/phase-12/implementation-guide.md`      | Yes  | 未確認   |
| `outputs/phase-12/documentation-changelog.md`   | Yes  | 未確認   |
| `outputs/phase-12/unassigned-task-report.md`    | Yes  | 未確認   |
| `outputs/verification-report.md`                | Yes  | 未確認   |

#### ステップ1-3: artifacts.json 最終ステータス更新

`artifacts.json` が存在する場合は全 Phase のステータスを確認・更新する。

```bash
cat docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/artifacts.json 2>/dev/null || echo "artifacts.json 未作成"
```

更新すべき状態（全 Phase 完了時）:

```json
{
  "taskId": "TASK-SKILL-LIFECYCLE-05",
  "taskName": "作成済みスキルを使う主導線",
  "taskType": "design",
  "status": "completed",
  "phases": {
    "phase-1": "completed",
    "phase-2": "completed",
    "phase-3": "completed",
    "phase-4": "completed",
    "phase-5": "completed",
    "phase-6": "completed",
    "phase-7": "completed",
    "phase-8": "completed",
    "phase-9": "completed",
    "phase-10": "completed",
    "phase-11": "completed",
    "phase-12": "completed",
    "phase-13": "in_progress"
  },
  "acceptanceCriteria": {
    "AC-1": "met",
    "AC-2": "met",
    "AC-3": "met",
    "AC-4": "met"
  },
  "completedAt": "2026-03-15"
}
```

- [ ] `artifacts.json` の全 Phase ステータスが実際の完了状態を反映している
- [ ] Phase 13 ステータスが `in_progress` → `completed` に更新されている（本 Phase 完了時）

#### ステップ1-4: index.md の Phase 一覧ステータス更新

`index.md` の Phase 一覧テーブルの `ステータス` 列を全て `completed` に更新する。

```bash
# ステータスが not_started のまま残っている行を確認
grep "not_started" docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/index.md
```

- [ ] `index.md` の全 Phase ステータスが `completed` に更新されている

#### ステップ1-5: 受入基準の充足確認

| 受入基準 ID | 基準                                         | 充足根拠                                                                  | 判定   |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| AC-1        | 作成直後の「今すぐ使う」導線が定義されている | Phase 2 ステップ1 CTA仕様表（RECOMMENDED/USE_ALLOWED → Primary CTA）      | 未確認 |
| AC-2        | 保存済みスキルの再利用導線が定義されている   | Phase 2 ステップ2 Skill Center（おすすめ/最近使った/保存済み3セクション） | 未確認 |
| AC-3        | 実行結果から改善へ戻る導線が定義されている   | Phase 2 ステップ4 PostExecutionActionBar「改善する」CTA                   | 未確認 |
| AC-4        | 利用中の品質表示と再評価が定義されている     | Phase 2 ステップ3 ScoreGateBadge 7地点配置 + EP-4 再評価設計              | 未確認 |

---

### タスク2: PR 本文の生成

> **設計タスクの PR** であるため、コードの変更ではなく設計成果物（仕様書群）の追加・更新が変更内容となる。

#### ステップ2-1: 変更ファイル一覧の確認

```bash
# ブランチの差分を確認
git diff --stat main -- docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/
git diff --stat main -- .claude/skills/aiworkflow-requirements/references/
```

変更ファイルの分類:

| 分類                     | ファイル群                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| 新規: タスク仕様書群     | `phase-1-requirements.md` 〜 `phase-13-pr-creation.md`（13ファイル）                                    |
| 新規: Phase 11 成果物    | `outputs/phase-11/walkthrough-*.md`（5ファイル）+ `manual-test-report.md`                               |
| 新規: Phase 12 成果物    | `outputs/phase-12/implementation-guide.md` + `documentation-changelog.md` + `unassigned-task-report.md` |
| 更新: システム仕様書     | `ui-ux-feature-components.md`・`arch-state-management.md` 等（Phase 12 Step 2 で更新済み）              |
| 更新: LOGS.md / SKILL.md | 各2ファイル（Phase 12 Step 1-A で更新済み）                                                             |

#### ステップ2-2: PR 本文テンプレート

```markdown
## Summary

- TASK-SKILL-LIFECYCLE-05「作成済みスキルを使う主導線」の設計仕様書を作成
- 3つの利用シナリオ（作成直後/あとから/履歴から）の主利用導線と CTA 仕様を定義
- ScoreGateBadge / SkillCard / SkillDetailPanel / PostExecutionActionBar の設計を完了
- 改善フィードバックループ（実行結果 → EP-4 → Task03 改善 → EP-2 → 再利用）を設計

## 背景・目的

「スキルを作ったが使われない」状態を防ぐため、スキル利用の主導線を設計する。
Workspace → Agent の二段構成による主利用フローと、Skill Center からの発見導線を定義する。

## 変更内容

### 設計成果物（タスク仕様書）

- Phase 1-13 の仕様書を `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/` に追加

### 設計のハイライト

#### CTA 仕様（ScoringGate 4段階）

| ScoringGate       | スコア範囲 | 今すぐ使う    | 保存して後で使う | 改善系 CTA        |
| ----------------- | ---------- | ------------- | ---------------- | ----------------- |
| RECOMMENDED       | 100        | Primary(有効) | Secondary(有効)  | 任意（text link） |
| USE_ALLOWED       | 80-99      | Primary(有効) | Secondary(有効)  | 任意（text link） |
| SAVE_ALLOWED      | 60-79      | -             | Primary(有効)    | 推奨（Secondary） |
| NEEDS_IMPROVEMENT | 0-59       | -             | -                | 必須（Warning）   |

#### 新規コンポーネント

| コンポーネント           | Atomic レベル | 責務                                             |
| ------------------------ | ------------- | ------------------------------------------------ |
| `ScoreGateBadge`         | atoms         | 品質ゲートの色+アイコン+ラベル表示               |
| `SkillCard`              | molecules     | Skill Center の一覧カード                        |
| `SkillDetailPanel`       | organisms     | スキル詳細サイドパネル                           |
| `PostExecutionActionBar` | organisms     | 実行後 4 アクション（再実行/改善/完了/terminal） |

#### 状態管理拡張

- `skillSlice`: `favoriteSkillNames`（Set / persist）・`recentlyUsedSkills`（最大 20 件 / persist）
- `agentSlice`: `lastExecutionResult`・`postExecutionScore`（非 persist）

### システム仕様書更新（Phase 12 Step 2 で実施済み）

- `ui-ux-feature-components.md`: ScoreGateBadge / PostExecutionActionBar 設計追加
- `arch-state-management.md`: skillSlice / agentSlice 拡張フィールド記録

## Test Plan

### 設計レビュー結果（Phase 3）

- 要件-設計突合マトリクス: 10項目すべて PASS
- Task01/04 依存契約チェック: PASS
- UI/UX 多角レビュー（CTA 視認性 / 再利用入口 / 改善戻り / A11y / Apple HIG）: PASS
- Phase 3 ゲート判定: **PASS または MINOR（指摘は Phase 12 で未タスク化）**

### 最終レビュー結果（Phase 10）

- Phase 10 ゲート判定: **PASS または MINOR（指摘は Phase 12 で未タスク化）**

### 手動テスト（設計ウォークスルー、Phase 11）

- シナリオ A（作成直後→即時利用）: PASS
- シナリオ B（Skill Center→再利用）: PASS
- シナリオ C（履歴→再実行）: PASS
- 改善フィードバックループ: PASS
- エッジケース（Empty State / エラー / 境界値 / A11y）: PASS

## 関連タスク・依存関係

- 依存（前提）: TASK-SKILL-LIFECYCLE-01（画面責務）/ TASK-SKILL-LIFECYCLE-04（ScoringGate）
- 後続（実装）: Phase 4-9 実装タスク（本 PR の設計に基づき実装フェーズで対応）

## 未タスク（Phase 12 で検出・登録済み）

- `outputs/phase-12/unassigned-task-report.md` を参照
```

- [ ] PR 本文テンプレートに Phase 3 / Phase 10 / Phase 11 の実際のゲート判定結果を反映している
- [ ] 変更ファイル一覧が `git diff --stat` の実際の出力と一致している

---

### タスク3: コミット前チェックリスト

> 本タスクは設計ドキュメントのみの変更のため、`pnpm lint` / `pnpm typecheck` / テスト実行は対象外。ただし、ファイル存在確認とリンク整合性の確認は必須。

#### ステップ3-1: 必須ファイル存在確認

```bash
# 全 Phase 仕様書の存在確認（13ファイル）
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13; do
  file="docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-${i}-*.md"
  ls $file 2>/dev/null || echo "MISSING: phase-${i}"
done
```

- [ ] 13ファイル全ての phase-N-\*.md が存在する
- [ ] `index.md` が存在し、Phase 一覧が最新状態である
- [ ] `artifacts.json` が存在し、全 Phase ステータスが更新されている

#### ステップ3-2: 内部リンク整合性確認

各 Phase 仕様書の「前提Phase」「後続Phase」リンクが正しいファイルを参照していることを確認する。

```bash
# 前提Phase / 後続Phase のリンク確認
grep -n "前提Phase\|後続Phase" docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-*.md
```

| リンク箇所           | 期待するリンク先          | 確認   |
| -------------------- | ------------------------- | ------ |
| phase-11 → 前提Phase | phase-10-final-review.md  | 未確認 |
| phase-11 → 後続Phase | phase-12-documentation.md | 未確認 |
| phase-12 → 前提Phase | phase-11-manual-test.md   | 未確認 |
| phase-12 → 後続Phase | phase-13-pr-creation.md   | 未確認 |
| phase-13 → 前提Phase | phase-12-documentation.md | 未確認 |
| phase-13 → 後続Phase | なし（最終Phase）         | 未確認 |

- [ ] 全 Phase の前提Phase・後続Phase リンクが正しいファイルを参照している
- [ ] 参照先ファイルが実際に存在する

#### ステップ3-3: outputs ディレクトリ整合性確認

```bash
# Phase 12 で作成した outputs ファイルの確認
ls -la docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/
ls -la docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-11/
```

- [ ] `outputs/phase-11/` 配下に6ファイルが存在する
- [ ] `outputs/phase-12/` 配下に3ファイルが存在する
- [ ] `outputs/verification-report.md` が存在する

#### ステップ3-4: CLAUDE.md / .claude/rules 遵守確認

| チェック項目         | 確認内容                                     | 判定   |
| -------------------- | -------------------------------------------- | ------ |
| `--no-verify` 不使用 | git commit 時に `--no-verify` を使っていない | 未確認 |
| ブランチ直 push 禁止 | main ブランチに直接 push していない          | 未確認 |
| pnpm 使用            | ドキュメントのみの変更のため対象外           | N/A    |
| `any` 型不使用       | ドキュメントのみの変更のため対象外           | N/A    |

---

### タスク4: ブランチ名・PR タイトルの確認

#### ステップ4-1: ブランチ名の確認

```bash
git branch --show-current
```

| 項目           | 期待値                                       | 確認   |
| -------------- | -------------------------------------------- | ------ |
| ブランチ名     | `docs/task-skill-lifecycle-05-spec-creation` | 未確認 |
| プレフィックス | `docs/`（設計ドキュメントのみの変更）        | 未確認 |

- [ ] ブランチ名が `docs/task-skill-lifecycle-05-spec-creation` であることを確認

#### ステップ4-2: PR タイトルの確認

| 項目              | 値                                                     |
| ----------------- | ------------------------------------------------------ |
| PR タイトル（案） | `docs(spec): 作成済みスキル利用導線の設計仕様書を作成` |
| 文字数            | 26文字（70文字以内ルール: OK）                         |
| 形式              | `docs(spec): ` プレフィックス + 内容                   |

- [ ] PR タイトルが 70 文字以内である
- [ ] PR タイトルに `docs/` または `docs(spec):` プレフィックスが含まれている

#### ステップ4-3: PR 作成コマンド（最終確認用）

本タスクはコミット・PR 作成を行わない（指示に従い省略）。ただし、PR 作成を行う場合は以下のコマンドを使用する。

```bash
# PR 作成（実行は指示があった場合のみ）
gh pr create \
  --title "docs(spec): 作成済みスキル利用導線の設計仕様書を作成" \
  --body "$(cat <<'EOF'
## Summary

- TASK-SKILL-LIFECYCLE-05「作成済みスキルを使う主導線」の設計仕様書を作成
- 3つの利用シナリオ（作成直後/あとから/履歴から）の主利用導線と CTA 仕様を定義
- ScoreGateBadge / SkillCard / SkillDetailPanel / PostExecutionActionBar の設計を完了
- 改善フィードバックループ（実行結果 → EP-4 → Task03 改善 → EP-2 → 再利用）を設計

## Test Plan

- Phase 3 設計レビュー: PASS
- Phase 10 最終レビュー: PASS
- Phase 11 設計ウォークスルー: 全シナリオ PASS

EOF
)" \
  --base main \
  --draft
```

> **注意**: `--no-verify` は絶対に使用禁止（CLAUDE.md 参照）。

---

## 成果物

| 成果物                     | パス                                     | 説明                                        |
| -------------------------- | ---------------------------------------- | ------------------------------------------- |
| 成果物確認ログ             | `outputs/phase-13/final-check-report.md` | 全 Phase 成果物の存在確認・受入基準充足記録 |
| PR 本文                    | `outputs/phase-13/pr-description.md`     | タスク2で生成した PR 本文の最終版           |
| artifacts.json（更新済み） | `artifacts.json`                         | 全 Phase 完了ステータス                     |
| index.md（更新済み）       | `index.md`                               | Phase 一覧の全 Phase completed 状態         |

## 完了条件

- [ ] タスク1: 全 13 Phase の仕様書ファイルが存在することを確認している
- [ ] タスク1: outputs/ 配下の全必須成果物が存在することを確認している
- [ ] タスク1: artifacts.json の全 Phase ステータスが completed に更新されている
- [ ] タスク1: index.md の全 Phase ステータスが completed に更新されている
- [ ] タスク1: 受入基準 AC-1〜AC-4 の充足根拠が記録されている
- [ ] タスク2: PR 本文が生成され、Phase 3/10/11 の実際のゲート判定結果が反映されている
- [ ] タスク3: 全必須ファイルの存在確認が完了している
- [ ] タスク3: 内部リンク（前提Phase/後続Phase）の整合性が確認されている
- [ ] タスク4: ブランチ名が `docs/task-skill-lifecycle-05-spec-creation` であることを確認している
- [ ] タスク4: PR タイトルが 70 文字以内であることを確認している
- [ ] artifacts.json の Phase 13 ステータスが completed に更新されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

- [ ] 参照資料確認（Phase 1-12 成果物・index.md・artifacts.json 現状確認）
- [ ] タスク1: 全 Phase 仕様書存在確認（13ファイル）
- [ ] タスク1: outputs/ 成果物存在確認
- [ ] タスク1: artifacts.json 更新
- [ ] タスク1: index.md ステータス更新
- [ ] タスク1: 受入基準 AC-1〜AC-4 充足確認
- [ ] タスク2: 変更ファイル一覧確認（git diff --stat）
- [ ] タスク2: PR 本文生成（Phase 3/10/11 実績値反映）
- [ ] タスク3: 必須ファイル存在確認
- [ ] タスク3: 内部リンク整合性確認
- [ ] タスク3: outputs ディレクトリ整合性確認
- [ ] タスク4: ブランチ名確認
- [ ] タスク4: PR タイトル確認
- [ ] 完了条件検証
- [ ] artifacts.json Phase 13 ステータスを completed に更新

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] `outputs/phase-13/final-check-report.md` が生成されている
- [ ] `outputs/phase-13/pr-description.md` が生成されている
- [ ] `artifacts.json` の Phase 13 ステータスが `completed` に更新されている
- [ ] `index.md` の全 Phase ステータスが `completed` に更新されている

> **P53 注記**: 設計タイプのため、コード変更・テスト実行・スクリーンショット取得は対象外。全成果物は設計仕様書（.md ファイル）である。
>
> **P07 ルール遵守**: `git commit --no-verify` / `git push --no-verify` は絶対に使用しない。

## 次のPhase

なし（TASK-SKILL-LIFECYCLE-05 の最終 Phase）
