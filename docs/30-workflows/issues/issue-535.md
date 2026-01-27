# [#535] "[TASK-WCE-FILE-SIZE-UI-001] ファイルサイズ警告UI実装"

## メタ情報

```yaml
task_id: TASK-WCE-FILE-SIZE-UI-001
task_name: ファイルサイズ警告UI実装
category: 改善
target_feature: workspace-chat-edit/FileAttachmentButton
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12（TASK-WCE-UI-001）
created_date: 2026-01-27
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-workspace-chat-edit-file-size-warning-ui.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-WCE-UI-001（Issue #494）でFileAttachmentButtonコンポーネントを実装した際、ファイルサイズのバリデーション（最大10MB）は実装されているが、ユーザーへの視覚的な警告UIは未実装である。現在はコンソールログまたはエラー時のみ通知される。

### 1.2 問題点・課題

| 項目               | 現状         | 課題                                       |
| ------------------ | ------------ | ------------------------------------------ |
| ファイルサイズ表示 | なし         | ユーザーがファイルサイズを確認できない     |
| 警告表示           | エラー時のみ | 事前警告がない                             |
| 進捗表示           | なし         | 大きいファイル選択時のフィードバックがない |

### 1.3 放置した場合の影響

- ユーザーが大きなファイルを選択した際、なぜ添付できないか分かりにくい
- UXの一貫性が損なわれる
- ユーザーが試行錯誤する時間が増加

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイル添付時にファイルサイズを視覚的に表示し、制限に近づいた場合に警告を表示する。

### 2.2 最終ゴール

- FileContextBadgeにファイルサイズを表示
- 制限の80%以上で警告色表示
- 制限超過時にエラーメッセージをインライン表示

### 2.3 スコープ

#### 含むもの

- FileContextBadgeへのファイルサイズ表示追加
- 警告色（黄色）・エラー色（赤）のスタイル追加
- aria-liveによるスクリーンリーダー対応

#### 含まないもの

- ファイル圧縮機能
- ファイルサイズ制限の変更
- バックエンド側の変更

### 2.4 成果物

| 成果物                   | 配置先                                                               |
| ------------------------ | -------------------------------------------------------------------- |
| FileContextBadge.tsx更新 | `apps/desktop/src/renderer/features/workspace-chat-edit/components/` |
| テスト追加               | `__tests__/FileContextBadge.test.tsx`                                |
| Storybook更新            | `stories/FileContextBadge.stories.tsx`                               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-WCE-UI-001（Issue #494）が完了していること
- FileContextBadgeコンポーネントが存在すること

### 3.2 依存タスク

| タスク          | 状態 |
| --------------- | ---- |
| TASK-WCE-UI-001 | 完了 |

### 3.3 必要な知識

- React / TypeScript
- Tailwind CSS
- WCAG 2.1 AAアクセシビリティ要件
- Zustand状態管理

### 3.4 推奨アプローチ

1. FileContext型にfileSize属性を追加（既存の場合は確認）
2. FileContextBadgeにサイズ表示コンポーネントを追加
3. 警告ロジック（80%閾値）を実装
4. アクセシビリティ対応（aria-live）

---

## 4. 実行手順

### Phase構成

| Phase | 名称       | 成果物                       |
| ----- | ---------- | ---------------------------- |
| 1     | 要件定義   | requirements.md              |
| 2     | 設計       | design.md                    |
| 4     | テスト作成 | FileContextBadge.test.tsx    |
| 5     | 実装       | FileContextBadge.tsx         |
| 6     | Storybook  | FileContextBadge.stories.tsx |

### Phase 5: 実装

#### 目的

FileContextBadgeにファイルサイズ表示と警告機能を追加

#### 手順

1. FileContext型にfileSize属性があることを確認
2. formatFileSize関数を作成（B/KB/MB単位自動変換）
3. FileSizeIndicatorコンポーネントを作成
4. 警告色ロジックを実装（80%以上で黄色、100%超で赤）
5. aria-liveリージョンを追加

#### 成果物

FileContextBadge.tsx（更新）

#### 完了条件

- [ ] ファイルサイズが表示される
- [ ] 8MB以上で警告色になる
- [ ] 10MB超でエラー色になる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイルサイズがB/KB/MB単位で表示される
- [ ] 80%閾値で警告色（黄色）が表示される
- [ ] 100%超でエラー色（赤）が表示される

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] axe-coreでアクセシビリティ違反なし
- [ ] Storybookで全状態を確認可能

### ドキュメント要件

- [ ] 実装ガイド更新
- [ ] システム仕様書更新（ui-ux-feature-components.md）

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ           | 期待結果                     |
| ------ | ------------------ | ---------------------------- |
| TC-001 | 1KBファイル表示    | "1 KB"と表示                 |
| TC-002 | 8MBファイル表示    | 警告色で表示                 |
| TC-003 | 11MBファイル表示   | エラー色で表示               |
| TC-004 | スクリーンリーダー | サイズと警告が読み上げられる |

### 検証手順

1. Storybookで各状態を視覚確認
2. 自動テスト実行
3. VoiceOverでアクセシビリティ確認

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                   |
| ------------------ | ------ | -------- | ---------------------- |
| パフォーマンス低下 | 低     | 低       | React.memoで最適化済み |
| 既存UIとの整合性   | 中     | 低       | デザインレビューで確認 |

---

## 8. 参照情報

### 関連ドキュメント

- [ui-ux-feature-components.md](/.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md) - 既存コンポーネント仕様
- [workspace-chat-edit-ui実装ガイド](/docs/30-workflows/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md)

### 参考資料

- WCAG 2.1 AAガイドライン
- Apple Human Interface Guidelines

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 12将来の改善候補として記録:
- ファイルサイズ警告UI: 現在はバリデーションのみ
```

### 補足事項

本タスクは優先度「低」のため、他の高優先度タスク完了後に実施を検討する。
