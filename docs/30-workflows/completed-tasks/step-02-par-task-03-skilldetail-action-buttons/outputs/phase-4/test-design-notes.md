# Phase 4: テスト設計メモ

## 既存テストとの統合方針

- 既存の SkillDetailPanel.test.tsx に新規 describe ブロック「アクションボタンゾーン」を追加
- 既存の useSkillCenter.test.ts に TC-06/TC-07 を追加
- 既存テストの mock パターン（vi.fn(), vi.clearAllMocks()）を踏襲

## モックパターン

- SkillDetailPanel テスト: onEdit/onAnalyze を vi.fn() で定義し、fireEvent.click で呼び出しを検証
- useSkillCenter テスト: useAppStore のモックに setCurrentView/setCurrentSkillName を追加

## P39 準拠

- happy-dom 環境のため fireEvent を使用（userEvent 禁止）
