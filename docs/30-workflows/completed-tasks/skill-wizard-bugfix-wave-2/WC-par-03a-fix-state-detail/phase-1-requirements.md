# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 1                            |
| Phase名    | 要件定義                     |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | -                            |
| 次Phase    | Phase 2: 設計                |
| ステータス | pending                      |
| 作成日     | 2026-04-12                   |

## 目的

スキルウィザードの4件の詳細バグ（問題12・13・18・19）を受入条件として固定し、
修正スコープと検証可能な完了基準を定義する。

## 実行タスク

### Task 1: 問題の固定

- 問題12: `ConversationRoundStep`のuseEffectが`answers` propの変化を監視しておらず、リトライ時に`internalAnswers`が前回値を保持したまま残留する事実を記録する
- 問題13: templateモードでエラー発生後にウィザードをStep 0に戻す手段がUIに存在しない事実を記録する
- 問題18: `SkillCreateWizard`でq5が変更されても`resolveExternalIntegration`が再呼び出しされず、`hasExternalIntegration`と`externalToolName`が古い値のままになる事実を記録する
- 問題19: `generationLockRef`のfinally節でのリセット条件が不完全なため、キャンセル後にロックが`true`のまま残り、以降の生成操作が不能になる潜在的バグを記録する

### Task 2: 受入条件の確定

- AC-1: リトライ時にConversationRoundStepのinternalAnswersが前回値でなく空値にリセットされる
- AC-2: templateモードのエラー時にキャンセルボタンが表示され、Step 0に戻れる
- AC-3: q5変更後にhasExternalIntegrationとexternalToolNameが最新値で再計算される
- AC-4: generationLockRefがキャンセル後に正しくfalseに戻り、次の生成操作が可能になる
- AC-5: 既存の正常フロー（リトライなし・キャンセルなし）に回帰影響がない

### Task 3: スコープ境界

- 含む: ConversationRoundStep・GenerateStep・SkillCreateWizardのRenderer実装修正、対応するユニットテスト
- 含まない: Step 0〜Step 1以外のウィザードフロー変更、Main Process実装修正、IPC契約変更、PR作成

## 参照資料

| 資料名               | パス                                                                          | 説明                 |
| -------------------- | ----------------------------------------------------------------------------- | -------------------- |
| ウィザード実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 問題18・19の発生箇所 |
| Step 1コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 問題12の発生箇所     |
| 生成ステップ         | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | 問題13の発生箇所     |
| バグ修正ウェーブ     | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                         | 問題番号の一覧・背景 |

## 統合テスト連携

- Phase 4でリトライ時のinternalAnswersリセットシナリオを先に定義する
- Phase 10でAC-1〜AC-5とテストの対応表を再確認する

## 成果物

| 成果物     | パス                                         | 説明                     |
| ---------- | -------------------------------------------- | ------------------------ |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義、受入条件、境界 |

## 完了条件

- [ ] 4件の問題が個別に問題文として固定されている
- [ ] AC-1〜AC-5が検証可能な形で定義されている
- [ ] 含む/含まないが明確である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
