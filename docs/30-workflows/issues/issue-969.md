# [#969] "[UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001] Phase 12 Vitest 非watch実行ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-VITEST-RUN-MODE-GUARD-001
task_name: Phase 12 Vitest 非watch実行ガード
category: 改善
target_feature: Phase 12 テスト再確認コマンド運用（desktop package）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再確認
created_date: 2026-03-04
dependencies: []
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-vitest-run-mode-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 の再確認でテストを再実行する際、`pnpm test` では watch モードや対象外テストまで起動し、証跡取得が遅延しやすい。

### 1.2 問題点・課題

- watch モードでプロセスが終了せず、検証フローが停止する
- ルート実行と package 実行で設定解決が異なり、誤判定が発生する
- 必要な最小テストだけを再確認したい場面で、実行範囲が過剰になる

### 1.3 放置した場合の影響

- Phase 12 の再確認時間が増加し、並列実行効率が下がる
- 証跡採取が遅れ、台帳同期が後ろ倒しになる
- テスト実行の再現性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 のテスト再確認を `vitest run` 固定に統一し、非watchで決定論的に実行できる状態を作る。

### 2.2 最終ゴール

1. Phase 12 テンプレートに `vitest run` 固定ルールを追加する
2. desktop テストの推奨実行コマンドを package コンテキストに統一する
3. `pnpm test` の誤用を防ぐ注意点を明文化する

### 2.3 スコープ

#### 含むもの

- Phase 12 でのテスト再確認コマンド標準化
- watch モード回避ルールの明文化
- 仕様台帳と教訓への反映

#### 含まないもの

- テストコードの新規実装
- CI パイプラインの全面改修

### 2.4 成果物

- 実行コマンド標準ガイド
- テンプレート更新
- 反映済み教訓記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop` パッケージで Vitest が実行できる
- Phase 12 再確認対象のテストファイルが特定済みである

### 3.2 依存タスク

- なし（単独で着手可能）

### 3.3 必要な知識

- Vitest の `run` と watch の違い
- モノレポでの package コンテキスト実行
- Phase 12 検証証跡の残し方

### 3.4 推奨アプローチ

1. `pnpm --filter @repo/desktop exec vitest run <target>` を標準コマンドとする
2. ルート実行より package 実行を優先する
3. 実行コマンドを `spec-update-summary.md` に記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                   | 解決策                                                   | 教訓                                   |
| ------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- | -------------------------------------- |
| `pnpm test` で watch が残留し再確認が止まる | Phase 12 の再実行時に対話待ちが発生        | `vitest run` を固定し、単発実行で終了させる              | Phase 12 の再確認は非watchを前提にする |
| ルート実行で設定解決が不安定                | モノレポの設定参照差で再実行が必要になった | `--filter @repo/desktop` または `cd apps/desktop` で実行 | テストは対象パッケージ文脈で実行する   |

---

## 4. 実行手順

### Phase構成

- Phase A: 実行ルール定義
- Phase B: テンプレート反映
- Phase C: 運用検証

### Phase A: 実行ルール定義

#### 目的

watch 起因の停止を防ぐ。

#### 手順

1. 非watch標準コマンドを定義する
2. 禁止コマンド（`pnpm test`）を明記する
3. package 実行ルールを定義する

#### 成果物

- 実行ルール表

#### 完了条件

- ルール文書から標準コマンドが一意に判定できる

### Phase B: テンプレート反映

#### 目的

Phase 12 の再利用性を上げる。

#### 手順

1. テンプレート検証コマンド表へ `vitest run` を追加する
2. watch 注意点をチェックリスト化する
3. 変更履歴へ反映する

#### 成果物

- 更新済みテンプレート

#### 完了条件

- テンプレートのみで正しい実行コマンドを選べる

### Phase C: 運用検証

#### 目的

実際の再確認で手戻りがないことを確かめる。

#### 手順

1. 対象テストを `vitest run` で実行する
2. 結果を台帳へ記録する
3. 監査4点セットを実行する

#### 成果物

- 実行ログ

#### 完了条件

- 非watchで再確認が完了し、証跡が残っている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `vitest run` 固定ルールが定義されている
- [ ] package コンテキスト実行ルールが記載されている
- [ ] 禁止コマンドが明記されている

### 品質要件

- [ ] watch 残留による停止リスクが低減されている
- [ ] 再確認コマンドが決定論的である
- [ ] 実行ログが台帳へ同期されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録されている
- [ ] `lessons-learned.md` に関連導線が追加されている

---

## 6. 検証方法

### テストケース

- Case 1: `vitest run` で単発実行が完了する
- Case 2: package コンテキスト実行で設定解決が安定する
- Case 3: 監査4点セットと証跡記録が同一ターンで完了する

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                            |
| ---------------------------- | ------ | -------- | ----------------------------------------------- |
| watch モードで処理が止まる   | 高     | 中       | `vitest run` をテンプレートで固定化する         |
| ルート実行で設定解決が崩れる | 中     | 中       | `--filter @repo/desktop` 実行を標準化する       |
| 実行コマンドの転記漏れ       | 中     | 中       | `spec-update-summary.md` へ実行行を必須記録する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

### 参考資料

- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md`
- `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 12 の再確認で、watchモード起因の待機により証跡記録が遅延した。
非watch実行と package コンテキスト固定を標準化して再発を防止する。
```

### 補足事項

- 本タスクは「検証運用の安定化」が目的であり、機能仕様変更は含まない。
