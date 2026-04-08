# Phase 1: 要件定義 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 機能要件

| 要件ID | 内容                                                                      |
| ------ | ------------------------------------------------------------------------- |
| FR-01  | `SkillInfoFormData` を入力として受け取り、`SmartDefaultResult` を返すこと |
| FR-02  | purpose テキストから tool（slack/github/notion）を推論すること            |
| FR-03  | purpose テキストから timing（scheduled/realtime）を推論すること           |
| FR-04  | category から format（code/structured）を推論すること                     |
| FR-05  | 推論根拠を `inferenceLog: string[]` に記録すること                        |
| FR-06  | 推論対象キーワードが含まれない場合、該当フィールドを `null` で返すこと    |
| FR-07  | 推論件数が0件でも `inferenceLog` は空配列 `[]` として返すこと             |

## 非機能要件

| 要件ID | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| NFR-01 | TypeScript strict モードに準拠すること                                   |
| NFR-02 | `any` 型を使用しないこと                                                 |
| NFR-03 | 外部ライブラリへの依存なし（規則ベース実装のみ）                         |
| NFR-04 | `packages/shared/` に配置し、デスクトップ/Web 両方から利用可能であること |

## 型定義確認

`packages/shared/src/types/skillCreator.ts` より確認済み:

```typescript
export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory | null;
}

export interface SmartDefaultResult {
  who: string | null;
  input: string | null;
  timing: string | null;
  output: string | null;
  tool: string | null;
  format: string | null;
  inferenceLog?: string[];
}
```

## ステータス

完了 — 実行日: 2026-04-08
