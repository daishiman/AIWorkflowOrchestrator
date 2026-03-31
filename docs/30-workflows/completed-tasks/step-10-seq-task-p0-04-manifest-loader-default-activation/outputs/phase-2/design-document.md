# Phase 2 成果物: 設計書

## 自動インスタンス化戦略

### コンストラクタ DI override パターン

```typescript
constructor(deps: RuntimeSkillCreatorFacadeDeps) {
  // 外部注入を優先し、なければ自動インスタンス化
  this.sourceResolver = deps.sourceResolver ?? new SkillCreatorSourceResolver();
  this.resourcePlanner = deps.resourcePlanner ?? new PhaseResourcePlanner();
  this.resolvedResourceReader =
    deps.resolvedResourceReader ?? new ResolvedResourceReader(deps.resourceLoader);
  // 他のフィールドは従来通り
}
```

**各コンポーネントのコンストラクタ依存**:

- `SkillCreatorSourceResolver`: 引数なし（デフォルトコンストラクタ）
- `PhaseResourcePlanner`: 引数なし（デフォルトコンストラクタ）
- `ResolvedResourceReader`: `defaultResourceLoader?: ResourceLoader`（オプション）

→ 全コンポーネントが Facade の保持情報のみで生成可能。

---

## manifest 自動発見設計

### loadWorkflowManifest() 拡張

```
explicitRoot あり
  → explicitRoot/workflow-manifest.json を探索（既存動作）
explicitRoot なし
  → sourceResolver.resolve({}) で candidates を取得
  → candidates[0], [1], ... の順に workflow-manifest.json を探索
  → 最初に見つかった manifest を返す
  → 見つからない場合は undefined を返す
```

### 探索順序

1. `explicitRoot`（`resourceLoader.getBasePath()` または外部指定）
2. `AIWORKFLOW_SKILL_CREATOR_PATH` 環境変数
3. デフォルト candidates（getSkillCreatorRootCandidates() 順）

### キャッシュ戦略

- キャッシュなし（呼び出し毎に探索）
- マニフェストローダー（`ManifestLoader`）は内部キャッシュを持つため、重複探索コストは低い

---

## fallback chain 設計

| 優先度 | 条件                                                 | 動作                                       |
| ------ | ---------------------------------------------------- | ------------------------------------------ |
| 1      | dynamic pipeline + リソース取得成功                  | dynamic pipeline でエージェント/参照を取得 |
| 2      | dynamic pipeline + リソース0件 + resourceLoader あり | static resourceLoader でエージェントを取得 |
| 3      | dynamic pipeline なし + resourceLoader あり          | static resourceLoader でエージェントを取得 |
| 4      | 全て不在                                             | 空のエージェントスペックで LLM 呼び出し    |

**遷移ログ**:

- pipeline 有効化: `[RuntimeSkillCreatorFacade] dynamic resource pipeline activated`
- manifest 発見: `[RuntimeSkillCreatorFacade] manifest auto-discovered at {path}`
- static fallback: `[RuntimeSkillCreatorFacade] dynamic pipeline found no resources, falling back to static loader`

---

## ipc/index.ts wiring 調整方針

現在の ipc/index.ts はすでに3コンポーネントを明示的に注入しているため、Facade 内部の自動インスタンス化は外部注入によって上書きされる。

**方針**: ipc/index.ts の明示的注入は維持する（冗長だが明確）。将来的に注入を省略しても自動インスタンス化でカバーされる。

---

## 30思考法マトリクス

| #   | 思考法           | 適用観点                                                                     | 得られた示唆                                        | 採用 |
| --- | ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------------- | ---- |
| 1   | 目的思考         | なぜ自動インスタンス化が必要か                                               | pipeline が動かなければ manifest の意味がない       | ✓    |
| 2   | 逆説思考         | 「注入しない」ことをデフォルトにすると何が壊れるか                           | 後方互換が壊れる → DI override で解決               | ✓    |
| 3   | 分解思考         | 問題を分解: 初期化 / 発見 / fallback                                         | 3つを独立した設計単位にする                         | ✓    |
| 4   | 類比思考         | Spring/NestJS の DI デフォルト値と同じパターン                               | `?? new Xxx()` パターンは一般的                     | ✓    |
| 5   | システム思考     | 全体への影響: ipc/index.ts / テスト                                          | テストへの影響を最小化する fallback chain が必要    | ✓    |
| 6   | 制約思考         | 既存テストを壊さない制約下での最小変更                                       | dynamic でリソースが取れない場合 static fallback    | ✓    |
| 7   | 優先度思考       | 何を先に実装するか                                                           | manifest 自動発見より先に自動インスタンス化         | ✓    |
| 8   | 仮説思考         | 「manifest が常に存在する」仮定は成り立つか                                  | 成り立たない → fallback が必須                      | ✓    |
| 9   | 因果思考         | 自動インスタンス化 → dynamic pipeline 自動試行 → plan()分岐変化 → テスト影響 | 連鎖を意識した設計                                  | ✓    |
| 10  | 比較思考         | 外部注入 vs 自動インスタンス化のどちらが良いか                               | 両方をサポートするハイブリッド                      | ✓    |
| 11  | ゼロベース思考   | 最初から設計したらどうなるか                                                 | コンストラクタにデフォルト引数を持たせる            | 参考 |
| 12  | 抽象化思考       | 「pipeline の有効化」を抽象化                                                | コンポーネントの存在 + リソースの取得可能性         | ✓    |
| 13  | 具体化思考       | 抽象的な「自動発見」を具体化                                                 | candidates 順にファイル存在チェック                 | ✓    |
| 14  | 最悪ケース思考   | 全 candidates で manifest が見つからない場合                                 | undefined を返し static fallback へ                 | ✓    |
| 15  | 最善ケース思考   | manifest + 3コンポーネント全て動作                                           | dynamic pipeline 完全活性化                         | ✓    |
| 16  | トレードオフ思考 | キャッシュなし vs キャッシュあり                                             | ManifestLoader 内部キャッシュで十分                 | ✓    |
| 17  | リスク思考       | 既存テストへのリスク                                                         | 影響するテストを特定して対処策を設計                | ✓    |
| 18  | 段階的思考       | 実装順序                                                                     | 自動インスタンス化 → manifest 発見 → fallback chain | ✓    |
| 19  | 俯瞰思考         | タスク全体の位置づけ                                                         | P0-04 は pipeline 活性化の前提であり価値が高い      | ✓    |
| 20  | 深掘り思考       | fallback の各段階でログは十分か                                              | 3段階のログを追加                                   | ✓    |
| 21  | 横展開思考       | plan() だけでなく improve() も同様の変更が必要                               | improve() も同じ fallback chain を適用              | ✓    |
| 22  | 時系列思考       | 初期化時 → plan() 呼び出し時 → fallback 時                                   | 各タイミングのログを設計                            | ✓    |
| 23  | 役割分担思考     | Facade の責務 vs 各コンポーネントの責務                                      | Facade は生成と lifecycle 管理のみ                  | ✓    |
| 24  | 単純化思考       | 最小変更で最大効果                                                           | コンストラクタ5行 + loadWorkflowManifest 10行       | ✓    |
| 25  | 正規化思考       | 命名の統一                                                                   | `_autoInstantiated` フラグは不要                    | ✓    |
| 26  | 例外処理思考     | manifest ファイルが壊れている場合                                            | ManifestLoader が例外を throw → catch → undefined   | ✓    |
| 27  | 冪等思考         | 複数回初期化しても安全か                                                     | コンストラクタは1回のみ呼ばれるため問題なし         | ✓    |
| 28  | 可観測性思考     | pipeline の状態が外部から確認できるか                                        | ログと degraded error で確認可能                    | ✓    |
| 29  | 拡張性思考       | 将来 4コンポーネント目が追加される場合                                       | DI override パターンで容易に拡張可能                | ✓    |
| 30  | 実用性思考       | 実装後のデバッグ容易性                                                       | ログ + fallback / degraded error で確認可能         | ✓    |
