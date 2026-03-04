# UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001 - タスク指示書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001              |
| タスク名     | SkillCenter Phase11再撮影の preview ビルド事前ガード導入 |
| 分類         | 改善                                                     |
| 対象機能     | Phase 11 スクリーンショット再取得フロー（SkillCenter）   |
| 優先度       | 中                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | Phase 12（ブランチ再監査）                               |
| 発見日       | 2026-03-04                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 再監査中に、SkillCenter のスクリーンショット再取得を実行した際、`pnpm --filter @repo/desktop preview` が失敗し、再撮影フローが停止した。

### 1.2 問題点・課題

- `capture-skill-center-phase11.mjs` は `http://127.0.0.1:4173` 前提で動くが、preview ビルド失敗時の事前検出がない。
- 失敗時に「証跡更新不能」なのか「既存証跡で代替可能」なのかの判定ルールが曖昧。
- 失敗ログが未タスクへ自動で昇格されず、運用者依存で漏れやすい。

### 1.3 放置した場合の影響

- Phase 11 証跡の鮮度担保が不安定になる。
- UI/UX再検証の再現性が下がる。
- 同種タスクで同じ手戻りが継続する。

---

## 2. 何を達成するか（What）

### 2.1 目的

スクリーンショット再取得前に preview ビルド可否を機械判定し、失敗時の処理（未タスク化/代替証跡記録）を標準化する。

### 2.2 最終ゴール

- 再撮影前に preflight で失敗を即時検出できる。
- 失敗時の記録先と未タスク化フローが固定化される。
- 成功時のみ再撮影を実行し、時刻を成果物へ反映できる。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/scripts/capture-skill-center-phase11.mjs` 実行前の preflight 手順定義
- `task-specification-creator` の Phase 11/12 ガイド更新
- Phase 12 成果物への失敗時記録ルール追記

#### 含まないもの

- `@repo/shared/types/skill` 解決不具合そのものの実装修正
- 全 workflow への一括自動適用

### 2.4 成果物

- ガイド更新: `phase-11-12-guide.md`
- パターン更新: `skill-creator/references/patterns.md`
- 運用記録: `task-workflow.md` / `lessons-learned.md`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm` で `@repo/desktop` のコマンドが実行可能
- Phase 11 スクリーンショット出力先が作成済み

### 3.2 依存タスク

- なし（独立）

### 3.3 必要な知識

- `electron-vite preview` の実行フロー
- Phase 11/12 の証跡運用（TCカバレッジ、成果物記録）

### 3.4 推奨アプローチ

1. preview 起動可否を preflight で検証
2. 成功時のみスクリーンショット再取得
3. 失敗時は未タスク起票 + 代替証跡の判定を記録

---

## 4. 実行手順

### Phase構成

- Phase A: 事前検証
- Phase B: 再撮影 or 失敗分岐
- Phase C: 成果物同期

### Phase A: 事前検証

#### 目的

再撮影前に preview 実行可否を判定する。

#### 手順

1. `pnpm --filter @repo/desktop preview` を起動して build 成否を確認する
2. `127.0.0.1:4173` の待受を確認する
3. 失敗時はログを保存する

#### 成果物

- preflight 実行ログ

#### 完了条件

- 成功/失敗のどちらかを判定済み

### Phase B: 再撮影 or 失敗分岐

#### 目的

判定結果に応じて次アクションを固定化する。

#### 手順

1. 成功時: `capture-skill-center-phase11.mjs` を実行して再撮影
2. 失敗時: 本未タスクを参照し、Phase 12 `unassigned-task-detection.md` に記録
3. 既存証跡を使う場合は「再撮影不能理由」と「既存証跡時刻」を併記

#### 成果物

- 再撮影済み `TC-*.png` または失敗記録

#### 完了条件

- 再撮影成功、または失敗時の記録が完了

### Phase C: 成果物同期

#### 目的

Phase 12 成果物と仕様台帳を整合させる。

#### 手順

1. `spec-update-summary.md` / `documentation-changelog.md` を更新
2. `task-workflow.md` / `lessons-learned.md` へ苦戦箇所を反映
3. `verify-unassigned-links` / `audit --diff-from HEAD` を実行

#### 成果物

- 同期済み仕様書・成果物

#### 完了条件

- `currentViolations=0` かつリンク整合 PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] preview preflight の成否判定フローが文書化されている
- [ ] 失敗時の分岐（未タスク化/代替証跡）が定義されている

### 品質要件

- [ ] `verify-unassigned-links` が PASS
- [ ] `audit-unassigned-tasks --json --diff-from HEAD` で `currentViolations=0`

### ドキュメント要件

- [ ] `phase-11-12-guide.md` に手順追記
- [ ] `task-workflow.md` と `lessons-learned.md` に反映

---

## 6. 検証方法

### テストケース

- TC-1: preview 成功時に再撮影まで完了する
- TC-2: preview 失敗時に未タスク化と成果物記録が残る

### 検証手順

1. preflight を実行し成否を確認
2. 成功/失敗パスで成果物記録を確認
3. 未タスク監査とリンク監査を実行

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                          |
| -------------------------------------- | ------ | -------- | --------------------------------------------- |
| preview 失敗原因が複数あり切り分け不能 | 中     | 中       | ログ保存を必須化し、失敗時はまず未タスク化    |
| 再撮影不能時に証跡鮮度が曖昧           | 中     | 中       | 既存証跡の撮影時刻を成果物へ明記              |
| 仕様書反映漏れ                         | 中     | 低       | `task-workflow` と `lessons` を同一ターン更新 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/manual-test-result.md`

### 参考資料

- `apps/desktop/scripts/capture-skill-center-phase11.mjs`
- `docs/30-workflows/unassigned-task/task-renderer-build-fix.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4173/advanced/skill-center?skipAuth=true
Rollup failed to resolve import "@repo/shared/types/skill"
from "src/renderer/components/molecules/SkillCategoryFilter/index.tsx"
```

### 補足事項

- 本タスクは「再撮影前の運用ガード」が対象であり、モジュール解決エラー本体の修正は別タスクで扱う。
