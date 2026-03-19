# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-9F: スキル共有・インポート機能 再監査（2026-02-27）

### タスク概要

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-9F                                                                               |
| 目的       | 実装/仕様/未タスク管理のドリフトを除去し、Phase 12 実行証跡を再利用可能な形で固定する |
| 完了日     | 2026-02-27                                                                            |
| ステータス | **完了**                                                                              |

### 仕様書別SubAgent分担（再監査時）

| SubAgent | 担当仕様書                      | 主担当作業                                       |
| -------- | ------------------------------- | ------------------------------------------------ |
| A        | `interfaces-agent-sdk-skill.md` | 共有型10種 + Preload API 3メソッド契約の同期     |
| B        | `api-ipc-agent.md`              | 3チャネルの request/response/validation 契約同期 |
| C        | `security-electron-ipc.md`      | sender検証 + P42 + 許可値チェックの4層防御同期   |
| D        | `task-workflow.md`              | 完了台帳・UT-9F残課題・検証証跡の固定化          |
| E        | `lessons-learned.md`            | 苦戦箇所と簡潔解決手順の再利用化                 |

### 苦戦箇所と解決策

#### 1. IPC ハンドラ実装と起動配線の乖離

| 項目   | 内容                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| 課題   | `skillHandlers.share.ts` が存在しても `registerAllIpcHandlers` に登録されておらず、実行時に機能しない状態が残った |
| 原因   | 実装タスクと起動配線タスクを分離し、統合チェックを後回しにした                                                    |
| 解決策 | `index.ts` に `registerSkillShareHandlers` と DI 配線、`createGitHubClient` 型注釈を追加して起動経路を固定        |
| 教訓   | IPC機能は「ハンドラ実装」だけで完了判定しない。`channels + preload + register + tests` を1セットで閉じる          |

#### 2. 型パスの正本ドリフト（`skill/<domain>.ts` vs `skill-<domain>.ts`）

| 項目   | 内容                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 課題   | 仕様書・監査スクリプト・未完了タスクで旧パス記述が混在し、監査が誤検知した                                                  |
| 原因   | `packages/shared/src/types` のフラット化後に、監査ロジック更新が追従していなかった                                          |
| 解決策 | `task-workflow.md` / `ipc-preload-spec-sync-guardian` / task-023a〜f を一括で `types/index.ts` + `skill-<domain>.ts` に統一 |
| 教訓   | 構成変更時は「実装→仕様→監査スクリプト」の順で同期しないと、監査結果自体が信頼できなくなる                                  |

#### 3. 未タスク配置先の混同とフォーマット不足

| 項目   | 内容                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 課題   | UT-9F 系6件が `docs/30-workflows/completed-tasks/skill-share/unassigned-task/` に配置され、正本ディレクトリと不一致だった             |
| 原因   | 親ワークフロー配下配置と共通 `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` の運用ルールを混同した                                              |
| 解決策 | 6件を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に9セクション形式で再作成し、`unassigned-task-report.md` / `task-workflow.md` の参照を同期 |
| 教訓   | 未タスク作成は「配置先確認 + 形式監査 + 台帳登録」を同一ターンで完了させる                                                            |

### 同種課題向け簡潔解決手順（5ステップ）

1. 追加機能の完了判定は「実装 + 起動配線 + 契約 + テスト」で固定する。
2. 仕様同期は `task-workflow.md` を起点に、関連仕様書と監査スクリプトを同時更新する。
3. 未タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に9セクション形式で作成する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。
5. 検証値を `documentation-changelog` と `lessons-learned` に転記して終了する。

### 検証結果（2026-02-27 15:39 JST）

| 検証項目                                                                           | 結果                                           |
| ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/skill-share --json` | PASS（13/13、errors=0、warnings=0）            |
| `validate-phase-output docs/30-workflows/completed-tasks/skill-share`              | PASS（28項目、error=0、warning=0）             |
| `verify-unassigned-links`                                                          | PASS（95/95 existing、missing=0）              |
| `audit-unassigned-tasks --json --diff-from HEAD`                                   | `currentViolations=0`, `baselineViolations=71` |

### 成果物

| 成果物                | パス                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| 実行ワークフロー      | `docs/30-workflows/completed-tasks/skill-share/`                                            |
| 仕様更新サマリー      | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント変更ログ  | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート  | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/unassigned-task-report.md`  |
| 未タスク指示書（6件） | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-*.md`                |
| 完了台帳              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        |

---

## TASK-9H: スキルデバッグモード実装（2026-02-27）

### タスク概要

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-9H                                                                                                          |
| 目的       | スキルデバッグ機能（7ch IPC + DebugSession/SkillDebugger）の実装内容と苦戦箇所を、再利用可能な手順として固定する |
| 完了日     | 2026-02-27                                                                                                       |
| ステータス | **完了**                                                                                                         |

### 苦戦箇所と解決策

#### 苦戦箇所1: `registerAllIpcHandlers` への登録漏れ

| 項目   | 内容                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| 課題   | `skillDebugHandlers.ts` を実装しても、起動配線が漏れて機能が有効化されなかった                |
| 原因   | ハンドラ実装と `apps/desktop/src/main/ipc/index.ts` の登録作業を別タイミングで進めた          |
| 解決策 | `registerSkillDebugHandlers(mainWindow)` を `registerAllIpcHandlers` に追加し、起動経路を固定 |
| 教訓   | IPC機能は「channels + preload + handlers + register」を1セットで更新する                      |

#### 苦戦箇所2: Phase 12 必須成果物の不足

| 項目   | 内容                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 課題   | `implementation-guide.md` 以外の必須成果物が欠落し、監査証跡が不完全になった                                                     |
| 原因   | Task 1 の作成後に Task 2-5 成果物を一括確認する手順が不足していた                                                                |
| 解決策 | `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` を追加作成 |
| 教訓   | Phase 12は Task 1〜5 を成果物名で突合してから完了判定する                                                                        |

#### 苦戦箇所3: `phase-12-documentation.md` のステータス未同期

| 項目   | 内容                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| 課題   | 成果物と検証は完了しているのに、実行仕様書のステータスが `未実施` のまま残った |
| 原因   | 成果物更新と手順書チェック更新が分離し、二重台帳が不一致になった               |
| 解決策 | ステータスを `完了` に更新し、完了条件チェックを成果物実体に合わせて同期       |
| 教訓   | Phase 12完了判定は「成果物実体 + 仕様書チェック + 検証証跡」の三点一致で行う   |

### 同種課題向け簡潔解決手順（4ステップ）

1. 追加IPCは `channels.ts` / `skill-api.ts` / `skillDebugHandlers.ts` / `ipc/index.ts` を同ターンで更新する。
2. Phase 12 成果物5件（`implementation-guide`, `spec-update-summary`, `documentation-changelog`, `unassigned-task-detection`, `skill-feedback-report`）をファイル名で突合する。
3. `verify-all-specs` → `validate-phase-output` → `verify-unassigned-links` → `audit --diff-from HEAD` を固定順で実行する。
4. `task-workflow.md` と `lessons-learned.md` と `phase-12-documentation.md` を同時同期し、台帳不一致を残さない。

### 成果物

| 成果物               | パス                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| 実装ガイド           | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/spec-update-summary.md`       |
| 更新履歴             | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出         | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/skill-feedback-report.md`     |

---

## TASK-10A-E-C: Store駆動ライフサイクル統合設計（2026-03-06）

### 苦戦箇所: Phase 12成果物の「計画」記述が残りやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `spec-update-summary.md` を更新しても `documentation-changelog.md` が「仕様策定のみ」のまま残存しやすい |
| 再発条件 | 複数成果物の同期を分離実行し、最終突合を省略する |
| 対処 | Phase 12の最終段で `documentation-changelog` を正本として再生成し、Task 1〜5 を明示記録 |
| 標準ルール | 「計画」文言（予定/実行待ち/仕様策定のみ）を完了前に `rg` で全件排除する |

### 苦戦箇所: 未タスク指示書のフォーマット逸脱

| 項目 | 内容 |
| --- | --- |
| 課題 | 最小構成で作成すると `unassigned-task` 監査で必須見出し不足が発生 |
| 再発条件 | `## 1..9` セクションを省略して作成する |
| 対処 | `assets/unassigned-task-template.md` を必ず適用し、Why/What/How/検証/リスクを明示 |
| 標準ルール | 未タスク作成後に `audit-unassigned-tasks --target-file` で個別検証する |

### 苦戦箇所: P31派生パターン（useShallow未適用による無限ループ）

| 項目 | 内容 |
| --- | --- |
| 課題 | `.filter()` を使う派生selectorがZustandの `Object.is` 比較で毎回新参照と判定され、`renderHook` テストで無限ループ発生 |
| 再発条件 | 配列を返す派生セレクタに `useShallow` を適用しない |
| 対処 | `zustand/react/shallow` の `useShallow` でセレクタをラップし、shallow比較で内容同一時の再レンダリングを抑制 |
| 標準ルール | `.filter()` / `.map()` / スプレッド構文で新しい参照を返すセレクタには `useShallow` を必ず適用する |

### 苦戦箇所: worktree環境でのrollup native module不足

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree環境で `Cannot find module @rollup/rollup-darwin-x64` が発生し vitest 実行不可 |
| 再発条件 | worktreeの `node_modules` がシンボリックリンクではなく実体コピーされた場合、native moduleが欠落する |
| 対処 | worktreeディレクトリで `pnpm install --frozen-lockfile` を実行し、native moduleを再生成 |
| 標準ルール | worktreeでのテスト実行前に必ず `pnpm install --frozen-lockfile` を実行する |

### 苦戦箇所: 既存実装が設計の大半を満たしていた場合の差分分析

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 2で設計した要件の大半が既存の `agentSlice` に実装済みだったため、新規実装範囲が派生セレクタ2件のみに縮小 |
| 再発条件 | 仕様策定タスクで既存コードの事前調査なしに設計を開始する |
| 対処 | Phase 1-2の初期段階で既存実装をコードレベルで確認し、差分（未実装部分）のみを設計対象とする |
| 標準ルール | 仕様策定タスクでは必ず既存コードの `grep` / `Read` を先行し、設計前に差分分析を完了させる |

### 同種課題の簡潔解決手順（4ステップ）

1. Phase 12の必須成果物5件を先に作成し、`Task 1〜5` の実施ログを埋める。
2. `phase-12-documentation.md` のチェックボックスを実績に合わせて同期する。
3. 未タスクはテンプレート準拠で `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に作成する。
4. `verify-all-specs` / `validate-phase11-screenshot-coverage` / `verify-unassigned-links` を再実行し、結果を changelog に固定する。

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| 派生selectorで無限ループ | `import { useShallow } from "zustand/react/shallow"` → セレクタを `useShallow()` でラップ |
| worktreeでnative module不足 | `cd <worktree-dir> && pnpm install --frozen-lockfile` |
| Phase 12の「計画」文言残存 | `rg "予定\|実行待ち\|仕様策定のみ" outputs/phase-12/` で全件排除 |
| 未タスク9見出し不足 | `audit-unassigned-tasks --target-file <path>` で個別検証 |

---

## persist iterable ハードニングでの教訓（2026-03-08）

| 項目 | 内容 |
| --- | --- |
| 課題 | `viewHistory` / `expandedFolders` を永続化データとして信頼しすぎると、復元時に iterable 例外で画面遷移が停止する |
| 再発条件 | `Array.isArray` / `instanceof Set` の境界検証をせずに spread / `new Set(raw)` を実行する |
| 対処 | hydrate と action の両方で防御し、非期待型は空配列/空Setへフォールバックする |
| 標準ルール | UI変更が小さくても、ユーザーが画面検証を要求した場合は Phase 11 のスクリーンショット証跡を必須にする |

### 5分解決カード

1. 破損 persist を localStorage に注入して再現する。
2. hydrate 側（復元）で型ガード + フォールバックを入れる。
3. action 側（更新）でも同じガードを入れて二重防御にする。
4. 破損ケースのユニットテストを固定する。
5. Phase 11 の TC-ID とスクリーンショットを `manual-test-result.md` に同期する。

## TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001

### 実装内容

- `agentSlice.executeSkill` に `if (isExecuting) return;` ガードを追加（2行の変更）
- Store層ガード + 既存UIガード面3箇所の二重防御アーキテクチャ
- テスト9件（T-01〜T-05, T-09〜T-12）作成、全PASS

### 苦戦箇所

#### 1. テスト実行ディレクトリ依存（P40再発）

- **症状**: プロジェクトルートから `pnpm vitest run --coverage` を実行すると `ReferenceError: window is not defined` で全テスト失敗
- **原因**: `apps/desktop/vitest.config.ts` の `environment: "happy-dom"` 設定がカレントディレクトリの config を優先読み込みするため適用されない
- **解決**: `cd apps/desktop && pnpm vitest run` で対象パッケージのディレクトリから実行
- **再発条件**: モノレポ環境でサブエージェントにテスト実行を委譲する際に発生しやすい

#### 2. flushMicrotasks によるタイミング制御

- **症状**: `executeSkill` 内の `await preflightSkillExecutionAuth()` を通過させないと `isExecuting = true` に到達しない
- **原因**: `executeSkill` は async 関数で、preflight auth の await 前に `isExecuting` を set する前にガードチェックが必要
- **解決**: `flushMicrotasks()` ヘルパー（`setTimeout(resolve, 0)`）で microtask を1つ進め、preflight 通過後の `set({ isExecuting: true })` に到達させてからガードをテスト
- **再発条件**: Zustand Store の async アクション内で複数の await がある場合のテスト設計時

```typescript
// flushMicrotasks パターン
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, 0); });
}

// 使用例: preflight を通過させてから isExecuting をテスト
const firstCall = getState().executeSkill("first");
await flushMicrotasks(); // preflight 通過
expect(getState().isExecuting).toBe(true); // ガード有効
```

#### 3. createStore パターンでの Zustand set/get 再現

- **症状**: `createAgentSlice(set, get, store)` でテスト用 Store を作成する際、`set` の型と動作の再現が難しい
- **原因**: Zustand の `set` は関数とオブジェクトの両方を受け付け、且つ shallow merge する。テスト用の `set` 実装でこの動作を正確に再現する必要がある
- **解決**: `Object.assign(state, partial)` + `store = { ...store, ...state }` で shallow merge を再現

```typescript
function createStore(): { getState: () => AgentSlice } {
  let store = {} as AgentSlice;
  const state = {} as Partial<AgentSlice>;
  const set = (fn: ((current: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>) => {
    const partial = typeof fn === "function" ? fn(store) : fn;
    Object.assign(state, partial);
    store = { ...store, ...state } as AgentSlice;
  };
  const get = () => store;
  store = createAgentSlice(set as never, get as never, {} as never);
  return { getState: () => store };
}
```

#### 4. 既存テストファイルの環境依存エラー

- **症状**: agentSlice の18テストファイル中13ファイルが `window is not defined` または `Failed to load @repo/shared/types/auth-mode` で失敗
- **原因**: 既存テストの一部が happy-dom 環境やモノレポの shared パッケージビルドに依存
- **解決**: 新規テストは `createStore()` + `mockElectronAPI()` パターンで環境依存を最小化。既存テスト失敗は本タスクのスコープ外として切り分け

### 同種課題の5分解決カード

| ステップ | アクション |
|----------|-----------|
| 1 | `agentSlice.ts` の対象 async アクション冒頭で `get().isExecuting` チェックを追加 |
| 2 | `_handleComplete` / `_handleError` で `isExecuting: false` 復元を確認 |
| 3 | テストは `createStore()` + `mockElectronAPI()` + `flushMicrotasks()` パターンで作成 |
| 4 | `cd apps/desktop && pnpm vitest run` で実行（P40準拠） |
| 5 | UIガード面3箇所（ExecuteButton / AgentExecutionView / ChatPanel）の回帰確認 |

### 検証ゲート

- [ ] T-01〜T-12 全PASS
- [ ] Line Coverage ≥ 80%
- [ ] UIガード面3箇所の `isExecuting` 参照が props または個別セレクタHook で安定している

### 再監査追補

#### 5. 未タスク指示書の9セクション逸脱

- **症状**: `UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001` を作成した時点では、メタ情報と短い要約だけがあり、`Why/What/How/実行手順/検証方法` が欠落していた
- **原因**: `unassigned-task-detection.md` の3ステップ完了を、指示書品質そのものと混同した
- **解決**: `unassigned-task-template.md` を正本として 9セクションへ書き直し、`audit-unassigned-tasks --json --diff-from HEAD --target-file <file>` で `currentViolations=0` を確認する

#### 6. `validate-phase-output --phase` のドキュメント drift

- **症状**: workflow 本文や template は `--phase 12` 付きの例を残していたが、実スクリプトは workflow path の位置引数のみを受け付ける
- **原因**: validator 実装変更後に template / system spec / workflow 本文が同時更新されていなかった
- **解決**: `validate-phase-output.js <workflow-dir>` を正本コマンドとして統一し、skill / system spec / outputs を同一ターンで修正する

#### 7. BrowserRouter 配下の screenshot harness で Router を二重化

- **症状**: review harness 内に `MemoryRouter` を重ねたため、対象 view が描画前に落ちて screenshot 取得が止まった
- **原因**: 「isolated harness を作る」意図が「Router を再定義する」に置き換わった
- **解決**: 既存 Router の descendant route として harness を追加し、pageerror ログで route 崩れを早期検知する

### 同種課題の簡潔解決手順（4ステップ）

1. current workflow の成果物実体と未タスク指示書を確認し、配置済みとテンプレート準拠を分けて判定する。
2. `validate-phase-output.js <workflow-dir>`、`validate-phase12-implementation-guide.js --workflow <workflow-dir>`、`audit-unassigned-tasks --diff-from HEAD --target-file <file>` を実行する。
3. review harness を使う場合は既存 Router 配下で描画し、画面証跡を撮ってから system spec を更新する。
4. system spec、skill docs、workflow 本文、未タスク台帳を同一ターンで同期する。
---

## TASK-10A-G 再監査教訓（2026-03-09）

### 苦戦箇所: feature 全体 coverage と handler-scope coverage の混同

| 項目 | 内容 |
| --- | --- |
| 課題 | `96.9 / 88.9 / 100` を TASK-10A-G 全体の coverage と読める記述が残った |
| 再発条件 | 大規模ファイルの一部だけを gating 対象にしたのに、scope 注記を省略する |
| 対処 | `handler-scope coverage` を workflow / system spec に明記した |
| 標準ルール | coverage 数値は対象範囲付きで記録する |

### 苦戦箇所: Phase 12 成果物に「実行予定」表現が残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `spec-update-summary.md` に完了後も `予定` 文言が残った |
| 再発条件 | 実施前の叩き台をそのまま Phase 12 最終成果物へ残す |
| 対処 | `予定` 表現を除去し、実更新したファイル名と結果へ置換した |
| 標準ルール | `rg "予定|実行待ち|後続タスク" docs/30-workflows/<task>/outputs/phase-12/` を最終チェックに入れる |

### 苦戦箇所: screenshot harness の固定ポート競合

| 項目 | 内容 |
| --- | --- |
| 課題 | create / analysis / management panel の capture script を完全並列で回すと `5173` が競合した |
| 再発条件 | port 指定なしの screenshot harness を同時起動する |
| 対処 | 直列再実行へ切り替え、analysis mock を追加して証跡を再取得した |
| 標準ルール | `--port` がない screenshot harness は直列実行し、取得時刻も記録する |

### 苦戦箇所: test-only task でも explicit screenshot 要求が入る

| 項目 | 内容 |
| --- | --- |
| 課題 | 当初は P53 に従ってログ確認だけで閉じていたが、ユーザー要求は「実画面で再確認」だった |
| 再発条件 | UI変更が主目的ではない task を理由に screenshot を省略する |
| 対処 | current workflow に representative screenshots / plan / metadata / coverage を追加した |
| 標準ルール | explicit screenshot 要求時は test-only task でも current workflow 配下へ画面証跡を残す |

### 苦戦箇所: completed-tasks 移管前提の誤記

| 項目 | 内容 |
| --- | --- |
| 課題 | LOGS に completed-tasks へ移管済みと記録したが、current branch 実体は現 workflow 配下が正本だった |
| 再発条件 | completed workflow 化を計画段階で書き、実体確認を省略する |
| 対処 | current workflow canonical path を再確認し、LOGS / task-workflow / artifacts をその場で補正した |
| 標準ルール | completed-tasks への移管を記録する前に `test -d <path>` で実在確認する |

### 苦戦箇所: supporting artifact の件数が summary 文書とずれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `test-documentation.md` だけが旧件数 `43` のまま残った |
| 再発条件 | summary 文書だけを補正し、supporting artifact を横断確認しない |
| 対処 | Layer 3 を `16`、合計を `55 tests` へ補正した |
| 標準ルール | `rg -n "43件|55 tests|合計" docs/30-workflows/<task>/outputs/phase-12/` を実行して実測値を揃える |

### 苦戦箇所: open backlog の canonical path がタスク状態とズレる

| 項目 | 内容 |
| --- | --- |
| 課題 | `UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION` の参照先が、Phase 12 中の配置と archive 後の配置でずれやすかった |
| 再発条件 | Phase 12 中の root 配置と、完了移管後の completed workflow 配下配置を同じルールで扱う |
| 対処 | completed workflow 配下 `unassigned-task/` へ再配置し、関連参照を同一ターンで張り替えた |
| 標準ルール | Phase 12 中は root `unassigned-task/`、完了移管後は `completed-tasks/<task>/unassigned-task/` を canonical path とする |

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| worktree で Rollup optional dependency 欠落 | `pnpm install --frozen-lockfile` |
| Phase 12 の planned wording 残存 | `rg "予定|実行待ち|後続タスク" docs/30-workflows/<task>/outputs/phase-12/` |
| feature coverage の scope 誤読 | `pnpm exec tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:create` |
| supporting artifact の件数ドリフト | `rg -n "43件|55 tests|合計" docs/30-workflows/<task>/outputs/phase-12/` |
| open backlog の canonical path ドリフト | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` と `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/<task>/unassigned-task/<task>.md` |

---

