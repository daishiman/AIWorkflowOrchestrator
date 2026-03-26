# Phase 9: 品質保証

## 目的

ユーザーが最初に全部を言語化しなくてよい UX になっているか確認する。

## 実行タスク

- question type と UI component の対応確認
- phase と surface の分離確認
- secret / free text / choice の扱い再点検

## 品質観点

- ユーザーは不足情報を段階的に埋められる
- AI の質問が UI 上で actionable に見える
- 最初から全要件入力を強制しない
- hidden input や auto-send を前提にしていない

## 公式照合観点

- approvals / user input の考え方と UI bridge が衝突していない
- `canUseTool` ベースの承認や質問導線を独自 UI に写経する際の責務が崩れていない

## 完了条件

- [ ] 段階的回答 UX が前提化されている
- [ ] question type と UI surface の対応が読める
- [ ] 安全入力と承認導線の境界が明確
- [ ] **本Phase内の全タスクを100%実行完了**
