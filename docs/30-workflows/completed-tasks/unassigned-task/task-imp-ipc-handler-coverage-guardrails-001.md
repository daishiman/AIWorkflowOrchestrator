# UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001: IPCハンドラ単位カバレッジ計測ガードレール自動化

## メタ情報

```yaml
issue_number: 921
task_id: UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001
task_name: IPCハンドラ単位カバレッジ計測ガードレール自動化
category: 改善
target_feature: coverage-by-handler（Istanbul形式判定/命名例外/テスト検出）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 Phase 12 再確認（実装苦戦箇所）
created_date: 2026-03-01
```

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001                                       |
| タスク名     | IPCハンドラ単位カバレッジ計測ガードレール自動化                                  |
| 分類         | 改善                                                                             |
| 対象機能     | `apps/desktop/scripts/coverage-by-handler.ts` と関連検証フロー                   |
| 優先度       | 中                                                                               |
| 見積もり規模 | 中規模                                                                           |
| ステータス   | 未実施                                                                           |
| 発見元       | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 Phase 12 再確認（苦戦箇所・2026-03-01） |
| 発見日       | 2026-03-01                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001` でハンドラ単位カバレッジ基盤は完成したが、実装時に「形式誤認」「命名例外ドリフト」「テスト探索漏れ」の3点で手戻りが発生した。

### 1.2 問題点・課題

- `coverage-final.json` の実体形式を事前固定しないと、raw v8 想定による実装ミスが再発する
- `SKILL_GET_IMPORTED` のような命名例外を規則変換だけで処理すると、IPCチャンネル名がずれる
- `scripts/**/*.test.ts` を `vitest.config.ts` の include に含め忘れると、テスト未実行のまま誤って通過する

### 1.3 放置した場合の影響

- カバレッジ判定の偽陽性/偽陰性が発生し、Phase 7品質判定の信頼性が低下する
- 同種タスクで毎回同じ調査を繰り返し、Phase 12での再監査コストが増える
- 仕様書（quality/task-workflow/lessons）と実装のドリフトが再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

ハンドラ単位カバレッジ運用に「実体先行の形式確認」「命名例外の機械検証」「scripts配下テスト探索ガード」を追加し、再発要因を自動検出可能にする。

### 2.2 最終ゴール

1. 解析前に Istanbul 形式（`statementMap` / `branchMap` / `fnMap`）を検証する前処理が定義されている
2. 例外マップ（`SKILL_GET_IMPORTED -> skill:getImported`）の整合をテストで保証できる
3. `scripts/**/*.test.{ts,tsx}` の探索漏れを設定監査で検知できる
4. 仕様書に運用ルールと検証手順が同期され、再利用可能になる

### 2.3 スコープ

#### 含むもの

- `coverage-by-handler` 系のガード処理・テスト・運用手順
- `task-workflow.md` / `quality-requirements.md` / `lessons-learned.md` への反映
- Phase 12 で使う検証コマンドセットの明文化

#### 含まないもの

- 各 IPC ハンドラ本体の新規機能開発
- カバレッジ閾値（Rule-1〜4）の数値変更
- 既存未タスク全件の一括正規化

### 2.4 成果物

- ガードレール仕様を反映した未タスク指示書（本ファイル）
- 実装時チェックリスト（形式・命名例外・探索設定）
- 機械検証ログ（target監査 + diff監査 + リンク検証）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001` が完了済みである
- `apps/desktop/scripts/coverage-by-handler.ts` と `coverage-by-handler.test.ts` が存在する
- `task-specification-creator` の監査スクリプトを実行できる

### 3.2 依存タスク

- ~~UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001~~（完了）

### 3.3 必要な知識

- Istanbul カバレッジ JSON 構造（`statementMap` / `branchMap` / `fnMap`）
- IPCチャンネル命名規則と例外運用
- Vitest の include 設定と `scripts/` 配下テスト収集挙動

### 3.4 推奨アプローチ

1. 先に `coverage-final.json` 実体をサンプルとして固定し、解析前提を明示する
2. 命名変換は「規則 + 例外マップ」の2段構成でテスト駆動化する
3. `scripts/**/*.test.{ts,tsx}` の設定検証を自動化し、設定漏れを即時検出する
4. 仕様書と未タスク台帳を同一ターンで同期し、証跡を残す

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                       | 発見経緯                                                          | 解決策                                                    | 教訓                                         |
| ------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `coverage-final.json` を raw v8 形式と誤認 | `coverage-by-handler.ts` 初期設計時に実体確認前の想定実装を行った | Istanbul 形式を前提にし、形式不一致時は明示的に失敗させる | 解析実装前に実データ形式を固定する           |
| `SKILL_GET_IMPORTED` の命名例外ドリフト    | 規則変換のみでチャンネル名へ変換し、camelCase 例外が落ちた        | 例外マップを導入し、変換テストで固定                      | 命名規則外は「仕様」として明示管理する       |
| `scripts/**/*.test.ts` が収集されない      | `src/**` 前提の include で運用していた                            | `vitest.config.ts` include を拡張し、設定監査を追加       | テスト追加と設定更新は同一タスクで完了させる |

---

## 4. 実行手順

### Phase構成

- Phase A: ガード要件定義
- Phase B: 実装・テスト整備
- Phase C: 仕様同期
- Phase D: 監査・完了判定

### Phase A: ガード要件定義

#### 目的

再発要因3件を検知可能なルールへ分解する。

#### 手順

1. `coverage-final.json` の必須キー要件を定義する
2. 命名例外マップの対象一覧を確定する
3. `scripts/**/*.test.{ts,tsx}` 設定監査の合否条件を定義する

#### 成果物

- ガード要件定義メモ

#### 完了条件

- 3課題それぞれに検知ルールが割り当てられている

### Phase B: 実装・テスト整備

#### 目的

実装とテストで再発防止を機械化する。

#### 手順

1. Istanbul形式の前処理チェックを追加する
2. 命名例外マップのテストケースを追加する
3. Vitest include 設定監査を追加する

#### 成果物

- 追加実装とテスト

#### 完了条件

- 3課題に対応する失敗ケースがテストで再現できる

### Phase C: 仕様同期

#### 目的

運用ルールをシステム仕様へ反映する。

#### 手順

1. `quality-requirements.md` に派生未タスクを追記する
2. `task-workflow.md` 残課題テーブルへ本タスクを登録する
3. 必要に応じて `lessons-learned.md` へ追補する

#### 成果物

- 更新済み仕様書

#### 完了条件

- 仕様書と未タスク指示書の参照整合が取れている

### Phase D: 監査・完了判定

#### 目的

未タスク登録品質と参照整合を機械検証する。

#### 手順

1. `verify-unassigned-links.js` を実行する
2. `audit-unassigned-tasks.js --json --target-file` を実行する
3. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行する

#### 成果物

- 監査ログ

#### 完了条件

- `currentViolations.total = 0` かつ `missing = 0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 形式誤認を防ぐ前処理チェックが定義されている
- [ ] 命名例外マップの検証手順が定義されている
- [ ] scripts配下テスト探索の設定監査手順が定義されている

### 品質要件

- [ ] 再発要因3件に対する検知方法が1対1で紐づいている
- [ ] `current` と `baseline` の判定軸を分離して記録している
- [ ] 機械検証コマンドと期待結果が明記されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] 親タスクの苦戦箇所が 3.5 セクションに反映されている

---

## 6. 検証方法

### テストケース

- Case 1: Istanbul必須キーが欠落した入力で前処理が失敗する
- Case 2: `SKILL_GET_IMPORTED` が例外マップで正しく `skill:getImported` へ変換される
- Case 3: `scripts/**/*.test.{ts,tsx}` が include から除外された場合に監査が失敗する
- Case 4: 未タスク指示書の target監査で `current=0` を維持できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-handler-coverage-guardrails-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
pnpm --filter @repo/desktop test:run -- scripts/coverage-by-handler.test.ts
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                         |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------ |
| 形式チェックを厳格化しすぎて既存入力を誤検知する | 中     | 中       | 既存サンプルJSONをフィクスチャ化し、互換ケースを先に固定する |
| 例外マップが増え保守負荷が上がる                 | 低     | 中       | 追加時に必ずテストケースを併記し、不要例外を定期棚卸しする   |
| 設定監査だけ通って実際のテスト実行が抜ける       | 中     | 低       | 設定監査と実行テストを同一ジョブで必須化する                 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-12/implementation-guide.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
今回の実装では、Istanbul形式の誤認・チャンネル命名例外・Vitest include漏れで手戻りが発生した。
同種課題を短時間で解くため、前処理チェック/例外マップ/設定監査をガードレールとして標準化する。
```

### 補足事項

- 本タスクは運用・検証ガードの整備が対象であり、機能仕様（Rule-1〜4）の変更は含まない。
