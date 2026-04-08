# 要件定義書

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 1                                              |
| 作成日   | 2026-04-07                                     |

## 型定義確認（W0-seq-01 成果物）

`packages/shared/src/types/skillCreator.ts` より確認済み：

```typescript
// SkillInfoFormData（入力型）
export interface SkillInfoFormData {
  skillName?: string; // 任意入力
  purpose: string; // 必須
  category: SkillCategory | null; // 未選択時 null
}

// SmartDefaultResult（返り値型）
export interface SmartDefaultResult {
  who: string | null;
  input: string | null;
  timing: string | null;
  output: string | null;
  tool: string | null;
  format: string | null;
  inferenceLog?: string[]; // optional（実装では常に返す）
}

// SkillCategory
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";
```

## 機能要件

| 要件ID | 内容                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| FR-01  | `SkillInfoFormData` を入力として受け取り、`SmartDefaultResult` を返すこと                                              |
| FR-02  | purpose テキストから tool（slack/github/notion）を推論すること                                                         |
| FR-03  | purpose テキストから timing（scheduled/realtime）を推論すること                                                        |
| FR-04  | category から format（code/structured）を推論すること                                                                  |
| FR-05  | 推論根拠を `inferenceLog: string[]` に記録すること                                                                     |
| FR-06  | 推論対象キーワードが含まれない場合、該当フィールドを `null` で返すこと（`purpose` が空でも `category` は独立評価する） |
| FR-07  | 推論件数が0件でも `inferenceLog` は空配列 `[]` として返すこと                                                          |

## 非機能要件

| 要件ID | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| NFR-01 | TypeScript strict モードに準拠すること                                   |
| NFR-02 | `any` 型を使用しないこと                                                 |
| NFR-03 | 外部ライブラリへの依存なし（規則ベース実装のみ）                         |
| NFR-04 | `packages/shared/` に配置し、デスクトップ/Web 両方から利用可能であること |

## 推論ルール

| 入力フィールド     | 推論キーワード                             | 推論結果                              |
| ------------------ | ------------------------------------------ | ------------------------------------- |
| `purpose`          | "Slack" を含む                             | `tool = "slack"`                      |
| `purpose`          | "GitHub" を含む                            | `tool = "github"`                     |
| `purpose`          | "Notion" を含む                            | `tool = "notion"`                     |
| `purpose`          | "毎日"/"毎週"/"定期"/"スケジュール" を含む | `timing = "scheduled"`                |
| `purpose`          | "リアルタイム"/"即座"/"すぐに" を含む      | `timing = "realtime"`                 |
| `category`         | `"code-support"`                           | `format = "code"`                     |
| `category`         | `"data-analysis"`                          | `format = "structured"`               |
| 上記いずれも非該当 | -                                          | 各フィールド `null`（フォールバック） |
