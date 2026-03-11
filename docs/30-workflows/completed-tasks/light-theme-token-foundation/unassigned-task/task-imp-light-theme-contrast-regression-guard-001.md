# TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 - Light Contrast Regression Guard

## メタ情報

```yaml
issue_number: 1157
```

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001   |
| タスク名     | light theme コントラスト回帰ガードの恒久化           |
| 分類         | 改善                                                 |
| 対象機能     | Phase 11 screenshot 運用 / contrast 監査 / checklist |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 Phase 12   |
| 発見日       | 2026-03-11                                           |
| 親タスク     | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

light theme token 基盤は修正済みだが、Phase 11 の視覚検証では画面ごとの差が残った。現状は人手レビュー中心で、コントラスト回帰を機械的に検知・防止する運用が弱い。

### 1.2 問題点

- screenshot は取得しているが、contrast 観点の合否が定量化されていない
- capture 前提（preview 起動・port 状態）が固定されておらず、検証の再現性が低い
- Phase 11/12 文書間で「所見」「対応」「残課題」の同期がずれやすい

### 1.3 放置した場合の影響

- light theme の可読性劣化を次タスクで見逃す
- Phase 12 再監査時に同じ論点を繰り返し調査する

---

## 2. 何を達成するか（What）

### 2.1 目的

light theme のコントラスト回帰を、screenshot と監査手順で継続的に検知できる運用へ改善する。

### 2.2 最終ゴール

1. Phase 11 に contrast チェック観点を固定し、証跡と所見を 1:1 で管理する
2. screenshot 取得 preflight（preview/port）を標準化する
3. Phase 12 で未タスク判定・仕様同期まで自動検証できる状態にする

### 2.3 スコープ

#### 含むもの

- Phase 11 screenshot checklist の contrast 観点追加
- capture 前 preflight（build/serve/port）手順追加
- Phase 12 の検証値（`verify-unassigned-links`, `audit --diff-from HEAD`）同期ルール強化

#### 含まないもの

- 新規テーマの追加
- 既存デザイントークンの全面再設計

### 2.4 成果物

- contrast regression guard の運用手順書
- Phase 11/12 チェック項目の更新
- 監査コマンド実行ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001` の screenshot 証跡が存在する
- `task-specification-creator` の validator 群が利用可能

### 3.2 推奨アプローチ

1. 既存 screenshot テストケースに contrast 判定列を追加する
2. capture preflight をコマンド化し、失敗時分岐を文書に固定する
3. Phase 12 で検証値を summary/changelog/spec に同値転記する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 発見経緯                                                | 解決策                                                                                               | 教訓                                                    |
| ---------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| screenshot があっても可読性判定が曖昧    | Phase 11 で「見づらい」所見が定量化されていなかった     | TCごとに contrast 観点を明示し、判定根拠を残す                                                       | 画面証跡は画像だけでなく判定基準をセットで残す          |
| capture 再実行が環境依存で失敗しやすい   | `ERR_CONNECTION_REFUSED` で再撮影が止まるケースがあった | preview/port preflight を必須化し、失敗時は未タスク化                                                | 再撮影前に環境状態を検証してから撮る                    |
| 未タスク判定が「導線あり」で止まりやすい | 残課題があっても formalization が漏れる                 | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` へ正式起票を必須化 | Task 4 は検出レポートと指示書作成を分離せず同時実施する |

---

## 4. 実行手順

1. Phase 11 の `manual-test-result.md` に contrast 判定欄（対象/基準/結果）を追加する
2. screenshot 取得前に preflight（build / preview / port）を確認する
3. screenshot を取得し、TCごとに contrast 所見を記録する
4. Phase 12 で `verify-unassigned-links` / `audit-unassigned-tasks --diff-from HEAD` を実行する
5. 判定結果を `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` に同値転記する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 11 の screenshot ケースに contrast 判定観点が追加されている
- [ ] capture preflight が標準手順として記録されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が PASS
- [ ] `verify-unassigned-links` が `ALL_LINKS_EXIST`
- [ ] `audit-unassigned-tasks --json --diff-from HEAD` が `currentViolations=0`

### ドキュメント要件

- [ ] Phase 12 成果物（summary/changelog/unassigned）が同一判定値で同期されている

---

## 6. 検証方法

```bash
# 1) Phase 11 screenshot coverage
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/light-theme-token-foundation

# 2) 未タスクリンク監査
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 3) 未タスク差分監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD

# 4) Phase 12 準拠確認
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/light-theme-token-foundation --json
```

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                              |
| --------------------------------------- | ------ | -------- | ----------------------------------------------------------------- |
| screenshot 運用が重くなり実行漏れが出る | 中     | 中       | TC数を固定し、代表画面を先に定義する                              |
| preflight 手順が守られず再現失敗する    | 中     | 中       | 失敗時の分岐とログ記録を完了条件へ含める                          |
| 判定値の同期漏れが再発する              | 中     | 低       | summary/changelog/unassigned の三点同値転記をチェックリスト化する |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

---

## 9. 備考

- 本タスクは「UIの見た目品質を将来タスクで落とさないための運用ガード」。
- 実装より先に、検証観点と証跡同期の手順を固定することを優先する。
