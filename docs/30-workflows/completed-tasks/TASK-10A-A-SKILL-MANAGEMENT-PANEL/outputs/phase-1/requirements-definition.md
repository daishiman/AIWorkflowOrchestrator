# Phase 1 要件定義 成果物

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | TASK-10A-A           |
| 機能名   | SkillManagementPanel |
| Phase    | 1                    |
| 完了日   | 2026-03-02           |
| 判定     | PASS                 |

## 機能要件サマリ (FR-1〜FR-10)

- **FR-1: スキル一覧表示** — カード形式、グリッドレイアウト（3/2/1列レスポンシブ）、件数表示（「管理中のツール（N件）」）
- **FR-2: 検索機能** — name/description の部分一致、300ms デバウンス、クリアボタン（×）、0件時メッセージ
- **FR-3: カテゴリフィルタリング** — 7カテゴリ（testing, design, development, documentation, security, performance, other）+ 「すべて」タブ、検索との AND 条件
- **FR-4: 編集操作** — 編集アイコンボタン → currentView を `"editor"` に切替、SkillEditor に skill/onClose を渡す
- **FR-5: 分析操作** — 分析アイコンボタン → currentView を `"analysis"` に切替、SkillAnalysisView に対象スキルを渡す
- **FR-6: 削除操作** — 確認ダイアログ（「"スキル名" を削除しますか？この操作は取り消せません。」）、`removeSkill(skill.name)` 実行、トースト通知（成功/失敗）
- **FR-7: 新規作成操作** — 「新しいツールを作成」ボタン → currentView を `"create"` に切替、閉じ時に fetchSkills() で再取得
- **FR-8: ローディング状態** — `isLoadingSkills === true` でスケルトン UI（カード形状プレースホルダー 3 枚、shimmer 効果）
- **FR-9: エラー状態** — `skillError !== null` でエラーメッセージ + リトライボタン → fetchSkills() 再実行
- **FR-10: 空状態** — 0 件時「まだツールが追加されていません」+ SkillCenterView への誘導リンク

## 非機能要件サマリ (NFR-1〜NFR-5)

- **NFR-1: パフォーマンス** — 初回レンダリング 500ms 以内、フィルタリング 100ms 以内（50 件基準）、useMemo でキャッシュ
- **NFR-2: アクセシビリティ（WCAG 2.1 AA）** — キーボード操作（Tab/ArrowUp/ArrowDown）、aria-label 全ボタン付与、aria-live="polite" 動的変更通知、削除ダイアログ role="alertdialog" + フォーカストラップ、コントラスト比 4.5:1 / 3:1
- **NFR-3: Apple HIG 準拠** — 8px グリッドスペーシング、角丸 8-12px、影 `0 1px 3px rgba(0,0,0,0.04)`、システムカラー（ライト/ダーク両対応）、アニメーション 200-300ms
- **NFR-4: 状態管理** — Zustand agentSlice から個別セレクタで取得（P31 対策）、合成 Store Hook 使用禁止、ローカル状態（currentView/selectedSkill/searchQuery）は useState
- **NFR-5: テスト制約** — fireEvent 使用（P39 対策）、apps/desktop/ から実行（P40 対策）、Line 80% / Branch 60% / Function 80% 以上

## 受け入れ基準 (AC-1〜AC-11)

- **AC-1: スキル一覧表示** — 3 件のスキル存在時、3 枚のカードがグリッド表示され、各カードにスキル名・説明文（最大 2 行）・カテゴリバッジが表示、ヘッダーに「管理中のツール（3件）」
- **AC-2: 検索機能** — "code-review", "test-generator", "doc-writer" 存在時、"test" 入力 300ms 経過で "test-generator" のみ表示
- **AC-3: カテゴリフィルタリング** — "testing" タブ選択で category="testing" のみ表示、検索条件との AND 結果
- **AC-4: 編集ボタン** — 編集ボタン押下で SkillEditor が該当スキル情報とともに表示、リスト非表示
- **AC-5: 分析ボタン** — 分析ボタン押下で SkillAnalysisView（プレースホルダー）が表示、リスト非表示
- **AC-6: 削除操作** — 削除ボタン → 確認ダイアログ → 「削除」選択 → removeSkill(skill.name) 実行 → 成功トースト「"スキル名" を削除しました」→ カード消失
- **AC-7: 新規作成** — 「新しいツールを作成」ボタン押下で新規作成画面表示、リスト非表示
- **AC-8: ローディング状態** — isLoadingSkills===true で 3 枚のスケルトンカード表示、取得完了で実カードに置換
- **AC-9: エラー状態** — skillError!==null でエラーメッセージ + リトライボタン表示、リトライ押下で fetchSkills() 再実行
- **AC-10: 空状態** — 0 件で「まだツールが追加されていません」+ SkillCenterView 誘導リンク表示
- **AC-11: キーボード操作** — Tab で検索フィールド → カテゴリタブ → 新規作成ボタン → スキルカード群の順にフォーカス移動、ArrowDown で次カードへ移動

## IN スコープ (SCOPE-1〜SCOPE-10)

| ID       | 機能                                                   |
| -------- | ------------------------------------------------------ |
| SCOPE-1  | インポート済みスキルの一覧表示（カード形式）           |
| SCOPE-2  | スキル名・説明文によるテキスト検索                     |
| SCOPE-3  | カテゴリによるフィルタリング                           |
| SCOPE-4  | 各スキルカードに編集ボタン（→ SkillEditor 遷移）       |
| SCOPE-5  | 各スキルカードに分析ボタン（→ SkillAnalysisView 遷移） |
| SCOPE-6  | 各スキルカードに削除ボタン（確認ダイアログ付き）       |
| SCOPE-7  | 新規作成ボタン（→ 新規スキル作成画面遷移）             |
| SCOPE-8  | ローディング状態表示（スケルトン UI）                  |
| SCOPE-9  | エラー状態表示（リトライボタン付き）                   |
| SCOPE-10 | 空状態表示（インポート済みスキルが 0 件の場合）        |

## OUT スコープ (OUT-1〜OUT-6)

| ID    | 除外機能                                 | 理由                                    |
| ----- | ---------------------------------------- | --------------------------------------- |
| OUT-1 | スキルの探索・追加 UI                    | SkillCenterView（TASK-UI-05）の責務     |
| OUT-2 | スキル実行 UI                            | AgentView の責務                        |
| OUT-3 | スキルファイルの直接編集                 | SkillEditor（TASK-9A）の責務            |
| OUT-4 | スキル分析・改善のロジック               | SkillAnalysisView（TASK-10A-B）の責務   |
| OUT-5 | スキルチェーン/スケジュール/デバッグ管理 | SkillAdvancedViews（TASK-UI-05B）の責務 |
| OUT-6 | スキルアナリティクスダッシュボード       | TASK-9J の責務                          |

## 前提条件 (PRE-1〜PRE-5)

| ID    | 前提条件                                                                                 |
| ----- | ---------------------------------------------------------------------------------------- |
| PRE-1 | TASK-9A（SkillEditor）が完了し、`SkillEditor.tsx` が使用可能                             |
| PRE-2 | agentSlice に `importedSkills`, `isLoadingSkills`, `skillError` の個別セレクタが定義済み |
| PRE-3 | `removeSkill` アクションが agentSlice に実装済み                                         |
| PRE-4 | `fetchSkills` アクションが agentSlice に実装済み                                         |
| PRE-5 | Preload API の `skill.remove()` が P42 準拠 3 段バリデーションを実装済み                 |

## 制約 (CON-1〜CON-5)

| ID    | 制約                                                                         |
| ----- | ---------------------------------------------------------------------------- |
| CON-1 | Renderer → Main の通信は IPC（Preload Bridge）経由のみ                       |
| CON-2 | Zustand の合成 Store Hook（`useSkillStore()`）は使用禁止（P31 対策）         |
| CON-3 | happy-dom 環境のテストでは `userEvent` 使用禁止（P39 対策）                  |
| CON-4 | テスト実行は `apps/desktop/` ディレクトリから実行（P40 対策）                |
| CON-5 | CSS 変数ベースのスタイルは `variantStyles` Record で export する（P47 対策） |

## Pitfall 対策

| Pitfall ID | 対策内容                                                     | 適用箇所            |
| ---------- | ------------------------------------------------------------ | ------------------- |
| P31        | Zustand 個別セレクタ使用（合成 Hook 禁止）                   | NFR-4, CON-2        |
| P39        | happy-dom 環境で fireEvent 使用（userEvent 禁止）            | NFR-5, CON-3        |
| P40        | apps/desktop/ からテスト実行                                 | NFR-5, CON-4        |
| P42        | 3 段バリデーション（型チェック → 空文字列 → トリム空文字列） | PRE-5, 削除操作     |
| P47        | variantStyles Record export でテスト可読性確保               | CON-5, スタイル定義 |

## 完了条件チェック

- [x] 全機能要件（FR-1〜FR-10）が定義されている
- [x] 全非機能要件（NFR-1〜NFR-5）が定義されている
- [x] 全受け入れ基準（AC-1〜AC-11）が検証可能な条件で記述されている
- [x] IN スコープ/OUT スコープが明確に分離されている
- [x] 前提条件と制約が明示されている
- [x] 既存コンポーネント（SkillCenterView, AgentView, SkillEditor）との責務境界が明確
- [x] 既知の落とし穴（P31, P39, P40, P42, P47）の対策が要件に反映されている
