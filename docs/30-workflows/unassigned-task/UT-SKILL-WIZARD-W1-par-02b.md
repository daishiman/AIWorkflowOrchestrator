# 未タスク指示書: UT-SKILL-WIZARD-W1-par-02b

## メタ情報

```yaml
issue_number: 2010
task_id: UT-SKILL-WIZARD-W1-par-02b
task_name: ConversationRoundStep コンポーネント実装（Step 1）
category: 改善
target_feature: skill-wizard/conversation-round-step
priority: 高
scale: 大規模
status: 未実施
created_date: 2026-04-07
dependencies: [UT-SKILL-WIZARD-W0-seq-01]
```

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W1-par-02b                                              |
| 由来       | UT-SKILL-WIZARD-W1-par-02a Phase 12 未タスク検出レポート（W2 引き継ぎ） |
| ステータス | unassigned                                                              |
| 優先度     | high                                                                    |
| 作成日     | 2026-04-07                                                              |
| 関連仕様書 | skill-wizard-redesign-lane/W1-par-02b-conversation-round-step/index.md  |

## 目的

スキル作成ウィザードの Step 1 として `ConversationRoundStep.tsx` を新規実装する。  
6問インタビュー形式（Q1〜Q6）でスキル設定を収集し、`SkillInfoStep`（Step 0）から引き継いだ `formData.category` を使って Q5「外部ツール連携」の必須/任意を制御する。

## 背景

W1-par-02a（SkillInfoStep）の実装で `formData.category` の型契約と伝達インターフェースが確立された。  
Step 1 への `formData` 引き継ぎおよび `external-integration` カテゴリ時の Q5 必須ロジック表示は、  
W1-par-02a のスコープ外として明示的に本タスク（W1-par-02b）へ委譲されている。

### 苦戦箇所（W1-par-02a より引き継ぎ）

- **Q5 必須化制御**: `formData.category` が `external-integration` のとき UI 上で Q5 を必須★表示する必要がある。  
  `SkillInfoStep` 側でカテゴリが確定するまで Q5 の必須フラグは不定のため、  
  `ConversationRoundStepProps` で `formData` をそのまま受け取り、レンダリング時に動的判定することが推奨。
- **Page 分割とバリデーション**: Q1〜Q3（Page 1）と Q4〜Q6（Page 2）に分割しつつ、  
  必須 Q5 が Page 2 に存在するため、Page 遷移ゲートと最終 Submit ゲートの2段階バリデーションが必要。

## 実行タスク

1. `ConfigureStep.tsx` を削除し `ConversationRoundStep.tsx` を新規作成する
2. 6問のインタビューフォーム（Q1〜Q6）を Page 1/2 の2ページ構成で実装する
3. `formData.category === "external-integration"` 時、Q5 に必須★バッジを表示する
4. Q3「定期実行」選択時、`SkillWizardScheduleConfig` 入力 UI をインライン展開する
5. 「今すぐ生成する」ボタンクリック時に適用サマリーカードを表示してから生成に進む
6. `SkillCreateWizard.tsx` の Step 1 を `ConversationRoundStep` に差し替える
7. `WizardOptions` 型エクスポートを `wizard/index.ts` から削除する（W2-seq-03b と調整）
8. ユニットテスト・スナップショットテストを作成する

## 参照資料

| 参照資料                                 | パス                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| W1-par-02b 詳細仕様書（index.md）        | docs/30-workflows/skill-wizard-redesign-lane/W1-par-02b-conversation-round-step/index.md     |
| W1-par-02a SkillInfoStep 実装            | apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx                          |
| 共有型定義（SkillInfoFormData 等）       | packages/shared/src/types/skillCreator.ts                                                    |
| UI/UX 仕様（ウィザード）                 | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-skill-analysis.md |
| W1-par-02a Phase 12 未タスク検出レポート | docs/30-workflows/W1-par-02a-skill-info-step/outputs/phase-12/unassigned-task-detection.md   |

## 受入基準

- [ ] `ConversationRoundStep.tsx` が実装され、Q1〜Q6 全問が動作する
- [ ] `formData.category === "external-integration"` 時、Q5 に必須★バッジが表示される
- [ ] Q5 が必須時、未入力のまま Submit できない
- [ ] Q3「定期実行」選択時、スケジュール設定 UI がインライン展開される
- [ ] Page 1（Q1〜Q3）→ Page 2（Q4〜Q6）の進捗バー「質問 N/6」が常時表示される
- [ ] `ConfigureStep.tsx` が削除されており、参照箇所が存在しない
- [ ] `SkillCreateWizard.tsx` が `ConversationRoundStep` を正しく使用している
- [ ] 既存の Step 0（SkillInfoStep）・Step 2 以降の動作が壊れていない
- [ ] ユニットテストがすべて PASS している

## 注意事項

- 並列実行可: `W1-par-02c-complete-step`、`W1-par-02d-lifecycle-panel` と同 Wave 1
- `ConversationAnswers` 型は `packages/shared/src/types/skillCreator.ts` に定義済み or 本タスクで追加要
- `SmartDefaultResult` 型が未定義の場合は本タスクで定義する
- Phase 13（PR 作成）はユーザー指示まで blocked 扱い
