# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| Phase名    | 設計レビューゲート                        |
| 前提Phase  | Phase 2（設計）                           |
| 後続Phase  | Phase 4                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-shared-ipc-channel-contract-001 |

## 目的

Phase 2 設計の妥当性を検証し、Phase 4（テスト作成）への進行可否を判定する。既存 IPC 契約との整合性・後方互換性・型安全性・命名規則準拠の観点から設計を評価し、PASS/MINOR/MAJOR/CRITICAL の 4 段階で判定を下す。

## 背景

本タスクは IPC チャンネルの shared 正本化という、既存 contract に影響を与える可能性がある変更を含む。Phase 3 レビューゲートにより、設計の欠陥を早期に検出し、実装フェーズでの手戻りを防ぐ。

## 実行タスク

### タスク1: レビュー観点の評価

**目的**: Phase 2 設計の各観点を評価し、判定根拠を記録する

**実行手順**:

1. `outputs/phase-2/design.md` を読み込み、以下のレビュー観点で評価する
2. 各観点の評価結果と根拠を design-review-result.md に記録する
3. 観点ごとの判定（PASS/MINOR/MAJOR/CRITICAL）を下す
4. 総合判定を算出する

**レビュー観点**:

| 観点                    | 評価内容                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| 既存 IPC 契約との整合性 | APPROVAL_CHANNELS / EXECUTION_CHANNELS の追加パターンと同一形式であるか      |
| 後方互換性              | ALLOWED_ON_CHANNELS・既存 IPC handler・既存 preload API に破壊的変更がないか |
| 型安全性                | SKILL_CREATOR_RUNTIME_CHANNELS の型定義が TypeScript strict モードで安全か   |
| 命名規則準拠            | SCREAMING_SNAKE_CASE 定数名・"skill-creator:xxx" 文字列値の形式準拠          |
| import パス整合性       | @repo/shared/src/ipc/channels の import パスがモノレポ規約に準拠しているか   |
| テスト設計の妥当性      | TC-01〜TC-09 が AC-1〜AC-7 を網羅しているか                                  |

---

### タスク2: 判定の確定

**目的**: 総合判定を算出し、Phase 4 への進行可否を確定する

**実行手順**:

1. 各観点の判定をもとに総合判定を算出する
2. 以下の判定基準テーブルに従い、総合判定を決定する
3. 判定結果と戻り先（該当する場合）を design-review-result.md に記録する
4. MAJOR/CRITICAL の場合は指摘事項を具体的に記録し、戻り先 Phase の担当タスクを明示する

**判定基準テーブル**:

| 判定     | 説明                                                                           | Phase 4 進行   |
| -------- | ------------------------------------------------------------------------------ | -------------- |
| PASS     | 全観点で問題なし。設計が完全に妥当                                             | 即時進行可     |
| MINOR    | 軽微な懸念あり。設計の本質に影響しない改善点のみ（コメント追加・命名微修正等） | 条件付き進行可 |
| MAJOR    | 設計の一部に重大な欠陥あり。Phase 2 の特定タスクへ差し戻しが必要               | 進行不可       |
| CRITICAL | 設計全体が根本的に誤っている。Phase 1 から見直しが必要                         | 進行不可       |

**戻り先決定基準テーブル**:

| 判定     | 戻り先                 | 理由例                                                 |
| -------- | ---------------------- | ------------------------------------------------------ |
| PASS     | なし（Phase 4 へ進む） | -                                                      |
| MINOR    | なし（Phase 4 へ進む） | 指摘事項を Phase 4 開始前に反映する                    |
| MAJOR    | Phase 2（設計）        | ALLOWED_ON_CHANNELS の破壊的変更が設計に含まれている等 |
| CRITICAL | Phase 1（要件定義）    | 移行対象チャンネルの認識が根本的に誤っている等         |

---

### タスク3: MINOR 指摘の反映確認

**目的**: MINOR 判定の場合、指摘事項を Phase 4 着手前に設計へ反映する

**実行手順**:

1. 判定が MINOR の場合、指摘事項の一覧を design-review-result.md に記録する
2. Phase 2 の design.md / validation-matrix.md / topology-diagram.md の修正箇所を特定する
3. 修正が完了したことを design-review-result.md に記録する
4. 判定が PASS の場合、このタスクはスキップとして記録する

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`（MINOR 指摘反映完了の記録を含む）

---

## 参照資料

| 参照資料                   | パス                                                 | 内容                           |
| -------------------------- | ---------------------------------------------------- | ------------------------------ |
| Phase 2 設計               | `outputs/phase-2/design.md`                          | レビュー対象の設計ドキュメント |
| Phase 2 テスト設計         | `outputs/phase-2/validation-matrix.md`               | TC-01〜TC-09 の設計            |
| Phase 2 トポロジー         | `outputs/phase-2/topology-diagram.md`                | チャンネル定義の依存関係       |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`             | AC-1〜AC-7                     |
| shared channels.ts         | `packages/shared/src/ipc/channels.ts`                | 既存 IPC 契約の参照            |
| preload channels.ts        | `apps/desktop/src/preload/channels.ts`               | 既存 preload 構造の参照        |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` | Phase テンプレート             |

## 成果物

| 成果物               | パス                                      | 内容                                                     |
| -------------------- | ----------------------------------------- | -------------------------------------------------------- |
| design-review-result | `outputs/phase-3/design-review-result.md` | 各観点の評価・総合判定・指摘事項・戻り先（該当する場合） |

## 統合テスト連携

- レビューゲートの総合判定が PASS または MINOR でなければ Phase 4 へ進まない
- MINOR 指摘が Phase 4 のテスト設計に影響する場合、validation-matrix.md を更新してから Phase 4 へ進む
- 設計レビュー結果は Phase 5（実装）のコードレビュー基準としても参照される

## 完了条件

- [ ] 全レビュー観点の評価が design-review-result.md に記録されている
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が明記されている
- [ ] レビュー判定が PASS または MINOR であること
- [ ] MINOR の場合、指摘事項が Phase 4 着手前に design.md へ反映されている
- [ ] MAJOR/CRITICAL の場合、戻り先 Phase が明示されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 2（設計）完了
- **後続**: Phase 4（テスト作成）へ進む（PASS/MINOR の場合のみ）

## 次のPhase

完了後（PASS または MINOR 判定の場合）、以下のファイルを実行してください:
`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-4-test-creation.md`
