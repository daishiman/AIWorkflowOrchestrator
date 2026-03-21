# Phase 2 成果物: 設計概要

## メタ情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | UT-SLIDE-UI-001 |
| Phase    | 2 - 設計        |
| 作成日   | 2026-03-21      |

## 設計方針

### アーキテクチャ判断

1. **UI 層独立の状態型**: `SlideUIStatus` を `SyncStatus` から独立させ、`deriveSlideUIStatus()` で導出
2. **モック優先**: 未実装の store フィールド（`isHandoff`, `syncDirection`）はデフォルト値でフォールバック
3. **個別セレクタ**: P31/P48 対策として全セレクタを個別関数で定義
4. **Apple HIG 準拠**: CSS 変数でカラートークンを管理し、Light/Dark 両対応

### ファイル構成

```
apps/desktop/src/renderer/slide/
  types.ts                          # SlideUIStatus, GuidanceVariant, deriveSlideUIStatus
  selectors.ts                      # 個別セレクタ（P31/P48 対策）
  components/
    SlideSyncCard.tsx               # 同期状態カード
    SlideProgressRow.tsx            # 進捗行
    SlideWatchStatus.tsx            # 監視ステータス
    SlideGuidanceBlock.tsx          # ガイダンスブロック
    TerminalLauncher.tsx            # ターミナルランチャー
  SlideWorkspace.tsx                # 既存ファイル変更（再構成）
```

## SlideWorkspace 再構成

```
[現行]                          [新構造]
SlideWorkspace                  SlideWorkspace
+-- ヘッダー                    +-- ヘッダー（変更なし）
+-- [no project]                +-- [no project]（変更なし）
|   +-- open CTA               |   +-- open CTA
+-- [has project]               +-- [has project]
    +-- project info panel          +-- SlideSyncCard（project info 置換）
    |   +-- path                    |   +-- path + lastSyncedAt
    |   +-- SyncStatusIndicator     |   +-- SlideUIStatus badge
    +-- error alert                 |   +-- SlideWatchStatus
    +-- SkillPhasePanel             +-- SlideProgressRow（running 時のみ）
    +-- manual sync button          +-- SlideGuidanceBlock（degraded/guidance 時）
    +-- file info grid              +-- SkillPhasePanel（synced 時のみ）
                                    +-- file info grid（変更なし）
                                    +-- TerminalLauncher（右下固定）
```

## 条件レンダリング設計

```typescript
const uiStatus = useSlideUIStatus();

return (
  <div className="relative h-full">
    {/* 常時表示 */}
    <SlideSyncCard ... />

    {/* running 時のみ */}
    {uiStatus === "running" && <SlideProgressRow ... />}

    {/* degraded / guidance 時のみ */}
    {(uiStatus === "degraded" || uiStatus === "guidance") && (
      <SlideGuidanceBlock ... />
    )}

    {/* synced 時のみ: Phase 選択 */}
    {uiStatus === "synced" && <SkillPhasePanel ... />}

    {/* 常時表示: 右下固定 */}
    <TerminalLauncher ... />
  </div>
);
```
