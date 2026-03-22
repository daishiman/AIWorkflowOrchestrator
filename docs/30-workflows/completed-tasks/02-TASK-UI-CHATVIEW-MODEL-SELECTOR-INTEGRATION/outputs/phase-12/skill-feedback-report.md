# Skill Feedback Report: TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION

## Date: 2026-03-22

## Feedback Items

### 1. task-specification-creator

**Observation**: Phase 4 仕様書で `data-testid="inline-model-selector"` の使用を想定していたが、実際のコンポーネントにはその属性が存在しなかった。テスト記述時にコンポーネントの実際の API（`role="combobox"`）に合わせて調整が必要だった。

**Suggestion**: Phase 4 テスト仕様書作成時に、対象コンポーネントの実際の data-testid / ARIA role を事前確認するステップを追加する。

### 2. aiworkflow-requirements

**Observation**: ChatView の既存テスト（ChatView.test.tsx, ChatView.guidance.test.tsx）が InlineModelSelector の Store セレクタをモックしていなかったため、統合後にテストが失敗した。

**Suggestion**: コンポーネント統合時の「テストモック波及」をチェックリストに追加する。新しいコンポーネントを既存ビューに追加する際、既存テストのモック更新が必要になるパターンとして P21/P35 の拡張版として記録する。

## Summary

- Total feedback items: 2
- Improvement areas: Test specification accuracy, Test mock propagation awareness
