# UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 Phase 12 対象Vitest実行ガード - タスク指示書

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 |
| タスク名     | Phase 12 対象Vitest実行ガード                |
| 分類         | 改善                                         |
| 対象機能     | Phase 12 再監査時のテスト再実行運用          |
| 優先度       | 中                                           |
| 見積もり規模 | 小規模                                       |
| ステータス   | 完了（2026-03-05 移管）                      |
| 発見元       | TASK-UI-01-C Phase 12 準拠再確認（苦戦箇所） |
| 発見日       | 2026-03-05                                   |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-01-C の Phase 12 再監査で、対象5ファイルのみを再検証したい場面で `pnpm run test:run -- ...` を使うと、script 経由の引数伝播差により全体テスト実行へ展開されるリスクが確認された。

### 1.2 問題点・課題

- 再監査で「対象テストだけを短時間で再実行する」目的が崩れ、検証時間が不安定化する。
- script 経由実行と `pnpm exec vitest run` 直実行の境界が文書化されておらず、運用が担当者依存になりやすい。
- 検証スクリプトの所在（`.claude/skills/.../scripts`）を事前確認しないと、コマンド失敗で再確認サイクルが遅延する。

### 1.3 放置した場合の影響

- Phase 12 の再監査時間が読めなくなり、複数ワークフロー並列検証時のスループットが低下する。
- 監査実行ログの再現性が落ち、`5 files / 37 tests` のような対象限定証跡を再利用しにくくなる。
- 同種課題で毎回コマンド調整が発生し、手戻りが継続する。

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 再監査時に、対象テストのみを確実に実行する手順を標準化し、全体テスト誤起動を防ぐ。

### 2.2 最終ゴール

1. 対象テスト再実行は `pnpm exec vitest run <対象ファイル>` へ統一されている。
2. 実行前 preflight（対象workflow実在、監査スクリプト実在）がチェックリスト化されている。
3. `task-workflow.md` / `lessons-learned.md` / 未タスク指示書の三点で同一手順を参照できる。

### 2.3 スコープ

#### 含むもの

- Phase 12 再監査向けの対象Vitest実行ルール定義
- preflight コマンド（`test -d` / `test -f`）の必須化
- 関連仕様書の導線同期（task-workflow / lessons-learned）

#### 含まないもの

- 新規機能実装
- 既存テストケース内容の変更
- baseline 全体違反の一括是正

### 2.4 成果物

- 本未タスク指示書
- `task-workflow.md` 残課題テーブル登録
- `lessons-learned.md` 関連未タスク導線

## 3. どのように実行するか（How）

### 3.1 前提条件

- `@repo/desktop` の Vitest 実行コマンドが利用できる。
- `.claude/skills/task-specification-creator/scripts` 配下の監査スクリプトを実行できる。

### 3.2 依存タスク

- TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN（完了）

### 3.3 必要な知識

- `pnpm exec vitest run` と npm script ラッパーの引数伝播差
- `audit-unassigned-tasks.js` の `--target-file` / `--diff-from` 判定
- Phase 12 準拠再監査フロー

### 3.4 推奨アプローチ

1. 再監査前に preflight を実行し、workflow と監査スクリプトの実体を固定する。
2. 対象テスト再実行は script 経由ではなく `pnpm exec vitest run` 直指定へ統一する。
3. 検証結果を `task-workflow.md` と `lessons-learned.md` に同一ターンで反映する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                              | 発見経緯                                                     | 解決策                                                                                                | 教訓                                                 |
| ------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm run test:run --` で全体テストが起動しやすい | TASK-UI-01-C の再監査で対象5ファイル再検証時に実行時間が膨張 | `pnpm --filter @repo/desktop exec vitest run <対象ファイル群>` へ統一                                 | 対象テスト再確認は script ラッパーを介さず直実行する |
| 監査スクリプトの所在誤認でコマンド失敗しやすい    | `scripts/...` 直下想定で実行し `MODULE_NOT_FOUND` が発生     | `test -f .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js` を preflight 化 | スクリプト実在確認をコマンド実行前に固定する         |

## 4. 実行手順

### Phase構成

- Phase A: preflight 固定
- Phase B: 対象Vitest実行ルール適用
- Phase C: 仕様同期と監査

### Phase A: preflight 固定

#### 目的

検証対象パスと実行スクリプトの実在を先に確定する。

#### 手順

1. `test -d docs/30-workflows/completed-tasks/task-056c-notification-history-domain` を実行する。
2. `test -f .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js` を実行する。
3. `rg --files docs/30-workflows | rg 'task-056c-notification-history-domain'` で対象を再確認する。

#### 成果物

- preflight 実行ログ

#### 完了条件

- workflow と監査スクリプトの実在が確認済み。

### Phase B: 対象Vitest実行ルール適用

#### 目的

対象テストのみを安定して再実行できる運用を固定する。

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run <対象5ファイル>` を実行する。
2. `pnpm --filter @repo/desktop typecheck` を実行する。
3. 実行結果を `5 files / 37 tests` などの対象件数付きで記録する。

#### 成果物

- 対象テスト再実行ログ
- 型検証ログ

#### 完了条件

- 対象ファイル限定のテスト実行が PASS。

### Phase C: 仕様同期と監査

#### 目的

未タスク登録とシステム仕様同期を完了する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本タスクを登録する。
2. `lessons-learned.md` に関連未タスク導線を追加する。
3. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --target-file` を実行する。

#### 成果物

- 更新済み仕様書
- 参照整合監査ログ

#### 完了条件

- 参照切れがなく、対象未タスク監査が `currentViolations.total=0`。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 対象Vitest実行を `pnpm exec vitest run` 直指定へ統一した
- [ ] preflight（workflow実在 / script実在）を手順化した

### 品質要件

- [ ] 対象テストが PASS（対象件数つきで記録）
- [ ] `typecheck` が PASS
- [ ] `audit --target-file` が `currentViolations.total=0`

### ドキュメント要件

- [ ] 本指示書を `docs/30-workflows/unassigned-task/` に配置した
- [ ] `task-workflow.md` の残課題テーブルへ登録した
- [ ] `lessons-learned.md` の関連未タスクへ追記した

## 6. 検証方法

### テストケース

- Case 1: script 経由ではなく直実行で対象ファイルのみテストされる
- Case 2: preflight で workflow / スクリプト実在が確認できる
- Case 3: 未タスク参照監査が PASS する

### 検証手順

```bash
test -d docs/30-workflows/completed-tasks/task-056c-notification-history-domain
test -f .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/store/slices/notificationSlice.test.ts \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/notificationHandlers.test.ts \
  src/main/ipc/historySearchHandlers.test.ts \
  src/preload/channels.test.ts
pnpm --filter @repo/desktop typecheck
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md
```

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                                          |
| ------------------------------------------ | ------ | -------- | ----------------------------------------------------------------------------- |
| 実行者が再び `pnpm run test:run --` を使う | 中     | 中       | Phase 12 手順書に「直実行必須」を明記し、レビュー時にコマンド文字列を確認する |
| preflight 省略でパス誤認が再発する         | 中     | 中       | `test -d` / `test -f` を完了条件に含める                                      |
| 検証PASSでも台帳反映が漏れる               | 中     | 低       | `task-workflow` と `lessons-learned` の同時更新をチェックリスト必須項目にする |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
pnpm run test:run -- 経由で対象再確認のつもりが全体テストへ展開され、再監査の所要時間が増加した。
```

### 補足事項

本タスクは機能追加ではなく、Phase 12 再監査運用の再現性を高めるためのガードタスクである。
