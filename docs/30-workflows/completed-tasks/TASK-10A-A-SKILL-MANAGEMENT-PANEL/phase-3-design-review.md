# Phase 3: 設計レビューゲート

## メタ情報

| 項目     | 値                   |
| -------- | -------------------- |
| Phase    | 3                    |
| 機能名   | SkillManagementPanel |
| タスクID | TASK-10A-A           |
| 作成日   | 2026-03-02           |
| 前Phase  | Phase 2: 設計        |
| 次Phase  | Phase 4: テスト作成  |

## 目的

実装開始前に Phase 1（要件定義）および Phase 2（設計）の成果物の妥当性を検証する。要件カバレッジ、設計整合性、既存パターンとの一貫性、セキュリティ、アクセシビリティ、Pitfall対策の全観点でレビューを実施する。

## 実行タスク

- 要件カバレッジ検証: Phase 1の全要件がPhase 2設計でカバーされているか確認
- 設計整合性検証: 既存コンポーネント（SkillCenterView, AgentView, SkillEditor）との一貫性を確認
- IPC契約整合性検証: 既存チャネル利用の妥当性を確認
- Pitfall対策検証: P31/P39/P40/P42/P47対策が設計に含まれているか確認
- アクセシビリティ検証: WCAG 2.1 AA準拠設計の確認
- 状態管理検証: Zustand個別セレクタ使用パターンの確認

## 参照資料

| 資料名         | パス                                    | 説明             |
| -------------- | --------------------------------------- | ---------------- |
| 要件定義書     | `phase-1-requirements.md`               | Phase 1成果物    |
| 設計書         | `phase-2-design.md`                     | Phase 2成果物    |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`    | Pitfall一覧      |
| 状態管理ルール | `.claude/rules/03-state-management.md`  | Zustand設計原則  |
| セキュリティ   | `.claude/rules/04-electron-security.md` | IPC セキュリティ |

## 判定基準

| 判定              | 条件                 | 対応                    |
| ----------------- | -------------------- | ----------------------- |
| PASS              | 全観点で問題なし     | Phase 4へ進行           |
| MINOR             | 軽微な指摘あり       | 指摘対応後Phase 4へ進行 |
| MAJOR（要件問題） | 要件に重大な漏れあり | Phase 1へ戻る           |
| MAJOR（設計問題） | 設計に重大な問題あり | Phase 2へ戻る           |

## 実行手順

### 1. 要件カバレッジ検証

Phase 1の全機能要件がPhase 2の設計でカバーされているか確認する。

| Phase 1 要件 | Phase 2 設計対応箇所                                        | カバレッジ確認 |
| ------------ | ----------------------------------------------------------- | -------------- |
| FR-1-1       | 3.1 初期化フロー: mount → fetchSkills()                     | [ ]            |
| FR-1-2       | 1.3 SkillManagementCard: name, description, badge表示       | [ ]            |
| FR-1-3       | 5.2 レスポンシブブレークポイント: 3列/2列/1列               | [ ]            |
| FR-1-4       | 1.3 SkillManagementHeader: skillCount表示                   | [ ]            |
| FR-2-1       | 1.3 SkillSearchBar + 2.3 filteredSkills (name, description) | [ ]            |
| FR-2-2       | 2.3 useMemo でクライアントサイドフィルタリング              | [ ]            |
| FR-2-3       | 2.1 searchQuery → debouncedQuery（300ms）                   | [ ]            |
| FR-2-4       | 設計書にゼロ結果UIの記述があるか                            | [ ]            |
| FR-2-5       | 1.3 SkillSearchBar: onClear                                 | [ ]            |
| FR-3-1       | 1.3 SkillCategoryFilter: 7カテゴリ                          | [ ]            |
| FR-3-2       | 1.3 SkillCategoryFilter: 8タブ（横スクロール）              | [ ]            |
| FR-3-3       | 2.3 filteredSkills: AND条件                                 | [ ]            |
| FR-3-4       | FR-2-4と共通                                                | [ ]            |
| FR-4-1       | 1.3 SkillCardActions: 編集アイコン                          | [ ]            |
| FR-4-2       | 3.3 編集操作フロー: setCurrentView("editor")                | [ ]            |
| FR-4-3       | 3.3 SkillEditor表示（skill, onClose）                       | [ ]            |
| FR-4-4       | 3.3 onClose → setCurrentView("list")                        | [ ]            |
| FR-5-1       | 1.3 SkillCardActions: 分析アイコン                          | [ ]            |
| FR-5-2       | 3.4 分析操作フロー: setCurrentView("analysis")              | [ ]            |
| FR-5-3       | 3.4 SkillAnalysisView表示                                   | [ ]            |
| FR-5-4       | 3.4 onClose → setCurrentView("list")                        | [ ]            |
| FR-6-1       | 1.3 SkillCardActions: 削除アイコン                          | [ ]            |
| FR-6-2       | 3.5 削除操作フロー + 1.3 SkillDeleteDialog                  | [ ]            |
| FR-6-3       | 3.5 removeSkill(skill.name)                                 | [ ]            |
| FR-6-4       | 3.5 showToast("success")                                    | [ ]            |
| FR-6-5       | 3.5 showToast("error")                                      | [ ]            |
| FR-6-6       | 2.1 isDeleting + 4.7 SkillDeleteDialogProps.isDeleting      | [ ]            |
| FR-7-1       | 1.3 SkillManagementHeader: onCreateNew                      | [ ]            |
| FR-7-2       | 3.6 setCurrentView("create")                                | [ ]            |
| FR-7-3       | 3.6 onClose → setCurrentView("list") + fetchSkills()        | [ ]            |
| FR-8-1       | 1.3 SkillManagementSkeleton + 3.1 初期化フロー              | [ ]            |
| FR-8-2       | 1.3 SkillManagementSkeleton: shimmerアニメーション          | [ ]            |
| FR-9-1       | 1.3 SkillManagementError + 7 エラーハンドリング             | [ ]            |
| FR-9-2       | 4.8 SkillManagementErrorProps.onRetry                       | [ ]            |
| FR-10-1      | 1.3 SkillManagementEmpty                                    | [ ]            |
| FR-10-2      | 1.3 SkillManagementEmpty: 誘導リンク                        | [ ]            |

### 2. 非機能要件カバレッジ検証

| Phase 1 NFR | Phase 2 設計対応箇所                        | カバレッジ確認 |
| ----------- | ------------------------------------------- | -------------- |
| NFR-1-1     | 設計上の制約あり（初回レンダリング500ms）   | [ ]            |
| NFR-1-2     | 2.3 useMemo キャッシュ                      | [ ]            |
| NFR-1-3     | 2.3 useMemo 依存配列                        | [ ]            |
| NFR-2-1     | 6.2 キーボードナビゲーション: Tab/Shift+Tab | [ ]            |
| NFR-2-2     | 6.2 ArrowUp/ArrowDown                       | [ ]            |
| NFR-2-3     | 6.1 SkillDeleteDialog: role="alertdialog"   | [ ]            |
| NFR-2-4     | 6.1 全ボタン aria-label                     | [ ]            |
| NFR-2-5     | 6.1 aria-live="polite"                      | [ ]            |
| NFR-2-6     | 5.3 Apple HIGカラー（コントラスト確認必要） | [ ]            |
| NFR-3-1     | 5.4 8pxグリッド                             | [ ]            |
| NFR-3-2     | 5.5 角丸 8px/12px                           | [ ]            |
| NFR-3-3     | 5.5 影                                      | [ ]            |
| NFR-3-4     | 5.3 Apple HIG System Colors                 | [ ]            |
| NFR-3-5     | 5.5 アニメーション（shimmer）               | [ ]            |
| NFR-4-1     | 2.2 個別セレクタ使用                        | [ ]            |
| NFR-4-2     | 2.2 合成Hook不使用                          | [ ]            |
| NFR-4-3     | 2.1 ローカル状態一覧                        | [ ]            |
| NFR-5-1     | 8.2 P39対策                                 | [ ]            |
| NFR-5-2     | 8.2 P40対策                                 | [ ]            |
| NFR-5-3     | 設計段階では確認不可（Phase 7で検証）       | [ ]            |

### 3. 既存パターン整合性検証

既存コンポーネントとの設計パターン一貫性を確認する。

| 確認項目                                                         | 参照元               | 確認結果 |
| ---------------------------------------------------------------- | -------------------- | -------- |
| Zustand個別セレクタの使用パターンがAgentViewと一致               | AgentView/index.tsx  | [ ]      |
| SkillEditorのProps渡しパターンが既存実装と一致                   | SkillEditor.tsx      | [ ]      |
| カテゴリフィルタリングのパターンがAgentViewのskillCategoryと一致 | AgentView/index.tsx  | [ ]      |
| useCallbackの使用パターンがAgentViewと一致                       | AgentView/index.tsx  | [ ]      |
| data-testid命名がプロジェクト規約と一致                          | 既存テストファイル群 | [ ]      |
| トースト通知がshowToast()パターンと一致                          | AgentView/index.tsx  | [ ]      |

### 4. Pitfall対策検証

| Pitfall | 対策内容                                           | 設計箇所           | 確認結果 |
| ------- | -------------------------------------------------- | ------------------ | -------- |
| P31     | 個別セレクタのみ使用、合成Hook不使用               | 2.2 Store連携      | [ ]      |
| P39     | fireEvent使用、userEvent不使用                     | 8.2 テスト環境制約 | [ ]      |
| P40     | apps/desktop/から実行                              | 8.2 テスト環境制約 | [ ]      |
| P42     | removeSkill はPreload API側で3段バリデーション済み | 前提条件PRE-5      | [ ]      |
| P47     | variantStyles Record export                        | 8.2 テスト環境制約 | [ ]      |

### 5. アクセシビリティ検証

| 確認項目                                               | WCAG基準 | 確認結果 |
| ------------------------------------------------------ | -------- | -------- |
| 全インタラクティブ要素にrole/aria-label付与            | 4.1.2    | [ ]      |
| 削除ダイアログにフォーカストラップ実装                 | 2.4.3    | [ ]      |
| 動的コンテンツにaria-live使用                          | 4.1.3    | [ ]      |
| キーボードナビゲーション（Tab, Arrow, Escape）         | 2.1.1    | [ ]      |
| カラーコントラスト比（テキスト4.5:1, UI3:1）           | 1.4.3    | [ ]      |
| フォーカスインジケータの可視性                         | 2.4.7    | [ ]      |
| 色だけで情報を伝えていないか（バッジにはテキスト併用） | 1.4.1    | [ ]      |

### 6. セキュリティ検証

| 確認項目                                        | ルール参照            | 確認結果 |
| ----------------------------------------------- | --------------------- | -------- |
| IPC通信はPreload Bridge経由のみ                 | 04-electron-security  | [ ]      |
| Rendererから直接Node.js APIを使用していない     | 01-architecture       | [ ]      |
| removeSkillの引数がP42準拠3段バリデーション済み | 06-known-pitfalls#P42 | [ ]      |
| エラーメッセージに内部情報を含まない            | 04-electron-security  | [ ]      |

### 7. 状態管理検証

| 確認項目                                              | ルール参照          | 確認結果 |
| ----------------------------------------------------- | ------------------- | -------- |
| ローカル状態（UI固有）とStore状態（共有）の境界が適切 | 03-state-management | [ ]      |
| useEffect依存配列に合成Hook戻り値の関数を含まない     | P31                 | [ ]      |
| useMemo依存配列が正しい                               | React最適化         | [ ]      |
| fetchSkillsはuseEffect内で呼び出し、依存配列に含む    | P31対策             | [ ]      |

### 8. コンポーネント設計検証

| 確認項目                                                 | 原則             | 確認結果 |
| -------------------------------------------------------- | ---------------- | -------- |
| organisms > molecules > atoms の層分割が正しい           | Atomic Design    | [ ]      |
| 1コンポーネント1責務（SRP）                              | SOLID            | [ ]      |
| Props型が過不足なく定義されている                        | TypeScript型安全 | [ ]      |
| コンポーネント間の依存方向が上位→下位                    | 依存性逆転       | [ ]      |
| カスタムフック（useSkillManagement）がUIとロジックを分離 | 関心の分離       | [ ]      |

## レビュー結果テンプレート

```markdown
### レビュー結果

| 項目            | 結果             |
| --------------- | ---------------- |
| 実施日          | YYYY-MM-DD       |
| 判定            | PASS/MINOR/MAJOR |
| 指摘数（MINOR） | N件              |
| 指摘数（MAJOR） | N件              |

### 指摘事項

| #   | 重要度 | 観点     | 内容 | 対応方針 |
| --- | ------ | -------- | ---- | -------- |
| 1   | MINOR  | 例: 設計 | 内容 | 対応方針 |

### 対応結果

| #   | 対応状況 | 対応内容 |
| --- | -------- | -------- |
| 1   | 完了     | 内容     |
```

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物           | 配置先                                   |
| ---------------- | ---------------------------------------- |
| 本設計レビュー書 | `phase-3-design-review.md`（本ファイル） |

## 完了条件

- [ ] 全要件カバレッジ確認表（セクション1）が全チェック完了
- [ ] 全非機能要件カバレッジ確認表（セクション2）が全チェック完了
- [ ] 既存パターン整合性（セクション3）が全チェック完了
- [ ] Pitfall対策（セクション4）が全チェック完了
- [ ] アクセシビリティ（セクション5）が全チェック完了
- [ ] セキュリティ（セクション6）が全チェック完了
- [ ] 状態管理（セクション7）が全チェック完了
- [ ] コンポーネント設計（セクション8）が全チェック完了
- [ ] 判定がPASSまたはMINOR（MINOR指摘はすべて対応済み）

## 次Phase

Phase 4: テスト作成 → `phase-4-test-creation.md`
