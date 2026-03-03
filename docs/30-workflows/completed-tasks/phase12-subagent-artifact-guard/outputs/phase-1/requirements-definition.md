# 要件定義書 — Phase 12 SubAgent成果物固定ガード

## メタ情報

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001                                        |
| Phase      | 1                                                                                 |
| 作成日     | 2026-03-03                                                                        |
| ステータス | completed                                                                         |
| 抽出根拠   | resource-map.md起点 → topic-map.md → search-spec（task-workflow/lessons-learned） |

---

## 1. 抽出根拠（resource-map/topic-map/search-spec活用）

本要件は以下の参照資料から抽出した。

| 参照資料                                           | 用途                           | 抽出内容                                                    |
| -------------------------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| `resource-map.md` → Phase 12運用改善タスク行       | タスク種別から参照仕様を逆引き | `task-workflow.md` / `lessons-learned.md` を優先参照に特定  |
| `topic-map.md` → `task-workflow` セクション        | 対象仕様書の読み取り範囲を確定 | 完了台帳・残課題テーブル・検証証跡セクションを対象に設定    |
| `phase12-system-spec-retrospective-template.md` §3 | SubAgent分担構造を分析         | `1仕様書=1SubAgent` 原則とStep 2二重突合を要件候補に抽出    |
| `phase12-spec-sync-subagent-template.md` §2        | SubAgent完了条件を分析         | 仕様書別完了条件（型差分ゼロ、欠落ゼロ等）を要件候補に抽出  |
| `spec-update-workflow.md` §Step 1-G                | 検証コマンド順次実行手順を分析 | `currentViolations=0`合否基準、`baseline/current`分離を抽出 |
| 未タスク指示書 §2.2「最終ゴール」                  | 4ゴールを要件候補に分解        | FR-01〜FR-04 を定義                                         |
| 未タスク指示書 §3.5「実装課題と解決策」            | 親タスク4教訓を要件化          | FR-05〜FR-08 を定義                                         |
| `getfiletree-ipc` Phase 12成果物（実例）           | 要件の妥当性を実例で検証       | summary/report/changelogの実例構造を確認                    |

---

## 2. 機能要件（FR）

### FR-01: spec-update-summary テンプレート準拠構造

| 項目   | 内容                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| 要件ID | FR-01                                                                                  |
| 分類   | 機能要件                                                                               |
| 優先度 | 高                                                                                     |
| 出典   | 未タスク指示書 §2.2 最終ゴール①、`phase12-system-spec-retrospective-template.md` §1〜7 |

**定義:**
`spec-update-summary.md` の構造が `phase12-system-spec-retrospective-template.md` の全7セクション（メタ情報・実装内容サマリー・仕様書別SubAgent分担・仕様反映先・苦戦箇所・簡潔解決手順・検証コマンド）を含み、別タスクに適用可能な再利用可能形式になっていること。

**具体的な条件:**

- セクション①（メタ情報）: `タスクID` / `実施日` / `ステータス` / `監査対象workflow` / `SubAgent分担` の5フィールドが記載されている
- セクション③（仕様書別SubAgent分担）: `SubAgent列` / `担当仕様書列` / `主担当作業列` / `依存関係列` の4列が存在する
- セクション⑤（苦戦箇所）: `苦戦箇所` / `再発条件` / `解決策` / `今後の標準ルール` の4列が存在する
- セクション⑥（簡潔解決手順）: 5ステップ形式で記述されている

---

### FR-02: spec-sync-subagent-report SubAgent責務の成果物固定

| 項目   | 内容                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| 要件ID | FR-02                                                                        |
| 分類   | 機能要件                                                                     |
| 優先度 | 高                                                                           |
| 出典   | 未タスク指示書 §2.2 最終ゴール②、`phase12-spec-sync-subagent-template.md` §2 |

**定義:**
`spec-sync-subagent-report.md` に `1仕様書=1SubAgent` の対応で責務・依存関係・完了条件が成果物として固定されており、次回再確認時に責務の解釈が揺れないこと。

**具体的な条件:**

- SubAgent分担テーブルに `SubAgent列` / `担当仕様書列` / `主担当作業列` / `完了条件列` の4列が存在する
- 各SubAgentに対して1仕様書のみが割り当てられている（複数仕様書の混在なし）
- Step 2判定同期チーム（SubAgent-S2-A/B/C）が明示されている
- 完了チェックリストに `currentViolations=0` 確認項目が含まれている

---

### FR-03: Step 2判定の三点突合説明可能性

| 項目   | 内容                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| 要件ID | FR-03                                                                                 |
| 分類   | 機能要件                                                                              |
| 優先度 | 高                                                                                    |
| 出典   | 未タスク指示書 §2.2 最終ゴール③、`phase12-system-spec-retrospective-template.md` §3.3 |

**定義:**
Phase 12のStep 2判定結果が `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3成果物で一致していることを、三点突合の方法で説明できること。

**具体的な条件:**

- `phase-12-documentation.md` の更新対象テーブルにStep 2対象仕様書が記載されている
- `documentation-changelog.md` のStep 2判定（完了/該当なし）が `phase-12-documentation.md` の更新対象と一致している
- `spec-update-summary.md` の仕様反映先一覧がStep 2で実際に更新した仕様書と一致している
- 三点突合の確認コマンド `rg -n '^\\| 2\\s+\\|'` が実行可能で、結果が説明できる

---

### FR-04: 未タスク監査のcurrentViolations=0合否基準運用

| 項目   | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| 要件ID | FR-04                                                                  |
| 分類   | 機能要件                                                               |
| 優先度 | 高                                                                     |
| 出典   | 未タスク指示書 §2.2 最終ゴール④、`spec-update-workflow.md` §Step 1-G.1 |

**定義:**
未タスク監査において `audit-unassigned-tasks.js` の `currentViolations.total` を合否基準（0件でPASS）として運用し、`baselineViolations` は監視値として別記録することが標準化されていること。

**具体的な条件:**

- `audit-unassigned-tasks.js --json --target-file <path>` の `currentViolations.total=0` を合否とする
- `audit-unassigned-tasks.js --json --diff-from HEAD` の `currentViolations.total=0` を合否とする
- scope未指定の全体監査（`--json`のみ）結果は `baselineViolations` として別記録する
- 記録フォーマット: `audit-unassigned-tasks: 全体 PASS/FAIL（baseline: N件, current: M件）→ current PASS/FAIL`

---

### FR-05: IPC仕様の層別契約明示（親タスク教訓①）

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| 要件ID | FR-05                                                                            |
| 分類   | 機能要件                                                                         |
| 優先度 | 中                                                                               |
| 出典   | 未タスク指示書 §3.5 課題①「Main契約 `IpcResult<T>` と Preload公開 `T` の表現差」 |

**定義:**
IPC仕様書において、Main Process契約（`IpcResult<T>` ラッパー付き）とPreload公開契約（`T` 直接）の2層の契約差を分離して記載すること。

**具体的な条件:**

- `api-ipc-agent.md` または対応するIPC仕様書に「Main契約」と「Preload公開」を別行で記述する
- 形式: `Main: IpcResult<T>` / `Preload: T` のように層ごとの戻り値型を明示する
- 単一戻り値表記のみでは条件を満たさない

---

### FR-06: 完了前の成果物名照合固定化（親タスク教訓②）

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| 要件ID | FR-06                                                   |
| 分類   | 機能要件                                                |
| 優先度 | 中                                                      |
| 出典   | 未タスク指示書 §3.5 課題②「Phase 12成果物名のドリフト」 |

**定義:**
Phase 12完了判定前に `phase-12-documentation.md` の成果物記載と `outputs/phase-12/` 実体ファイル名を1対1突合し、名称の乖離（ドリフト）がないことを確認すること。

**具体的な条件:**

- `outputs/phase-12/` 配下のファイル名一覧を `ls` で取得する
- `phase-12-documentation.md` に記載された成果物パスと実体ファイル名が完全一致している
- 一致確認を `documentation-changelog.md` の完了チェックリストに記録する

---

### FR-07: 未タスク`## メタ情報`1セクション原則（親タスク教訓③）

| 項目   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 要件ID | FR-07                                                                                           |
| 分類   | 機能要件                                                                                        |
| 優先度 | 中                                                                                              |
| 出典   | 未タスク指示書 §3.5 課題③「未タスク `## メタ情報` 重複」、`spec-update-workflow.md` §Step 1-G.1 |

**定義:**
未タスク指示書の `## メタ情報` セクションがYAMLブロック+表の2箇所に分散せず、1セクションのみに統一されていること。機械監査コマンドで確認可能なこと。

**具体的な条件:**

- `rg -n '^## メタ情報$' <unassigned-file>` の出力が1件のみ
- `rg -n '^## メタ情報$|^## [1-9]\\. ' <unassigned-file>` で `## メタ情報` が1件 + `## 1..9` が9件の計10件
- YAMLブロック（```yaml）と表（| 項目 |）が `## メタ情報` 単一セクション内に同居することは許容する

---

### FR-08: SubAgent責務の成果物化（親タスク教訓④）

| 項目   | 内容                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------- |
| 要件ID | FR-08                                                                                                 |
| 分類   | 機能要件                                                                                              |
| 優先度 | 高                                                                                                    |
| 出典   | 未タスク指示書 §3.5 課題④「SubAgent責務が成果物に残らない」、`phase12-spec-sync-subagent-template.md` |

**定義:**
Phase 12の仕様同期において `spec-sync-subagent-report.md` を作成し、仕様書ごとの担当SubAgent・依存関係・完了条件を成果物として固定することで、次回再確認時に責務境界を再利用可能にすること。

**具体的な条件:**

- `spec-update-summary.md` のみ更新して `spec-sync-subagent-report.md` を作成しない状態は条件を満たさない
- `spec-sync-subagent-report.md` が `outputs/phase-12/` に存在する
- `spec-sync-subagent-report.md` の内容が `spec-update-summary.md` の §3（仕様書別SubAgent分担）と整合している

---

### FR-09: 監査スクリプトの順次実行（Step 1-G準拠）

| 項目   | 内容                                                        |
| ------ | ----------------------------------------------------------- |
| 要件ID | FR-09                                                       |
| 分類   | 機能要件                                                    |
| 優先度 | 高                                                          |
| 出典   | `spec-update-workflow.md` §Step 1-G「検証コマンド順次実行」 |

**定義:**
Phase 12 Task 2完了後に以下の4スクリプトをこの順序で実行し、全て合格することを確認すること。

**具体的な条件（実行順序固定）:**

1. `verify-unassigned-links.js` → `missing: 0`（参照リンク整合）
2. `audit-unassigned-tasks.js --json --target-file <path>` → `currentViolations: 0`（対象ファイル形式）
3. `audit-unassigned-tasks.js --json --diff-from HEAD` → `currentViolations: 0`（今回差分）
4. `verify-all-specs.js --workflow <workflow-path> --json` → `PASS`（仕様書準拠）

---

### FR-10: テンプレート構造検証（summary/report/changelogの三点突合）

| 項目   | 内容                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 要件ID | FR-10                                                                               |
| 分類   | 機能要件                                                                            |
| 優先度 | 高                                                                                  |
| 出典   | Phase 1仕様書 §統合テスト連携、`phase12-system-spec-retrospective-template.md` §3.3 |

**定義:**
`spec-update-summary.md`（テンプレート準拠）/ `spec-sync-subagent-report.md`（SubAgent責務固定）/ `documentation-changelog.md`（Step 2判定）の3成果物の記載内容が整合していること。

**具体的な条件:**

- summaryのSubAgent分担（§3）とreportのSubAgent分担（§2）が同じSubAgent数・担当仕様書で一致している
- changelogのStep 2判定と summaryの仕様反映先（§4）が矛盾していない
- 3成果物のタスクIDが同一である

---

## 3. 非機能要件（NFR）

### NFR-01: テンプレート再利用性

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| 要件ID | NFR-01                                                                           |
| 分類   | 非機能要件（再利用性）                                                           |
| 優先度 | 高                                                                               |
| 出典   | 未タスク指示書 §2.2 最終ゴール①、`phase12-system-spec-retrospective-template.md` |

**定義:**
`phase12-system-spec-retrospective-template.md` と `phase12-spec-sync-subagent-template.md` が、本タスクと異なる別タスクのPhase 12でタスクIDとワークフローパスのみ変更して適用できる汎用構造を維持していること。

**測定基準:**

- テンプレートにタスク固有の情報（スキル名、IPCチャンネル名等）がハードコードされていない
- `<TASK-ID>` / `<workflow-path>` などのプレースホルダー形式が維持されている

---

### NFR-02: 運用手順の保守性（5ステップ）

| 項目   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 要件ID | NFR-02                                                                     |
| 分類   | 非機能要件（保守性）                                                       |
| 優先度 | 中                                                                         |
| 出典   | `getfiletree-ipc` Phase 12成果物 §6「同種課題の簡潔解決手順（5ステップ）」 |

**定義:**
同種課題（Phase 12仕様同期）が発生した際に、5ステップ手順を参照すれば初動から完了までの作業が網羅的に把握できること。

**測定基準:**

- 手順書に手順1〜5が明記されており、各ステップが1文で完結している
- 手順書に参照スクリプトのコマンドが含まれており、コマンドコピーで即実行可能

---

### NFR-03: 成果物名一貫性（ドリフト防止）

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| 要件ID | NFR-03                                                  |
| 分類   | 非機能要件（一貫性）                                    |
| 優先度 | 高                                                      |
| 出典   | 未タスク指示書 §3.5 課題②「Phase 12成果物名のドリフト」 |

**定義:**
Phase 12成果物（`spec-update-summary.md` / `spec-sync-subagent-report.md` / `documentation-changelog.md` / `unassigned-task-detection.md`）の命名が、`phase-12-documentation.md` の成果物記載・`artifacts.json` の成果物リスト・実体ファイル名の3箇所で完全一致していること。

**測定基準:**

- `ls outputs/phase-12/` の出力と `phase-12-documentation.md` の成果物パスが完全一致
- `artifacts.json` の成果物リストと実体ファイル名が完全一致

---

### NFR-04: 依存タスクとの関係明記

| 項目   | 内容                           |
| ------ | ------------------------------ |
| 要件ID | NFR-04                         |
| 分類   | 非機能要件（追跡可能性）       |
| 優先度 | 中                             |
| 出典   | 未タスク指示書 §3.2 依存タスク |

**定義:**
本タスクの成果物（summary/report/changelog）が、依存タスク3件の成果物との関係を明記し、同種課題発生時の参照先として活用できること。

**依存タスク（本タスクがブロックするもの）:**

1. `UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001` — SubAgent同期ガードの詳細ルール
2. `UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001` — Step 2対象仕様書の追跡ガード
3. `UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001` — 証跡値同期ガード

**測定基準:**

- 本タスクの成果物に上記3件のタスクIDが参照または言及されている
- 各依存タスクが「本タスク完了後に着手可能」という順序関係が明確

---

## 4. FR/NFR優先度マトリクス

| 要件ID | 分類 | 優先度 | 4つの最終ゴールへの対応                |
| ------ | ---- | ------ | -------------------------------------- |
| FR-01  | FR   | 高     | ゴール①（summary再利用可能化）         |
| FR-02  | FR   | 高     | ゴール②（report責務固定）              |
| FR-03  | FR   | 高     | ゴール③（三点突合説明可能性）          |
| FR-04  | FR   | 高     | ゴール④（currentViolations=0合否基準） |
| FR-05  | FR   | 中     | 親タスク教訓①（IPC層別契約）           |
| FR-06  | FR   | 中     | 親タスク教訓②（成果物名照合）          |
| FR-07  | FR   | 中     | 親タスク教訓③（メタ情報1件原則）       |
| FR-08  | FR   | 高     | 親タスク教訓④（SubAgent責務成果物化）  |
| FR-09  | FR   | 高     | ゴール④（監査スクリプト順次実行）      |
| FR-10  | FR   | 高     | ゴール③（三点突合テンプレート構造）    |
| NFR-01 | NFR  | 高     | ゴール①（テンプレート再利用性）        |
| NFR-02 | NFR  | 中     | ゴール③（手順保守性）                  |
| NFR-03 | NFR  | 高     | 親タスク教訓②（命名一貫性）            |
| NFR-04 | NFR  | 中     | 依存タスク追跡可能性                   |

---

## 5. 要件件数サマリー

| 分類              | 件数 |
| ----------------- | ---- |
| 機能要件（FR）    | 10件 |
| 非機能要件（NFR） | 4件  |
| 合計              | 14件 |

---

## 6. 依存タスク関係図

```
本タスク（UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001）
  └── ブロック → UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
                    （SubAgent同期ガードの詳細ルール実装）
  └── ブロック → UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001
                    （Step 2対象仕様書の追跡ガード実装）
  └── ブロック → UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001
                    （証跡値同期ガード実装）
```

本タスクは「Phase 12 SubAgent成果物固定の標準ルール確立」を目的としており、依存3件はその標準ルールを各観点で具体化・実装する後続タスクに位置づけられる。

---

## 7. 変更履歴

| バージョン | 日付       | 内容                    |
| ---------- | ---------- | ----------------------- |
| 1.0.0      | 2026-03-03 | Phase 1要件定義初版作成 |
