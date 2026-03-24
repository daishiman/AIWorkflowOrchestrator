# UT-IMP-SESSION-DOCK-SHARE-RAIL-LAYOUT-001: Share Rail / Transcript レイアウト競合対策

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| 未タスクID | UT-IMP-SESSION-DOCK-SHARE-RAIL-LAYOUT-001                |
| 発見元     | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 Phase 11 DI-01 |
| 優先度     | 低                                                       |
| 分類       | UI/UX 改善                                               |
| 対応時期   | 実装タスク Phase 5 UI 実装時                             |

## 概要

transcript 展開時に Share Rail の表示位置が重なり、操作性が低下する可能性がある。sticky footer または上部移動で対応する。

## 対応方針

- transcript 展開時の Share Rail 表示位置を sticky footer or 上部移動で対応
- レスポンシブ対応（compact mode での Share Rail 位置調整）
- Apple HIG 準拠のレイアウト調整

## 対象ファイル

- Share Rail コンポーネント（実装タスクで確定）
- Transcript 表示コンポーネント（実装タスクで確定）

## 受入基準

- [ ] transcript 展開時に Share Rail が視認可能な位置に表示されている
- [ ] Share Rail の表示位置が sticky footer or 上部移動のいずれかで実装されている
- [ ] Apple HIG のスペーシング（8px グリッド）に準拠している
- [ ] provenance chip と 3操作 CTA が適切に配置されている

## 依存関係

- 親タスク: TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001
- 前提: Share Rail コンポーネントの基本実装（実装タスク Phase 5）

## 開発知見・苦戦箇所

- Phase 11 手動テスト計画で初めて発見された UI 競合。設計段階（Phase 2）では transcript と Share Rail の同時表示レイアウトが検討されておらず、実装段階で対応が必要になるパターン
- Apple HIG の sticky 要素配置ガイドライン（safe area、keyboard avoidance）を事前に確認しておくと実装がスムーズ

## 関連仕様書

- `docs/30-workflows/completed-tasks/step-02-seq-task-02-session-dock-artifact-bridge/outputs/phase-11/discovered-issues.md`
