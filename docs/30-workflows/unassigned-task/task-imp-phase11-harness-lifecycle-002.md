# UT-IMP-PHASE11-HARNESS-LIFECYCLE-001 - Phase 11 harness ファイルのライフサイクル管理

## メタ情報

```yaml
issue_number: 1116
task_id: UT-IMP-PHASE11-HARNESS-LIFECYCLE-001
task_name: Phase 11 harness ファイルのライフサイクル管理
category: 改善
target_feature: Phase 11 手動テスト用 harness ファイルの作成・保管・削除ルール策定
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12
created_date: 2026-03-09
dependencies:
  - TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001
```

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE11-HARNESS-LIFECYCLE-001                               |
| タスク名     | Phase 11 harness ファイルのライフサイクル管理                      |
| 分類         | 改善                                                               |
| 対象機能     | Phase 11 手動テスト用 harness ファイルの作成・保管・削除ルール策定 |
| 優先度       | 低                                                                 |
| 見積もり規模 | 小規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12                 |
| 発見日       | 2026-03-09                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 11 手動テストでは、対象機能を isolated に検証するため dedicated harness（HTML + TSX + capture script）を作成する。しかし、現在はこれらファイルの配置先・命名規則・保管/削除ルールが未定義のため、タスクごとにファイルが蓄積する。

### 1.2 問題点・課題

- renderer ディレクトリに Phase 11 固有ファイルが散在（`phase11-*.html`, `phase11-*.tsx`, `Phase11*Harness.tsx`）
- capture script が `apps/desktop/scripts/` に混在
- PR マージ後も harness ファイルが本番バンドルに含まれるリスク
- 命名規則の不統一（`phase11-app-debug-localstorage-clear` vs `Phase11AppDebugLocalstorageClearHarness`）

### 1.3 放置した場合の影響

- ビルドサイズの不要な増大
- renderer ディレクトリの可読性低下
- 新規タスクの Phase 11 実装者が参考にすべきパターンが不明確

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 harness ファイルの作成・配置・命名・保管/削除のライフサイクルルールを策定する。

### 2.2 最終ゴール

1. harness ファイルの標準配置先が定義される（例: `apps/desktop/src/renderer/__harness__/` or `tests/harness/`）
2. 命名規則が統一される
3. PR マージ後の保管/削除ポリシーが策定される
4. 既存の harness ファイルが新ルールに準拠してリファクタリングされる

### 2.3 スコープ

#### 含むもの

- 配置先・命名規則・保管ポリシーの策定
- 既存 harness ファイルの棚卸しと移動
- `.gitignore` または Vite exclude 設定の追加
- task-specification-creator の Phase 11 テンプレートへのルール反映

#### 含まないもの

- Phase 11 テスト手法そのものの再設計
- E2E テスト基盤の刷新

### 2.4 成果物

- ライフサイクルルール文書
- 既存ファイルのリファクタリング差分
- Phase 11 テンプレート更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現在の harness ファイル一覧の把握

### 3.2 依存タスク

- TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001（Phase 11 harness の実例）

### 3.3 必要な知識

- Vite のエントリポイント設定と bundle 対象制御
- Phase 11 手動テストのワークフロー

### 3.4 推奨アプローチ

1. `rg -n "phase11\|Phase11\|Harness" apps/desktop/src/` で既存ファイルを棚卸し
2. 配置先の候補を比較検討（`__harness__/` vs `tests/harness/` vs `.phase11/`）
3. Vite exclude 設定で本番バンドルからの除外を確認
4. ルールを策定し、task-specification-creator の Phase 11 テンプレートに反映

---

## 4. 実行手順

### Phase構成

- Phase A: 棚卸しとルール策定
- Phase B: 既存ファイルの移動・リファクタリング
- Phase C: テンプレート更新と仕様同期

### Phase A: 棚卸しとルール策定

#### 手順

1. `rg -n "phase11\|Phase11" apps/desktop/src/ apps/desktop/scripts/` で全 harness ファイルを列挙
2. 各ファイルの用途（html entry / tsx component / capture script）を分類
3. 配置先・命名規則・保管ポリシーを策定

#### 完了条件

- ライフサイクルルール文書が作成されている

### Phase B: 既存ファイルの移動

#### 手順

1. 策定したルールに従い、既存 harness ファイルを移動
2. Vite 設定（`vite.config.ts`）で除外ルールを追加
3. 影響範囲のテスト実行

#### 完了条件

- 全 harness ファイルが新ルールに準拠している

### Phase C: テンプレート更新

#### 手順

1. `task-specification-creator/references/phase-11-12-guide.md` に harness ルールを追記
2. system spec（lessons-learned.md）に教訓を反映

#### 完了条件

- テンプレートと仕様書が同期されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] harness ファイルの標準配置先が定義されている
- [ ] 命名規則が統一されている
- [ ] 本番バンドルから harness が除外されている

### 品質要件

- [ ] 既存テスト/ビルドが PASS
- [ ] Vite bundle 解析で harness ファイルが含まれていない

### ドキュメント要件

- [ ] Phase 11 テンプレートにルールが反映されている
- [ ] lessons-learned.md に教訓が記録されている

---

## 6. 検証方法

### テストケース

- Case 1: `rg -n "phase11\|Phase11" apps/desktop/src/renderer/` の結果が新配置先のみであること
- Case 2: `pnpm --filter @repo/desktop build` が成功し、bundle に harness ファイルが含まれないこと
- Case 3: 新規 Phase 11 テスト作成時にテンプレートに従えること

### 検証手順

```bash
# 棚卸し
rg -n "phase11\|Phase11" apps/desktop/src/ apps/desktop/scripts/

# ビルド確認
pnpm --filter @repo/desktop build

# 未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --target-file docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-imp-phase11-harness-lifecycle-001.md
```

---

## 7. リスクと対策

| リスク                                      | 影響度 | 発生確率 | 対策                                           |
| ------------------------------------------- | ------ | -------- | ---------------------------------------------- |
| harness 移動で既存 screenshot path が壊れる | 中     | 中       | 移動前に全 workflow の Phase 11 証跡パスを確認 |
| Vite exclude 設定が不完全                   | 低     | 低       | bundle 解析で harness ファイル名を grep 確認   |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-11-manual-test.md`
- `apps/desktop/src/renderer/phase11-app-debug-localstorage-clear.html`
- `apps/desktop/src/renderer/Phase11AppDebugLocalstorageClearHarness.tsx`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/skill-creator/references/patterns.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

---

## 9. 備考

### 実装時の苦戦箇所と5分解決カード

#### 苦戦1: BrowserRouter 配下の harness route 配置

| 項目         | 内容                                                                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | dedicated harness を standalone HTML で作成したが、App.tsx の BrowserRouter と共存できず routing error が発生                                             |
| 原因         | Vite の multi-page 設定と React Router の path 管理が衝突                                                                                                 |
| 解決策       | harness を BrowserRouter の descendant route として `/phase11-harness/*` に配置するか、完全に別エントリポイントとして `phase11-*.html` を Vite に登録する |
| 検出コマンド | `rg -n "BrowserRouter\|createBrowserRouter" apps/desktop/src/renderer/`                                                                                   |
| 再発防止     | `patterns.md` に「BrowserRouter 配下の screenshot harness は descendant route で作る」パターン登録済み                                                    |

#### 苦戦2: harness ファイルの命名不統一

| 項目     | 内容                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `phase11-app-debug-localstorage-clear.html`（kebab-case）と `Phase11AppDebugLocalstorageClearHarness.tsx`（PascalCase）が混在                         |
| 原因     | HTML は kebab-case が慣例、React コンポーネントは PascalCase が慣例だが、prefix の `phase11` / `Phase11` が統一されていない                           |
| 解決策   | ファイル名規則を策定: HTML は `phase11-{task-short-name}.html`、TSX は `Phase11{TaskShortName}Harness.tsx`、script は `capture-{task-id}-phase11.mjs` |
| 再発防止 | Phase 11 テンプレートに命名規則テーブルを追加                                                                                                         |

### 補足事項

- Phase 11 harness は「手動テスト用の一時的な検証環境」であり、本番コードではない。PR マージ後に残す場合は回帰テスト資産として活用する判断が必要。
