# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001  |
| 機能名     | skill-wizard/resolve-external-integration |
| 前提Phase  | Phase 2                                   |
| 後続Phase  | Phase 4                                   |
| 作成日     | 2026-04-15                                |
| ステータス | pending                                   |

## 目的

Phase 4（テスト作成）・Phase 5（実装）へ進めるかのゲート判定を行う。Phase 2 で確定した設計の AC 整合性・実現可能性・リスクを検証し、設計の承認または修正指示を出す。

## 実行タスク

- AC 整合性チェック: Phase 2 設計が AC-1〜AC-7 をすべて満たしているか検証
- 実現可能性確認: Promise.all 並列取得・マージ戦略・フォールバック設計が既存コードと整合しているか確認
- リスク評価: 後方互換性・テストカバレッジ90%達成・バッジ削除の影響範囲を評価
- ゲート判定: Phase 4 へ進む / 設計を修正して Phase 2 に差し戻す、の判定

## 参照資料

| 資料名                          | パス                                                                                         | 用途                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 成果物                  | `outputs/phase-1/requirements-definition.md`                                                 | AC-1〜AC-7 の原本参照                  |
| Phase 2 設計書                  | `outputs/phase-2/design.md`                                                                  | レビュー対象の設計内容                 |
| resolveExternalIntegration 実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | 現状コードとの整合性確認               |
| 対象コンポーネント              | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | バッジ削除対象の実装確認               |
| テストファイル                  | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 削除対象テスト（TC-1〜TC-6）の実態確認 |

## 実行手順

### 1. AC 整合性チェック

Phase 2 設計と各 AC の対応を検証する。

| AC   | 受け入れ基準                                                        | Phase 2 対応設計                                      | 整合性 |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| AC-1 | `string[]` 受け取り・複数ツール並列処理                             | Promise.all による並列取得（案A採用）                 | -      |
| AC-2 | 各ツールの統合情報（API エンドポイント・認証方式・主要操作）マージ  | flatMap + Set による重複排除マージ戦略                | -      |
| AC-3 | 単一ツール選択時は従来と同一の動作（後方互換性）                    | `toolNames.length === 1` の単一パス保持               | -      |
| AC-4 | 空配列・未対応ツールに対する安全なフォールバック                    | `[]` → 空の merged object 返却、未対応 → 結果から除外 | -      |
| AC-5 | `SkillCreateWizard.tsx` の呼び出し箇所が `selectedOptions` 全体渡し | M-01 TODO 箇所を `selectedOptions` 全体渡しに更新     | -      |
| AC-6 | テストカバレッジ 90% 以上                                           | TC-1〜TC-10（10ケース）で Line/Branch/Function を網羅 | -      |
| AC-7 | M-01 TODO コメントが削除される                                      | Phase 5 実装時に TODO コメント削除を明示              | -      |

#### チェックコマンド

```bash
# AC-1: Promise.all パターンが型的に問題ないか確認
grep -n "Promise.all\|Promise\.allSettled" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# AC-5: 呼び出し箇所の型が string[] に対応しているか確認
grep -n "resolveExternalIntegration\|selectedOptions" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# AC-7: M-01 TODO の存在確認
grep -n "M-01\|TODO.*resolveExternal" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 2. 実現可能性確認

#### 2-1. 既存コードとの整合性

| 確認項目                           | 確認内容                                                         | 判定 |
| ---------------------------------- | ---------------------------------------------------------------- | ---- |
| `MergedExternalIntegration` 型定義 | flatMap でマージする各フィールドが配列型であるか確認             | -    |
| `ExternalToolIntegration` 型定義   | 個別ツールの統合情報が正規化されているか確認                     | -    |
| `fetchToolIntegrationInfo` 関数    | 関数が存在する場合、Promise を返す非同期関数かどうか確認         | -    |
| `selectedOptions` の型             | `SkillCreateWizard.tsx` で `string[]` 型が付与されているか確認   | -    |
| バッジ削除の副作用                 | `MAIN_TOOL_BADGE_ENABLED` フラグ削除後に型エラーが生じないか確認 | -    |

```bash
# MergedExternalIntegration / ExternalToolIntegration 型定義の確認
grep -n "MergedExternalIntegration\|ExternalToolIntegration\|type.*Integration\|interface.*Integration" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# selectedOptions の型確認
grep -n "selectedOptions.*:\|selectedOptions.*string" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

#### 2-2. テストカバレッジ達成の実現可能性

| テストケース数 | 対象ブランチ                             | カバレッジ見込み |
| -------------- | ---------------------------------------- | ---------------- |
| TC-1〜TC-2     | Promise.all 並列処理パス                 | Line +15%        |
| TC-3           | 後方互換パス（`tools.length === 1`）     | Branch +10%      |
| TC-5〜TC-6     | 空配列・未対応ツールのフォールバックパス | Branch +20%      |
| TC-7〜TC-8     | 部分失敗・全失敗のフォールバックパス     | Branch +15%      |
| TC-9           | 重複排除パス                             | Line +10%        |
| TC-10          | mergeIntegrations の全ブランチ           | Branch +10%      |
| **合計見込み** | -                                        | **90%+**         |

### 3. リスク評価

| リスク項目                     | リスク内容                                                            | 対策                                                                      | 重大度 |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| 後方互換性破壊                 | `string` → `string[]` 変更で呼び出し箇所の型エラーが発生する可能性    | Phase 5 実装前に型チェックを実施（`pnpm typecheck`）                      | 高     |
| テストカバレッジ未達           | 90% 未達の場合、AC-6 不合格                                           | TC-1〜TC-10 に加え、追加テストケースを Phase 4 で設計                     | 中     |
| バッジ削除による UI テスト破損 | TC-1〜TC-6 削除後に `ConversationRoundStep.test.tsx` が失敗する可能性 | 削除前に既存テスト全件通過を確認してから削除を実施                        | 低     |
| Promise.all エラー伝播         | 個別取得失敗で `Promise.all` が reject する可能性                     | 全ての `fetchToolIntegrationInfo` 呼び出しに catch を付与し、失敗分を除外 | 中     |
| M-01 TODO の削除漏れ           | AC-7 未達（コメント残存）                                             | `grep` で全件確認後に削除（Phase 5 完了条件に組み込む）                   | 低     |

### 4. ゲート判定

#### 判定基準

| 判定項目                         | 基準                                                                           | 結果 |
| -------------------------------- | ------------------------------------------------------------------------------ | ---- |
| AC-1〜AC-7 と Phase 2 設計の整合 | 全 AC が Phase 2 設計で対応されている                                          | -    |
| 既存コードとの型整合性           | `MergedExternalIntegration` / `ExternalToolIntegration` が配列フィールドを持つ | -    |
| テストカバレッジ 90% 達成見込み  | TC-1〜TC-10 で 90% 以上が見込める                                              | -    |
| バッジ削除の影響範囲             | `ConversationRoundStep.tsx` 内に局所化されている                               | -    |
| リスク対策の妥当性               | 高リスク項目に具体的な対策が定義されている                                     | -    |

#### 判定フロー

```
全判定項目が PASS
  → Phase 4（テスト作成）へ進む

1件以上が FAIL
  → 該当箇所を修正して Phase 2 に差し戻す
```

## 統合テスト連携【必須】

| 判定項目         | 基準 | 結果 |
| ---------------- | ---- | ---- |
| AC整合性チェック | PASS | -    |
| 実現可能性確認   | PASS | -    |
| リスク評価完了   | PASS | -    |

## 成果物

| 成果物           | パス                               | 説明                                         |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | AC整合性・実現可能性・リスク評価・ゲート判定 |

## 完了条件

- [ ] AC-1〜AC-7 と Phase 2 設計の整合性チェックが完了済み
- [ ] `MergedExternalIntegration` / `ExternalToolIntegration` 型定義の確認が完了済み
- [ ] `selectedOptions` の型（`string[]`）の確認が完了済み
- [ ] テストカバレッジ 90% 達成の見込みが確認済み
- [ ] バッジ削除の影響範囲（`ConversationRoundStep.tsx` 内局所化）が確認済み
- [ ] 5項目のリスク評価が完了済み
- [ ] ゲート判定（Phase 4 進行 / Phase 2 差し戻し）が実施済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. AC 整合性チェック（AC-1〜AC-7 の全件検証）
2. 既存コードとの型整合性確認
3. テストカバレッジ達成の実現可能性評価
4. リスク評価（5項目）
5. ゲート判定の実施
6. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 4: テスト作成
