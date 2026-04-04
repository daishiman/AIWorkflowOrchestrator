# Phase 8 出力: リファクタリング

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### 実施内容

リファクタリング対象なし。

理由:

- 変更規模が小さい（CTA ボタン 1 件・スタイル 1 件の追加）
- 既存パターン（viewStyles / data-testid / data-route-kind）を踏襲
- 責務境界は設計段階で整理済み

### コード品質確認

- `headerCtaSecondary` は `headerCta` と対称的なスタイル定義
- `navigateToSkillManagement` は既存 navigate 関数と同一パターン
- `data-testid="header-row"` 追加により TC-CTA-08 のテスト堅牢性向上
