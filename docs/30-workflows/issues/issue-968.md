# [#968] "[UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001] Phase 12 スクリーンショット実行コマンド登録ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001
task_name: Phase 12 スクリーンショット実行コマンド登録ガード
category: 改善
target_feature: Phase 11/12 UI証跡の再取得運用（apps/desktop scripts）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再確認
created_date: 2026-03-04
dependencies: []
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-screenshot-command-registration-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workflow02 の UI証跡再取得では専用スクリプトが存在する一方、`pnpm run screenshot:*` のコマンド公開が未整備で、実行手順が人依存になった。

### 1.2 問題点・課題

- `apps/desktop/scripts/*.mjs` があっても `package.json` scripts に未登録だと発見性が低い
- `pnpm run | rg screenshot` で対象が見えず、手動 `node scripts/...` に依存する
- Phase 11/12 の再確認手順を他タスクへ横展開しにくい

### 1.3 放置した場合の影響

- UI証跡再取得の初動が遅れる
- 実行コマンドが統一されず、再現性が低下する
- Phase 12 の証跡テンプレート運用が定着しない

---

## 2. 何を達成するか（What）

### 2.1 目的

スクリーンショット再取得スクリプトを `pnpm run screenshot:*` で一意に実行できる運用へ統一する。

### 2.2 最終ゴール

1. 対象スクリプトが `apps/desktop/package.json` scripts に登録される
2. Phase 11/12 文書のコマンド例が `pnpm --filter @repo/desktop run screenshot:<feature>` に統一される
3. `pnpm --filter @repo/desktop run | rg screenshot` で対象が発見できる

### 2.3 スコープ

#### 含むもの

- screenshot 実行コマンド登録（workflow02 対象）
- Phase 12 テンプレート/実装ガイドのコマンド同期
- 検証手順（run一覧確認 + coverage検証）

#### 含まないもの

- Playwright テストケース自体の増減
- 既存 workflow 全件への一括展開

### 2.4 成果物

- `package.json` scripts 更新
- 更新後コマンドを反映した Phase 12 ドキュメント
- 検証ログ（run一覧、coverage）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs` が実在する
- `pnpm --filter @repo/desktop` 実行が可能

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- `pnpm` ワークスペース scripts 運用
- Phase 11 screenshot coverage 検証
- Phase 12 仕様同期手順

### 3.4 推奨アプローチ

1. `package.json` scripts に screenshot エントリを追加
2. workflow02 の `phase-11/12` 成果物へ実行コマンドを反映
3. run一覧確認と coverage 検証を同一ターンで記録

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                           | 発見経緯                                                             | 解決策                                                | 教訓                                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| screenshot スクリプトが CLI 一覧に出ず、実行経路が分かりづらい | `pnpm --filter @repo/desktop run` に workflow02 向けコマンドが未表示 | scripts 登録を必須化し、Phase 12 に同じコマンドを転記 | 「スクリプト実体あり」だけでは不十分。実行エントリ公開まで完了扱いにしない |
| 手動 `node scripts/...` 実行が文書ごとに揺れた                 | 実装者ごとに実行例が異なる                                           | `screenshot:<feature>` 命名に統一する                 | Phase 11/12 の UI証跡は `run screenshot:*` を正本にする                    |

---

## 4. 実行手順

### Phase構成

- Phase A: コマンド登録
- Phase B: 文書同期
- Phase C: 検証

### Phase A: コマンド登録

#### 目的

実行経路を一意化する。

#### 手順

1. `apps/desktop/package.json` に `screenshot:skill-import-idempotency-guard` を追加
2. スクリプト名と対象ファイルの対応をコメント/文書で明記
3. run一覧に表示されることを確認

#### 成果物

- 更新済み `apps/desktop/package.json`

#### 完了条件

- `pnpm --filter @repo/desktop run | rg screenshot` で新規コマンドが表示される

### Phase B: 文書同期

#### 目的

Phase 12 手順を再利用可能にする。

#### 手順

1. workflow02 の Phase 11/12 文書へ `screenshot:<feature>` コマンドを反映
2. `task-workflow.md` / `lessons-learned.md` に運用ルールを追記
3. 変更履歴を更新

#### 成果物

- 更新済み Phase 11/12 文書
- 更新済みシステム仕様書

#### 完了条件

- コマンド記述が `run screenshot:*` へ統一されている

### Phase C: 検証

#### 目的

運用ルールが実行可能であることを確認する。

#### 手順

1. 新規コマンドで screenshot を再取得
2. coverage validator を実行
3. 検証結果を `spec-update-summary.md` に記録

#### 成果物

- screenshot 証跡
- coverage 検証結果

#### 完了条件

- screenshot 再取得と `validate-phase11-screenshot-coverage` が PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] screenshot コマンドが scripts に登録されている
- [ ] コマンド名が feature 単位で識別可能
- [ ] 文書内コマンドが統一されている

### 品質要件

- [ ] 実行経路が一意（`run screenshot:*`）になっている
- [ ] 手動コマンド依存が排除されている
- [ ] 検証ログが同一ターンで記録されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` の関連未タスクに導線がある

---

## 6. 検証方法

### テストケース

- Case 1: `run` 一覧で screenshot コマンドが発見可能
- Case 2: 登録コマンドで screenshot を再取得できる
- Case 3: coverage validator が PASS する

### 検証手順

```bash
pnpm --filter @repo/desktop run | rg screenshot
pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                     |
| ------------------------------ | ------ | -------- | -------------------------------------------------------- |
| scripts 命名が既存規約と不一致 | 中     | 中       | 既存 `screenshot:*` 命名規約に合わせる                   |
| 文書側が旧コマンドのまま残る   | 中     | 中       | `rg 'capture-skill-import-idempotency-guard'` で残存検査 |
| コマンド登録のみで検証未実施   | 中     | 低       | coverage validator 実行を完了条件に含める                |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`

### 参考資料

- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
スクリーンショット再取得は実装されているが、コマンド公開が弱く再利用時に迷いやすい。
```

### 補足事項

- 本タスクは UI証跡運用の再現性向上を目的とする運用ガードであり、機能追加そのものは含まない。
