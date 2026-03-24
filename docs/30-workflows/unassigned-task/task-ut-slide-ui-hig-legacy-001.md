# UT-SLIDE-UI-HIG-LEGACY-001: 既存 Slide コンポーネントの Apple HIG 統一

## メタ情報

```yaml
issue_number: 1578
```

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-SLIDE-UI-HIG-LEGACY-001         |
| 起源       | UT-SLIDE-UI-001 Phase 10 MINOR-004 |
| 優先度     | 低                                 |
| ステータス | 未着手                             |

## 指摘内容

スコープ外の既存ファイル（`SyncStatusIndicator.tsx`, `SkillPhasePanel.tsx`）に Tailwind gray / green クラスが残存しており、今回追加した Slide UI コンポーネントの Apple HIG 風トーンと一致しない。

## 対応方針

1. `SyncStatusIndicator.tsx` の `bg-green-500` 等を Apple HIG 色に変更
2. `SkillPhasePanel.tsx` の Tailwind gray を Apple HIG 中性灰に変更
3. `SlideWorkspace.tsx` の新規コンポーネントと視覚的に統一

## 関連タスク

- UT-SLIDE-UI-001（起源）
