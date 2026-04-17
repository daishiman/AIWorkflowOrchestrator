# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 3                   |
| Phase名    | 設計レビューゲート  |
| 対象機能   | TASK-SW-STREAM-001  |
| 前提Phase  | Phase 2: 設計       |
| 次Phase    | Phase 4: テスト作成 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
`SkillCreatorProgress` 型定義の妥当性、コールバック呼び出し箇所の網羅性、
後続タスク TASK-SW-STREAM-002 への影響を重点的に確認する。

## 実行タスク

### Task 1: 設計整合性チェック（AC 対応確認）

| AC   | 設計での対応                                                                                                     | 評価 |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ---- |
| AC-1 | `createSkill()` 第2引数に `onProgress?: (progress: SkillCreatorProgress) => void` を追加する設計が明記されている | TBD  |
| AC-2 | `runCreateWorkflow` 開始前に `planning` / 10% のコールバック呼び出しが設計されている                             | TBD  |
| AC-3 | SKILL.md 生成開始前に `generating-skill` / 40% のコールバック呼び出しが設計されている                            | TBD  |
| AC-4 | エージェント定義生成開始前に `generating-agents` / 70% のコールバック呼び出しが設計されている                    | TBD  |
| AC-5 | 検証開始前に `validating` / 90% のコールバック呼び出しが設計されている                                           | TBD  |
| AC-6 | スキルディレクトリ返却前に `done` / 100% のコールバック呼び出しが設計されている                                  | TBD  |
| AC-7 | `onProgress?.()` オプショナルチェーン呼び出しにより `undefined` 時の安全動作が設計されている                     | TBD  |
| AC-8 | `createSkill()` の第1引数・戻り値型が変更されておらず、既存テストへの影響なしと確認されている                    | TBD  |

### Task 2: TASK-SW-STREAM-002 との接続設計確認

- TASK-SW-STREAM-002 は本タスク完了後に `skillCreatorHandlers.ts` で以下のように接続する設計:

```typescript
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

- 本タスクで定義した `SkillCreatorProgress` 型が Preload 側の `SkillCreatorProgress` 型と整合するか確認
- コールバック引数の `phase` 文字列値が `useStreamingProgress.ts` の `PHASE_TO_STAGE` マップと整合するか確認

### Task 3: リスク評価

| ID   | リスク                                                                   | 影響度 | 対策                                                                          |
| ---- | ------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| R-01 | `create` モード以外でも `done` を呼ぶ場合、モード別の期待値と乖離する    | 低     | `done` コールバックは `create` モード内のみに限定し、設計を明確化する         |
| R-02 | コールバック内で例外が発生した場合、`createSkill()` の処理が中断される   | 低     | コールバック呼び出しを `try/catch` で保護するか、または呼び出し側の責任とする |
| R-03 | `SkillCreatorProgress` 型名が Preload 側と異なる名前で定義されている場合 | 低     | Preload 側の型定義を確認し、名称を統一するか型インポートを検討する            |
| R-04 | `TASK-SW-STRUCT-001` と同一ファイルを変更するため、書き込み競合のリスク  | 中     | `TASK-SW-STRUCT-001` 完了後に本タスクを開始する（直列実行を維持）             |

### Task 4: simpler alternative 検討

より単純な代替案を検討する。

**代替案**: `SkillCreatorService` のコンストラクタに `onProgress` を注入する（DI パターン）

- メリット: 各メソッド呼び出しごとにコールバックを渡す必要がない
- デメリット: コンストラクタ変更により既存の全テストでモック修正が必要になる。TASK-SW-STREAM-002 側での接続方法も複雑になる

**判断**: 現設計（メソッド引数として渡す）を採用する。オプショナル引数により後方互換性が保たれ、TASK-SW-STREAM-002 との接続も最小変更で済むため。

### Task 5: MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                                       | 解決予定Phase | 解決確認Phase | 備考                                 |
| --------- | -------------------------------------------------------------- | ------------- | ------------- | ------------------------------------ |
| TECH-M-01 | `collaborative` / `orchestrate` モードでは進捗通知が発火しない | 別タスク      | 別タスク      | 各モードへの進捗通知は別途設計が必要 |
| TECH-M-02 | コールバック内例外の扱いが未定義                               | Phase 5       | Phase 9/10    | 実装時にオプショナルチェーンで対応   |

## ゲート判定

**判定**: TBD（実施時に PASS / MINOR / MAJOR を判定する）

Phase 4 開始条件: ゲート判定が PASS または MINOR の場合のみ進行する。
MAJOR 判定の場合は Phase 2 へ差し戻す。

Phase 13 blocked 条件: ユーザー承認がない限り commit / push / PR を実行しない。

## 参照資料

- `outputs/phase-2/TASK-SW-STREAM-001-design.md` — レビュー対象（設計書）
- `outputs/phase-1/TASK-SW-STREAM-001-requirements.md` — AC 確認基準
- `apps/desktop/src/preload/skill-creator-api.ts` — `SkillCreatorProgress` 型確認
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` — `PHASE_TO_STAGE` マップ確認

## 統合テスト連携

- `createSkill()` の IPC 契約（チャンネル・引数・戻り値）に変更がないことを設計レビューで確認する
- TASK-SW-STREAM-002 が使用する `onProgress` の型・呼び出し仕様との整合性を確認する

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-STREAM-001-review.md | `outputs/phase-3/TASK-SW-STREAM-001-review.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-8）が設計でカバーされていることを確認した
- [ ] TASK-SW-STREAM-002 との接続整合性を確認した
- [ ] リスク台帳（R-01〜R-04）が作成されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] MINOR 追跡テーブルが作成されている
- [ ] ゲート判定が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（設計整合性チェック）を100%実行した
- [ ] Task 2（TASK-SW-STREAM-002 との接続設計確認）を100%実行した
- [ ] Task 3（リスク評価）を100%実行した
- [ ] Task 4（simpler alternative 検討）を100%実行した
- [ ] Task 5（MINOR 追跡テーブル）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-review.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
