# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 3                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 2                                 |
| 後続Phase  | Phase 4（PASS または MINOR の場合）     |
| 作成日     | 2026-04-15                              |
| ステータス | completed                               |

## 目的

Phase 2 の設計内容を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。
PASS/MINOR/MAJOR のいずれかを決定し、MINOR の場合は追跡テーブルに記録する。

## 実行タスク

- 設計一貫性チェック: 型・シグネチャ・呼び出しポイントが矛盾なく整合しているか
- AC 整合チェック: 設計が AC-1〜AC-5 を全て満たしているか
- 後方互換性チェック: オプショナル引数追加の影響範囲が管理可能か
- 型整合性チェック: `SkillCreatorProgressData` と `useStreamingProgress.ts` の期待型が一致するか
- TASK-SW-STREAM-002 接続インターフェースの妥当性チェック
- MINOR 追跡テーブル: 指摘事項があれば記録

## 参照資料

| 資料名                  | パス                                                          | 用途               |
| ----------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 1 成果物          | `outputs/phase-1/requirements-definition.md`                  | 要件・AC参照       |
| Phase 2 成果物          | `outputs/phase-2/design.md`                                   | 設計書参照         |
| useStreamingProgress.ts | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`     | 期待型との整合確認 |
| SkillCreatorService.ts  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 現行コード確認     |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                                                  | 判定基準                             | 結果 |
| --------------------------------------------------------------------------------------------- | ------------------------------------ | ---- |
| `SkillCreatorProgressData` が `{ phase: string; percentage: number; message: string }` で定義 | TypeScript で型エラーなし            | PASS |
| `createSkill()` の第2引数が `onProgress?: SkillCreatorProgressCallback` である                | シグネチャが設計通り                 | PASS |
| 5段階のコールバック呼び出しが処理フローの適切な順序で配置されている                           | `planning→generating-skill→...→done` | PASS |
| `onProgress?.()` のオプショナルチェーン呼び出しが全5箇所で使用されている                      | ガード付き呼び出しの確認             | PASS |

### 2. AC 整合チェック

| AC ID | 設計対応                                                                        | 充足判定 |
| ----- | ------------------------------------------------------------------------------- | -------- |
| AC-1  | `onProgress?: SkillCreatorProgressCallback` をシグネチャに追加する設計          | PASS     |
| AC-2  | `runCreateWorkflow` 開始直前に `planning` フェーズのコールバック呼び出しを配置  | PASS     |
| AC-3  | SKILL.md・エージェント定義・検証・完了の4段階で `onProgress?.()` を呼び出す設計 | PASS     |
| AC-4  | `onProgress` が `undefined` の場合、`onProgress?.()` がスキップされる設計       | PASS     |
| AC-5  | オプショナル引数のため既存テストのシグネチャ更新が不要な設計                    | PASS     |

### 3. 後方互換性チェック

```bash
# createSkill の全呼び出し元を確認（影響範囲の把握）
grep -rn "createSkill" apps/ packages/

# 既存テストでの createSkill 使用箇所確認
grep -rn "createSkill" apps/desktop/src/main/ipc/__tests__/
```

| チェック項目                                                            | 判定基準                         | 結果 |
| ----------------------------------------------------------------------- | -------------------------------- | ---- |
| `createSkill` の呼び出し元で第2引数なしの呼び出しが型エラーにならないか | オプショナル引数であることを確認 | PASS |
| 既存テストのモック設定に変更が不要か                                    | モック変更量が最小限             | PASS |

### 4. 型整合性チェック

```bash
# useStreamingProgress.ts の StreamingProgressApi.onProgress の引数型確認
grep -n -A 5 "onProgress" apps/desktop/src/renderer/hooks/useStreamingProgress.ts

# SkillCreatorProgress 型の定義確認
grep -rn "SkillCreatorProgress" apps/desktop/src/
```

| チェック項目                                                                | 判定基準         | 結果 |
| --------------------------------------------------------------------------- | ---------------- | ---- |
| `SkillCreatorProgressData.phase` が `string` 型（フロント側の期待型と一致） | 型が一致している | PASS |
| `SkillCreatorProgressData.percentage` が `number` 型                        | 型が一致している | PASS |
| `SkillCreatorProgressData.message` が `string` 型                           | 型が一致している | PASS |

### 5. TASK-SW-STREAM-002 接続インターフェースの妥当性チェック

| チェック項目                                                                       | 判定基準                                             | 結果 |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------- | ---- |
| `onProgress` コールバックが `sendSkillCreatorProgress` の第2引数型と互換性があるか | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` 送信型との整合 | PASS |
| TASK-SW-STREAM-002 が本タスク完了後に単独実施可能な粒度か                          | 依存関係が明確                                       | PASS |

### 6. レビュー判定基準

| 判定  | 条件                                                       | 次のアクション         |
| ----- | ---------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-5 の設計対応が充足    | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                 | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（型不整合・AC未充足・後方互換性の破壊） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例**:

- `SkillCreatorProgressData` の型が `useStreamingProgress.ts` の期待型と一致しない
- `onProgress` を必須引数にしてしまい既存呼び出し元に破壊的変更が生じる
- AC-1〜AC-5 のいずれかを設計が満たせない構造的欠陥がある

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 7. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

### 8. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [x] 総合判定が PASS または MINOR であること
- [x] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [x] MINOR の指摘事項が追跡テーブルに記録されていること

## 統合テスト連携【必須】

| 判定項目               | 基準     | 結果 |
| ---------------------- | -------- | ---- |
| 型チェック（設計段階） | PASS     | PASS |
| 後方互換性             | 破壊なし | PASS |

## 多角的チェック観点

| 観点           | チェック内容                                                                |
| -------------- | --------------------------------------------------------------------------- |
| 型設計妥当性   | `SkillCreatorProgressData` が将来の拡張（フェーズ追加）にも対応できるか     |
| 最小変更原則   | 設計変更が本タスクのスコープ（コールバック引数追加）に限定されているか      |
| テスト設計適合 | Phase 4 でテストを書きやすい設計（モック注入が容易）になっているか          |
| 接続整合       | TASK-SW-STREAM-002 との接続インターフェースが明確で二重実装のリスクがないか |

## 成果物

| 成果物           | パス                               | 説明                            |
| ---------------- | ---------------------------------- | ------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [x] 設計一貫性チェック（4項目）が完了
- [x] AC-1〜AC-5 の設計対応が確認済み
- [x] 後方互換性チェックが完了
- [x] 型整合性チェック（3項目）が完了
- [x] TASK-SW-STREAM-002 接続インターフェースの妥当性確認が完了
- [x] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [x] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [x] Phase 4 開始条件（PASS or MINOR）が充足されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 設計一貫性チェック（4項目）
2. AC 整合チェック（AC-1〜AC-5）
3. 後方互換性チェック（grep による影響範囲確認）
4. 型整合性チェック
5. TASK-SW-STREAM-002 接続インターフェース妥当性確認
6. 総合判定記録
7. MINOR 追跡テーブル記録（該当時）
8. 成果物の出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
