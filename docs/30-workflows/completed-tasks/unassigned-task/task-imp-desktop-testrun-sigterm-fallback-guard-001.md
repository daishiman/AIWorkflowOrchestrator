# UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001: apps/desktop test:run SIGTERM フォールバックガード

## メタ情報

```yaml
issue_number: TBD
task_id: UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001
task_name: apps/desktop test:run SIGTERM フォールバックガード
category: 改善
target_feature: apps/desktop 回帰テスト運用（長時間 fixture テスト含む）
priority: 中
scale: 小規模
status: 完了（completed-tasks移管）
source_phase: TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 Phase 12 再確認（実装苦戦箇所）
created_date: 2026-03-05
completed_date: 2026-03-05
dependencies:
  - TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001
```

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001          |
| タスク名     | apps/desktop test:run SIGTERM フォールバックガード         |
| 分類         | 改善                                                       |
| 対象機能     | apps/desktop の回帰テスト運用（全量実行 + 分割実行）       |
| 優先度       | 中                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 完了（2026-03-05, completed-tasks移管）                    |
| 発見元       | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 Phase 12 再確認 |
| 発見日       | 2026-03-05                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`pnpm --filter @repo/desktop test:run` を全量で実行すると、`skill-creator.fixture.test.ts` 実行中に `SIGTERM` で中断するケースがあり、回帰結果の判定が不安定になった。親タスクでは分割実行で回避したが、恒久運用ルールとしては未固定である。

### 1.2 問題点・課題

- 全量実行が失敗した際のフォールバック手順が仕様化されておらず、担当者ごとに対処が揺れる
- `SIGTERM` 失敗ログと分割実行結果の記録粒度が統一されていない
- システム仕様書と未タスク台帳への同期が同一ターンで固定されず、再発しやすい

### 1.3 放置した場合の影響

- Phase 9/10/12 の完了判定が再現不能になり、レビュー差し戻しが増える
- 同種課題で同じ切り分けを繰り返し、工数が増大する
- テスト証跡の信頼性が下がり、品質保証の説明責任を満たせない

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop test:run` が `SIGTERM` で中断しても、分割実行で回帰範囲を確定し、同じ判定基準で完了可否を判断できる運用を標準化する。

### 2.2 最終ゴール

1. `SIGTERM` 発生時の標準フォールバック手順（ログ保存 + 分割実行）が文書化される
2. `task-workflow.md` / `lessons-learned.md` / `api-ipc-system.md` に同一ルールが同期される
3. 検証コマンドと判定基準が固定され、担当者が変わっても同一結果を得られる

### 2.3 スコープ

#### 含むもの

- `pnpm --filter @repo/desktop test:run` の `SIGTERM` 発生時フォールバック手順
- 分割実行コマンドの標準化（`vitest run <対象>`）
- 失敗ログと分割実行結果の記録フォーマット統一

#### 含まないもの

- fixture テスト自体の大規模リファクタリング
- CI 全体の実行戦略変更
- `@repo/shared` 側テスト戦略の変更

### 2.4 成果物

- 本未タスク指示書（9セクション + 3.5教訓）
- システム仕様書の追補（残課題テーブル、教訓、IPC運用）
- 検証ログ（`verify-unassigned-links` / `audit-unassigned-tasks`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop test:run` がローカルで実行可能
- `pnpm --filter @repo/desktop exec vitest run ...` で対象テストを個別実行できる
- `task-specification-creator` の監査スクリプトが利用可能

### 3.2 依存タスク

- `TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001`（完了済み）

### 3.3 必要な知識

- Vitest の対象ファイル指定実行
- Phase 12 の証跡同期ルール（task-workflow / lessons / api-ipc）
- `audit-unassigned-tasks` の `current` / `baseline` 判定分離

### 3.4 推奨アプローチ

1. 全量実行を試行し、`SIGTERM` 失敗ログを保存する
2. 対象回帰テストを分割実行して合否を確定する
3. 失敗ログと分割実行結果をセットで仕様書へ同期する
4. 未タスク監査（target + diff）でフォーマットと差分健全性を確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                              | 発見経緯                                                                  | 解決策                                                                                                   | 教訓                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop test:run` が `SIGTERM` で中断し、全量結果だけでは合否を確定できない | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 の Phase 12 再確認で実際に発生 | 失敗ログを証跡化したうえで `pnpm --filter @repo/desktop exec vitest run <対象>` に切替し、対象回帰を確定 | 全量1本の成否だけで判定せず、長時間系は分割実行の合算判定を許容する |
| フォールバック手順が口頭運用で文書同期が漏れる                                    | task-workflow の完了記録のみ更新し、lessons/api-ipc 追補が遅延した        | `task-workflow` / `lessons-learned` / `api-ipc-system` の3点同期を完了条件へ追加                         | 仕様同期は「実装内容 + 苦戦箇所 + 検証手順」の同時反映を必須化する  |
| `current` と `baseline` の読み分け不足で監査結果を誤判定しやすい                  | 未タスク監査の全体値だけで fail と誤認するケースがあった                  | 合否は `--diff-from HEAD` の `currentViolations`、資産監視は baseline として別管理                       | 監査は二軸（current/baseline）で扱う                                |

---

## 4. 実行手順

### Phase構成

- Phase A: 失敗条件の再現と証跡取得
- Phase B: 分割実行フォールバック定義
- Phase C: 仕様書同期
- Phase D: 監査と完了判定

### Phase A: 失敗条件の再現と証跡取得

#### 目的

`SIGTERM` の発生条件を証跡として固定する。

#### 手順

1. `pnpm --filter @repo/desktop test:run` を実行する
2. `SIGTERM` 発生時の標準ログ形式を記録する
3. 対象テストファイルを抽出する

#### 成果物

- 失敗ログ（コマンド、症状、対象ファイル）

#### 完了条件

- `SIGTERM` 発生時の記録フォーマットが定義されている

### Phase B: 分割実行フォールバック定義

#### 目的

対象回帰の合否を分割実行で確定できるようにする。

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run <対象>` を定義する
2. 対象回帰の PASS 条件を明文化する
3. 全量失敗 + 分割PASS の判定ルールを定義する

#### 成果物

- 分割実行コマンドセット
- 判定ルール

#### 完了条件

- 誰が実行しても同じ手順で回帰判定できる

### Phase C: 仕様書同期

#### 目的

システム仕様スキルへ運用ルールを恒久反映する。

#### 手順

1. `task-workflow.md` に残課題行を追加する
2. `lessons-learned.md` に関連未タスク導線を追記する
3. `api-ipc-system.md` の同種課題チェックへ関連未タスクを追記する
4. `SKILL.md` / `LOGS.md` の履歴を更新する

#### 成果物

- 更新済みシステム仕様書群

#### 完了条件

- 3仕様書 + 履歴ファイルに同一タスクIDが記録される

### Phase D: 監査と完了判定

#### 目的

未タスク指示書の形式と参照整合を機械確認する。

#### 手順

1. `verify-unassigned-links.js` を実行する
2. `audit-unassigned-tasks --target-file` を実行する（移管前パスで実施）
3. `audit-unassigned-tasks --diff-from HEAD` を実行する
4. `currentViolations=0` を確認して完了判定する

#### 成果物

- 監査結果ログ

#### 完了条件

- `currentViolations=0` かつリンク切れなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SIGTERM` 発生時フォールバック手順が定義されている
- [ ] 分割実行コマンドが再利用可能な形で記録されている
- [ ] 合否判定ルール（全量失敗 + 分割PASS）が文書化されている

### 品質要件

- [ ] 失敗ログと分割実行結果がセットで記録されている
- [ ] `current` / `baseline` の判定基準が明記されている
- [ ] 同一手順を別担当者が再現できる

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` と `api-ipc-system.md` に関連導線がある
- [ ] `SKILL.md` と `LOGS.md` の履歴更新が完了している

---

## 6. 検証方法

### テストケース

- Case 1: 全量実行が成功する場合、従来どおり全量結果で判定できる
- Case 2: 全量実行が `SIGTERM` の場合、分割実行で回帰判定を確定できる
- Case 3: 文書同期後に未タスクリンクとフォーマット監査が PASS する

### 検証手順

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts src/main/ipc/__tests__/authKeyHandlers.test.ts
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                                   |
| ---------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| `SIGTERM` の再現性が環境差で変動する     | 中     | 中       | 失敗ログと対象ファイルを必須記録し、再現条件を固定する                 |
| 分割実行対象の選定漏れで回帰抜けが起こる | 高     | 低       | 失敗ログから対象ファイルを抽出し、テンプレート化したコマンドを使用する |
| 仕様書同期が一部漏れて再発する           | 中     | 中       | `task-workflow` / `lessons` / `api-ipc` の3点同期を完了条件にする      |
| baseline違反を今回差分違反と誤判定する   | 低     | 中       | 合否は `currentViolations` 固定、baseline は監視値として分離記録する   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-12/spec-update-summary.md`

### 参考資料

- `.claude/skills/skill-creator/references/patterns.md`（SIGTERM 再発パターン）
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
apps/desktop test:run: Command failed with signal "SIGTERM"
```

### 補足事項

- 本未タスクは「全量実行をやめる」ことではなく、「全量失敗時に判定を止めない」ためのフォールバック標準化が目的。
- 実装時は、親タスクの教訓と矛盾しないよう `runtime配線 + テスト中断ガード` を一体で扱うこと。
