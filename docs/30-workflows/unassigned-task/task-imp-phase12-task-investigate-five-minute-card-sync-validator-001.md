# UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001: 5分解決カード同期バリデータ実装

## メタ情報

```yaml
issue_number: 1013
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001   |
| タスク名     | 5分解決カード同期バリデータ実装                                       |
| 分類         | 改善                                                                  |
| 対象機能     | Phase 12 仕様同期（task-workflow / api-ipc-system / lessons-learned） |
| 優先度       | 中                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | Phase 12（TASK-INVESTIGATE 追補作業）                                 |
| 発見日       | 2026-03-06                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-INVESTIGATE の追補で、同種課題を短時間で再現するために「5分解決カード」を `task-workflow.md` / `api-ipc-system.md` / `lessons-learned.md` の3仕様書へ同期した。  
ただし同期確認は手作業中心で、文書間ドリフトを機械的に防ぐ仕組みが不足している。

### 1.2 問題点・課題

- 3仕様書のうち1つだけ更新されても、レビュー時まで見逃しやすい。
- 5ステップ順序の不一致（手順の並び替え）を自動検出できない。
- テンプレートに重複行があると、同期ルール自体の記述が崩れる。

### 1.3 放置した場合の影響

- 同種障害で再利用すべき手順が文書ごとにズレ、初動が遅延する。
- Phase 12 の完了判定が人依存になり、再監査コストが増加する。
- `current=0` でも、実運用手順が再現不能な状態で完了扱いになる。

---

## 2. 何を達成するか（What）

### 2.1 目的

5分解決カードの「存在・手順順序・同期先3点一致」を機械検証できるようにし、Phase 12 の再利用品質を安定化する。

### 2.2 最終ゴール

- 3仕様書のカード同期状態を1コマンドで検証できる。
- 同期不一致時に、どの仕様書のどの要素が欠落しているかを出力できる。
- Phase 12 テンプレートの完了条件に検証手順が組み込まれている。

### 2.3 スコープ

#### 含むもの

- `task-specification-creator` 側に同期検証スクリプトを追加する。
- `skill-creator` テンプレートの完了チェックに当該検証を追加する。
- `aiworkflow-requirements` 側に運用ルール（カード同期検証）を反映する。

#### 含まないもの

- 過去すべての完了タスク文書の一括修正。
- CIパイプライン全体への必須ジョブ追加（今回はローカル検証手順まで）。

### 2.4 成果物

- `task-specification-creator/scripts/` 配下の同期検証スクリプト
- テンプレート更新（retrospective/subagent）
- `task-workflow.md` / `api-ipc-system.md` / `lessons-learned.md` への運用追記
- 未タスク検証ログ（`audit --target-file` 結果）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001` の3仕様書追補が存在すること。
- `node` 実行環境が利用可能であること。
- `task-specification-creator` と `aiworkflow-requirements` の正本パスを参照できること。

### 3.2 依存タスク

- TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001（完了）
- 既存の `verify-all-specs` / `validate-phase-output` / `audit-unassigned-tasks` 運用（整備済み）

### 3.3 必要な知識

- Phase 12 Task 2（Step 1-A/1-B/1-C/Step 2）の判定基準
- `task-workflow.md` / `api-ipc-system.md` / `lessons-learned.md` の変更履歴運用
- unassigned-task 9セクションフォーマットと `## メタ情報` 重複禁止ルール

### 3.4 推奨アプローチ

Script First を採用し、カード同期判定を機械化する。  
人間レビューは「判定結果の妥当性確認」に限定し、検出はスクリプトで行う。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                | 発見経緯                                                                 | 解決策                                                 | 教訓                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| 3仕様書のカード同期漏れ                             | TASK-INVESTIGATE 追補で3仕様書を手作業同期した際、差分確認に時間を要した | 3仕様書の見出し・5手順・検証ゲートの一致を機械検証する | 再利用手順は「記述」だけでなく「同期検証」まで必須   |
| `NON_VISUAL` から `SCREENSHOT` への昇格判断が遅れる | 追加要求で画面検証が必要になり、Phase 11 証跡を再取得した                | 昇格条件をテンプレート完了チェックへ固定する           | UI要求はタスク性質より優先し、証跡方式を即時切替する |
| テンプレート重複行が再利用時の誤解を招く            | retrospective テンプレートに手順5重複・コマンド重複が存在した            | 重複行を除去し、重複検出チェックを追加する             | テンプレート品質は実装品質と同等に扱う               |

---

## 4. 実行手順

### Phase構成

- Phase A: 要件固定（検証対象と判定条件を固定）
- Phase B: 実装（同期検証スクリプト追加）
- Phase C: 文書同期と検証（3仕様書・テンプレートへ反映）

### Phase A: 要件固定

#### 目的

5分解決カード同期の判定条件（存在・順序・値）を確定する。

#### 手順

1. 3仕様書の対象セクションを特定する。
2. 必須項目（症状/根本原因/最短5手順/検証ゲート/同期先3点）を定義する。
3. 失敗時の出力形式（欠落ファイル/欠落項目）を定義する。

#### 成果物

- 同期検証仕様メモ（項目定義）

#### 完了条件

- 必須項目5種と順序判定ルールが文書化されている。

### Phase B: 実装

#### 目的

カード同期を検証するスクリプトを作成する。

#### 手順

1. `task-specification-creator/scripts/` に検証スクリプトを追加する。
2. 3仕様書を入力に、項目不足と順序不一致を検出できるようにする。
3. `--json` 出力を実装し、CI組み込み可能な形式にする。

#### 成果物

- 同期検証スクリプト本体
- スクリプト使用例（READMEまたはコメント）

#### 完了条件

- 正常ケースで exit code 0、異常ケースで非0を返す。

### Phase C: 文書同期と検証

#### 目的

テンプレートとシステム仕様へ運用ルールを同期し、再利用可能状態にする。

#### 手順

1. `skill-creator` テンプレートの完了チェックに検証コマンドを追加する。
2. `aiworkflow-requirements` の3仕様書へ運用ルールを反映する。
3. `audit-unassigned-tasks --target-file` と `verify-unassigned-links` を実行する。

#### 成果物

- テンプレート更新
- 仕様書更新
- 検証ログ

#### 完了条件

- 3仕様書のカード同期が機械検証で PASS。
- 未タスク指示書の監査 `currentViolations=0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 3仕様書の5分解決カード同期を検証できる
- [ ] 欠落項目と不一致項目を明示できる
- [ ] JSON出力で結果を機械可読化できる

### 品質要件

- [ ] 正常/異常で終了コードが分岐する
- [ ] 手順順序（1〜5）不一致を検知できる
- [ ] 既存スクリプト運用（verify/validate/audit）と競合しない

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `api-ipc-system.md` と `lessons-learned.md` に関連未タスクが同期されている
- [ ] 本指示書が9セクション構成で Level A 相当の粒度を満たす

---

## 6. 検証方法

### テストケース

- Case 1: 3仕様書すべてにカードが存在する場合、検証 PASS
- Case 2: 1仕様書でカード見出しが欠落している場合、検証 FAIL
- Case 3: 5手順の順序が異なる場合、検証 FAIL

### 検証手順

```bash
# 1) 未タスク指示書の配置・フォーマット監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md

# 2) 未タスク参照リンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001

# 3) 仕様同期後の全体検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 \
  --strict
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                     |
| ---------------------------------------------- | ------ | -------- | -------------------------------------------------------- |
| 判定ルールが厳しすぎて既存文書が大量FAILになる | 中     | 中       | 初期は警告モードを用意し、段階的に厳格化する             |
| スクリプト導入後にテンプレート更新が追従しない | 中     | 中       | `skill-creator` 完了チェックに必須コマンドを固定する     |
| 3仕様書の対象セクション名が将来変更される      | 中     | 低       | 見出しパターンを設定化し、変更履歴に同期ルールを記載する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 参考資料

- `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-12/documentation-changelog.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
タスク仕様書作成skill（/.claude/skills/task-specification-creator/）に従って未タスクを未タスクディレクトリ（/docs/30-workflows/unassigned-task/）に作成して。
未タスク仕様書を作成してください。合わせて、同未タスク仕様書に今回実装に苦戦した箇所も記述してください。
これは、同じような課題を簡潔に解決するために必要です。そして、システムの仕様書スキルの内容も反映させること。
```

### 補足事項

- 本タスクは「TASK-INVESTIGATE の追補で判明した運用課題」を対象とする。
- 目的は機能追加ではなく、Phase 12 の再利用性と同期品質の強化である。
