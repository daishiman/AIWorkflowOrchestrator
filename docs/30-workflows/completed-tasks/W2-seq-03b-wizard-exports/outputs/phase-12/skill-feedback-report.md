# スキルフィードバックレポート（Phase 12）

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新
- 実施日: 2026-04-08

## 改善点

**検出件数: 1 件**

### 1. deprecated コンポーネントの barrel 依存を切る

| 項目 | 内容                                                                 |
| ---- | -------------------------------------------------------------------- |
| 分類 | コード品質 / 依存境界                                                |
| 対象 | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` |

**課題:**

`DescribeStep.tsx` が `GenerationMode` を `./index` から import していたため、deprecated コンポーネントが barrel を経由して再帰的に自身の公開面へ依存していた。

**改善:**

- `GenerationMode` の import 元を `./GenerateStep` に切り替えた
- deprecated ファイルを直接の実装元にだけ依存させ、公開 API の barrel への依存を外した

**効果:**

- barrel 依存の循環を避けやすくなる
- 将来 `index.ts` の export 契約をさらに絞る際の影響を小さくできる

## 今後のタスクへの推奨事項

- deprecated コンポーネントは公開 barrel ではなく、必要な実装元へ直接依存させる
- エクスポート契約テストでは runtime の存在確認と TypeScript の型確認を分離する
