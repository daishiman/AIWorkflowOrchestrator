# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| Phase名    | リファクタリング        |
| 対象機能   | TASK-SW-STREAM-FUP-03   |
| 前提Phase  | Phase 7: カバレッジ確認 |
| 次Phase    | Phase 9: 品質保証       |
| ステータス | 未実施                  |
| 作成日     | 2026-04-17              |

## 目的

progress flow 定義と emit helper を 1 箇所に寄せ、progress literal の重複を削除する。

## リファクタリング観点

### 1. progress flow 定義の重複排除

各 mode の progress literal は `PROGRESS_FLOW_BY_MODE` に集約し、private method や `createSkill()` の中に再記述しない。

### 2. emit helper の統一

```typescript
private emitProgressStep(
  step: SkillCreatorProgressStep,
  onProgress?: SkillCreatorProgressCallback,
): Promise<void> {
  onProgress?.(step.progress);
  return step.run();
}
```

**判断基準**: 3つ以上の mode で progress emission が共通化できる場合は helper を抽出する。1〜2箇所だけの重複ならインライン維持でもよい。

### 3. 命名整理

| 確認項目                 | 期待命名                   | 実際の命名 | 対応             |
| ------------------------ | -------------------------- | ---------- | ---------------- |
| フェーズ名（kebab-case） | `engine-selection`         | 実際の値   | 差異があれば修正 |
| 定数オブジェクト名       | `PROGRESS_FLOW_BY_MODE`    | 実際の名前 | UpperCase維持    |
| ワークフローメソッド名   | `runCollaborativeWorkflow` | 実際の名前 | 変更なし推奨     |

## リファクタリング禁止事項

- `create` モードのフェーズ定数・emitProgress 呼び出しを変更しない
- 既存テスト14件が PASS し続けることを各ステップ後に確認する

## 変更記録テンプレート

| 対象     | Before   | After    | 理由     |
| -------- | -------- | -------- | -------- |
| （記入） | （記入） | （記入） | （記入） |

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                                      | パス                                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-refactoring-record.md | `outputs/phase-8/TASK-SW-STREAM-FUP-03-refactoring-record.md` |

## 完了条件

- [ ] progress flow 定義の重複排除可否を判断した
- [ ] emit helper の抽出可否を判断した
- [ ] 命名の一貫性を確認・修正した
- [ ] 全テスト（既存14件 + 新規）が PASS し続けている
- [ ] 変更記録テーブルを作成した
- [ ] 成果物が生成されている

## タスク100%実行確認【必須】

- [ ] リファクタリング観点を全件確認した
- [ ] 変更記録テーブルを埋めた
- [ ] 全テスト PASS を確認した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
