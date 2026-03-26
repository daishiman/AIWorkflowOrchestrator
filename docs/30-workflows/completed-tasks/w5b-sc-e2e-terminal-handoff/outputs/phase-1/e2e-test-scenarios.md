# E2E テストシナリオ定義書

## 概要

Skill Creator LLM統合の全フロー（plan → execute-plan → improve → TerminalHandoff）を検証する5つのE2Eテストシナリオを定義する。

---

## シナリオA: 正常フロー（plan → execute-plan → スキル生成）

### 対応AC/FR

- AC-1: 自然言語入力 → LLM がカテゴリベースでスキル一式を生成する
- AC-2: 生成スキルが `.claude/skills/` に永続化され即座に実行可能
- AC-6: verify - 生成スキルが要求を満たすかトータル検証できる
- FR-1: LLM によるスキル設計（plan）
- FR-2: スキルファイル生成・永続化（execute-plan）

### テスト手順

1. `skill-creator:plan` を正常なプロンプトで呼び出す
2. レスポンスが `IpcResult<RuntimeSkillCreatorPlanResponse>` 形式であることを検証
3. `planId`、`skillSpec`、`skillName` が非空であることを確認
4. 返却された `planId` と `skillSpec` を使い `skill-creator:execute-plan` を呼び出す
5. レスポンスが `IpcResult<RuntimeSkillCreatorExecuteResponse>` 形式であることを検証
6. `success: true` かつ `executeId`、`skillName` が返却されることを確認

### 期待結果

- plan: `{ success: true, data: { planId: string, skillSpec: string, skillName: string, ... } }`
- execute-plan: `{ success: true, data: { executeId: string, skillName: string, success: true } }`

---

## シナリオB: TerminalHandoff 経路（API Key 未設定）

### 対応AC/FR

- AC-4: API Key 未設定時は TerminalHandoffBundle + CLI コマンド表示
- FR-6: API Key 未設定時の TerminalHandoff 経路保証

### テスト手順

1. `skill-creator:plan` を `authMode: "api-key"`, `apiKey: null` で呼び出す
2. レスポンスの `data` が `{ type: "terminal_handoff", guidance: HandoffGuidance }` であることを検証
3. `HandoffGuidance` の構造を検証:
   - `terminalCommand`: 非空文字列、英数字で開始
   - `contextSummary`: 非空文字列
   - `reason`: 非空文字列
4. `terminalCommand` にシェルインジェクション文字（`;`, `|`, `&&`, `` ` ``）が含まれないことを確認

### 期待結果

```typescript
{
  success: true,
  data: {
    type: "terminal_handoff",
    guidance: {
      terminalCommand: "claude ...",  // 非空、英数字開始
      contextSummary: "...",          // 非空
      reason: "..."                   // 非空
    }
  }
}
```

---

## シナリオC: LLM エラー発生時の回復フロー

### 対応AC/FR

- AC-7: エラー時に適切なメッセージ表示
- NFR-4: LLMエラー後にアプリがクラッシュしないこと

### テスト手順

1. RuntimeSkillCreatorFacade の `plan()` がエラーをスローするようモックを設定
2. `skill-creator:plan` を呼び出す
3. レスポンスが `{ success: false, error: string }` 形式であることを検証
4. `error` がサニタイズされていることを確認（スタックトレース・ファイルパス・API Key が含まれない）
5. エラー後に同じチャネルへ再リクエストして正常レスポンスが返ることを確認（リトライ可能性）

### 期待結果

- エラー時: `{ success: false, error: "サニタイズ済みエラーメッセージ" }`
- リトライ時: `{ success: true, data: { ... } }`
- 注意: `error` は単純な `string` 型（`{ code, message }` ではない）。これは P60 修正後の仕様。

---

## シナリオD: improve 機能（フィードバック → 差分提案 → 適用）

### 対応AC/FR

- AC-5: improve - フィードバック → 差分提案 → 承認で適用
- FR-3: スキル改善（improve）

### テスト手順

1. `skill-creator:improve-skill` を `{ skillName, feedback, authMode, apiKey }` で呼び出す
2. レスポンスが `IpcResult<RuntimeSkillCreatorImproveResponse>` であることを検証
3. `suggestions` 配列に `{ section, before, after, reason }` 構造の提案が含まれることを確認
4. 返却された `suggestions` を使い `skill-creator:apply-improvement` を呼び出す
5. レスポンスが `IpcResult<ApplyImprovementResult>` であることを検証
6. `applied >= 1` であることを確認

### 期待結果

- improve: `{ success: true, data: { improveId: string, suggestions: [...] } }`
- apply: `{ success: true, data: { applied: number, skipped: number, skippedDetails: [], errors: [] } }`

---

## シナリオE: 後方互換（既存 skill:create チャンネル）

### 対応AC/FR

- AC-8: 既存 skill:create（テンプレート生成）が破壊されない
- NFR-3: 後方互換

### テスト手順

1. `skill:create` チャンネルにハンドラーが登録されていることを確認
2. 正常な引数（`name`, `description`, `mode` 等の CreateSkillOptions）で呼び出す
3. レスポンスが `IpcResult<string>` 形式であることを検証
4. 新しい `skill-creator:plan` チャンネルと共存していることを確認
5. 両チャンネルが同時に登録されている状態で、それぞれ独立して動作することを確認

### 期待結果

- `skill:create`: `{ success: true, data: "/path/to/skill" }` （既存動作を維持）
- `skill-creator:plan`: `{ success: true, data: { ... } }` （新規フローが共存）
