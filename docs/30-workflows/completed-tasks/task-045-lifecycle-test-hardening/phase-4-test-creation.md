# Phase 4: テスト作成 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-10A-G                 |
| Phase    | 4 - テスト作成             |
| 前Phase  | `phase-3-design-review.md` |
| 次Phase  | Phase 5（実装）            |

## 目的

既存 suite を前提に、追加・補完するテストケースを確定する。  
「既に守れている観点」と「今回追加する観点」を分けて書く。

## G1: create / list / view 往復

### `SkillCreateWizard.test.tsx`

| テストID | 現状 | 追加/確認内容                                    |
| -------- | ---- | ------------------------------------------------ |
| TC-G1-01 | 既存 | `useCreateSkill` へ description / options が渡る |
| TC-G1-02 | 既存 | 成功時に完了 view と生成パスが表示される         |
| TC-G1-03 | 既存 | Error / unknown error のメッセージを保持する     |

### `SkillManagementPanel.integration.test.tsx`

| テストID | 現状 | 追加/確認内容                                                   |
| -------- | ---- | --------------------------------------------------------------- |
| TC-G1-11 | 既存 | create view へ遷移し、close で list view に戻る                 |
| TC-G1-12 | 既存 | import 成功後に available → imported へ移動する                 |
| TC-G1-13 | 既存 | analysis view 往復後も list / count / search state が維持される |

## G2: analyze / improve / recovery / store

### `SkillAnalysisView.test.tsx`

| テストID | 現状     | 追加/確認内容                                        |
| -------- | -------- | ---------------------------------------------------- |
| TC-G2-01 | 既存     | mount 時に analyze が走る                            |
| TC-G2-02 | 既存     | retry で analyze を再実行できる                      |
| TC-G2-03 | 補完対象 | 選択改善後の再分析導線を固定する                     |
| TC-G2-04 | 既存     | auto improve の confirm 分岐を固定する               |
| TC-G2-05 | 補完対象 | `isAnalyzing` / `isImproving` 中の排他制御を固定する |

### `useSkillAnalysis.test.ts`

| テストID | 現状 | 追加/確認内容                    |
| -------- | ---- | -------------------------------- |
| TC-G2-11 | 既存 | suggestion の toggle             |
| TC-G2-12 | 既存 | auto-fixable のみ選択            |
| TC-G2-13 | 既存 | apply selected の委譲            |
| TC-G2-14 | 既存 | auto improve の confirm / cancel |

### `agentSlice.skill-lifecycle.test.ts`

| テストID | 現状     | 追加/確認内容                                    |
| -------- | -------- | ------------------------------------------------ |
| TC-G2-21 | 補完対象 | invalid skillName に対する guard（P42）          |
| TC-G2-22 | 補完対象 | apply success 後の state 復元                    |
| TC-G2-23 | 補完対象 | autoImprove success / failure の state 復元      |
| TC-G2-24 | 補完対象 | analyze error 後の retry で state が再利用できる |

## G3: 上位回帰

### `ChatPanel.skill-management.test.tsx`

| テストID | 現状 | 追加/確認内容                                      |
| -------- | ---- | -------------------------------------------------- |
| TC-G3-01 | 既存 | toggle 表示                                        |
| TC-G3-02 | 既存 | open / close で panel と message area が切り替わる |
| TC-G3-03 | 既存 | `isExecuting` 中に toggle が disabled になる       |

## 実装ルール

- 新規 file は追加しない。
- テスト名は「条件 → 期待結果」で書く。
- happy-dom では `fireEvent` を使う。
- 依存する mock は各 file の既存パターンに寄せる。

## 実行コマンド（設計時の確認用）

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

## 完了条件

- [x] G1 / G2 / G3 の追加・確認対象が既存 suite に割り当てられている
- [x] 新規ファイル前提が入っていない
- [x] P39 / P42 / P50 の制約が明記されている

## テンプレート準拠追補

## 実行タスク

- T1: G1 / G2 / G3 のテストケースを既存 suite ごとに確定する
- T2: 補完対象と既存回帰対象を分離して書く
- T3: 実装時制約を Phase 5 へ引き渡す

## 参照資料

| 参照資料       | パス                                                                                        | 用途                     |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| 依存Phase 1    | `phase-1-requirements.md`                                                                   | 受入条件とスコープ確認   |
| 設計           | `phase-2-design.md`                                                                         | RT-ID 割当確認           |
| 設計レビュー   | `phase-3-design-review.md`                                                                  | 事前ゲート結果確認       |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | suite 追記方針           |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P39 / P42 / P50 制約確認 |

## 実行手順

1. 既存ケースと補完対象ケースを分けて棚卸しする
2. suite ごとにテスト ID と観点を割り振る
3. Phase 5 の runtime 境界と command を固定する

## 統合テスト連携

| 連携面 | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| G1     | create / list / analysis view 往復の上位連携を確定する     |
| G2     | analyze / improve / retry / guard の状態遷移連携を確定する |
| G3     | ChatPanel top-level toggle と `isExecuting` 回帰を維持する |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                          |
| ------------------ | ---- | ------------------------------------------------- |
| テスト設計         | ✅   | 新規 file を増やさず既存 suite で守れるか         |
| エラーハンドリング | ✅   | unknown error / retry / confirm cancel を含めるか |
| UI/UX              | ✅   | view 往復・disabled・toggle 契約が入っているか    |
| アーキテクチャ     | △    | Main IPC 側へ横滑りしていないか                   |

## 成果物

| 成果物         | パス                       | 説明                     |
| -------------- | -------------------------- | ------------------------ |
| テスト作成仕様 | `phase-4-test-creation.md` | suite 別ケース一覧と制約 |

## サブタスク管理

1. suite 棚卸し
2. テスト ID 割当
3. 補完対象の明文化
4. Phase 5 handoff 条件整理

## タスク100%実行確認

- [x] G1 / G2 / G3 のケース表を確定した
- [x] 補完対象と既存回帰対象を分離した
- [x] 新規 file 非作成と runtime 境界を明記した

## 次のPhase

Phase 5（実装）
