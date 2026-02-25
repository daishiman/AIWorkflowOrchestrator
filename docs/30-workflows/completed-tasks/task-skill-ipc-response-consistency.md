# skill:ハンドラIPCレスポンス形式統一 - タスク指示書

## メタ情報

```yaml
issue_number: 873
issue_url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/873
```

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001                                     |
| タスク名     | skill:ハンドラIPCレスポンス形式統一                                           |
| 分類         | リファクタリング                                                              |
| 対象機能     | `apps/desktop/src/main/ipc/skillHandlers.ts` と対応する Preload/Renderer 契約 |
| 優先度       | 中                                                                            |
| 見積もり規模 | 中規模                                                                        |
| ステータス   | 完了（Phase 1〜12）                                                           |
| 発見元       | Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査）                    |
| 発見日       | 2026-02-21                                                                    |
| spec_path    | `docs/30-workflows/completed-tasks/task-skill-ipc-response-consistency.md`    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skillHandlers.ts` の `skill:` チャネルは、戻り値契約がチャネルごとに混在している。

- ラッパー返却: `return { success, data }` / `return { success: false, error }`
- 直接返却: `return importedSkill` / `return boolean | null | RemoveResult`
- 例外返却: `throw { code, message }`

この混在自体より重大なのは、呼び出し層で契約解釈が揃っていない点である。

### 1.2 問題点・課題

現状で確認できる代表的な不整合:

| 論点                       | 現状                                                                                          | 影響                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `skill:execute` Main戻り値 | `{ success, data: SkillExecutionResponse }`                                                   | Preload/Renderer が `SkillExecutionResponse` 直返しと誤認すると `executionId` を取り出せない |
| `skillAPI.execute()` 型    | `Promise<SkillExecutionResponse>`                                                             | 実際の Main 応答形とずれる可能性                                                             |
| Renderer 利用側の解釈差    | `agentSlice` は `response.executionId` 直参照、`useSkillExecution` は `response.success` 判定 | 同一APIに対して利用規約が分岐し、回帰バグを誘発                                              |
| `skill:remove` 契約        | Main は `RemoveResult` を返却、Preload は `Promise<void>` と宣言                              | 仕様と実装の差分が静かに埋もれる                                                             |

### 1.3 放置した場合の影響

- IPC境界での型安全が見かけ上のみ成立し、実行時不整合を継続的に生む
- 仕様書更新時に「どれが正本か」を毎回再判断する運用になる
- 新規 `skill:` チャネル追加時に誤った実装テンプレートが複製される

因果ループ（悪循環）:

`契約混在` → `呼び出し側で独自解釈` → `テストが局所最適化` → `仕様書が追従しづらい` → `契約混在が固定化`

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:` IPC 契約を「暗黙の混在」から「明示ルールに基づく統一」に再定義し、Main/Preload/Renderer/テスト/仕様書を一貫させる。

### 2.2 最終ゴール

- `skill:` チャネルの戻り値が、定義済み契約プロファイルに100%分類される
- Preload API が Main 応答形式を完全吸収し、Renderer からは一意の戻り値形のみ見える
- Renderer 側で同一APIの利用パターンが単一化される
- 契約ドリフト検出テストで再発を機械検出できる

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/skillHandlers.ts` の全 `skill:` ハンドラ
- `apps/desktop/src/preload/skill-api.ts` の `safeInvoke` / `safeInvokeUnwrap` 適用方針
- `apps/desktop/src/preload/types.ts` および必要な shared 型定義の同期
- `apps/desktop/src/renderer` の `skill.execute/remove` 利用箇所の契約統一
- 関連テスト（Main IPC / Preload API / Renderer 利用側）

#### 含まないもの

- `skillHandlers.ts` 以外のIPCドメイン（`ai:*`, `auth:*` など）
- `safeInvoke` / `safeInvokeUnwrap` 実装自体の改造
- 新規機能追加（チャネル追加、UI機能追加）

### 2.4 成果物

| 成果物                   | パス                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 契約統一済みハンドラ     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                               |
| 契約統一済み Preload API | `apps/desktop/src/preload/skill-api.ts`                                                                                    |
| 同期済み型定義           | `apps/desktop/src/preload/types.ts`（必要に応じて `packages/shared/src/types/skill.ts`）                                   |
| 回帰防止テスト           | `apps/desktop/src/main/ipc/__tests__/` / `apps/desktop/src/preload/__tests__/` / `apps/desktop/src/renderer/**/__tests__/` |
| 仕様更新記録             | Phase 12 成果物（implementation-guide / documentation-changelog / system-docs-update-log）                                 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-FIX-SKILL-IMPORT-RETURN-TYPE-001` 完了
- `UT-FIX-SKILL-REMOVE-INTERFACE-001` 完了
- `UT-FIX-SKILL-VALIDATION-CONSISTENCY-001` 完了

### 3.2 依存タスク

| タスクID                                  | 状態   | 依存内容                                                       |
| ----------------------------------------- | ------ | -------------------------------------------------------------- |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001       | 完了   | `skill:import` を `ImportedSkill` 返却へ統一済み               |
| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001   | 未完了 | `skillId` / `skillName` 命名ドリフト是正（本タスクと相互影響） |
| UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001 | 未完了 | 引数形式の統一（本タスクのテスト設計に影響）                   |

### 3.3 必要な知識

- Electron IPC (`ipcMain.handle`, `ipcRenderer.invoke`)
- Preload 境界設計 (`safeInvoke`, `safeInvokeUnwrap`)
- P23/P32/P42/P44/P45 の再発防止パターン
- `aiworkflow-requirements` の正本更新フロー

### 3.4 契約統一の設計方針（2軸思考 + トレードオン思考）

比較軸:

- 軸1: 実装変更コスト（低 ←→ 高）
- 軸2: 契約の明瞭性（低 ←→ 高）

| 方針                                                     | 変更コスト | 明瞭性 | 評価                                          |
| -------------------------------------------------------- | ---------- | ------ | --------------------------------------------- |
| A: 全チャネルを直接返却 + throw に統一                   | 高         | 高     | 長期最適だが既存テスト・仕様影響が大きい      |
| B: 全チャネルをラッパー返却 + unwrap に統一              | 中         | 中     | `execute`/`remove` の既存期待値と衝突しやすい |
| C: 契約プロファイルを明示し、Preloadで単一利用体験に統一 | 中         | 高     | 既存資産を活かしつつ混乱を排除できる          |

推奨採用: **方針C**

- Main は「チャネル契約プロファイル表」に従って固定
- Preload は Renderer に対して常に「単一の戻り値解釈」を提供
- 仕様書で `AS-IS` と `TO-BE` を分離し、移行ステップを管理

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 発見経緯                              | 解決策                                                | 教訓                            |
| ---------------------------------------- | ------------------------------------- | ----------------------------------------------------- | ------------------------------- |
| ランタイム不整合は型注釈だけでは防げない | `UT-FIX-SKILL-IMPORT-RETURN-TYPE-001` | 契約テスト（戻り値形状テスト）を必須化                | IPC境界は実行時検証が必要       |
| `safeInvoke`/`safeInvokeUnwrap` の誤選択 | unwrap導入時の回帰                    | ハンドラ return 形式を先に固定し、Preloadを後追い修正 | 実装順序が品質を決める          |
| 3層同時更新漏れ                          | Main先行変更でドリフト                | Main/Preload/テストを同一変更単位で更新               | P23/P32をチェックリスト運用する |
| 仕様正本間の差分混在                     | `interfaces-*` と実装差分             | Phase 12 で差分根拠と更新範囲を明示                   | 「どこを正すか」を先に決める    |

### 3.6 システム仕様から抽出した必須制約（aiworkflow-requirements）

| ID   | 抽出元                                    | 必須制約                                                                                    |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| AR-1 | `interfaces-agent-sdk-skill.md`           | `skill:import` は `skillName: string` 受け取り、`ImportedSkill` を返す。                    |
| AR-2 | `architecture-implementation-patterns.md` | `return { success, data }` 系は `safeInvokeUnwrap`、直接返却系は `safeInvoke` を選択する。  |
| AR-3 | `security-skill-ipc.md`                   | `validateIpcSender` + 文字列 `.trim()` 非空検証を全 `skill:` ハンドラで実施する。           |
| AR-4 | `security-electron-ipc.md`                | IPC入力検証を Main 側で行い、不正入力を早期拒否する。                                       |
| AR-5 | `ipc-contract-checklist.md`               | 型同期（shared/preload）・仕様同期（interfaces/api/security）・テスト検証を必須で実施する。 |
| AR-6 | `task-workflow.md`                        | 本タスクIDと指示書パスの参照整合を維持する。                                                |
| AR-7 | `arch-electron-services.md`               | `skill:remove` の戻り値契約は `RemoveResult` であり、Preload 側型と乖離させない。           |

### 3.7 思考モード適用結果（要求された思考法の反映）

| 思考法             | 本タスクでの適用                                               |
| ------------------ | -------------------------------------------------------------- |
| 水平思考           | Main/Preload/Renderer/仕様書を同時に観測し、単一箇所最適を排除 |
| 垂直思考           | `skillHandlers.ts` 行単位で return/throw を棚卸し              |
| 逆説思考           | 「成功フラグがあるほど誤読される」ケースを前提に設計           |
| システム思考       | 契約ドリフトの因果ループを可視化し、チェックリストでループ断絶 |
| 類推思考           | UT-FIX-IPC-RESPONSE-UNWRAP 系の失敗パターンを再利用            |
| if思考             | 方針A/B/Cの分岐を先に比較し、影響を事前評価                    |
| 素人思考           | 「返り値は何型？」に一言で答えられる契約を目標化               |
| トレードオン思考   | 変更コストと明瞭性を同時に最大化する方針Cを選択                |
| プラスサム思考     | 契約統一を仕様更新とテスト強化に同時接続                       |
| 2軸思考            | コスト×明瞭性で方針選定                                        |
| 価値提案思考       | 開発者が「迷わない」ことを主価値に設定                         |
| why思考            | なぜ混在が危険かを利用者視点（Renderer）まで掘る               |
| 改善思考           | 一回修正ではなく再発防止（契約テスト）を成果物化               |
| 戦略的思考         | AS-IS修正と TO-BE運用ルールを分離                              |
| ダブル・ループ思考 | コード修正だけでなく「契約設計ルール」自体を更新               |
| 抽象化思考         | 個別チャンネル問題を「契約プロファイル管理問題」に抽象化       |
| プロセス思考       | Phaseごとに入力/出力/完了条件を定義                            |
| 仮説思考           | `execute`/`remove` が実害点という仮説を利用箇所で検証          |
| 論点思考           | 論点を「型」「戻り値」「利用側解釈」「仕様同期」に分解         |
| 因果関係ループ     | 混在→誤用→局所テスト→仕様遅延→混在 のループを断つ              |

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                                          |
| ----- | ---------------- | --------------------------------------------- |
| 1     | 要件定義         | 現状契約マトリクスの作成                      |
| 2     | 設計             | 契約プロファイル表と移行ルールの決定          |
| 3     | 設計レビュー     | 方針A/B/C評価と採用理由の確定                 |
| 4     | テスト作成       | 契約ドリフト検出テストを先行作成              |
| 5     | 実装             | Main/Preload/Renderer/型を同期更新            |
| 6     | テスト拡充       | 正常系・異常系・境界値を補完                  |
| 7     | カバレッジ確認   | 影響範囲の網羅率を確認                        |
| 8     | リファクタリング | 重複ロジック整理、命名改善                    |
| 9     | 品質保証         | lint/typecheck/test を通す                    |
| 10    | 最終レビュー     | 契約・依存・仕様差分の再監査                  |
| 11    | 手動検証         | 実行・中断・削除など主要フロー確認            |
| 12    | ドキュメント更新 | system仕様更新、未タスク判定、教訓反映        |
| 13    | 完了処理         | 完了条件の証跡化（コミット/PRは別指示時のみ） |

### Phase 1: 要件定義（契約棚卸し）

1. `skillHandlers.ts` 全14チャネルの return/throw パターンを表形式化
2. `skill-api.ts` 各メソッドの `safeInvoke` / `safeInvokeUnwrap` を対応付け
3. Renderer 利用側の期待形（`executionId` 参照箇所など）を抽出
4. 仕様正本（AR-1〜AR-7）との差分を `AS-IS差分表` にまとめる

### Phase 5: 実装（契約統一）

1. 採用方針（C）に従って Main 契約を明示化
2. Preload で Renderer 向け戻り値を単一解釈へ統一
3. Renderer 利用側を単一契約へ統一
4. 型定義（shared/preload）を同期
5. `ipc-contract-checklist.md` の Phase 4/5/6 を完了する

### Phase 12: ドキュメント更新（必須）

1. `interfaces-agent-sdk-skill.md` の戻り値テーブルを実装実態へ同期
2. `api-ipc-agent.md` / `security-skill-ipc.md` / `arch-electron-services.md` の関連表を同期
3. `task-workflow.md` の本タスク参照整合を維持
4. `documentation-changelog.md` に差分根拠（AS-IS→TO-BE）を記録

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:` 全チャネルが契約プロファイル表に100%分類される
- [ ] `skillAPI.execute/remove` の戻り値解釈が Renderer 全利用箇所で統一される
- [ ] Main/Preload/Renderer の契約差分が解消される

### 品質要件

- [ ] `pnpm typecheck` 成功
- [ ] `pnpm lint` 成功
- [ ] IPC関連テストが成功
- [ ] 契約ドリフト検出テストが追加され、失敗時に差分箇所が特定できる

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1/Part 2）作成
- [ ] `aiworkflow-requirements` 関連仕様を同期
- [ ] 未タスク（必要時）を `unassigned-task/` に正式登録

---

## 6. 検証方法

### テストケース

1. `skill:execute` が Renderer 期待型（`SkillExecutionResponse`）で一意に取得できる
2. `skill:remove` の戻り値契約が Preload 型定義と一致する
3. ラッパー型チャネルで `safeInvokeUnwrap` が誤用されていない
4. 直接返却型チャネルで `safeInvoke` が誤用されていない
5. バリデーション失敗時（空文字/空白文字/型不一致）に一貫したエラーが返る

### 検証手順

```bash
# 1. 型・Lint
pnpm typecheck
pnpm lint

# 2. IPC/Preload テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts

# 3. Renderer 利用箇所の契約確認
rg -n "electronAPI\.skill\.execute\(|electronAPI\.skill\.remove\(" apps/desktop/src/renderer

# 4. 契約プロファイル監査（差分の目視用）
rg -n "ipcMain\.handle\(|return \{ success|safeInvokeUnwrap|safeInvoke\(" apps/desktop/src/main/ipc/skillHandlers.ts apps/desktop/src/preload/skill-api.ts
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                   |
| -------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| `execute` 互換性崩れで実行導線が壊れる | 高     | 中       | Renderer 利用箇所を事前抽出し、統一方針で一括更新                      |
| 仕様書側だけ更新漏れ                   | 中     | 中       | `ipc-contract-checklist` Phase 5 を完了条件に組み込む                  |
| テストが既存混在前提で壊れる           | 中     | 高       | 契約プロファイル表をテスト期待値の唯一根拠にする                       |
| 関連未タスクと境界衝突                 | 中     | 中       | `GETDETAIL-NAMING-DRIFT` / `ARG-FORM-UNIFICATION` と変更境界を先に定義 |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

- `../../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `../../../.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `../../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `../../../.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
- `../../../.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- `../../../.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `../../../.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`
- `../../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### タスク仕様書作成スキル参照

- `../../../.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `../../../.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `../../../.claude/skills/task-specification-creator/agents/generate-unassigned-task.md`

### 関連タスク

- `UT-FIX-SKILL-IMPORT-RETURN-TYPE-001`（完了）
- `UT-FIX-SKILL-REMOVE-INTERFACE-001`（完了）
- `UT-FIX-SKILL-VALIDATION-CONSISTENCY-001`（完了）
- `UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001`（未完了）
- `UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001`（未完了）

---

## 9. 備考

### レビュー指摘の原文（Issue #873 抜粋）

```text
task_id: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
task_name: skill:ハンドラIPCレスポンス形式統一
spec_path: docs/30-workflows/completed-tasks/task-skill-ipc-response-consistency.md
```

### 補足事項

- 本仕様書は、UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 の完了記録として保持する。
- 本タスク実施時は、Phase 12 で `aiworkflow-requirements` 反映を必須とする。
- コミット・PRはユーザー明示指示がある場合のみ実施する。
