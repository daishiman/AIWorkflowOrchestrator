# UT-IMP-SKILL-CHAIN-BARREL-EXPORT-CONSISTENCY-001

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | UT-IMP-SKILL-CHAIN-BARREL-EXPORT-CONSISTENCY-001                      |
| 親タスク   | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001                         |
| 分類       | 改善（imp）                                                           |
| 優先度     | medium                                                                |
| ステータス | 未実施                                                                |
| 発見元     | Phase 12（documentation-changelog / task-workflow / lessons-learned） |
| 作成日     | 2026-03-03                                                            |

## 1. なぜこのタスクが必要か（Why）

`registerSkillChainHandlers` の登録漏れ修正で機能自体は復旧したが、`SkillChainStore` / `SkillChainExecutor` の公開境界が `apps/desktop/src/main/services/skill/index.ts` に未反映のまま残った。直接 import が残存すると、同種の IPC 追加時に依存経路が毎回ばらつき、設計ドリフトを継続的に生む。

放置した場合の影響:

- サービス参照規約がファイルごとに分岐し、保守時の影響範囲見積もりが不安定になる。
- IPC 登録修正は完了しても、アーキテクチャ境界の整合が毎回未解決で残る。
- Phase 12 での再発防止記録が「機能修正」と「設計整合」で分断される。

## 2. 何を達成するか（What）

- `services/skill/index.ts` で SkillChain 系サービスを公開し、サービス境界を統一する。
- Main 側参照を「直接 import かバレル経由か」で説明可能な状態にする。
- 今後の同種課題で再利用できる検証・監査手順を固定する。

スコープ:

- 含む: `apps/desktop/src/main/services/skill/index.ts` の export 統合、Main 側 import 経路の見直し、回帰テスト/型チェック、Phase 12 反映
- 含まない: SkillChain の機能追加、IPC チャネル追加、Renderer UI 変更

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001` の修正内容を確認済みであること。
- `registerAllIpcHandlers` と `ipc-double-registration.test.ts` の現状が把握できていること。

### 3.2 推奨アプローチ

1. 先に `services/skill/index.ts` の export を確定する。
2. その後に import 経路を段階移行し、循環参照を都度検証する。
3. テスト/型チェックを実行し、最後に仕様書へ検証証跡を同期する。

### 3.3 SubAgent 分担（関心ごと分離）

| SubAgent | 担当                                              | 並列可否   |
| -------- | ------------------------------------------------- | ---------- |
| A        | `services/skill/index.ts` の export 追加          | B と並列可 |
| B        | Main 側 import 経路の監査（直接 import 残存調査） | A と並列可 |
| C        | テスト/型チェックと回帰確認                       | A/B 完了後 |
| D        | 仕様書同期（task-workflow / lessons / LOGS）      | C と並列可 |

### 3.4 実装課題と解決策（親タスクからの教訓）

| 課題                                                                           | 発見経緯                                                                                              | 解決策                                                   | 教訓                                                                                         |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| IPC 登録修正を優先した結果、サービス公開境界が後回しになった                   | `TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001` Phase 12 で「機能復旧済みだが直接 import 残存」を確認 | 未タスクとして分離し、公開境界整合を独立ゴールで追跡する | 「機能修正」と「公開境界整合」は同一コミットで終わらない場合でも、同一ターンで未タスク化する |
| `handler/register/preload` は確認したが `services/*/index.ts` を見落としやすい | api-ipc / architecture / task-workflow 同期時の突合で判明                                             | 検証コマンドに `services/*/index.ts` 監査を固定追加する  | IPC 修正タスクの完了条件を 3点から 4点（service 公開境界含む）へ拡張する                     |
| 直接 import の残存理由が文書化されず再調査が必要になる                         | 再監査時に「なぜ残っているか」が即答できなかった                                                      | 残存の是非と移行方針を未タスク仕様書に明記する           | 未タスク仕様書に苦戦箇所を入れると、次回の初動調査を短縮できる                               |

### 3.5 同種課題の簡潔解決手順（4ステップ）

1. IPC 修正後に `handler/register/preload/service公開境界` の4点を機械確認する。
2. `services/*/index.ts` の export 更新有無を先に判定し、保留時は未タスク化する。
3. `ipc-double-registration` と `tsc --noEmit` をセット実行して回帰を確定する。
4. 結果を `task-workflow` / `lessons-learned` / 未タスク指示書へ同一ターンで同期する。

## 4. 実行手順

1. `apps/desktop/src/main/services/skill/index.ts` に `SkillChainStore` / `SkillChainExecutor` の export を追加する。
2. `rg -n "services/skill/SkillChain(Store|Executor)|from \"../services/skill\"" apps/desktop/src/main` で直接 import 残存を抽出する。
3. 移行対象をバレル経由へ置換し、循環参照がないかを確認する。
4. `cd apps/desktop && CI=1 pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts` を実行する。
5. `cd apps/desktop && pnpm exec tsc --noEmit` を実行する。
6. Phase 12 反映として `task-workflow.md` / `lessons-learned.md` / 未タスク監査結果を同期する。

## 5. 完了条件チェックリスト

- [ ] `services/skill/index.ts` に SkillChain 系 export が追加されている
- [ ] Main 側 import 経路の方針（移行済み or 段階移行）が記録されている
- [ ] `ipc-double-registration.test.ts` が PASS している
- [ ] `pnpm exec tsc --noEmit` が PASS している
- [ ] `verify-unassigned-links` が `missing: 0` である
- [ ] `audit-unassigned-tasks --target-file` が `currentViolations: 0` である

## 6. 検証方法

| 観点             | コマンド / 方法                                                                                                                                                                                                 | 合格条件                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- | ------------------ |
| バレル公開       | `rg -n "SkillChain(Store                                                                                                                                                                                        | Executor)" apps/desktop/src/main/services/skill/index.ts` | export 行が存在                                    |
| 直接 import 残存 | `rg -n "services/skill/SkillChain(Store                                                                                                                                                                         | Executor)                                                 | from \"../services/skill\"" apps/desktop/src/main` | 残存理由が説明可能 |
| 回帰テスト       | `cd apps/desktop && CI=1 pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts`                                                                                                                | PASS                                                      |
| 型整合           | `cd apps/desktop && pnpm exec tsc --noEmit`                                                                                                                                                                     | error 0                                                   |
| 未タスクリンク   | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                             | `missing: 0`                                              |
| 対象監査         | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-chain-barrel-export-consistency-001.md` | `currentViolations: 0`                                    |

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                      |
| -------------------------------- | ------ | -------- | --------------------------------------------------------- |
| バレル化で循環参照が発生する     | 中     | 中       | 置換ごとに `tsc --noEmit` を実行し、段階移行する          |
| 直接 import の一部を意図せず残す | 中     | 中       | `rg` 監査結果をレビュー時に貼り付け、残存理由を記録する   |
| 仕様同期漏れで再発防止が弱い     | 中     | 低       | `task-workflow` と `lessons-learned` を同一ターン更新する |

## 8. 参照情報

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/services/skill/index.ts`
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001/outputs/phase-12/unassigned-task-detection.md`

## 9. 備考

本タスクは機能不具合の修正ではなく、IPC 修正後に残る設計整合性（サービス公開境界）の是正を目的とする。  
完了判定は `currentViolations=0` を基準にし、`baselineViolations` は既存負債として分離記録する。
