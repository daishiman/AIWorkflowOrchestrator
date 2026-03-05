# UT-UI-01-PLACEHOLDER-GUIDANCE-001 Workspace/HistorySearch プレースホルダ導線改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-UI-01-PLACEHOLDER-GUIDANCE-001                            |
| タスク名     | Workspace/HistorySearch プレースホルダの次アクション導線追加 |
| 分類         | 改善                                                         |
| 対象機能     | TASK-UI-01-STORE-IPC-ARCHITECTURE                            |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 11 手動テスト（Apple UI/UX視覚検証）                   |
| 発見日       | 2026-03-05                                                   |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`WorkspaceView` と `HistorySearchView` はプレースホルダ表示のみで、次に何をすべきかが視覚的に伝わりにくい。

### 1.2 問題点・課題

- 空状態の説明が抽象的で、操作導線が不足している
- 初回利用者が「この画面で何ができるか」を理解しづらい

### 1.3 放置した場合の影響

機能自体が未実装に見え、利用継続率や探索性が下がる。

## 2. 何を達成するか（What）

### 2.1 目的

プレースホルダ画面に明確な次アクション導線を追加し、利用開始を促進する。

### 2.2 最終ゴール

- Workspace/HistorySearch で次操作が明示される
- 空状態でも「何をすればよいか」が 5 秒以内に理解できる

### 2.3 スコープ

#### 含むもの

- プレースホルダ文言の改善
- CTA（ボタン/リンク）追加
- 空状態UIの軽微なレイアウト改善

#### 含まないもの

- 本機能の本実装（検索/履歴取得ロジック）
- 新規 IPC 追加

### 2.4 成果物

- `WorkspaceView` / `HistorySearchView` UI改善差分
- テスト追加または更新
- 画面証跡

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現行のプレースホルダビュー構造を把握済みであること
- 遷移可能な既存画面（SkillCenter, Dashboard など）が定義済みであること

### 3.2 依存タスク

- TASK-UI-01-STORE-IPC-ARCHITECTURE（完了）

### 3.3 必要な知識

- 空状態（Empty State）設計
- App の View 遷移実装（`setCurrentView`）

### 3.4 推奨アプローチ

導線は 1 画面 1 主CTA を原則とし、情報過多を避ける。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                       | 発見経緯                                                         | 解決策                                                                             | 教訓                                                    |
| -------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 検証コマンド経路のドリフト | Phase 12 再監査でグローバルCLI依存だと環境差分で停止しやすかった | `node .claude/skills/task-specification-creator/scripts/*.js` で実体経路を固定する | 再監査手順はローカル実体パスを正本にする                |
| 画面証跡時刻の同期漏れ     | プレースホルダ導線の再撮影後、証跡時刻が成果物間でずれやすかった | `manual-test-result.md` / `screenshot-coverage.md` / 台帳を同一時刻で更新する      | UI改善タスクは「証跡時刻の同期」を必須チェック化する    |
| 再撮影後の残留プロセス     | `vite` / `capture-*` 残留で次の検証に影響するケースがあった      | 再撮影後に `ps -ef` を確認し不要プロセスを停止する                                 | 視覚検証は cleanup まで完了して初めて再現性が担保される |

## 4. 実行手順

### Phase構成

1. 文言設計
2. UI実装
3. テスト/手動検証
4. 仕様同期

### Phase 1: 実装

#### 目的

プレースホルダに実行可能な次アクションを追加する。

#### 手順

1. Workspace/HistorySearch に説明文とCTAを追加する。
2. CTA押下時に適切な遷移を行う。
3. UIテストを追加して文言・導線を保証する。

#### 成果物

改善UI + テスト差分

#### 完了条件

両画面で次アクションが明確に表示され、操作可能であること。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Workspace の空状態に CTA が表示される
- [ ] HistorySearch の空状態に CTA が表示される
- [ ] CTA で意図した遷移が実行される

### 品質要件

- [ ] 関連テストが PASS する
- [ ] 手動スクリーンショット検証が PASS する

### ドキュメント要件

- [ ] `task-workflow.md` の残課題ステータスを更新する
- [ ] `ui-ux-feature-components.md` または `ui-ux-navigation.md` を更新する

## 6. 検証方法

### テストケース

- プレースホルダ表示
- CTA表示とクリック
- 画面遷移確認

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/views/WorkspaceView src/renderer/views/HistorySearchView`
2. Phase 11 形式でスクリーンショットを取得し、導線視認性を確認する。

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                              |
| ------------------------------------ | ------ | -------- | --------------------------------- |
| プレースホルダに情報を詰め込みすぎる | 低     | 中       | 主CTAを1つに限定し、補足は短文化  |
| 遷移先が実装状態と不一致             | 中     | 低       | 遷移先を既存 completed 画面に限定 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/outputs/phase-11/manual-test-result.md`
- `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`
- `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`

## 9. 備考

本タスクは導線改善タスクであり、IPC・Store 契約変更が必要な場合は別タスクへ分離する。
