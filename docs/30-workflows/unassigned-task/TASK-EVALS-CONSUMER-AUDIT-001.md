# EVALS consumer 完全監査（スキーマ変更前の全 consumer 特定） - タスク指示書

## メタ情報

```yaml
issue_number: 2279
```


## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-EVALS-CONSUMER-AUDIT-001                                   |
| タスク名     | EVALS consumer 完全監査（スキーマ変更前の全 consumer 特定）     |
| 分類         | 改善/監査                                                       |
| 優先度       | **高**                                                          |
| 見積もり規模 | 中規模                                                          |
| ステータス   | 未着手                                                          |
| 発見元       | TASK-CONFLICT-PREVENT-001 Phase 12 unassigned-task-detection.md |
| 発見日       | 2026-04-18                                                      |
| depends_on   | TASK-CONFLICT-PREVENT-001（完了済み）                           |
| ブロック対象 | EVALS.json スキーマ変更を含む全タスク（AC-6 規則）              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

各スキルディレクトリには `EVALS.json` が配置されており、スキルの実行メトリクス・レベル・品質評価を管理する。現在確認されているファイルは以下のとおりである。

- `.claude/skills/task-specification-creator/EVALS.json`
- `.claude/skills/skill-creator/EVALS.json`
- `.claude/skills/aiworkflow-requirements/EVALS.json`
- `.claude/skills/skill-fixture-runner/EVALS.json`
- `.claude/skills/github-issue-manager/EVALS.json`
- `.claude/skills/int-test-skill/EVALS.json`
- `.agents/skills/` 以下の対応ファイル群
- `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`（フィクスチャ）

これらの `EVALS.json` を**読み込む・書き込む・検証する**コードやエージェントを「consumer」と呼ぶ。TASK-CONFLICT-PREVENT-001 では `EVALS.json` スキーマに `consumer 監査完了まで変更禁止（AC-6）` の制約が設けられた。しかし、どのコード・スクリプト・エージェントが `EVALS.json` を利用しているかを網羅的にリストアップした文書が存在しない。

### 1.2 問題点・課題

- **Consumer 一覧が不在**: 現時点で EVALS.json を利用している箇所が把握されていない。スキーマ変更時に見落としが発生するリスクが高い。
- **無声破損リスク**: フィールドを追加・削除・リネームした場合、consumer 側で JSON パースは成功するが、参照先フィールドが `undefined` となりメトリクス計算が壊れる。TypeScript 型検査が効かない純 JS スクリプトや YAML/Markdown 参照では特に検出困難。
- **dual root（.claude / .agents）によるドリフト**: `.claude/skills/` と `.agents/skills/` の両方に同一スキル構造が存在し、一方のみが更新されると整合性が崩れる。どちらの root を参照している consumer かを整理しないと、変更の影響範囲が正確に見積もれない。
- **CI 非連動**: 現状では `EVALS.json` の読み書きを行うスクリプト（`log-usage.js`・`log_usage.js`・`collect_feedback.js`・`init_skill.js`）が CI パイプラインと連動していないため、スキーマ変更後に破損を自動検知できない。

### 1.3 放置した場合の影響

| 影響                                                                                                    | 深刻度 |
| ------------------------------------------------------------------------------------------------------- | ------ |
| フィールド削除時にスクリプトが `undefined` を参照し、サイレントに誤ったメトリクスを書き込む             | 高     |
| `validate-schemas.js` や `skill-creator.fixture.test.ts` が期待するスキーマ構造と実態が乖離する         | 高     |
| dual root の片方だけが変更され、もう一方の consumer が古いスキーマで動き続ける                          | 中     |
| スキル改善サイクル（`self-improvement-cycle.md`）で参照するメトリクスが不正確になり、レベル判定が壊れる | 中     |

---

## 2. 何を達成するか（What）

### 2.1 目的

`EVALS.json` を読み込む・書き込む・検証するすべての consumer を特定し、スキーマ変更時の影響範囲を事前に把握できる状態にする。また、consumer ごとに参照フィールドと更新フィールドを整理し、将来のスキーマ変更ガイドラインを策定する。

### 2.2 最終ゴール

- **Consumer 完全一覧表**（コード・スクリプト・エージェント・テスト・ドキュメントを網羅）が作成される
- **各 consumer が参照・更新するフィールド**がマッピングされる
- **スキーマ変更前チェックリスト**が定義され、AC-6 の `変更禁止` 制約が解除可能な条件が明示される
- **dual root（.claude / .agents）の consumer 差分**が可視化される

### 2.3 スコープ

#### 含むもの

- `.claude/skills/` 以下の全スキルの `EVALS.json` に対する consumer 調査
- `.agents/skills/` 以下の全スキルの `EVALS.json` に対する consumer 調査
- `apps/desktop/src/` 内の TypeScript/JavaScript コードによる `EVALS.json` 参照
- `.claude/skills/*/scripts/` 内の Node.js スクリプトによる参照・更新処理
- `skill-fixture-runner` スクリプトによる検証処理
- テストファイル（`*.fixture.test.ts`・`SkillScanner.test.ts` 等）による参照
- エージェント定義（`agents/*.md`）内での EVALS.json 言及・利用指示

#### 含まないもの

- EVALS.json の**スキーマ変更自体**（このタスクは調査のみ）
- `.backups/` ディレクトリ内のアーカイブファイル
- `LOGS.md` や `references/` 内の単なるコメント・説明文（コードとして参照していないもの）

### 2.4 成果物

| 種別             | 成果物                   | 配置先                                                                     |
| ---------------- | ------------------------ | -------------------------------------------------------------------------- |
| 監査レポート     | consumer-audit-report.md | `docs/30-workflows/unassigned-task/outputs/TASK-EVALS-CONSUMER-AUDIT-001/` |
| フィールドマップ | evals-field-map.md       | `docs/30-workflows/unassigned-task/outputs/TASK-EVALS-CONSUMER-AUDIT-001/` |
| 変更ガイド       | schema-change-guide.md   | `docs/30-workflows/unassigned-task/outputs/TASK-EVALS-CONSUMER-AUDIT-001/` |
| dual root 差分表 | dual-root-parity.md      | `docs/30-workflows/unassigned-task/outputs/TASK-EVALS-CONSUMER-AUDIT-001/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 環境があり `node` コマンドが利用可能
- `pnpm` が利用可能
- リポジトリの最新 main が checkout されている
- `.claude/skills/` と `.agents/skills/` の両方にアクセスできる

### 3.2 依存タスク

| タスクID                  | 依存関係                          | 状態 |
| ------------------------- | --------------------------------- | ---- |
| TASK-CONFLICT-PREVENT-001 | このタスクの発見元・AC-6 の定義元 | 完了 |

このタスクは他のタスクから依存されている（EVALS スキーマ変更を含む全タスクのブロッカー）。

### 3.3 必要な知識

- `EVALS.json` の現行スキーマ構造（`skillName`・`version`・`currentLevel`・`metrics`・`levelHistory`・`patterns`・`phaseMetrics`・`qualityInsights`・`levelCriteria` フィールド）
- Node.js `fs` モジュールによる JSON 読み書きパターン
- `grep`・`ripgrep` による横断検索
- dual root（`.claude/skills/` と `.agents/skills/`）の同期ポリシー

### 3.4 推奨アプローチ

調査は以下の 3 レイヤーで行う。

1. **静的検索レイヤー**: `grep`・`ripgrep` で `EVALS.json`・`EVALS_PATH`・`evalsPath` 等のキーワードを検索し、参照箇所を列挙する
2. **フィールド参照レイヤー**: 特定した consumer ごとに、どのフィールドを読み書きしているかをコードリーディングで確認する
3. **テスト・検証レイヤー**: `skill-creator.fixture.test.ts`・`SkillScanner.ts` 等のテストコードが期待しているスキーマ構造を確認する

---

## 4. 実行手順

### Step 1: 全 consumer のリストアップ（静的検索）

```bash
# EVALS.json ファイルパスへの参照を検索（スクリプト）
grep -rn "EVALS\.json\|EVALS_PATH\|evalsPath" \
  .claude/skills/ .agents/skills/ apps/ \
  --include="*.js" --include="*.ts" --include="*.tsx" \
  --exclude-dir=".backups" --exclude-dir="node_modules"

# エージェント定義・参照ドキュメント内の言及を確認
grep -rn "EVALS" \
  .claude/skills/*/agents/ .agents/skills/*/agents/ \
  --include="*.md"

# テストファイルでの参照を確認
grep -rn "EVALS" \
  apps/desktop/src/__tests__/ \
  --include="*.ts" --include="*.tsx"
```

### Step 2: 各 consumer の読み書きフィールドを整理

特定した consumer ごとに以下を記録する。

| consumer パス                                                          | 操作       | 参照フィールド                            | 更新フィールド                                                             |
| ---------------------------------------------------------------------- | ---------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| （例）`.claude/skills/task-specification-creator/scripts/log-usage.js` | read/write | `metrics`, `levelHistory`, `currentLevel` | `metrics.totalUsageCount`, `metrics.successCount`, `metrics.lastEvaluated` |

### Step 3: dual root の差分確認

```bash
# .claude/skills と .agents/skills の EVALS.json を比較
diff \
  .claude/skills/task-specification-creator/EVALS.json \
  .agents/skills/task-specification-creator/EVALS.json

# 全スキルで同様の比較を実施
for skill in task-specification-creator skill-creator aiworkflow-requirements skill-fixture-runner github-issue-manager; do
  echo "=== $skill ==="
  diff .claude/skills/$skill/EVALS.json .agents/skills/$skill/EVALS.json 2>/dev/null || echo "片方が存在しない"
done
```

### Step 4: スキーマ定義を文書化

現行の `EVALS.json` スキーマをフィールドごとに記録する。

```
{
  skillName: string           // スキル識別子
  version: string             // スキルバージョン（semver）
  currentLevel: number        // 現在の習熟レベル（1/2/3）
  lastUpdated: string         // ISO 8601 日時
  metrics: {
    totalUsageCount: number
    successCount: number
    failureCount: number
    successRate: number
    averageDuration: number
    lastEvaluated: string
  }
  levelHistory: Array<{...}>
  patterns: {...}
  phaseMetrics: Record<string, {...}>
  qualityInsights: {...}
  levelCriteria: {...}
}
```

スキルごとにフィールドの差異（追加フィールド・省略フィールド）が存在する場合はその差異も記録する。

### Step 5: スキーマ変更前チェックリストを作成

consumer 一覧と参照フィールドマップをもとに、以下の観点でチェックリストを策定する。

- フィールド削除時: どの consumer が破損するか
- フィールド追加時: 既存 consumer が `undefined` を許容できるか
- フィールドリネーム時: 全 consumer の更新が必要な箇所リスト
- dual root の同期: `.claude/skills/` 変更時に `.agents/skills/` も連動するか

### Step 6: 成果物をレビューし AC-6 解除条件を確認

TASK-CONFLICT-PREVENT-001 の AC-6（「consumer 監査完了まで EVALS schema 変更禁止」）が解除可能かどうかを確認する。解除条件は以下のとおり。

- [ ] 全 consumer が consumer-audit-report.md に記載されている
- [ ] 各 consumer の参照フィールドが evals-field-map.md に記載されている
- [ ] schema-change-guide.md でフィールド変更手順が定義されている
- [ ] dual-root-parity.md で `.claude/skills/` と `.agents/skills/` の差分が 0 または許容範囲内であることが確認されている

---

## 5. 完了条件チェックリスト

- [ ] `consumer-audit-report.md` に全 consumer（スクリプト・TypeScript コード・テスト・エージェント定義）が列挙されている
- [ ] 各 consumer について「読み込みフィールド」「書き込みフィールド」「操作（read/write/validate）」が記録されている
- [ ] dual root（`.claude/skills/` vs `.agents/skills/`）の consumer 差分が可視化されている
- [ ] `evals-field-map.md` に現行スキーマの全フィールド定義が記載されている
- [ ] `schema-change-guide.md` に「フィールド追加」「フィールド削除」「フィールドリネーム」ごとの影響範囲と手順が定義されている
- [ ] TASK-CONFLICT-PREVENT-001 AC-6 の解除条件がすべて満たされているかどうかが判定されている
- [ ] 新たに発見された consumer がある場合は個別の未タスクとして記録されている

---

## 6. 検証方法

### 6.1 Consumer 漏れの確認

```bash
# 監査後に改めて検索し、consumer-audit-report.md に未記載の参照がないかを確認
grep -rn "EVALS\.json\|EVALS_PATH\|evalsPath" \
  .claude/skills/ .agents/skills/ apps/ \
  --include="*.js" --include="*.ts" --include="*.tsx" \
  --exclude-dir=".backups" --exclude-dir="node_modules" \
  | grep -v "consumer-audit-report.md"
```

上記コマンドの出力が、`consumer-audit-report.md` に記載済みのものだけであることを確認する。

### 6.2 dual root 差分の確認

```bash
# 差分が 0 または許容範囲内であることを確認
for skill in task-specification-creator skill-creator aiworkflow-requirements skill-fixture-runner github-issue-manager int-test-skill; do
  diff .claude/skills/$skill/EVALS.json .agents/skills/$skill/EVALS.json 2>/dev/null \
    && echo "$skill: 一致" \
    || echo "$skill: 差分あり"
done
```

### 6.3 AC-6 解除判定

以下のコマンドで全成果物ファイルが存在することを確認する。

```bash
ls docs/30-workflows/unassigned-task/outputs/TASK-EVALS-CONSUMER-AUDIT-001/
# consumer-audit-report.md
# evals-field-map.md
# schema-change-guide.md
# dual-root-parity.md
```

---

## 7. リスクと対策

| リスク                                                                            | 発生確率 | 影響 | 対策                                                                                               |
| --------------------------------------------------------------------------------- | -------- | ---- | -------------------------------------------------------------------------------------------------- |
| `grep` による静的検索で動的パス生成（文字列連結）を使っている consumer を見落とす | 中       | 高   | コードリーディングで `join(..., "EVALS.json")` パターンも確認する                                  |
| dual root の片方に新スキルが追加されており、もう片方への反映が漏れている          | 中       | 中   | `find` で全 EVALS.json を列挙し、`.claude` と `.agents` で対称性を確認する                         |
| エージェント定義（Markdown）内の EVALS.json 参照をコード consumer と混同する      | 低       | 低   | consumer 一覧を「コード」「スクリプト」「ドキュメント（参照のみ）」に分類して記録する              |
| 監査後に新たな consumer が追加されてスキーマが変更禁止のまま放置される            | 低       | 高   | `schema-change-guide.md` に「consumer 追加時は必ず evals-field-map.md を更新する」ルールを記載する |

---

## 8. 参照情報

| 資料名                                              | パス                                                                                          | 用途                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------- |
| TASK-CONFLICT-PREVENT-001 unassigned-task-detection | `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` | このタスクの発見元・AC-6 定義 |
| task-specification-creator EVALS.json               | `.claude/skills/task-specification-creator/EVALS.json`                                        | 代表スキーマのサンプル        |
| log-usage.js（task-specification-creator）          | `.claude/skills/task-specification-creator/scripts/log-usage.js`                              | 代表的な read/write consumer  |
| log_usage.js（skill-creator）                       | `.claude/skills/skill-creator/scripts/log_usage.js`                                           | 代表的な read/write consumer  |
| collect_feedback.js                                 | `.claude/skills/skill-creator/scripts/collect_feedback.js`                                    | 代表的な read consumer        |
| init_skill.js                                       | `.claude/skills/skill-creator/scripts/init_skill.js`                                          | EVALS.json 初期生成 consumer  |
| skill-creator.fixture.test.ts                       | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`                           | テスト consumer               |
| SkillScanner.ts                                     | `apps/desktop/src/main/services/skill/SkillScanner.ts`                                        | TypeScript コード consumer    |
| validate-skill-structure.js                         | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`                     | 検証 consumer                 |
| self-improvement-cycle.md                           | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`              | EVALS.json 構造の説明文書     |

---

## 9. 備考

### 苦戦箇所【記入必須】

#### EVALS スキーマ変更が即時禁止になった経緯

- **困難だった点**: TASK-CONFLICT-PREVENT-001 の作業中に EVALS.json のスキーマを変更（フィールド追加・定義拡張）しようとしたが、どのコードが `EVALS.json` を参照しているかを網羅的に把握していなかったため、変更を安全に行えるかどうかが判断できなかった。
- **採った対処**: AC-6「consumer 監査完了まで EVALS schema 変更禁止」として制約を課し、スキーマ変更を完全に凍結した。
- **発見された不確かさ**: `skill-fixture-runner` の `validate-skill-structure.js` が `EVALS.json` ファイルの存在を期待している（ファイル名チェック）が、実際にスキーマの内容を validate しているかどうかが不明確。`validate-schemas.js` も JSON Schema を検証するが、`EVALS.json` を対象としているかは確認が必要。

#### dual root による consumer 重複問題

- `.claude/skills/` と `.agents/skills/` の両方に同一スクリプトが存在しており、それぞれが独自の EVALS.json を読み書きする構造になっている。この dual root 状態では、スキーマを変更した際に両方の consumer を漏れなく更新しなければならないが、現状ではどちらの root が正本かが明確でない。
- この問題は `UT-UIUX-MIRROR-SYNC-CI-001` および `task-imp-aiworkflow-same-wave-sync-guard-001` と関連するが、それらは mirror の同期ガード全般を対象としており、EVALS.json 固有の consumer 監査とは分離して扱う必要がある。
