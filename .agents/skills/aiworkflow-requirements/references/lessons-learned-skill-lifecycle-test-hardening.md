# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-10A-G 実装知見追補（2026-03-10）

### 苦戦箇所と解決策

#### 1. IPC ハンドラキャプチャパターンの発見

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Main Process の IPC ハンドラを単体テストしようとする際、`ipcMain.handle` をモックして登録されたハンドラ関数を直接取り出す方法が非自明 |
| **再発条件** | Main Process の IPC ハンドラを単体テストしようとする場合 |
| **解決策** | 既存の `skillHandlers.contract.test.ts` にある handler capture パターン（`vi.mocked(ipcMain.handle).mock.calls.find(c => c[0] === 'skill:create')?.[1]`）を再利用。`registerSkillHandlers(mockService)` 後に `ipcMain.handle` の mock.calls からチャンネル名で検索 |
| **教訓**   | IPC ハンドラの単体テストでは handler capture パターンを標準とする |

```typescript
const { ipcMain } = vi.mocked(await import("electron"));
registerSkillHandlers(mockService);
const handler = vi.mocked(ipcMain.handle).mock.calls.find(
  (c) => c[0] === "skill:create"
)?.[1];
```

#### 2. G2 Store統合テストでの Promise 解決タイミング制御

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Zustand Store のアクション内で Preload API (window.electronAPI) を呼び出す非同期処理をテストする際、`createSkill`/`analyzeSkill` アクション内の `await window.electronAPI.skill.create()` が Promise を返すため、act + flushPromises を組み合わせないと状態遷移が完了しない |
| **再発条件** | Zustand Store のアクション内で Preload API (window.electronAPI) を呼び出す非同期処理をテストする場合 |
| **解決策** | `vi.waitFor()` を使って状態遷移の完了を待機するパターンを採用 |
| **教訓**   | Store アクションの非同期テストでは `vi.waitFor(() => expect(getState().someFlag).toBe(expected))` で状態遷移完了を待つ |

```typescript
const mockCreate = vi.fn().mockResolvedValue({ success: true });
window.electronAPI = { skill: { create: mockCreate } };
const { result } = renderHook(() => useAppStore((s) => s.createSkill));
await act(async () => { result.current("test", {}); });
await vi.waitFor(() => {
  expect(useAppStore.getState().skills).toHaveLength(1);
});
```

#### 3. G2 Phase 6 カバレッジ不足の根本原因特定

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Store アクションのバリデーション分岐や API ガード（electronAPI 未定義）がテストされていない。Phase 7 で Line 69.3%, Branch 46.7% と基準未達。21件中12件は正常系のみで、エラー系・ガード系のカバレッジが大幅に不足 |
| **再発条件** | Store アクションのバリデーション分岐や API ガード（electronAPI 未定義）がテストされていない場合 |
| **解決策** | Phase 6 で VAL(6件: createSkill/analyzeSkill/applySkillImprovements 各2件のバリデーション分岐) + GUARD(3件: electronAPI 未定義時の早期リターン) = 9件を追加し、100%/100% に到達 |
| **教訓**   | テスト専用タスクでは Phase 4 初回は正常系を中心に設計し、Phase 6 でカバレッジ計測結果に基づいてエッジケースを追加する「2段階テスト設計」を標準とする |

#### 4. P41 v8 Function Coverage 0% の exemption 判断

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Vitest v8 カバレッジプロバイダで skillHandlers.ts のようにオプションオブジェクト内にインラインアロー関数がある場合、`validateIpcSender` の options 内 `getAllowedWindows: () => [mainWindow]` が独立関数としてカウントされるため、G1 の handler-scope Function Coverage が 0% になる |
| **再発条件** | Vitest v8 カバレッジプロバイダで skillHandlers.ts のようにオプションオブジェクト内にインラインアロー関数がある場合 |
| **解決策** | Phase 7 レポートで P41 exemption として明記し、Line/Branch Coverage を主判定、Function Coverage を補助情報として扱うことで Phase 10 レビューでの不要な議論を回避 |
| **教訓**   | v8 プロバイダ使用時は Function Coverage 0% を自動的に FAIL としない。`getAllowedWindows` のようなインラインコールバックが原因の場合は P41 exemption として事前記録する |

#### 5. 並列エージェント実行時の Phase 12 分割戦略

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Phase 12 の仕様書更新を複数のサブエージェントに委譲する際、P43 準拠で「3ファイル以下/エージェント」に分割しないと rate limit で中断する |
| **再発条件** | Phase 12 の仕様書更新を複数のサブエージェントに委譲する場合 |
| **解決策** | Agent1(implementation-guide + spec-update-summary) と Agent2(LOGS.md x2 + SKILL.md x2 + references x2 + topic-map) に分割。Agent2 は references を 2ファイルに制限 |
| **教訓**   | Phase 12 サブエージェントは仕様書更新3ファイル以下、LOGS.md への「完了」記録は全更新終了後の最終ステップとする |

### TASK-10A-G 同種課題の5分解決カード

| 症状 | 原因 | 最短手順 |
| --- | --- | --- |
| IPCハンドラを直接テストしたい | handler capture パターン未発見 | `mock.calls.find(c => c[0] === 'channel')?.[1]` |
| Store統合テストで状態遷移が完了しない | async action の Promise 未解決 | `vi.waitFor(() => expect(getState()...))` |
| カバレッジが基準未達 | 正常系のみでエッジケース不足 | Phase 7 → 不足分岐特定 → Phase 6 追加 |
| Function Coverage 0% | P41 v8 inline function | exemption 記録（Line/Branch を主判定） |
| Phase 12 エージェント中断 | P43 rate limit | 3ファイル以下/エージェント分割 |

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-06

#### 苦戦箇所1: 設計タスクでのシステム仕様書更新先送り（P57）

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計タスク（型定義・契約定義のみ）では「`.claude/skills/` の実更新は PR 作成時に実施」と先送りし、`system-spec-update-summary.md` に計画文だけを記録した。Phase 12 完了条件を満たさなかった |
| 再発条件 | 「プロダクションコードがないから仕様書更新は後でよい」と判断する |
| 解決策 | 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない（TASK-SKILL-LIFECYCLE-05 苦戦箇所6 の再発） |
| 関連パターン | P57（新規）、P26（システム仕様書更新遅延） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所2: 設計タスクを理由とした未タスク指示書の配置省略（P58）

| 項目 | 内容 |
| --- | --- |
| 課題 | 「設計タスクだから」という例外判断で `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` への独立指示書ファイルの作成を省略した |
| 再発条件 | タスク種別を理由に P3 の3ステップを例外扱いにする |
| 解決策 | 設計タスクの未タスクであっても独立した指示書ファイルを `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に作成する |
| 標準ルール | P3（①指示書作成 → ②task-workflow 登録 → ③関連仕様書リンク追加）に例外はない |
| 関連パターン | P58（新規）、P3、P38 |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所3: 並列エージェント分担による documentation-changelog 件数不整合（P59）

| 項目 | 内容 |
| --- | --- |
| 課題 | documentation-changelog.md に「Task 4 検出件数: 0件」と記載されたが、実際の `unassigned-task-detection.md` では8件検出されていた |
| 再発条件 | 並列エージェントで分担し、changelog を各エージェントが個別に記録する |
| 解決策 | documentation-changelog.md は全 Task 完了後にメインエージェントが一括作成し、`unassigned-task-detection.md` の検出件数と照合してから記録する |
| 標準ルール | changelog は「事後統合」する。並列エージェントの中間報告をそのまま changelog に転記しない |
| 関連パターン | P59（新規）、P4、P43、P51 |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 同種課題の簡潔解決手順（3ステップ）

1. Phase 12 開始時に「設計タスク / 実装タスク」に関わらず `.claude/skills/` の実更新を必須とし、計画文ではなく実績ログのみを記録する。
2. 未タスク検出は P3 の3ステップを必ず完遂し、タスク種別を理由に例外判断をしない。
3. documentation-changelog はメインエージェントが最終統合する。

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-07

#### 苦戦箇所1: Phase 12 サブエージェントが「設計タスク範囲外」として実ファイル更新を保留する

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Step 1-A〜Step 2 で、サブエージェントが「設計タスクなので実ファイル更新は実装タスクで行う」と判断し、更新計画のみ記録した |
| 再発条件 | 設計タスク（spec_created）で Phase 12 を実行する場合に、「設計 = ファイル変更不要」と誤解する |
| 解決策 | 設計タスクでも Step 1-A（タスク完了記録）、Step 1-C（関連タスクテーブル）、Step 2（システム仕様更新）は実ファイルへの書き込みが必須 |
| 標準ルール | Phase 12 のシステム仕様書更新は、タスク種別に関わらず実ファイル変更を必ず伴う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所2: Phase 3 MINOR 4件の追跡フローが Phase 横断で見失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 3 で検出された MINOR 4件が Phase 5→9→10 を横断する過程で、追跡マトリクスを作成しなかったため対応状況の確認に時間がかかった |
| 再発条件 | Phase 3 の MINOR 指摘が4件以上で、複数 Phase にまたがる修正が必要な場合 |
| 解決策 | Phase 5 完了時点で「Phase 3 MINOR 追跡マトリクス」を作成し、各指摘の対応状況を明示する |
| 標準ルール | Phase 3 の MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所3: バックグラウンドエージェントの TaskOutput timeout パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列実行したバックグラウンドエージェントが10分 timeout で結果取得に失敗したが、実際には成果物ファイルの生成は完了していた |
| 再発条件 | 大量の成果物を生成する Phase（Phase 4/5/12）をバックグラウンドエージェントで実行した場合 |
| 解決策 | timeout 後は `find` / `ls` で成果物ファイルの存在を直接確認する |
| 標準ルール | バックグラウンドエージェント timeout 後は成果物ファイルの存在確認を優先する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 苦戦箇所4: コンテキストウィンドウ圧縮で前セッションのエージェント結果が消失する

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列エージェントの結果をメモリ上で保持したが、コンテキストウィンドウ圧縮により前セッションの結果が参照不能になった |
| 再発条件 | 長時間セッションで並列エージェントを多用し、結果をファイル出力せずメモリのみで保持した場合 |
| 解決策 | 並列エージェントの結果は必ず成果物ファイルとして出力し、後続 Phase ではファイルから読み取る |
| 標準ルール | 並列エージェントは成果物ファイル出力を優先し、結果参照はファイルベースで行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

#### 同種課題の簡潔解決手順（4ステップ）

1. 設計タスクの Phase 12 でも実ファイル更新を必ず実施する。「更新計画の記録」だけでは成果物にならない。
2. Phase 3 MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する。
3. バックグラウンドエージェント timeout 後は `find`/`ls` で成果物存在を直接確認する。
4. 並列エージェントの結果は成果物ファイルに出力し、コンテキスト消失に備える。

---

### 2026-03-15 TASK-SKILL-LIFECYCLE-05

#### 苦戦箇所1: Phase 11 の必須成果物が揃っておらず screenshot coverage validator が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` のみで運用し、`manual-test-checklist.md` と `screenshot-plan.json` が欠落した状態で再監査に進んでしまった |
| 再発条件 | 「スクリーンショットがあるから十分」と判断し、validator 前提ファイルを確認しない |
| 解決策 | `outputs/phase-11/` を `checklist/result/plan/screenshots` の4点セットで再構成し、TC-11-01〜05 の証跡を 1:1 で再紐付けした |
| 標準ルール | Phase 11 完了判定は `validate-phase11-screenshot-coverage` PASS を必須にし、必須ファイル欠落を残さない |

#### 苦戦箇所2: docs-heavy task の画面検証が build 依存で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | current build での capture が環境要因で不安定なとき、画面検証の証跡収集が止まりやすい |
| 再発条件 | fallback 経路を事前定義せず、実画面 capture 成功だけを前提に運用する |
| 解決策 | source screenshot を current workflow に集約し、review board 1件を current workflow で新規 capture、metadata で source と用途を明記した |
| 標準ルール | docs-heavy + screenshot要求時は review board fallback を許容し、source / review board / metadata を同時に記録する |

#### 苦戦箇所3: implementation-guide の literal 要件漏れで Phase 12 が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | Part 1 の「なぜ先行」と Part 2 の「使用例」「エッジケース」が欠けると validator で fail する |
| 再発条件 | 内容は充実していても、validator が見る literal 見出し・語句を満たさない |
| 解決策 | Part 1 冒頭に why-first を追加し、Part 2 に API 使用例セクションとエッジケースセクションを明示追加した |
| 標準ルール | implementation-guide は内容品質だけでなく validator literal 互換を同時に満たす |

#### 苦戦箇所4: Record パターンでの ScoringGate 網羅性保証

| 項目 | 内容 |
| --- | --- |
| 課題 | switch 文で ScoringGate の4段階を分岐しようとしたが、新しい段階が追加された場合にコンパイルエラーにならない。exhaustive check の `default: never` パターンも検討したが、静的マッピングの方が安全だった |
| 再発条件 | ユニオン型の分岐に switch 文を使い、exhaustive check を忘れる |
| 解決策 | `Record<ScoringGate, CTAVisibility>` で全キーの定義を型レベルで強制する。キーが不足するとコンパイルエラーになるため、網羅性が保証される |
| 標準ルール | ユニオン型の全ケース網羅には `Record<UnionType, Config>` パターンを使う（02-code-quality.md 準拠） |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所5: 設計タスクの artifacts.json 逐次更新忘れ

| 項目 | 内容 |
| --- | --- |
| 課題 | 49成果物を全て作成済みだったが、artifacts.json の phase status が全て `not_started` のまま放置。3つの並列検証エージェントで全Phase PASS を確認した後に初めて発見した |
| 再発条件 | 設計タスクでは「コードを書かない」前提があり、状態ファイルの更新が後回しにされる |
| 解決策 | 各Phase完了ごとに artifacts.json の status, artifacts 配列, acceptanceCriteria を逐次更新。最終的に status: "completed" + 全AC verified: true に更新した |
| 標準ルール | artifacts.json は Phase 完了の正式記録であり、成果物作成と同時に更新する |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所6: Phase 12 本文と成果物の実績が乖離する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` が `not_started` のまま、`documentation-changelog.md` に「実装タスクで後続対応」といった計画文が残り、成果物実体と矛盾した |
| 再発条件 | outputs 実体更新後に本体仕様書と changelog を同時更新しない |
| 解決策 | `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同一ターンで更新し、planned wording を除去した |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 開始時に `checklist/result/plan/screenshots` の4点セットを先に作る。
2. screenshot 取得は「実画面試行 → fallback review board → metadata固定」の順で閉じる。
3. Phase 12 は `implementation-guide` の literal 要件を先に満たしてから詳細説明を肉付けする。
4. `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` を同時に更新して整合を固定する。
5. 最終判定で `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行する。

---

### 2026-03-14 TASK-SKILL-LIFECYCLE-04

#### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 再発条件 | workflow ローカル path を temporary 運用のまま台帳反映する |
| 解決策 | root canonical path（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`）へ再配置し、`phase-12-documentation` / `unassigned-task-detection` / `task-workflow-backlog` / `interfaces` 参照を同ターン更新した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

#### 苦戦箇所2: `current`/`baseline` と配置可否を同一判定にすると報告が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | 監査値だけで「指定ディレクトリに置けているか」を判定しようとして説明が曖昧になった |
| 再発条件 | 配置可否・link整合・監査値を 1 つの数値で報告する |
| 解決策 | `配置可否`、`verify-unassigned-links`、`audit --diff-from HEAD --target-file` を3軸で分離記録した |
| 標準ルール | `currentViolations=0` は品質判定、配置可否は別項目として必ず明記する |

#### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 再発条件 | 「実装記録は完了したので index は後でよい」と判断する |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`current canonical set` と `artifact inventory` を起点に parent docs / ledger / indexes / logs を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |

#### 同種課題の簡潔解決手順（4ステップ）

1. MINOR 検出時に未タスク指示書を root `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ作成する。
2. 指示書は 9セクション形式（`## 1..9` + `3.5`）で作り、親タスク苦戦箇所を継承する。
3. `task-workflow-backlog` / 関連仕様書 / workflow outputs の参照を同ターンで更新する。
4. `verify-unassigned-links` と `audit --diff-from HEAD --target-file` で link と品質を分離検証する。

---

