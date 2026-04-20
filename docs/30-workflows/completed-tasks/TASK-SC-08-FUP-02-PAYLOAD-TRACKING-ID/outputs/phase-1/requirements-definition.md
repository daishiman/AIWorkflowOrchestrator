# Phase 1 成果物: 要件定義（requirements-definition）

## メタ情報

| 項目       | 値                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| Phase      | 1                                                                               |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                           |
| タスク名   | skill-creator progress payload への planId / requestId 付与による混線防止       |
| タスク種別 | NON_VISUAL code task                                                            |
| 目的       | progress payload 混線問題の要件と受入基準を Phase 1-13 実行可能粒度で再固定する |
| Issue      | #2300（closed）                                                                 |
| depends_on | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE（完了済み）                              |
| 作成日     | 2026-04-20                                                                      |

## 真の論点

単一 IPC ブロードキャストチャンネル `skill-creator:progress` に発生元識別子が欠落しており、
並行 `executePlan` 実行時にどの planId の通知か判別できない。これにより以下が発生し得る。

1. **並行実行時の混線**: 複数の `executePlan` がバックグラウンドで並行実行されると、
   異なる planId から発生した progress 通知が同一チャンネルに流れ込み UI 上の進捗表示が混在する。
2. **セッション復元後の誤表示**: 復元中の planId と現在表示中の planId が異なる場合でも、
   progress 通知が UI に反映されてしまう。
3. **フィルタリング不能**: Renderer 側で planId を判断する手段がない。

## 依存関係・責務境界

| 責務         | 担当ファイル                                                          | 境界                                    |
| ------------ | --------------------------------------------------------------------- | --------------------------------------- |
| 型責務       | `apps/desktop/src/preload/skill-creator-api.ts`                       | `SkillCreatorProgress` の構造定義       |
| 送信責務     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   | `sendSkillCreatorProgress` の broadcast |
| Runtime 経路 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `executeAsync` の snapshot push         |
| 受信フィルタ | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`             | Hook の callback 内フィルタ             |

## 価値とコスト

- 価値
  - 複数スキル並行生成時の UI 混線リスクを低コスト（オプショナルフィールド追加）で除去
  - セッション復元（TASK-P0-08）との競合による誤表示を防止
  - planId ベースのデバッグ容易性向上
- コスト
  - 型定義・関数シグネチャ・Hook の 4 ファイル修正
  - 既存テストの修正と新規フィルタリングテストの追加
  - オプショナルフィールド運用のため後方互換ロジックの明示が必要

## 改善優先順位

1. 型追加（preload）
2. Main 送信シグネチャ拡張
3. Runtime ルート emit 経路調査
4. Renderer フィルタ実装
5. テスト拡充（4 シナリオ）

## task classification【必須】

| 項目                 | 判定   | 理由                                                         |
| -------------------- | ------ | ------------------------------------------------------------ |
| UI task              | いいえ | Renderer は Hook のみ変更。視覚要素変更なし                  |
| docs-only            | いいえ | 型・関数・Hook のコード behavior を変更する                  |
| NON_VISUAL code task | はい   | Main Process + Renderer Hook + preload 型の計 4 ファイル変更 |

## 受入基準（AC-1 〜 AC-9）

| ID   | 基準                                                                                   | 検証方法                 |
| ---- | -------------------------------------------------------------------------------------- | ------------------------ |
| AC-1 | `SkillCreatorProgress` 型に `planId?: string` と `requestId?: string` が追加されている | 型定義 review / tsc      |
| AC-2 | `sendSkillCreatorProgress` が `planId` / `requestId` を payload に含めて送信できる     | コードレビュー           |
| AC-3 | `useStreamingProgress` に `options.planId` フィルタリングロジックが実装されている      | コードレビュー           |
| AC-4 | `planId` 一致時のみ Zustand ストアに書き込まれる                                       | vitest（filter match）   |
| AC-5 | `planId` 不一致の progress 通知はスキップされる                                        | vitest（filter miss）    |
| AC-6 | `progress.planId` 未設定時は後方互換で受け入れられる                                   | vitest（legacy payload） |
| AC-7 | `options.planId` 未指定時は全通知が受け入れられる                                      | vitest（no options）     |
| AC-8 | 既存 `useStreamingProgress` テストが全て PASS する                                     | vitest run               |
| AC-9 | `pnpm --filter @repo/desktop typecheck` / `lint` / targeted test が PASS する          | 品質コマンド群           |

## 4条件の初期評価

| 条件         | 初期判定 | 主因                                                                    |
| ------------ | -------- | ----------------------------------------------------------------------- |
| 矛盾なし     | PASS     | 既存実装と整合する方向で追加するだけ。破壊的変更はしない                |
| 漏れなし     | FAIL     | Phase 1-13 分割仕様がまだ存在しない。artifacts registry / gate が未定義 |
| 整合性あり   | FAIL     | Runtime ルートの progress 経路が既存仕様書で不確定のまま残っている      |
| 依存関係整合 | FAIL     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE との spec 参照リンクが未整備     |

（Phase 1 で artifacts registry（`artifacts.json`）固定、Runtime 経路調査方針確定、depends_on リンク整備により 3 FAIL を解消する。）

## 参照資料

- `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md`

## 完了条件

- [x] 真の論点と依存関係・責務境界を特定
- [x] task classification を NON_VISUAL code task として確定
- [x] AC-1 〜 AC-9 を確定
- [x] 4条件の初期評価を記録
- [x] Runtime ルートの emit 経路調査を Phase 2 の入力として定義
