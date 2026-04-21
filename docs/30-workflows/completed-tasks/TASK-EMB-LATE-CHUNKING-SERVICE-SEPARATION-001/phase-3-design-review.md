# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 3                                             |
| タスクID | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 |
| 前Phase  | [phase-2-design.md](phase-2-design.md)        |
| 次Phase  | phase-4-test-creation.md（Gate PASS 時）      |

> current fact: レビュー対象クラス名は `ChunkingLateChunkingAdapter` として解釈する。

## 目的

Phase 2 の設計事項 1〜4（コンストラクタシグネチャ・組み込み方法オプションA・ディレクトリ構造・SEP-01〜SEP-09）を 30 思考法と 4 条件でレビューし、Phase 4 開始可否を判定する。循環参照の物理的不可能性と逆方向参照禁止ルールを重点検証する。

## 判定基準

| 判定     | 条件                                                                                                   | 対応                                          |
| -------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| PASS     | 全レビュー観点で問題なし。4 条件すべて PASS。逆方向参照ゼロ                                            | Phase 4（テスト作成）へ進行                   |
| MINOR    | 軽微な指摘（命名・JSDoc 文言など）のみ残る                                                             | 指摘対応後 Phase 4 へ進行                     |
| MAJOR    | 重大な問題（設計事項 1〜4 のいずれかに破壊的変更が必要・逆方向参照の可能性・コンストラクタ非互換など） | 戻り先決定ルールに従い Phase 1 または Phase 2 |
| CRITICAL | 致命的問題（循環参照回避が不可能・`LateChunkingOptions` の移動強制・先行タスクの前提崩壊）             | Phase 1 へ戻りユーザーと要件を再確認          |

## 戻り先決定ルール

| 問題の種類                                                     | 戻り先              |
| -------------------------------------------------------------- | ------------------- |
| 要件（9 メソッド inventory、public/private 分類）の問題        | Phase 1（要件定義） |
| 設計（コンストラクタシグネチャ・ディレクトリ・SEP 仕様）の問題 | Phase 2（設計）     |
| 両方の問題                                                     | Phase 1（要件定義） |

---

## 実行タスク

1. 逆方向参照禁止と循環参照回避をレビューする。
2. 4 条件と AC-1〜AC-5 のトレーサビリティをレビューする。
3. 30 思考法で設計の穴・過剰・曖昧さを監査する。
4. PASS / MINOR / MAJOR / CRITICAL を決定する。

## レビュー観点

### 1. 循環参照チェック【重点】

参照方向マップが以下の一方向を成立させているか検証する。

```
chunking/chunking-service.ts
    ↓ import
embedding/late-chunking/LateChunkingService.ts
    ↓ import
chunking/interfaces.ts  (ITokenizer, IEmbeddingClient)
chunking/types.ts        (Chunk, LateChunkingOptions)
```

| チェック項目                                                                                      | 期待結果 | 検証方法                                                                                   |
| ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `chunking/interfaces.ts` が `embedding/late-chunking` を import しない                            | PASS     | `grep -rn "from.*embedding/late-chunking" packages/shared/src/services/chunking/` がゼロ件 |
| `chunking/types.ts` が `embedding/late-chunking` を import しない                                 | PASS     | 同上                                                                                       |
| `LateChunkingService.ts` が `chunking/chunking-service.ts` を import しない                       | PASS     | `LateChunkingService` は `chunking/types` と `chunking/interfaces` のみ参照                |
| `LateChunkingService.ts` が `embedding/late-chunking` 外のファイルから chunking/\* を再公開しない | PASS     | public API は `LateChunkingService` クラスのみ                                             |

循環参照が 1 件でも検出された場合は MAJOR 判定とし Phase 2 へ戻す。`LateChunkingOptions` を移動する提案が再浮上した場合は CRITICAL 判定として Phase 1 へ戻す。

### 2. 4 条件評価

| 条件   | 判定基準                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| 価値性 | public 昇格 3 メソッドのテスト観測性向上が「mock では困難」の真因解消に直結するか                           |
| 実現性 | 9 メソッドのコピー移動と委譲配線で完結するか。新規アルゴリズム・新規プロトコルの導入なしで実装可能か        |
| 整合性 | `chunking → embedding/late-chunking` の一方向参照が成立し、責務境界・状態所有権が矛盾なく閉じているか       |
| 運用性 | 既存 3 引数呼び出しを壊さず、後方互換を維持したまま close-out できるか。Phase 12 mandatory 6 tasks が揃うか |

4 条件のいずれかが FAIL 判定の場合は MAJOR 以上とし、戻り先決定ルールに従う。

### 3. 要件との整合性

| チェック項目                                                                       | 期待結果 |
| ---------------------------------------------------------------------------------- | -------- |
| Phase 1 AC-1（9 メソッド inventory）が設計事項 1 で実装可能な形に展開されている    | PASS     |
| Phase 1 AC-2（public 昇格 3 メソッド）が設計事項 1 の public 宣言に反映されている  | PASS     |
| Phase 1 AC-3（コンストラクタ第 4 引数）が設計事項 2 オプションA に採用されている   | PASS     |
| Phase 1 AC-4（逆方向参照禁止）が設計事項 3 の参照方向マップに明示されている        | PASS     |
| Phase 1 AC-5（artifact canonical 一覧）が設計事項 4 の artifact 配置と整合している | PASS     |

### 4. アーキテクチャの妥当性

| チェック項目                                                                               | 期待結果 |
| ------------------------------------------------------------------------------------------ | -------- |
| Extract Class パターンが SRP 違反解消として妥当か                                          | PASS     |
| `LateChunkingService` の責務が Late Chunking アルゴリズム 1 つに収斂しているか             | PASS     |
| `ChunkingService` が Late Chunking に関して「戦略統合ファサード + 委譲」のみの責務になるか | PASS     |
| `ITokenizer` / `IEmbeddingClient` が Port として変更されていないか                         | PASS     |
| ディレクトリ構造が `embedding/pipeline/` / `embedding/providers/` と整合しているか         | PASS     |

### 5. 技術的実現可能性

| チェック項目                                                                                                    | 期待結果 |
| --------------------------------------------------------------------------------------------------------------- | -------- |
| TypeScript コンストラクタのオプショナル引数で既存 3 引数呼び出しを破壊しない                                    | PASS     |
| `LateChunkingService` を `vi.fn()` でモックして SEP-08/SEP-09 の委譲確認が可能                                  | PASS     |
| public 昇格 3 メソッドが単独呼び出し可能（`ChunkingService` 非依存でインスタンス化可能）                        | PASS     |
| 先行タスク TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 による `IEmbeddingClient.getTokenEmbeddings?()` が利用可能 | PASS     |

### 6. インターフェース設計（simpler alternative 検討）

| 代替案                                                                       | 採用可否 | 不採用理由                                                                       |
| ---------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `LateChunkingService` を関数群としてエクスポートする（クラス化しない）       | 不採用   | `tokenizer` / `embeddingClient` の状態保持が必要で、関数引数が肥大化する         |
| `LateChunkingOptions` を `embedding/late-chunking` へ移動する                | 不採用   | `chunking/types.ts` との逆方向参照が発生し、循環参照リスクが増える               |
| 9 メソッドすべてを public に昇格する                                         | 不採用   | 実装詳細の暴露が増え、将来の内部リファクタリング自由度が下がる。3 メソッドで十分 |
| `ChunkingService` 内部で `LateChunkingService` を自動生成する（オプションB） | 不採用   | SEP-08/SEP-09 で `LateChunkingService` のメソッド呼び出しを spy できない         |

---

## 30 思考法の適用メモ

### 論理分析系（批判的思考・演繹思考・帰納的思考・アブダクション・垂直思考）

- 「private メソッドのままではテストできない」という前提を批判的に検証した結果、TypeScript の `private` 修飾子は構造的な型チェックのみで runtime 制約がないため `(service as any).determineChunkBoundaries()` 等の回避は可能。しかし保守性を考慮すると public 昇格が正道であることを演繹的に確認。
- 9 メソッドのうち 3 つが public に値するかは、「外部テストで直接検証する価値がある中間ステップか」を帰納的に判定する（境界変換・プーリング）。

### 構造分解系（要素分解・MECE・2 軸思考・プロセス思考）

- 9 メソッドを「エントリーポイント」「計算コア」「ヘルパー」に要素分解。
- public 3 メソッドと private 6 メソッドが MECE に分離されているか検証。
- 「責務（chunking 戦略 vs Late Chunking アルゴリズム）× 可視性（public vs private）」の 2 軸で整理。

### メタ・抽象系（メタ思考・抽象化思考・ダブル・ループ思考）

- 「なぜ現在 private に埋没しているのか」をメタ的に問い、`ChunkingService` の責務が曖昧だったことを真因として抽象化する。
- Extract Class だけでなく、将来的に `PoolingStrategy` を Strategy パターンで切り出す余地があるかをダブル・ループ思考で保留（本タスクでは対象外、未タスク候補として Phase 12 で記録する）。

### 発想・拡張系（ブレインストーミング・水平思考・逆説思考・類推思考・if思考・素人思考）

- 「もし `LateChunkingOptions` を移動したら何が起きるか（if 思考）」→ 循環参照が発生する。故に移動しない判断が逆説的に正しい。
- 「`pipeline/` / `providers/` 兄弟に `late-chunking/` を置く」類推。

### システム系（システム思考・因果関係分析・因果ループ）

- 強化ループ: 責務分離 → テスト観測性向上 → 回帰バグ早期検出 → 後続タスク（Pipeline 統合）の信頼性向上。
- バランスループ: 抽出コスト（9 メソッド移動・コンストラクタ拡張）↔ テスト観測性の価値。

### 戦略・価値系（トレードオン・プラスサム・価値提案・戦略的思考）

- プラスサム: `ChunkingService` 肥大化解消と `LateChunkingService` 単独再利用性を同時に実現。
- トレードオン: 後方互換維持と API 拡張を「オプショナル引数 4 番目」で両立。

### 問題解決系（why 思考・改善思考・仮説思考・論点思考・KJ 法）

- why: なぜ mock では困難か → private メソッドの入出力が ChunkingService 経由でしか観測できないから。
- 論点: 「mock での困難さ」vs「アルゴリズム層の独立性」。後者を主論点に固定し、前者は副次効果として扱う。

## 実行手順

1. Phase 2 設計事項 1〜4 と Phase 1 AC-1〜AC-5 の対応表を確認する。
2. import 方向、型配置、DI 境界、SEP-01〜SEP-09 の配置をレビューする。
3. 30 思考法の監査表で論点を点検する。
4. 判定結果を成果物へ反映する。

## 統合テスト連携

- Phase 4 では SEP-08 / SEP-09 を委譲確認の統合テストとして Red 化する。
- Phase 5〜6 では `chunking-service.integration.test.ts` を設計妥当性の回帰ラインとして維持する。
- Phase 10 では本レビューで固定した判定観点をそのまま最終レビューゲートに再利用する。

## 多角的チェック観点（AI が判断）

| 思考法               | この Phase での監査観点                                     |
| -------------------- | ----------------------------------------------------------- |
| 批判的思考           | `mock では困難` の真因が観測性不足かを切り分ける            |
| 演繹思考             | 9 メソッド抽出なら観測性が上がるという推論を確認する        |
| 帰納的思考           | 一方向参照ルールが複数 Phase に反映されているか確認する     |
| アブダクション       | テスト困難の自然な原因を `ChunkingService` への埋没とみなす |
| 垂直思考             | 要件→設計→テスト→実装の縦の流れが閉じているかを見る         |
| 要素分解             | 9 メソッドを entry / core / helper に分ける                 |
| MECE                 | public 3 件 / private 6 件の分類漏れをなくす                |
| 2軸思考              | 責務と可視性、単体と統合の 2 軸で整理する                   |
| プロセス思考         | フェーズゲートが Red→Green→Review に沿うかを見る            |
| メタ思考             | 仕様書自身が自己監査可能かを見る                            |
| 抽象化思考           | 問題を `アルゴリズム独立化` と捉える                        |
| ダブル・ループ思考   | Extract Class だけでなく評価基準自体も見直す                |
| ブレインストーミング | 後続の改善候補を洗い出す                                    |
| 水平思考             | `late-chunking/` の配置が構造理解を助けるかを見る           |
| 逆説思考             | `LateChunkingOptions` を動かさない方が整合的か確認する      |
| 類推思考             | Fat Service の Extract Class パターンと照合する             |
| if思考               | Phase 13 欠落時の運用破綻を想定する                         |
| 素人思考             | 非専門家にも責務分離の意味が通るか確認する                  |
| システム思考         | 分離→観測性→回帰減少→後続統合安全化の流れを見る             |
| 因果関係分析         | 中間状態不可視がテスト困難を生む因果を確認する              |
| 因果ループ           | 検証容易化の強化ループと管理負荷の抑制ループを見る          |
| トレードオン思考     | 後方互換維持と DI 注入性向上の両立を確認する                |
| プラスサム思考       | 軽量化と再利用性向上の同時達成を確認する                    |
| 価値提案思考         | 誰のどのコストが下がるかを明確化する                        |
| 戦略的思考           | pipeline 統合前に責務分離する順序を確認する                 |
| why思考              | なぜ今この分離が必要かを掘る                                |
| 改善思考             | 運用負荷を下げる最小修正を探す                              |
| 仮説思考             | coverage 指標の扱いを補助指標として再定義する               |
| 論点思考             | 主論点を設計と運用導線欠損に分ける                          |
| KJ法                 | 所見を責務分離 / 検証 / 運用 / 文書に整理する               |

## サブタスク管理

| サブタスク | 役割                     | 出力                          |
| ---------- | ------------------------ | ----------------------------- |
| Review A   | 依存方向と DI 境界の確認 | `design-review-result.md`     |
| Review B   | 30 思考法監査            | `solution-elegance-review.md` |
| Review C   | ゲート判定               | `review-prompt.txt`           |

---

## Phase 4 開始条件

以下がすべて満たされた場合のみ Phase 4（テスト作成）へ進行する。

- [ ] 循環参照チェック 4 項目すべて PASS
- [ ] 4 条件（価値性・実現性・整合性・運用性）すべて PASS
- [ ] 要件との整合性チェック 5 項目すべて PASS
- [ ] アーキテクチャの妥当性チェック 5 項目すべて PASS
- [ ] 技術的実現可能性チェック 4 項目すべて PASS
- [ ] simpler alternative 検討の不採用理由が記録されている
- [ ] 30 思考法の適用メモ（7 系統）が記録されている

## Phase 13 blocked 条件

以下のいずれかに該当する場合、Phase 13（PR 作成）は user の明示承認があるまで blocked とする。

- Phase 12 の mandatory 6 tasks（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）のいずれかが未完了
- `artifacts.json` と `outputs/artifacts.json` の parity が未確認
- SEP-01〜SEP-09 および `chunking-service.integration.test.ts` のいずれかが FAIL
- `chunking-service.ts` から 9 メソッドが完全に除去されていない
- `grep -rn "from.*embedding/late-chunking" packages/shared/src/services/chunking/interfaces.ts packages/shared/src/services/chunking/types.ts` が 1 件以上検出される

## レビュー実行ランナー

標準ランナーとして `codex exec` を使用する。

```bash
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-3-design-review.md \
  --output-prompt docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/outputs/phase-3/review-prompt.txt
```

## 仕様参照チェック（AI が判断）

| 観点             | 参照先（aiworkflow-requirements） | 確認内容                                                                                  |
| ---------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| アーキテクチャ   | `architecture-*.md`               | Extract Class パターン適用と層分離が `packages/shared/src/services/` 配下で整合しているか |
| インターフェース | `interfaces-*.md`                 | `ITokenizer` / `IEmbeddingClient` の Port 定義が変更されていないか                        |
| API 設計         | `api-*.md`                        | `ChunkingService.chunk()` の入出力シグネチャが不変であることを確認                        |

## 契約品質チェック（設計タスク専用）

| チェック項目             | 確認内容                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 前提条件/事後条件        | `applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings` の入出力前提が明記されているか    |
| Port 依存                | `LateChunkingService` が `ITokenizer` / `IEmbeddingClient` の Port のみに依存しているか                    |
| DI 境界表                | `ChunkingService` → `LateChunkingService` → `ITokenizer` / `IEmbeddingClient` の依存関係が記載されているか |
| 受入基準トレーサビリティ | Phase 1 の AC-1〜AC-5 と Phase 2 の設計事項 1〜4 が 1:1 で対応しているか                                   |

## 参照資料

- [phase-2-design.md](phase-2-design.md)
- [phase-1-requirements.md](phase-1-requirements.md)
- `.claude/skills/task-specification-creator/references/review-gate-criteria.md`
- `.claude/skills/task-specification-creator/references/phase-template-core.md`

## 成果物

| 成果物                   | パス                                          |
| ------------------------ | --------------------------------------------- |
| design review result     | `outputs/phase-3/design-review-result.md`     |
| solution elegance review | `outputs/phase-3/solution-elegance-review.md` |
| review prompt            | `outputs/phase-3/review-prompt.txt`           |

## 完了条件

- [ ] 判定基準（PASS/MINOR/MAJOR/CRITICAL）と戻り先ルールが明記されている
- [ ] 循環参照チェック 4 項目が検証済み
- [ ] 4 条件（価値性・実現性・整合性・運用性）が評価済み
- [ ] 要件との整合性・アーキテクチャの妥当性・技術的実現可能性・simpler alternative の 4 観点が記録されている
- [ ] 30 思考法の適用メモ（論理分析系・構造分解系・メタ抽象系・発想拡張系・システム系・戦略価値系・問題解決系）が記録されている
- [ ] Phase 4 開始条件のチェックリストが満たされているか判定した
- [ ] Phase 13 blocked 条件が記録されている
- [ ] 契約品質チェック 4 項目が実施されている

## タスク100%実行確認【必須】

- [ ] 循環参照チェック 完了
- [ ] 4 条件評価 完了
- [ ] 30 思考法レビュー 完了
- [ ] Phase 4 開始条件判定 完了
- [ ] Phase 13 blocked 条件記録 完了

## 次Phase

- PASS / MINOR: phase-4-test-creation.md へ進行し、SEP-01〜SEP-09 を TDD Red で実装する
- MAJOR: 戻り先決定ルールに従い Phase 1 または Phase 2 へ戻る
- CRITICAL: Phase 1 へ戻り user と要件を再確認する
