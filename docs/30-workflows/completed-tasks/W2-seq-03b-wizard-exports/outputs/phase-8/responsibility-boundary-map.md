# 責務境界マップ（Phase 8）

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新

## 責務境界の概念

wizard ディレクトリ内のファイル構成を「パブリック API 契約」と「実装」の 2 層に分類する。

```
┌──────────────────────────────────────────────────────────┐
│               パブリック API 契約層                        │
│                                                          │
│   wizard/index.ts                                        │
│   ├── export { SkillInfoStep }                           │
│   ├── export type { SkillInfoStepProps }                 │
│   ├── export { StepIndicator }                           │
│   ├── export { GenerateStep }                            │
│   └── export { CompleteStep }                            │
│                                                          │
│   ※ DescribeStep / DescribeStepProps は削除済み           │
└──────────────────────────┬───────────────────────────────┘
                           │ re-export
┌──────────────────────────▼───────────────────────────────┐
│               実装層（コンポーネントファイル）               │
│                                                          │
│   SkillInfoStep.tsx      ← アクティブ（DescribeStep 後継）  │
│   StepIndicator.tsx      ← アクティブ                     │
│   GenerateStep.tsx       ← アクティブ                     │
│   CompleteStep.tsx       ← アクティブ                     │
│   DescribeStep.tsx       ← @deprecated（段階的廃止中）     │
│                             index.ts からは非公開          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 境界の役割

| 層                  | ファイル           | 役割                                                                         |
| ------------------- | ------------------ | ---------------------------------------------------------------------------- |
| パブリック API 契約 | wizard/index.ts    | 外部から利用可能なエクスポートを一元管理。ここに列挙されたものだけが公開 API |
| 実装                | 各 `.tsx` ファイル | 具体的なコンポーネント実装。index.ts を通じてのみ公開される                  |

## 変更による境界の変化

- 変更前: `DescribeStep` / `DescribeStepProps` が公開 API に含まれていた
- 変更後: `DescribeStep` / `DescribeStepProps` は公開 API から除外（実装ファイルは残存）
- 変更後: `SkillInfoStepProps` が公開 API に追加

## 設計原則

外部モジュールは `wizard/index.ts` のみを import することで、内部実装の変更から保護される（情報隠蔽）。
