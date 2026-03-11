# [#1142] "[UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001] Phase 12 スクリーンショット実行時ポート競合ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001
task_name: Phase 12 スクリーンショット実行時ポート競合ガード
category: 改善
target_feature: Phase 11/12 UI証跡再取得運用（apps/desktop scripts）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再検証
created_date: 2026-03-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` の再実行時に、スクリーンショット取得は成功する一方で `Port 5174 is already in use` が出力され、実行結果の判定が揺れる状況が発生した。

### 1.2 問題点・課題

- 再取得が成功してもポート競合ログが残り、実行失敗と誤認しやすい
- 事前に使用中ポートを検査する標準手順がなく、再現条件が人依存
- 複数ターミナルで同時作業する再監査時に同問題が再発しやすい

### 1.3 放置した場合の影響

- Phase 11/12 の画面証跡再取得で無駄な切り分け工数が発生する
- 失敗判定のばらつきにより、再監査結果の説明責任が低下する
- 同種タスクへの横展開時に運用が不安定になる

---

## 2. 何を達成するか（What）

### 2.1 目的

スクリーンショット再取得前にポート競合を機械検査し、成功判定を一意化する。

### 2.2 最終ゴール

1. 実行前に `5174` の占有状態を確認する手順が標準化される
2. 競合時の分岐（既存プロセス停止 or 実行中サーバー再利用）が文書化される
3. Phase 11/12 成果物に「競合有無」と「対処結果」を必ず記録できる

### 2.3 スコープ

#### 含むもの

- screenshot コマンド実行前のポート確認手順
- 競合時の対処手順（停止/再利用）と記録方法
- Phase 11/12 文書テンプレートへの反映

#### 含まないもの

- screenshot 取得対象（TC）自体の増減
- Vite/Playwright の大規模構成変更

### 2.4 成果物

- ポート競合ガードを記載した運用手順
- 競合判定ログの記録テンプレート
- 検証コマンドと完了条件の更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop run screenshot:<feature>` が実行可能
- `lsof`（または同等コマンド）でポート占有確認が可能

### 3.2 依存タスク

- `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001`

### 3.3 必要な知識

- Vite dev server 起動ポート運用
- Phase 11 screenshot coverage 検証
- Phase 12 仕様同期手順

### 3.4 推奨アプローチ

1. screenshot 実行前にポート占有を確認する
2. 競合時は停止または再利用のどちらかを選び、記録する
3. screenshot 再取得と coverage 検証を実行し、結果を同期する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                     | 発見経緯                                           | 解決策                                           | 教訓                                                   |
| -------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| screenshot 実行時に `Port 5174 is already in use` が混在 | 2026-03-04 再検証で capture 成功後に競合ログを確認 | 実行前ポート検査と競合時分岐を必須化             | 成功証跡だけでは不十分。実行環境状態も完了条件に含める |
| 再監査で実行手順が人依存になりやすい                     | 並列作業で既存 dev server の有無が揺れた           | `lsof` ベースの定型確認 + 記録テンプレートを追加 | Phase 12 の再利用性は「再現手順の固定」で決まる        |

---

## 4. 実行手順

### Phase構成

- Phase A: 事前検査
- Phase B: 実行
- Phase C: 記録・検証

### Phase A: 事前検査

#### 手順

1. `lsof -nP -iTCP:5174 -sTCP:LISTEN` で占有状態を確認
2. 占有ありなら停止または再利用方針を決定
3. 方針を `spec-update-summary.md` に記録

#### 完了条件

- 競合有無と対処方針が記録されている

### Phase B: 実行

#### 手順

1. `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` を実行
2. `TC-01..04` と `import-call-diagnostics.json` の生成を確認

#### 完了条件

- screenshot 証跡が更新されている

### Phase C: 記録・検証

#### 手順

1. `validate-phase11-screenshot-coverage` を実行
2. 検証結果を `manual-test-result.md` と `spec-update-summary.md` へ同期
3. 必要に応じて未タスク化判定を実施

#### 完了条件

- 競合判定・対処・検証結果の3点が同一ターンで記録される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] screenshot 実行前のポート確認手順が定義されている
- [ ] 競合時の分岐（停止/再利用）が定義されている
- [ ] 文書に競合判定結果を記録できる

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が PASS する
- [ ] 実行ログの成功/警告判定基準が明確
- [ ] 再監査時に同じ手順を再現できる

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `ui-ux-feature-components.md` / `lessons-learned.md` に導線がある

---

## 6. 検証方法

### テストケース

- Case 1: 5174 が未使用のとき正常に screenshot 再取得できる
- Case 2: 5174 が使用中のとき分岐手順どおり対処できる
- Case 3: coverage validator が PASS する

### 検証手順

```bash
lsof -nP -iTCP:5174 -sTCP:LISTEN || true
pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                          |
| -------------------------------- | ------ | -------- | --------------------------------------------- |
| 競合検知だけで対処記録が残らない | 中     | 中       | `spec-update-summary.md` に判定結果を必須記録 |
| 競合時に手順が分岐しすぎる       | 中     | 低       | 停止/再利用の2択に限定して標準化              |
| 成功証跡のみで環境問題を見落とす | 中     | 中       | 実行ログへポート状態を必須項目化              |

---

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

- 本タスクは「screenshot コマンド登録ガード」の次段として、実行環境の安定化を扱う。
- 既存 baseline 違反は本タスクの合否対象外とし、`currentViolations` を判定基準とする。
