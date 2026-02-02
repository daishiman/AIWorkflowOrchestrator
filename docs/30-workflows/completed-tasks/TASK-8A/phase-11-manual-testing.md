# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 11                 |
| Phase名    | 手動テスト検証     |
| 前提Phase  | Phase 10           |
| 後続Phase  | Phase 12           |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

テスト実行結果を手動で確認し、自動化では検出できない問題（テスト名の正確性、モックの妥当性、エッジケースの見落とし）を検証する。

## 背景

自動テストは定義された条件のみを検証するが、テストの意図と実装の乖離や、テスト自体のバグは手動確認でしか検出できない場合がある。

## 実行タスク

### Task 1: テスト実行結果の目視確認

**目的**: テスト実行結果を詳細に確認し、テストが意図通りに動作していることを検証する。

**実行手順**:

1. 以下のコマンドで詳細なテスト結果を出力する：
   ```bash
   pnpm --filter @repo/desktop vitest run --reporter=verbose \
     src/main/services/skill/__tests__/SkillScanner.test.ts \
     src/main/services/skill/__tests__/SkillImportManager.test.ts \
     src/main/services/skill/__tests__/SkillExecutor.test.ts \
     src/main/services/skill/__tests__/PermissionResolver.test.ts \
     src/renderer/store/slices/__tests__/skillSlice.test.ts
   ```
2. 以下の観点で目視確認する：
   - **テスト名の正確性**: テスト名が実際に検証している内容と一致しているか
   - **テスト数の整合性**: 44テストケースすべてが出力に含まれているか
   - **実行時間の偏り**: 特定テストに実行時間が集中していないか
   - **skip/pending**: スキップされているテストがないか
3. 結果を `outputs/phase-11/manual-test-result.md` に記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

### Task 2: モック妥当性検証

**目的**: モックが実際のモジュールの振る舞いを正しく模倣していることを手動で確認する。

**実行手順**:

1. 以下のモック設定を実装コードと突合する：

| モック対象                            | 確認ポイント                                        |
| ------------------------------------- | --------------------------------------------------- |
| `fs/promises` (SkillScanner)          | readdir/readFileの戻り値型が実際のNode.js APIと一致 |
| `electron-store` (SkillImportManager) | get/set/delete/hasの引数パターンが実際のAPIと一致   |
| `@anthropic-ai/claude-agent-sdk`      | query/createHooksの戻り値が実際のSDK仕様と一致      |
| `window.electronAPI.skill`            | 各メソッドのシグネチャがpreload定義と一致           |

2. モック戻り値がハードコーディングされている箇所で、実際のAPI仕様との乖離がないか確認する
3. 乖離があれば修正指示を記録する
4. 結果を `outputs/phase-11/manual-test-result.md` に追記する

### Task 3: エッジケース追加提案

**目的**: 現在のテストでカバーされていないエッジケースを特定し、改善提案を記録する。

**実行手順**:

1. 各モジュールの実装コードを再読し、以下の観点でエッジケースを検討する：
   - **並行処理**: 複数の非同期操作が同時に実行された場合
   - **状態遷移**: 不正な順序での操作（例: abort before execute）
   - **入力バリデーション**: null, undefined, 空オブジェクトの入力
   - **メモリリーク**: リスナーやタイマーの解放漏れ
2. 検出されたエッジケースを以下の形式で記録する：
   - 対象モジュール
   - エッジケースの説明
   - 推奨テストケース（実装は不要、記録のみ）
   - スコープ（TASK-8A内で対応 / 未タスクとして記録）
3. 結果を `outputs/phase-11/manual-test-result.md` に追記する
4. スコープ外の発見課題がある場合は `outputs/phase-11/discovered-issues.md` に分離して記録する（0件の場合は作成不要）

## 参照資料

| 参照資料         | パス                                                         | 説明            |
| ---------------- | ------------------------------------------------------------ | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                    | レビュー指摘    |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                  | テスト実装内容  |
| スキル管理IF     | aiworkflow-requirements `interfaces-agent-sdk-skill.md`      | 型定義・API仕様 |
| Phase 11ガイド   | task-specification-creator `references/phase-11-12-guide.md` | 詳細ガイド      |

## 成果物

| 成果物         | パス                                     | 説明                           |
| -------------- | ---------------------------------------- | ------------------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 目視確認・モック検証・提案記録 |

## 統合テスト連携

- 手動テストで発見されたエッジケースのうち、統合テスト（TASK-8B, TASK-8C）の範囲に該当するものは統合テスト側に提案として記録する
- IPC通信に関連するエッジケースは統合テストの範囲として明示する

## 完了条件

- [ ] 44テストケースすべてが verbose 出力で確認されている
- [ ] スキップされているテストがないことを確認している
- [ ] 5モジュールすべてのモック妥当性が検証されている
- [ ] エッジケース追加提案が記録されている（0件の場合も明記）
- [ ] 手動テスト結果が `outputs/phase-11/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 11 \
  --artifacts "outputs/phase-11/manual-test-result.md:手動テスト結果"
```

## 依存関係

| 項目      | 内容     |
| --------- | -------- |
| 前提Phase | Phase 10 |
| 後続Phase | Phase 12 |

## 次のPhase

→ [phase-12-documentation.md](phase-12-documentation.md)
