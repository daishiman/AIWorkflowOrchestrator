# Phase 2 契約マッピング設計

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 2
- 入力: Phase 1成果物（GAP-01〜05, FR-02, NFR-03, NFR-05）
- ステータス: 完了（implementation_and_spec_sync）

## 目的

`skillName`（外部契約）と `skillId`（内部契約）の橋渡しルールを明文化し、変換境界と変換アルゴリズムを固定する。

## マッピング定義

| 契約層                    | フィールド       | 型       | 意味                                   | 由来                                     |
| ------------------------- | ---------------- | -------- | -------------------------------------- | ---------------------------------------- |
| Renderer/Preload          | `skillName`      | `string` | 人間可読なスキル名                     | UI入力 / SkillExecutionRequest.skillName |
| Main Handler (型ガード後) | `args.skillName` | `string` | isSkillNameRequest判定済みの値         | Preload経由                              |
| Main Handler (解決後)     | `skill.id`       | `string` | スキルメタデータから取得した一意識別子 | scanAvailableSkills() -> find()          |
| Service/Executor          | `skillId`        | `string` | 実行基盤のキー                         | Main Handler から受け取り                |

## 変換境界

- **変換実施箇所**: `skillHandlers.ts` L259-263（Main Handler内、Service呼び出し前）
- **変換方向**: skillName（外部） -> skillId（内部）の一方向のみ
- **逆変換**: 不要（Rendererには実行結果のみ返却）

## 変換アルゴリズム（現状の実装）

```typescript
// skillHandlers.ts L257-268（skillNameパス）
if (hasSkillName) {
  const { skills } = await skillService.scanAvailableSkills();
  const skill = skills.find((item) => item.name === args.skillName);
  if (!skill) {
    return { success: false, error: "スキルが見つかりません" };
  }
  const result = await skillService.executeSkill(skill.id, {
    prompt: args.prompt,
  });
  return { success: true, data: result };
}
```

### 改善計画

```typescript
// 推奨: getSkillByName を使用（SkillServiceに既存メソッド）
if (hasSkillName) {
  const skill = await skillService.getSkillByName(args.skillName);
  if (!skill) {
    return { success: false, error: "スキルが見つかりません" };
  }
  const result = await skillService.executeSkill(skill.id, {
    prompt: args.prompt,
  });
  return { success: true, data: result };
}
```

**改善理由**:

- `scanAvailableSkills()` は全スキルをファイルシステムからスキャンし直す可能性があり、性能コストが高い
- `getSkillByName()` はキャッシュ済みデータから名前検索するため効率的
- 既にSkillServiceに実装済みのメソッドを活用することで、責務の重複を排除

**注意事項（意味論的差異）**:

- `scanAvailableSkills()`: 全スキル（未インポート含む）を返す
- `getSkillByName()`: インポート済みスキルのみを検索
- 改善時はこのスコープ差異を検討し、テストの期待値も調整が必要

## エラー対応マッピング

| 条件                          | エラー種別                 | メッセージ                                     | 発生箇所         |
| ----------------------------- | -------------------------- | ---------------------------------------------- | ---------------- |
| skillNameが非文字列           | VALIDATION_ERROR (throw)   | "skillName must be a non-empty string"         | Handler L240-248 |
| skillNameが空文字/空白のみ    | VALIDATION_ERROR (throw)   | "skillName must be a non-empty string"         | Handler L240-248 |
| skillIdが非文字列/空文字/空白 | VALIDATION_ERROR (throw)   | "skillId must be a non-empty string"           | Handler L249-254 |
| skillName解決失敗（未検出）   | 業務エラー (return)        | "スキルが見つかりません"                       | Handler L261-263 |
| executeSkill実行失敗          | 業務エラー (return)        | エラーメッセージ or "スキル実行に失敗しました" | Handler L276-282 |
| sender検証失敗                | セキュリティエラー (throw) | toIPCValidationError(validation)               | Handler L225-230 |

### エラー処理パターンの非対称性

- **バリデーションエラー**: `throw` で例外送出（IPC経由でRenderer側にエラーとして伝播）
- **業務エラー**: `return { success: false, error: ... }` でオブジェクト返却
- この非対称性は既存の skill:import / skill:remove パターンと一貫している

## 互換性方針

| 変更対象                          | 方針                             | 理由                                                            |
| --------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| `SkillExecutionRequest` (Shared)  | 変更なし                         | Preload層の公開契約を維持                                       |
| `skill-api.ts` (Preload)          | 変更なし                         | `execute(request)` のシグネチャを維持                           |
| `skillHandlers.ts` (Main Handler) | 名前解決ロジックの改善のみ       | ユニオン型は維持、変換方法のみ変更                              |
| `SkillService` (Service)          | 変更なし                         | `executeSkill(skillId, params)` の契約を維持                    |
| テスト                            | 名前解決方法の変更に合わせて更新 | mockの呼び出し先が scanAvailableSkills -> getSkillByName に変更 |

## テスト観点への接続

| マッピング項目 | テスト観点                            | 対応テストID/ファイル                |
| -------------- | ------------------------------------- | ------------------------------------ |
| 名前解決成功   | skillName -> skillId 変換成功の検証   | TC-4-005 (execute.test.ts)           |
| 名前解決失敗   | 存在しないskillName -> エラーの検証   | TC-4-005 (execute.test.ts)           |
| エラー種別     | throw vs return の使い分け            | SH-EXE-V00~V06 (validation.test.ts)  |
| mock対象変更   | scanAvailableSkills -> getSkillByName | execute.test.ts（全skillNameパス系） |
| 委譲パス       | executeSkill(id, params) の正確性     | IT-002 (delegate.test.ts)            |

## 完了記録

- [x] 変換境界を明記（Main Handler内、Service呼び出し前）
- [x] 契約統一方針を明記（ユニオン型維持 + 正規入力はSkillExecutionRequest）
- [x] テスト観点への接続を明記（mock対象の変更点）
- [x] 実コードのスニペットと行番号を正確に反映
- [x] 意味論的差異（scanAvailableSkills vs getSkillByName）を記録
