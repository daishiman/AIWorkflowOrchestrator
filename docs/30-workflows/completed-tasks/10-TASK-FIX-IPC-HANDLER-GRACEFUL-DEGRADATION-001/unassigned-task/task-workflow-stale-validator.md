# Workflow Stale 一括検出バリデータ - タスク指示書

## メタ情報

```yaml
issue_number: 1093
```

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-WORKFLOW-STALE-VALIDATOR-001                                            |
| タスク名     | index.md / artifacts.json / phase-\*.md の stale 状態一括検出バリデータ        |
| 分類         | 改善                                                                           |
| 対象機能     | task-specification-creator バリデータ群                                        |
| 優先度       | 中                                                                             |
| 見積もり規模 | 小規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 Phase 12（スキルフィードバック） |
| 発見日       | 2026-03-08                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 の再監査で、`verify-all-specs` の構造チェックは PASS しているにもかかわらず、`index.md` の Phase ステータス（`完了` vs `未実施`）と `artifacts.json` の状態が乖離する stale 問題が発生した。P51（サブエージェントの documentation-changelog 早期完了記載）と同パターンで、構造は正しいが内容が古い状態を検出できていない。

### 1.2 問題点・課題

| 課題                         | 現状                                                   | あるべき姿                                                   |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `index.md` Phase ステータス  | `verify-all-specs` は見出し構造のみ検証                | Phase 完了状態と `artifacts.json` の整合を検証               |
| `artifacts.json` の `status` | `complete-phase.js` 実行で更新されるが未実行の検出なし | 全 Phase の completed/pending が実態と一致していることを検証 |
| `phase-*.md` の完了条件      | チェックリストの `[x]` 記載があっても手動確認のみ      | 完了条件の充足状態をプログラム的に検証                       |

### 1.3 放置した場合の影響

- Phase 12 完了後に `index.md` が `pending` のまま残り、タスクの進捗が正しく把握できない
- `artifacts.json` の状態が実態と乖離し、依存タスクの判定が誤る
- 手動での目視確認に頼ることになり、P4（早期完了記載）やP51（サブエージェント中断）の再発を防げない

---

## 2. 何を達成するか（What）

### 2.1 目的

`validate-workflow-stale.js` バリデータを作成し、以下の3点の整合を自動検証する:

1. `index.md` の Phase ステータスと `artifacts.json` の Phase status
2. `artifacts.json` の Phase status と対応する `outputs/phase-N/` ディレクトリの存在
3. `phase-*.md` の完了条件チェックリストの `[x]` 記載状態

### 2.2 最終ゴール

```bash
node .claude/skills/task-specification-creator/scripts/validate-workflow-stale.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
# → error=0 / warning=0 / info=N
```

### 2.3 スコープ

#### 含むもの

- `validate-workflow-stale.js` スクリプトの新規作成
- `index.md` ↔ `artifacts.json` の Phase ステータス整合検証
- `artifacts.json` ↔ `outputs/` ディレクトリの成果物存在検証
- Phase 12 完了条件の自動チェック

#### 含まないもの

- 既存バリデータ（`verify-all-specs`, `validate-phase-output`）の修正
- Phase 仕様書の内容品質検証（見出し・セクション構造は `verify-all-specs` が担当）

### 2.4 成果物

| 成果物               | パス                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| バリデータスクリプト | `.claude/skills/task-specification-creator/scripts/validate-workflow-stale.js`                |
| テスト               | `.claude/skills/task-specification-creator/scripts/__tests__/validate-workflow-stale.test.js` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の `scripts/` ディレクトリに書き込み権限があること
- 既存のバリデータスクリプト（`verify-all-specs.js`, `validate-phase-output.js`）のパターンを理解していること

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識

- Node.js ファイルシステム操作
- `artifacts.json` のスキーマ（`phases.{N}.status`, `phases.{N}.artifacts[]`）
- `index.md` の Markdown テーブルパース

### 3.4 推奨アプローチ

1. 既存バリデータ（`verify-all-specs.js`）のコードパターンを参照
2. `artifacts.json` → `index.md` → `outputs/` の三点突合ロジックを実装
3. 出力形式は既存バリデータと同じ `{ errors: [], warnings: [], info: [] }`

---

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                | 発見経緯                                                              | 解決策                                                         | 教訓                                                                              |
| ----------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 構造 PASS でも内容 stale（P51派生） | `verify-all-specs` が構造のみ検証し、Phase ステータスの整合を見逃した | 構造検証とは別に、ステータス整合を検証する専用バリデータを追加 | バリデータの検証範囲を明確に分離し、それぞれの責務を明記する                      |
| `artifacts.json` の手動更新漏れ     | `complete-phase.js` を実行し忘れた場合に stale が発生                 | バリデータで未実行を検出し warning 出力                        | Phase 完了処理は `complete-phase.js` 実行を必須とし、バリデータで未実行を検出する |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validate-workflow-stale.js` が `--workflow` 引数でワークフローパスを受け取る
- [ ] `index.md` ↔ `artifacts.json` の Phase ステータス不一致を error として報告
- [ ] `artifacts.json` の completed Phase に対応する `outputs/` が存在しない場合を warning として報告

### 品質要件

- [ ] 既存の完了済みワークフロー（`completed-tasks/`）で error=0 を確認
- [ ] 実行中のワークフローで意図的に stale を作り、検出されることを確認

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                                   |
| ----------------------------------- | ------ | -------- | ------------------------------------------------------ |
| Markdown テーブルパースの不安定性   | 中     | 中       | 正規表現でステータス列のみ抽出し、複雑なパースを避ける |
| 既存ワークフローでの false positive | 低     | 中       | 初期は warning レベルで出力し、安定後に error に昇格   |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                  | パス                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| P51 落とし穴          | `.claude/rules/06-known-pitfalls.md#P51`                                                                                       |
| P4 落とし穴           | `.claude/rules/06-known-pitfalls.md#P4`                                                                                        |
| 既存バリデータ        | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                                                        |
| skill-feedback-report | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/outputs/phase-12/skill-feedback-report.md` |
