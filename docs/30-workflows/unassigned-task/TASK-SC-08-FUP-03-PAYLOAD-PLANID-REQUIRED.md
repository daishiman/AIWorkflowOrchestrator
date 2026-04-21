# TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED

`SkillCreatorProgress.planId` を optional から required に昇格させ、`skill-creator:progress` 系の全送信経路で `planId` を必須フィールドとして扱う migration task。FUP-02 で導入した後方互換ロジックを段階的に除去し、型安全と filter 実装のシンプル化を達成する。

## メタ情報

```yaml
status: unassigned
issue_number: TBD
```

| 項目           | 内容                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED                                            |
| タスク種別     | NON_VISUAL code task（型 migration / 後方互換除去）                                  |
| ステータス     | unassigned（観測期間待ち）                                                           |
| 分類           | 型定義 migration + 後方互換ポリシー除去                                              |
| 対象機能       | `SkillCreatorProgress` の tracking ID、`useStreamingProgress` filter、emit 経路      |
| 優先度         | 中（観測期間経過後に昇格）                                                           |
| 見積もり規模   | 中規模                                                                               |
| 起票タイミング | FUP-02 の実コード導入後、1〜2 リリースの観測期間を経てから formalize                 |
| 発見元         | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID Phase 12 未タスク検出（候補 1）                |
| 発見日         | 2026-04-20                                                                           |
| depends_on     | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID（完了必須）                                    |
| 関連タスク     | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID / TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL |

---

## 1. ユーザー要求の要約

FUP-02 で `SkillCreatorProgress.planId` / `requestId` を optional として導入したが、これは後方互換のための過渡的な設計である。観測期間を経て全送信経路で `planId` が定着した後、optional を required に昇格させ、Hook 側の後方互換 filter（`progress.planId` 未設定の受け入れロジック）を除去することで、混線防止契約を型レベルで強制し、実装を単純化したい。

## 2. 現状整理

### 2.1 FUP-02 の完了状況（前提）

TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID（`docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/`）では以下を実装済みである。

- `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を optional field として追加
- `useStreamingProgress(options?: { planId?: string })` に `options.planId` ベースの filter を実装
- Main IPC（`skillCreatorHandlers.ts` の `sendSkillCreatorProgress` 等）で `planId` を付与する送信経路を整備
- `api-ipc-system-skill-creator.md` の `skill-creator:progress` payload 契約に optional として記載

### 2.2 現在の optional 後方互換ポリシー

FUP-02 の実装で採用している後方互換ポリシーは以下の通り（`docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md` より）。

| 状態                                         | 挙動                | 理由                                    |
| -------------------------------------------- | ------------------- | --------------------------------------- |
| `progress.planId` 未設定                     | Hook 側で受け入れる | 既存コード（planId 付与前）を破壊しない |
| `options.planId` 未指定                      | 全通知を受け入れる  | 既存 UI（filter 導入前）を破壊しない    |
| `progress.planId` と `options.planId` 一致   | 受け入れる（match） | 本 task 本来の動作                      |
| `progress.planId` と `options.planId` 不一致 | スキップ（miss）    | 本 task 本来の動作（混線防止）          |

### 2.3 本タスク着手時の確認ポイント

- 全 emit 経路（Runtime Facade / Main IPC / 他 Service）で `planId` を貫通させる実装が定着しているか（NV-02 / NV-03 相当の観測で確認済みであること）
- Phase 11 で NV-05（unit test 環境要因）のような blocker が解消されていること
- `skill-creator:progress` 以外の受信 Hook / 受信コードが新たに追加されていないか（FUP-04 の水平展開タスクと連動確認）

## 3. 真の論点（Why required 化が必要か）

### 3.1 型安全の強化

optional のままでは、受信側（Hook / test harness / 外部統合コード）が常に `progress.planId` の undefined チェックを強いられる。required 化することで型レベルで「tracking ID を持つ」契約を保証でき、誤って tracking ID なしで emit するコードパスをコンパイル時に検出可能となる。

### 3.2 filter ロジックの単純化

FUP-02 の Hook filter 擬似コード（後方互換対応）は以下の二重条件を持つ。

```ts
if (options?.planId !== undefined && progress.planId !== undefined) {
  if (options.planId !== progress.planId) {
    return; // miss
  }
}
```

required 化後は「`progress.planId` は必ず存在」という前提で、以下の単純な分岐に置き換えられる。

```ts
if (options?.planId !== undefined && options.planId !== progress.planId) {
  return; // miss
}
```

これにより保守コスト・バグ混入リスクが低減される。

### 3.3 混線防止契約の強制

optional のままでは、新規 emit 経路を追加する開発者が `planId` 付与を忘れても型検査を通ってしまう。FUP-02 で目的とした「混線防止」が契約として形骸化する恐れがある。required 化により、全 emit 経路で `planId` 付与が強制される。

### 3.4 下流タスク（FUP-04）の前提整備

FUP-04（progress filter の水平展開）では、`skill-creator:progress` 同等パターンを他 IPC channel に展開する。その際、参照実装となる本チャンネルの型契約がシンプル（required）である方が、展開先での設計判断が明瞭になる。

## 4. 価値とコスト

### 4.1 価値

- **型安全の強化**: 全 emit 経路で `planId` 付与が型レベルで強制される
- **実装単純化**: Hook filter / テストロジックが単純になる
- **契約の明示化**: `api-ipc-system-skill-creator.md` 契約書上も「必須」として明文化できる
- **他チャンネル水平展開の先例確立**: FUP-04 以降の展開で設計判断が容易になる

### 4.2 コスト

- **破壊的変更**: 型定義変更により、未付与の呼び出し元が TypeScript compile error を起こす
- **移行期間のリスク**: 観測期間中に新たな emit 経路が追加された場合、付与漏れ検出の網羅性に依存
- **テスト更新**: 後方互換シナリオ（`progress.planId === undefined` の legacy）を除去するテスト修正
- **リリースノート整備**: 外部統合（将来の extension / plugin）があれば告知が必要

## 5. 最終ゴール

- `SkillCreatorProgress.planId` が `string`（required）として定義されている
- `useStreamingProgress` の filter ロジックから `progress.planId === undefined` を受け入れる後方互換分岐が除去されている
- 全送信経路（Main IPC / Runtime Facade / その他 Service）で `planId` が必ず付与されている
- 移行リリースノートが整備され、破壊的変更として告知されている
- `api-ipc-system-skill-creator.md` の payload スキーマが「必須」に更新されている
- typecheck / lint / vitest が全て PASS する

## 6. スコープ

### 6.1 含むもの

- 型定義 `planId: string`（required）への変更（`apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorProgress`）
- 未付与箇所の実装修正（Main IPC / Runtime Facade / テストフィクスチャ等）
- Hook 側の後方互換 filter ロジック除去（`apps/desktop/src/renderer/hooks/useStreamingProgress.ts`）
- Hook / Main IPC の単体・統合テスト更新（legacy シナリオ削除、required 契約 assertion 追加）
- IPC 契約書 `api-ipc-system-skill-creator.md` の payload スキーマを「必須」に更新
- 移行リリースノートの作成（破壊的変更告知）

### 6.2 含まないもの

- `requestId` の required 昇格（本タスクでは `planId` のみを対象とする。`requestId` は監査用で運用パターンが確定してから別タスク化）
- progress チャンネルの多重化設計（別チャンネル案）
- `skill-creator:progress` 以外の IPC channel への水平展開（→ FUP-04 で対応）
- 実 Electron E2E テスト追加（FUP-01 の範囲）
- Runtime Facade / Workflow Engine 自体の責務分割

## 7. 前提条件

本タスクは以下の前提が揃ってから formalize すること。

1. **FUP-02 完了**: TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID の Phase 1-13 が全て完了し、main に merge されていること
2. **観測期間の経過**: FUP-02 の実コード導入後、1〜2 リリース程度の本番観測期間を経ていること
3. **全送信経路で planId 貫通の定着**: Main IPC / Runtime Facade / 他 Service の全 emit 経路で `planId` 付与が定着していることを、NV-02（static analysis）/ NV-03（emit 経路横断調査）相当の手段で確認済みであること
4. **Phase 11 相当の実測証跡**: NV-01〜NV-05 相当の手動テスト結果が揃い、特に NV-05（unit test 環境要因）が再現しない環境が整備されていること
5. **FUP-04 との順序整理**: FUP-04（水平展開）が先行する場合はその結果を踏まえ、後行する場合は本タスク完了後に参照点として利用する方針を決定していること

## 8. 変更対象ファイル想定

| ファイル                                                                                            | 役割                          | 変更内容                                                              |
| --------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                                     | `SkillCreatorProgress` 型定義 | `planId?: string` → `planId: string` に変更                           |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                                           | filter 実装                   | 後方互換分岐（`progress.planId === undefined` 受け入れ）を除去        |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`                            | Hook 単体テスト               | legacy（planId 未設定）シナリオを除去、required 契約 assertion を追加 |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                                 | Main emit helper              | `sendSkillCreatorProgress` が `planId` を必ず受け取るシグネチャに変更 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`                       | Main IPC validation テスト    | legacy シナリオ除去、required 契約 assertion 追加                     |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`                           | Main IPC 統合テスト           | 未付与呼び出しのテスト除去                                            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | Runtime emit 経路             | `onProgress` 呼び出し時の `planId` 付与を必須化（漏れ修正）           |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`                 | IPC 契約書                    | `planId` を「必須」に更新、後方互換説明を削除                         |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md` | 知見                          | required 化後の filter 契約に更新                                     |
| 移行リリースノート（配置先は Phase 1 で決定）                                                       | 破壊的変更告知                | 新規作成                                                              |

## 9. Acceptance Criteria

| AC 番号 | 条件                                                                                                                                                  | 検証方法                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| AC-1    | `SkillCreatorProgress.planId` が `string`（required）として定義されている                                                                             | 型定義レビュー + typecheck  |
| AC-2    | `useStreamingProgress.ts` から `progress.planId === undefined` を受け入れる後方互換分岐が除去されている                                               | diff レビュー + Hook テスト |
| AC-3    | Main IPC `sendSkillCreatorProgress` 等の emit helper が `planId` 必須のシグネチャになっている                                                         | 型定義レビュー + typecheck  |
| AC-4    | Runtime Facade（`RuntimeSkillCreatorFacade`）の `onProgress` 呼び出し経路で `planId` が必ず付与される                                                 | grep 静的解析 + 統合テスト  |
| AC-5    | `useStreamingProgress.test.ts` / `skillCreatorHandlers.validation.test.ts` / `skillCreatorIpc.integration.test.ts` の legacy シナリオが除去されている | diff レビュー + vitest      |
| AC-6    | `api-ipc-system-skill-creator.md` の `skill-creator:progress` payload スキーマで `planId` が「必須」と明記されている                                  | 契約書レビュー              |
| AC-7    | 移行リリースノートが作成され、破壊的変更として告知されている                                                                                          | ドキュメントレビュー        |
| AC-8    | `pnpm --filter @repo/desktop typecheck` が PASS する                                                                                                  | typecheck コマンド          |
| AC-9    | `pnpm --filter @repo/desktop lint` が PASS する                                                                                                       | lint コマンド               |
| AC-10   | 追加・更新した全テストが CI で PASS する                                                                                                              | CI ログ確認                 |

## 10. 苦戦箇所・学習事項（FUP-02 実装からの引き継ぎ）

本タスクを次に着手する開発者が、FUP-02 で直面した課題を繰り返さずに済むよう、以下の学習事項を引き継ぐ。

### 10.1 Phase 11 NV-05 環境要因の blocker リスク

**FUP-02 での苦戦**: Phase 11 で NV-05（unit test 環境要因）として、特定の Hook 単体テストが環境に依存して不安定になり、blocker として記録された（`outputs/phase-11/discovered-issues.md` 参照）。

**次タスクへの引き継ぎ**: 本タスクに着手する前に必ず NV-05 相当の blocker が再現しないことを確認すること。着手前に `pnpm --filter @repo/desktop test -- --run useStreamingProgress` を focused run で実行し、安定して PASS することを確認する。不安定な場合は、まず環境整備タスクを先行させる判断をすること。

### 10.2 後方互換ロジックの複雑化リスク

**FUP-02 での苦戦**: optional field の後方互換ポリシーとして「`progress.planId` 未設定」と「`options.planId` 未指定」の両方を受け入れる仕様を持たせたため、条件分岐が二重化し、テストケースが組み合わせ爆発しやすかった。

**次タスクへの引き継ぎ**: required 化すれば `progress.planId` 未設定の分岐は丸ごと除去できる。その際、テストケース（legacy シナリオ）の除去と新契約の assertion 追加を丁寧に対応させること。除去するテストケースと追加するテストケースの対応表を Phase 2（設計）で作成すると漏れを防げる。

### 10.3 emit 経路二系統の貫通漏れリスク

**FUP-02 での苦戦**: progress の emit 経路が Runtime Facade（`RuntimeSkillCreatorFacade`）と Main IPC（`skillCreatorHandlers.ts` の `sendSkillCreatorProgress`）の二系統に存在し、いずれにも `planId` を貫通させる必要があった。片方のみ対応して漏れが発生するリスクがあった。

**次タスクへの引き継ぎ**: required 化の際は以下の grep を Phase 0-1 で必ず実行し、両経路を網羅すること。

```bash
# Runtime Facade の emit 経路
grep -REn 'onProgress|emitProgress|webContents\.send' \
  apps/desktop/src/main/services/runtime/ \
  apps/desktop/src/main/ipc/

# Main IPC の emit helper
grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/

# 型定義参照箇所の網羅確認
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

未付与の呼び出し元は typecheck で検出されるが、テストフィクスチャや mock 実装は型推論の関係で検出漏れが起きやすい。phase 毎に二系統双方を確認する運用とすること。

### 10.4 空文字 `""` と `undefined` の厳密等価エッジケース

**FUP-02 での苦戦**: `progress.planId === ""`（空文字）と `progress.planId === undefined` は、厳密等価（`===`）比較で異なる結果となる。FUP-02 の Phase 6 で以下のエッジケースを追加検証した。

| ケース                             | FUP-02 での期待挙動                                                     |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `progress.planId === ""`（空文字） | `options.planId` 未指定なら受け入れ、指定ありなら不一致扱い（厳密等価） |
| `options.planId === ""`（空文字）  | filter 有効、空文字一致以外はスキップ                                   |
| `progress.planId === undefined`    | 後方互換で受け入れ                                                      |

**次タスクへの引き継ぎ**: required 化後は `progress.planId === undefined` の分岐は除去できる。ただし、空文字 `""` の取り扱いは依然として仕様判断が必要である。以下を Phase 1（要件）で明確化すること。

- 空文字 `""` を有効な planId として許容するか、invalid として emit 側で弾くか
- invalid とする場合、Main IPC 側で zod 等の validator で弾く位置を決める
- Hook 側の filter ロジックは「`options.planId` 指定時は厳密等価でのみ match」のルールを維持する

厳密等価判定は単純だが、「空文字 = undefined」のような誤った同一視をしないよう、テストで明示的に固定すること。

### 10.5 観測期間と required 化のタイミング判断

**FUP-02 での判断**: optional 導入直後に required 化すると、未整備の経路で型エラーが多発するため、1〜2 リリースの観測期間を挟む方針とした。

**次タスクへの引き継ぎ**: 観測期間中に新しい emit 経路が追加されていないか、Phase 1（要件確認）の前に以下を確認すること。

- `git log` で FUP-02 完了以降に `SkillCreatorProgress` / `sendSkillCreatorProgress` を変更した PR を洗い出す
- 新規 emit 経路が追加されていれば、それらにも `planId` が付与されているか確認する
- 付与漏れがあれば、本タスクの変更対象ファイルに追加する

## 11. 参照

- 正本: [docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/index.md](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/index.md)
- Phase 12 未タスク検出: [docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/unassigned-task-detection.md](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/unassigned-task-detection.md)（候補 1）
- Phase 12 実装ガイド: [docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md)
- Phase 11 discovered-issues: [docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-11/discovered-issues.md](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-11/discovered-issues.md)
- IPC 契約書: [.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md](../../../.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md)
- progress callback 知見: [.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md](../../../.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md)
- 関連兄弟タスク: [TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md](TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md) / [TASK-SC-08-FUP-01-INTEGRATION-TEST.md](TASK-SC-08-FUP-01-INTEGRATION-TEST.md)
- 状態管理 architecture: [.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md](../../../.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md)
