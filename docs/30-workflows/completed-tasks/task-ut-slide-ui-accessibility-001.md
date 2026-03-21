# UT-SLIDE-UI-ACCESSIBILITY-001: Slide UI アクセシビリティ改善

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスクID   | UT-SLIDE-UI-ACCESSIBILITY-001          |
| 起源       | UT-SLIDE-UI-001 Phase 10 MINOR-001/002 |
| 優先度     | 中                                     |
| ステータス | 解消済み（2026-03-21）                 |

## 解消内容

### MINOR-001: focus:ring 未設定 → 解消

`SlideProgressRow` / `SlideGuidanceBlock` / `TerminalLauncher` / `SlideWorkspace` close button に `focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2` を追加した。

### MINOR-002: synced バッジのコントラスト比不足 → 解消

`SlideSyncCard` の synced badge を黒文字へ変更し、視認性を改善した。

## 現在の扱い

追加作業は不要。履歴保持のためファイルは残す。

## 関連タスク

- UT-SLIDE-UI-001（起源）
