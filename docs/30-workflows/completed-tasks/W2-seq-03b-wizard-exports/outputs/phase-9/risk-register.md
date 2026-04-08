# リスク台帳（Phase 9）

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新
- 実施日: 2026-04-08

## リスク一覧

### リスク 1: DescribeStep.tsx の残存参照

| 項目       | 内容     |
| ---------- | -------- |
| リスクID   | RISK-001 |
| 影響度     | 低       |
| 発生確率   | 低       |
| 総合リスク | 低       |

**説明:**
`DescribeStep.tsx` ファイルは物理的に削除されず、`@deprecated` マークのみ付与されている。
将来的に誰かが `wizard/index.ts` を経由せず `DescribeStep.tsx` を直接 import する可能性がある。

**対策:**

- `DescribeStep.tsx` に `@deprecated` JSDoc を付与し、使用を非推奨とした
- `wizard/index.ts` からエクスポートを削除することで、公開 API 経由では参照不可とした
- ファイルの物理削除は別タスク（W2 以降）として計画済み

**将来の対応:**
`DescribeStep.tsx` の物理削除タスクを W2 以降のスコープで実施する。

---

### リスク 2: @deprecated マークの周知不足

| 項目       | 内容     |
| ---------- | -------- |
| リスクID   | RISK-002 |
| 影響度     | 低       |
| 発生確率   | 低       |
| 総合リスク | 低       |

**説明:**
`@deprecated` マークが付与されていても、IDE の警告表示に気づかない開発者が直接 import する可能性がある。

**対策:**

- `@deprecated` JSDoc に代替コンポーネント（`SkillInfoStep`）への移行案内を記載
- 本タスク仕様書・実装ガイドに変更内容を明記

## 残存リスクの総合評価

全リスクが「低」であり、現時点での対応は完了している。
`DescribeStep.tsx` の物理削除は将来タスクで対応予定。
