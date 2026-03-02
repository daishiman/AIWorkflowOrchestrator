# Phase 1: 要件定義

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 1                            |
| 機能名   | TASK-UI-05-SKILL-CENTER-VIEW |
| タスクID | TASK-UI-05-SKILL-CENTER-VIEW |
| 作成日   | 2026-03-01                   |

## 目的

SkillCenterView（ツールを探す）の要件を明確化し、受け入れ基準を定義する。ユーザーが直感的にツールを探し、ワンタップで追加できるアプリストア型体験に必要な機能要件・非機能要件を網羅的に抽出する。

## 実行タスク

- 要件抽出: タスク原本（セクション2〜9）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準をGherkin形式で定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- IPC連携要件定義: 既存IPCチャネルの利用要件を定義

## 参照資料

| 資料名                        | パス / タスクID                                                                                        | 説明                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- |
| タスク原本                    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-030-ui-05-skill-center-view.md` | 全仕様                       |
| デザイン基盤                  | TASK-UI-00 `00-design-foundation.md`                                                                   | 共通コンポーネント・トークン |
| UIアーキテクチャ              | TASK-UI-01 `01-architecture.md`                                                                        | Zustandスライス設計原則      |
| ナビゲーションコア            | TASK-UI-02 `02-navigation-core.md`                                                                     | サイドバーナビゲーション     |
| エージェントビュー            | TASK-UI-03 `03-agent-view.md`                                                                          | AgentView仕様（変更不可）    |
| 既存AgentView                 | `views/AgentView/index.tsx`                                                                            | 既存実装参照                 |
| 既存SkillImportDialog         | `components/organisms/SkillImportDialog/`                                                              | 既存ダイアログ参照           |
| 既存agentSlice                | `store/slices/agentSlice.ts`                                                                           | 既存スライス参照             |
| IPCチャネル定義               | `preload/channels.ts`                                                                                  | 既存チャネル定数             |
| P44: IPC不整合（解決済み）    | `.claude/rules/06-known-pitfalls.md#P44`                                                               | skill:import/remove修正済み  |
| P45: 命名ドリフト（解決済み） | `.claude/rules/06-known-pitfalls.md#P45`                                                               | skillName統一済み            |

## aiworkflow-requirements 仕様抽出結果（resource-map準拠）

`indexes/resource-map.md` の「UI実装」「API設計」「セキュリティ実装」「テスト実装」導線から、本タスクで必須となる仕様を抽出した。

| 関心領域                   | 仕様書                                                                            | このPhaseでの利用目的                      |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| UI実装                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | SkillCenterView のUI要件基準               |
| UIデザイン基盤             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | デザイントークン、配色、タイポグラフィ基準 |
| UI設計原則                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG / WCAG 準拠観点                  |
| 機能別コンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Skill 系コンポーネント責務                 |
| 状態管理/構成              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice 利用境界の確認                  |
| アーキテクチャ全体         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 依存方向（Renderer→Preload→Main）の確認    |
| IPC/API契約                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | skill系チャネル契約（引数/戻り値）         |
| API一覧                    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | チャネル命名と用途の正本確認               |
| 型インターフェース         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skillName/skillId 契約差異の確認           |
| セキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC sender検証と入力検証要件               |
| セキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill関連IPCの検証ルール                   |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 追加/削除失敗時のエラー契約確認            |
| テスト品質                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ/品質基準                        |
| コンポーネントテスト       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト方針（TDD, モック,検証軸）           |
| アクセシビリティテスト     | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG観点の試験項目抽出                     |
| データ整合性（非適用確認） | `.claude/skills/aiworkflow-requirements/references/database-schema.md`            | DBスキーマ変更なしを明示（非適用）         |

## 実行手順

### 1. 要件抽出

タスク原本のセクション2〜9から機能要件・非機能要件を抽出する。

### 2. 受け入れ基準作成

各要件に対して検証可能な受け入れ基準をGherkin形式で定義する。

### 3. FR/NFR分類

機能要件と非機能要件を分類し、優先度を設定する。

### 4. IPC連携要件定義

既存IPCチャネルの利用要件とサブダイアログ用チャネルを定義する。

---

## 機能要件（FR）

### FR-1: おすすめセクション（FeaturedSection）

| 要件ID | 要件                                                                           | 優先度 |
| ------ | ------------------------------------------------------------------------------ | ------ |
| FR-1-1 | 画面最上部に「おすすめ」セクションを表示する                                   | 高     |
| FR-1-2 | 未追加のツールのみを最大3枚の大きめカード（h=160px）で表示する                 | 高     |
| FR-1-3 | アクセントカラー5%グラデーション（左下から右上）背景を適用する                 | 中     |
| FR-1-4 | アイコンを56px（通常カードより大きめ）で表示する                               | 中     |
| FR-1-5 | stagger出現アニメーション（`opacity 0->1` + `translateY(8px->0)`、200ms間隔）  | 中     |
| FR-1-6 | ツール追加後、追加済みカードをフェードアウトし次のおすすめが繰り上がる         | 中     |
| FR-1-7 | 未追加ツールが0件の場合、おすすめセクションを非表示にする                      | 高     |
| FR-1-8 | おすすめ選定ロジック: 人気度順ソート + カテゴリ多様性確保（同カテゴリ最大2件） | 中     |

### FR-2: ツールカード（SkillCard）+ CardGrid

| 要件ID | 要件                                                                             | 優先度 |
| ------ | -------------------------------------------------------------------------------- | ------ |
| FR-2-1 | CardGridでツール一覧をカード形式（最低高さ120px、48pxアイコン）で表示する        | 高     |
| FR-2-2 | カード内に「追加する」ボタン（44x44pxタッチターゲット、Apple HIG準拠）を配置する | 高     |
| FR-2-3 | ツール名 + 一言説明（1行切り捨て）をカードに表示する                             | 高     |
| FR-2-4 | カードhover時に `scale(1.02)` + `box-shadow: var(--shadow-md)` を適用する        | 中     |
| FR-2-5 | カードactive（タップ/クリック中）時に `scale(0.97)` を適用する                   | 中     |
| FR-2-6 | カードfocus時に `outline: 2px solid var(--color-accent)` + `outline-offset: 2px` | 高     |
| FR-2-7 | カード本体クリックでSkillDetailPanelを表示する                                   | 高     |
| FR-2-8 | 追加済みカードのボタンを「追加済み!」状態で表示する                              | 高     |
| FR-2-9 | 件数表示（「XX件のツール」）を正確に表示する                                     | 中     |

### FR-3: 追加ボタン（AddButton）モーフィングアニメーション

| 要件ID | 要件                                                                        | 優先度 |
| ------ | --------------------------------------------------------------------------- | ------ |
| FR-3-1 | 「追加する」タップ -> スピナー（最大300ms）-> チェックマーク(✓)モーフィング | 高     |
| FR-3-2 | success-bounce: `scale(1.0 -> 1.15 -> 1.0)` + 色変化（300ms）               | 中     |
| FR-3-3 | ボタンテキストが「追加する」->「追加済み!」に変化する                       | 高     |
| FR-3-4 | ボタン色が primary -> success に変化する                                    | 中     |
| FR-3-5 | 失敗時にボタンが「追加する」に戻り、エラーToastを表示する                   | 高     |
| FR-3-6 | featured（おすすめカード用）とdefaultの2サイズをサポートする                | 中     |

### FR-4: カテゴリタブ（CategoryTabs）

| 要件ID | 要件                                                                                            | 優先度 |
| ------ | ----------------------------------------------------------------------------------------------- | ------ |
| FR-4-1 | 横スクロール可能なカテゴリタブ（すべて/開発ツール/文書作成/データ分析/自動化/その他）を表示する | 高     |
| FR-4-2 | タブ切替時に下線インジケータがスライドするアニメーション（200ms ease-out）                      | 中     |
| FR-4-3 | カテゴリ変更時にカードグリッドがcrossFadeで切り替わる（150ms）                                  | 中     |
| FR-4-4 | スクロールバーを非表示にし、タッチスワイプに対応する                                            | 中     |

### FR-5: 詳細パネル（SkillDetailPanel）

| 要件ID | 要件                                                                              | 優先度 |
| ------ | --------------------------------------------------------------------------------- | ------ |
| FR-5-1 | デスクトップ（>= 1024px）: 右からスライドインパネル（450px）で表示する            | 高     |
| FR-5-2 | モバイル（< 1024px）: 下からスライドアップのボトムシート（最大85vh）で表示する    | 高     |
| FR-5-3 | モバイル: 下方向スワイプ（閾値50px）で閉じる                                      | 中     |
| FR-5-4 | 「このツールでできること」箇条書き（3〜5項目、SKILL.md Capabilitiesから自動抽出） | 高     |
| FR-5-5 | 「AIにできること」を平易なユーザー向け表現のバッジで表示する                      | 高     |
| FR-5-6 | 「詳しい説明を見る」折りたたみ内にSKILL.md全文をMarkdownレンダリングする          | 中     |
| FR-5-7 | 折りたたみトグルアニメーション: `max-height` トランジション 300ms ease-out        | 中     |
| FR-5-8 | メタ情報（作成者、カテゴリ、追加日）を表示する                                    | 中     |

### FR-6: ツール操作フロー（追加/削除）

| 要件ID | 要件                                                                                   | 優先度 |
| ------ | -------------------------------------------------------------------------------------- | ------ |
| FR-6-1 | カード内「追加する」ボタンからの追加フロー（AddButton -> useImportSkill -> 成功/失敗） | 高     |
| FR-6-2 | ヘッダー右「+ 追加する」ボタンから既存SkillImportDialogを起動する追加フロー            | 高     |
| FR-6-3 | SkillDetailPanel「このツールを削除」から確認ダイアログ付きの削除フロー                 | 高     |
| FR-6-4 | 削除確認ダイアログ:「"{ToolName}" を削除しますか？この操作は取り消せません」           | 高     |
| FR-6-5 | 削除成功時: DetailPanel閉じる + カードボタンを「追加する」に戻す + Toast表示           | 高     |

### FR-7: ゼロステート

| 要件ID | 要件                                                                           | 優先度 |
| ------ | ------------------------------------------------------------------------------ | ------ |
| FR-7-1 | ツール0件時にEmptyState mood="welcoming" +「ツールを探してみよう」を表示する   | 高     |
| FR-7-2 | EmptyStateのアクションボタンでSkillImportDialogを起動する                      | 高     |
| FR-7-3 | 検索結果0件時に「見つかりませんでした」+「フィルターをクリア」ボタンを表示する | 高     |
| FR-7-4 | ローディング中: おすすめスケルトンカード3枚 + CardGridスケルトン6枚を表示する  | 中     |

### FR-8: レスポンシブ対応

| 要件ID | 要件                                                                 | 優先度 |
| ------ | -------------------------------------------------------------------- | ------ |
| FR-8-1 | >= 1440px: 4列グリッド + おすすめ3枚横並び + スライドインパネル      | 高     |
| FR-8-2 | 1024px〜1439px: 3列グリッド + おすすめ3枚横並び + スライドインパネル | 高     |
| FR-8-3 | 768px〜1023px: 2列グリッド + おすすめ横スクロール + ボトムシート     | 高     |
| FR-8-4 | < 768px: 1列グリッド + おすすめ横スクロール + ボトムシート           | 高     |

### FR-9: サブダイアログ

| 要件ID | 要件                                                                   | 優先度 | 移管元  |
| ------ | ---------------------------------------------------------------------- | ------ | ------- |
| FR-9-1 | ForkSkillDialog: 既存スキルを複製し新しい名前でカスタマイズ可能にする  | 中     | task-9e |
| FR-9-2 | ImportSkillDialog拡張: GitHub/Gist/URL/ローカルの4ソースタブを追加する | 中     | task-9f |
| FR-9-3 | ExportSkillDialog: Gist/ローカルへのエクスポート機能                   | 中     | task-9f |
| FR-9-4 | GenerateDocsDialog: LLMを使ったドキュメント自動生成 + DocPreview       | 低     | task-9i |

## 非機能要件（NFR）

| 要件ID | カテゴリ         | 要件                                           | 基準                     | 仕様参照               |
| ------ | ---------------- | ---------------------------------------------- | ------------------------ | ---------------------- |
| NFR-1  | アクセシビリティ | WCAG 2.1 AA準拠                                | 全項目クリア             | `ui-ux-*.md`           |
| NFR-2  | アクセシビリティ | キーボードで全操作が可能                       | Tab/Enter/Escape対応     | `ui-ux-*.md`           |
| NFR-3  | アクセシビリティ | コントラスト比4.5:1以上（通常テキスト）        | WCAG基準                 | `ui-ux-*.md`           |
| NFR-4  | アクセシビリティ | ARIAラベルを要素種別ごとに付与                 | 全インタラクティブ要素   | `ui-ux-*.md`           |
| NFR-5  | パフォーマンス   | SearchBarのリアルタイム検索フィルタリング      | デバウンス 150-300ms     | `architecture-*.md`    |
| NFR-6  | パフォーマンス   | アニメーションは`transform`と`opacity`のみ使用 | 60fps維持                | `architecture-*.md`    |
| NFR-7  | パフォーマンス   | おすすめセクション再計算をuseMemoで最適化      | importedSkills変更時のみ | `architecture-*.md`    |
| NFR-8  | テストカバレッジ | Line Coverage 80%以上                          | 最低基準                 | `02-code-quality.md`   |
| NFR-9  | テストカバレッジ | Branch Coverage 60%以上                        | 最低基準                 | `02-code-quality.md`   |
| NFR-10 | テストカバレッジ | Function Coverage 80%以上                      | 最低基準                 | `02-code-quality.md`   |
| NFR-11 | UX言語           | 全表示テキストで「スキル」->「ツール」に統一   | 5D準拠                   | タスク原本セクション3  |
| NFR-12 | UX言語           | 「インポート」->「追加する」に統一             | 5D準拠                   | タスク原本セクション3  |
| NFR-13 | UX言語           | 権限表示を「AIにできること」として平易な表現   | 5D準拠                   | タスク原本セクション3  |
| NFR-14 | 品質             | AgentViewに変更がないこと                      | 差分0                    | タスク原本セクション10 |

## IPC連携要件

既存のIPCチャネルを利用する。新規チャネル追加は不要。

| 操作                 | IPCチャネル              | 引数                                              | 備考                                 |
| -------------------- | ------------------------ | ------------------------------------------------- | ------------------------------------ |
| ツール一覧取得       | `skill:list`             | なし                                              | 初期読み込み・リフレッシュ時         |
| ツール追加           | `skill:import`           | `skillName: string`                               | P44解決済み: stringを直接渡す        |
| ツール削除           | `skill:remove`           | `skillName: string`                               | P44/P45解決済み: skillNameに統一済み |
| ツール詳細取得       | `skill:get-detail`       | `{ skillId: string }`                             | DetailPanel表示用                    |
| SKILL.md取得         | `skill:readFile`         | `{ skillName: string, relativePath: "SKILL.md" }` | SkillMarkdownCollapse表示用          |
| 外部ソースインポート | `skill:importFromSource` | `ShareTarget`                                     | TASK-9F追加チャネル                  |
| インポート元検証     | `skill:validateSource`   | `ShareTarget`                                     | TASK-9F追加チャネル                  |
| スキルエクスポート   | `skill:export`           | `{ skillName: string, destination: ShareTarget }` | TASK-9F追加チャネル                  |
| スキルフォーク       | `skill:fork`             | `ForkOptions`                                     | TASK-9E連携チャネル                  |
| ドキュメント生成     | `skill:docs:generate`    | `{ skillName: string, options: SkillDocOptions }` | TASK-9I連携チャネル                  |
| ドキュメント出力     | `skill:docs:export`      | `{ docId: string, format: "md" \| "html" }`       | TASK-9I連携チャネル                  |

## 受け入れ基準

### AC-1: おすすめセクション

```gherkin
Given SkillCenterViewが表示されている
When 未追加のツールが1件以上存在する
Then 画面最上部に最大3枚のおすすめカード（h=160px）が表示される
And おすすめカードにアクセントカラー5%グラデーション背景が適用される
And stagger出現アニメーション（200ms間隔）が動作する

Given おすすめカードのツールを追加した
When 追加が完了する
Then 追加済みカードがフェードアウトし次のおすすめが繰り上がる

Given 未追加ツールが0件の場合
Then おすすめセクションが非表示になる
```

### AC-2: ツールカード + CardGrid

```gherkin
Given SkillCenterViewが表示されている
When ツール一覧がロードされる
Then CardGridでカード形式（h>=120px、48pxアイコン）で表示される
And 各カードに「追加する」ボタン（44x44pxタッチターゲット）が配置される

Given ツールカードにマウスを乗せた
Then scale(1.02) + shadow-mdが適用される

Given ツールカード本体をクリックした
Then SkillDetailPanelが表示される
```

### AC-3: 追加ボタンモーフィング

```gherkin
Given 未追加ツールの「追加する」ボタンをタップした
When 追加処理が開始される
Then スピナーが表示される（最大300ms）

Given 追加処理が成功した
Then チェックマーク(✓)モーフィングが実行される
And success-bounce（scale 1.0->1.15->1.0）が動作する
And ボタンテキストが「追加済み!」に変化する
And ボタン色がprimary -> successに変化する

Given 追加処理が失敗した
Then ボタンが「追加する」に戻る
And エラーToastが表示される
```

### AC-4: カテゴリタブ

```gherkin
Given SkillCenterViewが表示されている
Then 横スクロール可能なカテゴリタブが表示される

Given カテゴリタブを切り替えた
Then 下線インジケータがスライドする（200ms ease-out）
And カードグリッドがcrossFadeで切り替わる（150ms）
And 選択カテゴリに該当するツールのみが表示される
```

### AC-5: 詳細パネル

```gherkin
Given デスクトップ（>= 1024px）でカードをクリックした
Then 右からスライドインパネル（450px）が表示される
And 「このツールでできること」箇条書きが表示される
And 「AIにできること」バッジが表示される
And 「詳しい説明を見る」折りたたみが表示される

Given モバイル（< 1024px）でカードをクリックした
Then 下からボトムシート（最大85vh）が表示される
And 下方向スワイプ（閾値50px）で閉じることができる
```

### AC-6: ツール操作フロー

```gherkin
Given DetailPanelが表示されている
When 「このツールを削除」をタップした
Then 確認ダイアログが表示される

Given 確認ダイアログで「削除」を選択した
Then ツールが削除される
And DetailPanelが閉じる
And カードのボタンが「追加する」に戻る
And 成功Toastが表示される

Given ヘッダー右の「+ 追加する」をクリックした
Then 既存SkillImportDialogが表示される
```

### AC-7: ゼロステート

```gherkin
Given ツールが0件の場合
Then EmptyState mood="welcoming" が表示される
And 「ツールを探してみよう」メッセージが表示される
And アクションボタンでSkillImportDialogが起動する

Given 検索結果が0件の場合
Then 「見つかりませんでした」メッセージが表示される
And 「フィルターをクリア」ボタンが表示される
```

### AC-8: レスポンシブ

```gherkin
Given 画面幅が1440px以上
Then 4列グリッド + おすすめ3枚横並び + スライドインパネルで表示される

Given 画面幅が1024px〜1439px
Then 3列グリッド + おすすめ3枚横並び + スライドインパネルで表示される

Given 画面幅が768px〜1023px
Then 2列グリッド + おすすめ横スクロール + ボトムシートで表示される

Given 画面幅が768px未満
Then 1列グリッド + おすすめ横スクロール + ボトムシートで表示される
```

### AC-9: UX言語

```gherkin
Given SkillCenterViewが表示されている
Then 画面タイトルが「ツールを探す」になっている
And 全表示テキストで「スキル」ではなく「ツール」が使用されている
And 「インポート」ではなく「追加する」が使用されている
And 権限表示が「AIにできること」として平易な表現になっている
And 有効/無効トグルが存在しない（追加/未追加の2状態のみ）
```

### AC-10: 品質

```gherkin
Given 全コンポーネントテストを実行した
Then 全テストがPASSする
And AgentViewに変更がないこと
And キーボードで全操作が可能
And 全操作にフィードバック（hover, active, focus状態）が定義されている
```

## 統合テスト連携【必須】

接続要件を以下に明記:

| 接続要件カテゴリ | 記載内容                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- |
| IPC接続          | 既存IPCチャネル（skill:list, skill:import, skill:remove, skill:get-detail, skill:readFile） |
| 状態管理         | Zustand agentSlice（既存利用、個別セレクタ使用: P31対策）                                   |
| データフロー     | Renderer -> Preload(contextBridge) -> Main -> SkillService -> FileSystem                    |
| サブダイアログ   | TASK-9F/9E/9Iの追加IPCチャネル（skill:importFromSource, skill:fork, skill:docs:generate）   |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する:

| 観点               | 適用判断 | 確認内容                                                      | 仕様参照先          |
| ------------------ | -------- | ------------------------------------------------------------- | ------------------- |
| UI/UX              | 適用     | アプリストア型体験、3レベル情報開示、マイクロインタラクション | `ui-ux-*.md`        |
| アクセシビリティ   | 適用     | WCAG 2.1 AA準拠、キーボード操作、ARIAラベル                   | `ui-ux-*.md`        |
| アーキテクチャ     | 適用     | コンポーネント構成、agentSlice利用、レスポンシブ設計          | `architecture-*.md` |
| パフォーマンス     | 適用     | アニメーション60fps、useMemo最適化、デバウンス                | `architecture-*.md` |
| エラーハンドリング | 適用     | 追加/削除失敗時のToast表示、ネットワークエラー対応            | `error-handling.md` |

**Electronデスクトップアプリ観点**:

| 層                         | 確認観点                                                     |
| -------------------------- | ------------------------------------------------------------ |
| フロントエンド（Renderer） | SkillCenterView全コンポーネントのUI表示・状態管理            |
| バックエンド（Main）       | SkillService経由のスキル操作（agentSlice利用のため変更なし） |
| IPC通信                    | 既存チャネル利用の妥当性確認                                 |
| Preload/セキュリティ       | contextBridge経由API公開（既存APIのみ利用）                  |

## アーキテクチャ層別要件

| 層                         | 確認観点                                                                  |
| -------------------------- | ------------------------------------------------------------------------- |
| フロントエンド（Renderer） | SkillCenterViewコンポーネント群のUI表示、状態管理（agentSlice利用）       |
| バックエンド（Main）       | 変更なし（既存SkillServiceを利用）                                        |
| IPC通信                    | 既存チャネル利用（新規チャネル追加なし、TASK-9F/9E/9Iチャネルは別タスク） |
| セキュリティ               | 既存のIPC契約を遵守（P42準拠3段バリデーション済み）                       |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件（FR-1〜FR-9、NFR-1〜NFR-14）が抽出されている
- [ ] 各要件に受け入れ基準（AC-1〜AC-10）がある
- [ ] FR/NFRが分類されている
- [ ] IPC連携要件が明記されている
- [ ] UX言語マッピング（5D準拠）が定義されている
- [ ] 既存画面（AgentView）との差別化が明確である
- [ ] レスポンシブ要件（4段階ブレークポイント）が定義されている
- [ ] サブダイアログ要件（FR-9）が定義されている
- [ ] 統合テスト連携の接続要件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 機能要件（FR-1〜FR-9）の抽出
3. 非機能要件（NFR-1〜NFR-14）の抽出
4. IPC連携要件の定義
5. 受け入れ基準（AC-1〜AC-10）の定義
6. 成果物の作成・配置

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --phase 1
```

## 使用スキル

- aiworkflow-requirements（仕様参照用）

## 次のPhase

Phase 2: 設計
