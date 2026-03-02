# UT-UI-05A-IMPLEMENTATION-CLOSURE-001: SkillEditorView 実装収束 - タスク指示書

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-UI-05A-IMPLEMENTATION-CLOSURE-001         |
| タスク名     | SkillEditorView 実装残課題収束               |
| 分類         | 改善                                         |
| 対象機能     | SkillEditorView UI/UX                        |
| 優先度       | 高                                           |
| 見積もり規模 | 大規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | Phase 11 discovered-issues / Phase 12 再監査 |
| 発見日       | 2026-03-02                                   |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`views/SkillEditorView` のコンポーネント群とテストは存在するが、導線と操作性の未実装項目が残っている。

### 1.2 問題点・課題

以下7課題が未解決で、ユーザー体験と実運用導線が不足している。

- UT-UI-05A-001: FileTree キーボードナビゲーション
- UT-UI-05A-002: モバイルドロワー
- UT-UI-05A-003: Cmd/Ctrl+S
- UT-UI-05A-004: 保存成功Toast
- UT-UI-05A-005: 読み取り専用表示強化
- UT-UI-05A-006: ナビゲーション導線配線
- UT-UI-05A-007: マイクロアニメーション

### 1.3 放置した場合の影響

実装資産があるにもかかわらず利用不能状態が続き、機能価値を回収できない。

## 2. 何を達成するか（What）

### 2.1 目的

SkillEditorView をアプリ導線へ接続し、主要UX要件を満たした利用可能状態にする。

### 2.2 最終ゴール

AppDock または SkillCenter から SkillEditorView へ遷移でき、主要操作（選択・編集・保存・警告）が仕様どおり動作する。

### 2.3 スコープ

#### 含むもの

上記7課題、関連テスト、仕様同期、スクリーンショット再取得。

#### 含まないもの

`skill:getFileTree` 実装そのもの（別タスクで管理）。

### 2.4 成果物

- SkillEditorView 導線実装差分
- UI/UX改善差分
- 更新済み `manual-test-result.md` とスクリーンショット

## 3. どのように実行するか（How）

### 3.1 前提条件

`UT-UI-05A-GETFILETREE-001` の依存関係を理解していること。

### 3.2 依存タスク

`UT-UI-05A-GETFILETREE-001`（優先）。

### 3.3 必要な知識

React状態管理、アクセシビリティ属性、キーボードイベント、レスポンシブUI。

### 3.4 推奨アプローチ

導線配線を先に行い、その後操作性改善を段階投入して回帰テストを固定する。

## 4. 実行手順

### Phase構成

導線配線 → UX改善 → 検証/仕様同期の3フェーズ。

### Phase 1: 導線配線

#### 目的

SkillEditorView に到達可能な画面遷移を実装する。

#### 手順

1. `ViewType` / `AppDock` / `App.tsx` に `skill-editor` 導線を追加する。
2. `onClose` 時の戻り遷移を定義する。
3. 既存 View への影響がないことを確認する。

#### 成果物

導線実装差分。

#### 完了条件

UI操作で SkillEditorView へ遷移できる。

### Phase 2: UX改善

#### 目的

7課題のうち UI/操作性項目を実装する。

#### 手順

1. キーボード操作（Tree navigation, Save shortcut）を実装する。
2. モバイルドロワー/Toast/読み取り専用表示/マイクロアニメーションを実装する。
3. テストを追加し、回帰を防ぐ。

#### 成果物

改善実装差分とテスト差分。

#### 完了条件

対象テストがPASSし、手動検証で主要項目が確認できる。

### Phase 3: 検証と仕様同期

#### 目的

成果をワークフローと system specs に反映する。

#### 手順

1. 画面スクリーンショットを再取得する。
2. `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` を更新する。
3. 未完了分が残る場合は残課題テーブルを更新する。

#### 成果物

更新済み仕様書と証跡。

#### 完了条件

Phase 11/12成果物とシステム仕様の整合が取れている。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillEditorView 導線が実装される
- [ ] 上記7課題の実装結果が明示される

### 品質要件

- [ ] 関連テストがPASSする
- [ ] アクセシビリティ属性が確認できる

### ドキュメント要件

- [ ] `manual-test-result.md` と `discovered-issues.md` を更新する
- [ ] システム仕様書の状態記述を同期する

## 6. 検証方法

### テストケース

- SkillEditorView 遷移確認
- FileTree キーボード操作
- Cmd/Ctrl+S 保存
- モバイル幅でのドロワー挙動

### 検証手順

1. `pnpm vitest run src/renderer/views/SkillEditorView/__tests__`
2. `pnpm typecheck`
3. Playwright でダッシュボード/Editor/SkillEditor の画面証跡を取得

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                           |
| ---------------------------- | ------ | -------- | ------------------------------ |
| 導線追加で既存ナビが崩れる   | 高     | 中       | AppDock 回帰テストを追加       |
| UI改善を一括投入して不安定化 | 中     | 中       | 機能ごとに小分け実装し段階検証 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-editor-view/outputs/phase-11/discovered-issues.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- WCAG 2.1 Treeview pattern
- Apple HIG (Desktop navigation / Feedback)

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
SkillEditorView 実装ファイルは存在するが、導線未配線とUX不足で利用できない。
```

### 補足事項

7件の個別課題は本タスクのサブスコープとして管理し、完了時に `task-workflow.md` で一括クローズ可。
