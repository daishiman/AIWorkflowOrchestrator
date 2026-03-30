# TASK-P0-03: Implementation Guide

## Part 1: 概念説明（中学生レベル）

### workflow-manifest.json って何？

料理のレシピ本を想像してください。レシピ本には「材料リスト」と「手順」が書いてあります。
workflow-manifest.json は、AIスキル（skill-creator）のための「レシピ本」です。

- **phases（フェーズ）** = 料理の手順。「材料を切る → 炒める → 味付け → 盛り付け → 完成」のように、順番が決まっています
- **resources（リソース）** = 各手順で使う材料や道具。「包丁」「フライパン」「調味料」のように、どの手順でどの道具を使うかが書いてあります
- **hooks（フック）** = 各手順の開始と終了のチェック。「火は通ったか？」「味は大丈夫か？」のように、次の手順に進む前の確認ポイントです

### なぜ本番パスに配置するの？

ManifestLoader というプログラムが workflow-manifest.json を読み込んで、スキルの実行手順を理解します。今までは「テスト用のレシピ」しかなく、「本番のレシピ」がありませんでした。本番のレシピがないと、プログラムはスキルをどう動かせばいいか分からないのです。

### canonical と mirror って何？

- **canonical（正本）** = 図書館にある「原本」。`.claude/skills/skill-creator/` に置きます
- **mirror（複製）** = 教室に置いてある「コピー」。`.agents/skills/skill-creator/` に置きます

両方が同じ内容であることが大切です。もし原本が書き換わったのにコピーが古いままだと、教室で読む人は間違った情報を見てしまいます。

---

## Part 2: 技術詳細

### manifest JSON 構造

```json
{
  "schemaVersion": 1,
  "workflowId": "skill-creator",
  "phases": [5 phases],
  "resources": [7 resource descriptors],
  "entry": [5 entry hooks],
  "exit": [5 exit hooks]
}
```

### 各フィールドの意味

| フィールド    | 型     | 説明                                                                                  |
| ------------- | ------ | ------------------------------------------------------------------------------------- |
| schemaVersion | number | manifest スキーマバージョン。`WORKFLOW_MANIFEST_SCHEMA_VERSION` (= 1) と一致必須      |
| workflowId    | string | workflow の一意識別子。skill-creator を識別する                                       |
| phases[]      | array  | workflow の実行段階。順序付きで dependsOn により依存関係を表現                        |
| resources[]   | array  | workflow で使用するリソースの記述子。skill-creator ディレクトリ内の実在ファイルを参照 |
| entry[]       | array  | 各 phase 開始時の validation hook                                                     |
| exit[]        | array  | 各 phase 終了時の handoff hook                                                        |

### Phase 定義と Workflow Lifecycle

| phase id               | title    | dependsOn              | resourceIds                                       | 説明                           |
| ---------------------- | -------- | ---------------------- | ------------------------------------------------- | ------------------------------ |
| requirements-gathering | 要件収集 | なし                   | agent-analyze-request                             | ユーザー要件のヒアリングと整理 |
| plan                   | 計画策定 | requirements-gathering | agent-define-boundary, ref-core-principles        | スキル構造と生成計画の確定     |
| execute                | 実行     | plan                   | ref-codex-best-practices, schema-agent-definition | スキルファイルの生成           |
| verify                 | 検証     | execute                | schema-boundary                                   | 生成結果の品質チェック         |
| improve                | 改善     | verify                 | agent-analyze-feedback                            | フィードバックに基づく改善     |

### Resource Descriptor マッピング

| resource id              | kind      | path                                 | phaseIds                 | 対象ディレクトリ |
| ------------------------ | --------- | ------------------------------------ | ------------------------ | ---------------- |
| agent-analyze-request    | agent     | ./agents/analyze-request.md          | [requirements-gathering] | agents/          |
| agent-define-boundary    | agent     | ./agents/define-boundary.md          | [plan]                   | agents/          |
| ref-core-principles      | reference | ./references/core-principles.md      | [plan]                   | references/      |
| ref-codex-best-practices | reference | ./references/codex-best-practices.md | [execute]                | references/      |
| schema-agent-definition  | schema    | ./schemas/agent-definition.json      | [execute]                | schemas/         |
| schema-boundary          | schema    | ./schemas/boundary.json              | [verify]                 | schemas/         |
| agent-analyze-feedback   | agent     | ./agents/analyze-feedback.md         | [improve]                | agents/          |

### ManifestLoader.loadManifest() の検証フロー

1. JSON ファイルを読み込み `JSON.parse()` で構文検証
2. 許可された top-level フィールドのみ存在することを確認
3. `schemaVersion === 1` を検証
4. `workflowId` が非空文字列であることを検証
5. `phases[]` が1件以上の配列であることを検証
6. 各 phase の必須フィールド (id, title, entryHookId, exitHookId) を検証
7. `resources[]` の各 resource の必須フィールド (id, kind, path) を検証
8. resource の kind が `agent | reference | schema | asset` のいずれかであることを検証
9. `entry[]` / `exit[]` の各 hook の必須フィールド (id, command) を検証
10. **Cross-reference 検証**: phase ↔ resource ↔ hook の双方向参照整合性を確認
11. **Phase 順序検証**: dependsOn で参照する phase が先に宣言されていることを確認
12. **Resource path 検証**: 各 resource の path が実在ファイルを指すことを `fs.access()` で確認
13. 検証通過後、resource path を絶対パスに正規化し、ハッシュを算出してキャッシュ

### Entry/Exit Hooks の役割

- **Entry hooks**: 各 phase 開始時の入力検証。phase が実行可能な状態であることを確認する
- **Exit hooks**: 各 phase 終了時の成果物引き渡し。次の phase に必要な情報が準備されたことを通知する
- hook の `command` フィールドは ManifestLoader の string 検証を通過する記述的な文字列

### Canonical / Mirror ポリシー

| 項目     | canonical                                             | mirror                                                |
| -------- | ----------------------------------------------------- | ----------------------------------------------------- |
| パス     | `.claude/skills/skill-creator/workflow-manifest.json` | `.agents/skills/skill-creator/workflow-manifest.json` |
| 役割     | 正本。設計変更時にこちらを先に更新する                | 複製。canonical と同一内容を維持する                  |
| 更新手順 | 直接編集                                              | `cp` コマンドで canonical からコピー                  |
| 検証方法 | `diff` で差分確認                                     | TC-08 テストで parity を自動検証                      |

### TASK-P0-04 への引き継ぎ事項

| 項目                              | 説明                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| ManifestLoader default activation | manifest の自動読み込みパスを設定する (本タスクのスコープ外)            |
| runtime pipeline 統合             | manifest を runtime の workflow 実行に組み込む                          |
| manifest 配置パス                 | `DEFAULT_SKILL_CREATOR_PATH` + `/workflow-manifest.json` として解決可能 |

### テスト結果サマリー

| カテゴリ                           | テスト数 | 結果                         |
| ---------------------------------- | -------- | ---------------------------- |
| Production manifest (TC-01〜TC-10) | 10       | 全 PASS                      |
| Edge case & regression (EC/RC)     | 7        | 全 PASS                      |
| 既存 ManifestLoader テスト         | 10       | 全 PASS (リグレッションなし) |
| **合計**                           | **27**   | **全 PASS**                  |
