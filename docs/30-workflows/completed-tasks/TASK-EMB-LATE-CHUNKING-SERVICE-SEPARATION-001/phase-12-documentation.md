# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 12                                                                          |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                               |
| タスク種別 | NON_VISUAL code task                                                        |
| 目的       | Phase 12 mandatory 6 tasks を完了させ、本体実装・仕様・skill 間の整合を取る |
| 前提Phase  | Phase 11（手動テスト）                                                      |
| 後続Phase  | Phase 13（PR作成）                                                          |
| 作成日     | 2026-04-20                                                                  |
| 機能名     | emb-late-chunking-service-separation                                        |

---

## 目的

Phase 12 の mandatory 6 tasks（implementation guide、system spec 更新判断、documentation changelog、未タスク検出、skill feedback、compliance check）をすべて完了させる。`ChunkingLateChunkingAdapter` 抽出に関する JSDoc を整備し、既存ドキュメント（UNASSIGNED-EMB-005 index、unassigned-task 仕様書）を更新する。また本 Phase では「中学生レベルの概念説明」を含めて非専門家にもタスク意図を理解可能にする。

---

## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- 本タスクは `NON_VISUAL code task`（コード変更を伴う）であり、`docs-only / spec_created` ではないため Step 1-B の status は `completed` を使う
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする
- spec 変更がある場合は `topic-map.md` を同 wave で再生成する

---

## 中学生レベルの概念説明

### Late Chunking とは何か

文章を AI に理解させるとき、長い文章は「チャンク（かたまり）」という小さな単位に分割する。通常は先に文章を切って、切ったあとのかたまりごとに別々に AI にベクトル化（数値化）してもらう。**Late Chunking** は順番を逆にして、まず文章全体を AI にベクトル化してもらい、そのあとで「このかたまりはどの範囲か」を決めて、その範囲の数値を平均化する方法である。文章全体の文脈を保ったまま分割できるため、検索精度が上がる。

### なぜ責務分離が必要か

現状、`ChunkingService` という 1 つのクラスが 3 つの異なる仕事（戦略の統合、コンテキスト付与、Late Chunking 処理）を抱えている。クラスが大きすぎると:

1. **テストが難しくなる**: Late Chunking だけを確かめたいのに、`ChunkingService` の全機能を準備しないとテストが書けない。
2. **バグが混ざりやすくなる**: ある機能を直したら別の機能が壊れるリスクが増える。
3. **後から機能を追加しにくい**: 新しい処理を足すと、さらにクラスが太くなる。

このタスクでは Late Chunking の処理だけを `ChunkingLateChunkingAdapter` という別のクラスに引っ越しする。引っ越し先では Late Chunking 単体でテストができるようになり、将来の改良もやりやすくなる。

---

## 実行タスク

### タスク 12-1: implementation guide 生成

**目的**: 実装済みの `ChunkingLateChunkingAdapter` の技術ドキュメントを生成する。

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を作成する。
2. 以下のセクションを含める。
   - クラス構造概要（`ChunkingLateChunkingAdapter` と `ChunkingService` の委譲関係）
   - 9 メソッドの役割一覧（public/private 分類と責務）
   - 座標系変換の説明（文字位置 → トークン位置 → セグメント位置）
   - プーリング戦略の選択ガイド（mean / cls / attention の特性）
   - DI パターン（コンストラクタ注入）の使用例
3. 技術ドキュメントガイド（`technical-documentation-guide.md`）に準拠する。

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク 12-2: system spec 更新判断

**目的**: aiworkflow-requirements の system spec 更新が必要かを判定し、更新した場合はサマリを残す。

**実行手順**:

1. `aiworkflow-requirements` skill の `references/` 配下を検索し、Late Chunking / ChunkingService / embedding に関する正本仕様を特定する。
2. 本タスクで導入した `ChunkingLateChunkingAdapter` が正本仕様に反映すべき変更かを判定する。
3. 更新不要と判断した場合は `outputs/phase-12/system-spec-update-summary.md` に「更新なし」と判定理由を記録する。
4. 更新必要と判断した場合は `spec-update-workflow.md` に従い、該当する正本仕様ファイルを更新する。
5. 更新後、`topic-map.md` の再生成が必要かを判定する。

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`
- 必要な場合: `aiworkflow-requirements` 配下の該当正本仕様更新

---

### タスク 12-3: documentation changelog 生成

**目的**: 本タスクのドキュメント変更を一覧化する。

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する。
2. 以下の変更をエントリとして記録する。
   - `chunking-late-chunking-adapter.ts` / `index.ts` / `chunking-late-chunking-adapter.test.ts` の新規作成
   - `chunking-service.ts` の委譲化と 9 メソッド除去
   - `chunking-service.integration.test.ts` の SEP-08 / SEP-09 追加
   - `docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/` の仕様書一式新設
   - 本タスク仕様書のステータスを `実施済み` に更新
3. `documentation-changelog-template.md` のフォーマットに準拠する。
4. `system-spec-update-summary.md` と同じ結論（更新あり / なし）を記載する。

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク 12-4: 未タスク検出

**目的**: 本タスク実施中に発見された未タスクを formalize する。

**実行手順**:

1. `outputs/phase-12/unassigned-task-detection.md` を作成する。
2. 以下の関連タスクとの関係を整理する。
   - TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001（先行タスク・完了済み）
   - TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001（後続タスク・本タスク完了後に着手可能）
   - Contextual Embeddings 処理の分離（別タスク候補・本タスクのスコープ外）
3. Contextual Embeddings 処理の分離を未タスク候補として `docs/30-workflows/unassigned-task/` に formalize するかを判断する。
4. formalize する場合は `unassigned-task-template.md` に従い、新規ファイルを作成する。
5. `UNASSIGNED-EMB-005-late-chunking/index.md` の「依然として残る本体スコープ」から該当項目を削除する。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`
- 必要な場合: `docs/30-workflows/unassigned-task/TASK-EMB-CONTEXTUAL-SEPARATION-001.md`（仮称・formalize する場合）

---

### タスク 12-5: skill feedback 生成

**目的**: task-specification-creator / aiworkflow-requirements skill に対するフィードバックを記録する。

**実行手順**:

1. `outputs/phase-12/skill-feedback-report.md` を作成する。
2. 本タスクを通じて得られた skill 改善案を記録する（例: DI パターンの設計テンプレート追加、モック実装雛型の活用度、循環参照チェック項目の有効性）。
3. 改善案がない場合は「改善提案なし」と明記する。
4. `self-improvement-cycle.md` のループに投入可能な形でサマリを残す。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

### タスク 12-6: compliance check（root evidence）

**目的**: Phase 12 mandatory 6 tasks が全て揃っていることを集約検証する。

**実行手順**:

1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する。
2. 以下の同値性を確認し記録する。
   - Task 定義（本ファイルの実行タスク）× outputs の実在性
   - artifacts.json のエントリ × outputs の実在性
   - current-baseline（現行コード状態）× 本タスクで変更された内容
   - validator（typecheck / lint / test）× Phase 9 の実行結果
3. 不整合がある場合は対応する Phase に戻る判定を記録する。
4. `phase12-task-spec-compliance-template.md` に準拠する。

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

### タスク 12-7: 既存ドキュメント更新

**目的**: 本タスク完了に伴う既存ドキュメントの整合を取る。

**実行手順**:

1. `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md` の「依然として残る本体スコープ」から `packages/shared/src/services/embedding/late-chunking/ への責務分離` を削除する。
2. `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md` の `status` を `実施済み` に更新する（仕様書本文は Issue #2314 と同内容のため本文更新は不要）。
3. 本タスク仕様書 `docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/index.md` のフロントマター `status` を `completed` に更新する。
4. `chunking-late-chunking-adapter.ts` にクラス / メソッドレベルの JSDoc が付与されていることを確認する（Phase 8 で付与済みのはず）。
5. `packages/shared/src/services/embedding/late-chunking/index.ts` のコメントに「Late Chunking 処理の責務を担うサービス層」と記載する。

**期待される成果物**:

- 既存ドキュメントの更新差分（git diff で確認）

---

## 参照資料

| 参照資料                              | パス                                                                                        | 内容                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| phase-template-phase12                | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`            | Phase 12 テンプレート          |
| phase-12-documentation-guide          | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | mandatory 6 tasks の詳細       |
| phase-12-completion-checklist         | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`     | 完了定義                       |
| spec-update-workflow                  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | system spec 更新判断フロー     |
| technical-documentation-guide         | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`     | implementation guide 詳細      |
| phase12-task-spec-compliance-template | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | compliance check 雛形          |
| documentation-changelog-template      | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`      | changelog 雛形                 |
| implementation-guide-template         | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`         | 実装ガイド雛形                 |
| UNASSIGNED-EMB-005 index              | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`                               | 更新対象（発見元ドキュメント） |
| unassigned-task 本タスク仕様書        | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md`        | 更新対象（ステータス反映）     |

---

## Canonical Artifacts

| 成果物                  | パス                                                     | 内容                                         |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------- |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`               | ChunkingLateChunkingAdapter 技術ドキュメント |
| system spec 更新サマリ  | `outputs/phase-12/system-spec-update-summary.md`         | 更新判断と反映結果                           |
| documentation changelog | `outputs/phase-12/documentation-changelog.md`            | 本タスクのドキュメント変更一覧               |
| 未タスク検出            | `outputs/phase-12/unassigned-task-detection.md`          | 関連タスクとの関係整理と formalize 候補      |
| skill feedback          | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案                               |
| compliance check        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | mandatory 6 tasks 集約検証                   |

---

## 統合テスト連携

- Phase 11 の `chunking-service.integration.test.ts` 実行結果を screenshot 代替の根拠として `implementation-guide.md` と `system-spec-update-summary.md` に引き継ぐ。
- Phase 12 の compliance check では、統合テスト evidence が実在し current fact と一致することを確認する。
- Phase 13 には統合テストを再実行せず、Phase 9〜11 で確定した evidence を参照して close-out する。

## 成果物

| 成果物                  | パス                                                      | 内容                                             |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`                | クラス構造・座標系・プーリング戦略の技術解説     |
| system spec 更新サマリ  | `outputs/phase-12/system-spec-update-summary.md`          | 更新有無の判定と反映結果                         |
| documentation changelog | `outputs/phase-12/documentation-changelog.md`             | 変更エントリ一覧                                 |
| 未タスク検出            | `outputs/phase-12/unassigned-task-detection.md`           | Contextual Embeddings 分離等の未タスク候補       |
| skill feedback          | `outputs/phase-12/skill-feedback-report.md`               | skill 改善提案サマリ                             |
| compliance check        | `outputs/phase-12/phase12-task-spec-compliance-check.md`  | Task / Step / validator / artifacts の同値性集約 |
| 既存ドキュメント更新    | UNASSIGNED-EMB-005 index / unassigned-task 本タスク仕様書 | ステータス / 残スコープ更新                      |

---

## 完了条件

- [ ] `implementation-guide.md` がクラス構造・座標系・プーリング戦略を網羅している
- [ ] `system-spec-update-summary.md` に更新有無の判定と理由が明記されている
- [ ] `documentation-changelog.md` の結論が `system-spec-update-summary.md` と一致している
- [ ] `unassigned-task-detection.md` に関連 3 タスクとの関係が整理されている
- [ ] `skill-feedback-report.md` に改善提案またはその不在が明記されている
- [ ] `phase12-task-spec-compliance-check.md` に Task / Step / validator / artifacts の同値性が記録されている
- [ ] `UNASSIGNED-EMB-005-late-chunking/index.md` から該当残スコープが削除されている
- [ ] `unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md` の status が `実施済み` に更新されている
- [ ] 本タスク仕様書 `index.md` の status が `completed` に更新されている
- [ ] `LateChunkingService.ts` にクラス / メソッドレベルの JSDoc が存在する
- [ ] 中学生レベルの概念説明セクションが本仕様書に含まれている

---

## タスク100%実行確認【必須】

- [ ] Task 12-1: implementation guide 生成 完了
- [ ] Task 12-2: system spec 更新判断 完了
- [ ] Task 12-3: documentation changelog 生成 完了
- [ ] Task 12-4: 未タスク検出 完了
- [ ] Task 12-5: skill feedback 生成 完了
- [ ] Task 12-6: compliance check 完了
- [ ] Task 12-7: 既存ドキュメント更新 完了

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）完了、MAJOR 以上の課題がないこと
- **後続**: Phase 13（PR作成）へ進む。ただし Phase 13 はユーザーの明示承認があるまで blocked

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-13-pr-creation.md`
