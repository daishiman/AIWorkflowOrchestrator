# [#1644] "[UT-IMP-MANIFEST-LOADER-CONTRACT-HARDENING-001] ManifestLoader の参照整合・cache 挙動・テスト境界を hardening する"

## メタ情報

```yaml
task_id: UT-IMP-MANIFEST-LOADER-CONTRACT-HARDENING-001
task_name: ManifestLoader の参照整合・cache 挙動・テスト境界を hardening する
category: 改善
target_feature: workflow manifest foundation の loader / shared contract
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-SDK-01 実装レビュー
created_date: 2026-03-26
dependencies: TASK-SDK-01
spec_path: docs/30-workflows/unassigned-task/task-imp-manifest-loader-contract-hardening-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/main/services/runtime/ManifestLoader.ts` は foundation service として `workflow-manifest.json` の `read / validate / normalize / cache` を担うが、今回の実装レビューで validation と cache の境界に抜けが見つかった。特に `resources[].phaseIds` の参照整合と cache の実効性が weak で、Task02/03/04 へ壊れた handoff を流しうる。

### 1.2 問題点・課題

- `resources[].phaseIds` が実在する `phases[].id` か未検証
- cache 判定が `stat` / `readFile` / `JSON.parse` / `validate` / `fs.access` の後にあり、I/O 削減として弱い
- `invalidate()`、`phaseIds` 不正、resource 消失後の再読込など高リスク境界にテストがない

### 1.3 放置した場合の影響

- 存在しない phase を参照する manifest が正常ロードされる
- hot path で毎回 I/O が走り、foundation loader の責務定義と実装が乖離する
- Task02 以降が manifest contract を信用できず、debug コストが上がる

---

## 2. 何を達成するか（What）

### 2.1 目的

ManifestLoader が foundation contract として破綻しないよう、参照整合、cache、回帰テストの 3 点を強化する。

### 2.2 最終ゴール

1. `resources[].phaseIds` が `phases[].id` と 1:1 で検証される
2. cache が「同じ参照を返すだけ」でなく、I/O / validation 境界として説明可能になる
3. 高リスク境界の unit test が追加され、回帰条件が固定される

### 2.3 スコープ

#### 含むもの

- `ManifestLoader.ts` の validation hardening
- cache 判定位置または cache strategy の見直し
- `ManifestLoader.test.ts` の追加ケース
- 必要に応じた workflow 文書 / system spec の同期

#### 含まないもの

- Task02 以降の engine 実装
- `RuntimeSkillCreatorFacade` の authority 変更
- public IPC / preload contract の変更

### 2.4 成果物

- 更新済み `apps/desktop/src/main/services/runtime/ManifestLoader.ts`
- 更新済み `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`
- 必要なら追加 fixture
- 必要に応じた system spec / workflow 文書更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `WorkflowManifest*` shared 型の正本が `packages/shared/src/types/skillCreator.ts` にある
- `arch-electron-services-details-part2.md` と `architecture-overview-core.md` で loader 境界を確認できる
- `esbuild` blocker がある場合は typecheck と targeted review で検証し、テスト再実行は環境整備後に行う

### 3.2 依存タスク

- TASK-SDK-01 foundation 実装
- worktree native binary guard 系の既存未タスク

### 3.3 必要な知識

- manifest topology validation
- cache invalidation の責務分離
- Vitest / fixture ベースの unit test 設計

### 3.4 推奨アプローチ

1. `assertPhaseReferences()` で `resource.phaseIds` も phase 集合へ照合する
2. cache hit 判定を read 後すぐへ寄せるか、少なくとも expensive normalize/access 前に置く
3. `phaseIds` 不正、resource 消失、`invalidate()` をテストで固定する
4. contract 変更が internal boundary に留まるかを system spec と再照合する

### 3.5 実装時の苦戦箇所と解決策

| 課題                                                  | 発見経緯                                          | 解決策                                                                           | 教訓                                                      |
| ----------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `phaseIds` は型上存在しても参照整合が抜けやすい       | `validateResources()` が型だけ見ていた            | `assertPhaseReferences()` に resource 側照合を追加し、invalid fixture を固定する | 「文字列配列」検証だけでは topology は閉じない            |
| cache key が正しくても cache hit が遅すぎると効かない | 現実装は normalize / access 後にだけ cache を見る | expensive step の前で cache を判定する設計に寄せる                               | cache は同一参照保証だけでなく I/O 削減境界として設計する |
| test blocker があると validation 抜けを見逃しやすい   | `esbuild` mismatch で Vitest 起動不能だった       | 再実行 blocker は既存 tracker に寄せつつ、追加すべき test case を先に文書化する  | 環境 blocker があっても未タスク formalize は止めない      |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約差分の再確認
- Phase B: validation / cache 実装修正
- Phase C: テスト追加
- Phase D: system spec / workflow 同期

### Phase A: 契約差分の再確認

#### 目的

実装と workflow 文書の境界差分を確定する。

#### 手順

1. `ManifestLoader.ts` と workflow outputs の `manifest-schema-design.md` / `cache-invalidation-design.md` / `loader-boundary-design.md` を比較する
2. `phaseIds` と cache hit 条件のズレを特定する
3. public IPC へ波及しないことを確認する

#### 成果物

- 差分メモ

#### 完了条件

- 変更対象が internal loader contract に閉じている

### Phase B: validation / cache 実装修正

#### 目的

loader の参照整合と cache 責務を是正する。

#### 手順

1. `resource.phaseIds` の phase 実在確認を追加する
2. cache hit 判定位置を見直す
3. `invalidate()` の期待動作を固定する

#### 成果物

- 更新済み loader 実装

#### 完了条件

- invalid manifest が期待通り reject される設計になっている

### Phase C: テスト追加

#### 目的

高リスク境界の回帰を防ぐ。

#### 手順

1. `phaseIds` 不正 fixture ケースを追加する
2. cache hit / resource 消失 / `invalidate()` ケースを追加する
3. 実行不能時は blocker と未実行理由を証跡化する

#### 成果物

- 追加 test case
- 実行結果または blocker 記録

#### 完了条件

- 追加した 3 系統のケースが spec / code / test で対応している

### Phase D: system spec / workflow 同期

#### 目的

foundation contract の current facts を正本へ戻す。

#### 手順

1. 必要なら `arch-electron-services-details-part2.md` を補足更新する
2. 必要なら `architecture-overview-core.md` / `interfaces-agent-sdk-skill-reference.md` を同期する
3. TASK-SDK-01 workflow outputs に hardening 完了内容を反映する

#### 成果物

- 更新済み spec / workflow 文書

#### 完了条件

- 実装と system spec の説明が一致している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `resources[].phaseIds` が phase 実在確認付きで検証されている
- [ ] cache strategy が current 実装より前段で判定されるか、責務が明示的に再定義されている
- [ ] `invalidate()` の挙動が固定されている

### 品質要件

- [ ] `ManifestLoader.test.ts` に `phaseIds` 不正ケースがある
- [ ] `ManifestLoader.test.ts` に cache / resource 消失 / `invalidate()` ケースがある
- [ ] typecheck が通る

### ドキュメント要件

- [ ] workflow 文書と system spec の loader 境界説明が current facts へ同期されている
- [ ] blocker がある場合は既存 tracker と接続されている

---

## 6. 検証方法

### テストケース

- TC-1: `resources[].phaseIds` に未定義 phase を入れると reject される
- TC-2: 同一 manifest の連続読込で不要な normalize / access を避けられる
- TC-3: `invalidate()` 後は再読込が走る
- TC-4: 初回成功後に resource が消えた場合の挙動が期待通りである

### 検証手順

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/ManifestLoader.test.ts
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                         |
| ---------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| cache 判定変更で stale manifest を返す               | 高     | 低       | mtime / schemaVersion / hash を維持し、回帰 test を追加する                  |
| internal contract 変更が Task02 handoff と食い違う   | 中     | 中       | workflow outputs と `arch-electron-services-details-part2.md` を同時更新する |
| `esbuild` mismatch で targeted test を再実行できない | 中     | 中       | 既存 native binary tracker を使い、typecheck + code review を先に完了させる  |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/runtime/ManifestLoader.ts`
- `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts`
- `docs/30-workflows/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-2/manifest-schema-design.md`
- `docs/30-workflows/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-2/cache-invalidation-design.md`
- `docs/30-workflows/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-2/loader-boundary-design.md`

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-conversation-db-robustness.md`

### 既存 blocker tracker

- `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`
- `docs/30-workflows/issues/issue-1023.md`

---

## 9. 備考

### レビュー指摘の原文

```text
resources[].phaseIds の参照整合が未検証です。
キャッシュ判定が遅すぎて、実質的にキャッシュが I/O 削減として機能していません。
テストが高リスク境界を押さえ切れていません。
```

### 補足事項

- `esbuild` mismatch 自体は既存未タスクで追跡し、本 task では loader contract の改善を主対象にする
- public IPC / preload contract は本 task の primary scope に含めない
