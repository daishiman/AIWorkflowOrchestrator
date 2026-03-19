# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 11                                           |
| Phase名    | 手動テスト検証                               |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 10（最終レビュー）                     |
| 後続Phase  | Phase 12（ドキュメント）                     |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 更新日     | 2026-03-17                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認し、**UI/UX品質の問題を発見・修正する**。Workspace Chat Panel の streaming / file context / conversation / terminal transcript の各機能が設計どおりに動作し、compact 幅でもレイアウトが崩れないことを検証する。スクリーンショットは品質改善のための手段であり、撮影自体が目的ではない。

## 実行タスク

- 機能テスト: zero state / streaming / cancel / file context / mention / conversation persistence / terminal handoff の代表シナリオを手動検証する
- UI/UXテスト: レイアウト / レスポンシブ（compact幅） / アクセシビリティ（WCAG準拠）を確認する
- 統合テスト: IPC 接続（llm:stream-chat / conversation:create / conversation:addMessage）/ データ永続化の手動確認を行う
- リグレッションテスト: Main Chat との並行動作 / 既存 WorkspaceView 機能への影響を確認する
- UI/UX品質評価: 全画面状態を撮影し、品質基準で評価し、問題を発見・修正・再検証する

## 参照資料

| 参照資料                    | パス                                                                        | 内容                                                              |
| --------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                   | 対象範囲と代表導線を確認する                                      |
| Phase 2（設計）             | `phase-2-design.md`                                                         | authority と handoff 契約を確認する                               |
| Phase 5（実装）             | `phase-5-implementation.md`                                                 | 手動確認対象の変更点を確認する                                    |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                                 | 回帰シナリオを確認する                                            |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                                 | coverage gap を確認する                                           |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                    | 整理後の責務境界を確認する                                        |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                              | 品質観点の確認結果を確認する                                      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                  | 最終判定後の確認観点を確認する                                    |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`      | UI 画面の確認対象を確認する                                       |
| WorkspaceView               | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                   | file preview / panel 統合の確認対象を確認する                     |
| UI/UX 正本                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`    | Workspace Chat Panel の zero / streaming / compact 状態を確認する |
| 実行ガイダンス              | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | 撮影コマンド詳細・レポート形式を確認する                          |
| Apple HIG カラー            | `.claude/rules/01-architecture.md`                                          | カラーパレット準拠を確認する                                      |

### システム仕様（aiworkflow-requirements）

> 手動テストの合否判定・UI/UX 照合の根拠として参照する。

| 参照資料                 | パス                                                                            | 照合内容                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | TC-11-01〜TC-11-04 の 5 状態（zero / streaming / guidance / compact）の照合根拠 |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | TC-11-05 terminal launcher / TC-11-04 guidance 導線の導線設計正本               |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | TC-11-02 streaming / cancel の stale chunk 判定根拠                             |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | TC-11-07 conversation persistence の Main Process 経由確認根拠                  |

## テストカテゴリ

- **機能テスト**: 正常系 / 異常系 / 境界値 / 状態遷移
- **UI/UXテスト**: レイアウト / レスポンシブ / フィードバック / アクセシビリティ
- **統合テスト**: IPC 連携 / データ永続化
- **リグレッションテスト**: 既存機能 / 関連機能

## テストケース

| No       | カテゴリ    | テスト項目                      | 前提条件                                          | 操作手順                                                                                                                              | 期待結果                                                                                                         | 実行結果   | スクリーンショット                          | 備考                           |
| -------- | ----------- | ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------- | ------------------------------ |
| TC-11-01 | 機能テスト  | zero state 表示                 | Workspace Chat Panel を初回表示する               | 1. WorkspaceView を開く 2. Chat Panel を選択する 3. 初期状態を確認する                                                                | suggestion bubble と capability 一覧が同時に表示される。compact 幅でもレイアウトが崩れない                       | {{RESULT}} | TC-11-01-zero-state-light.png               | compact 幅も別途確認           |
| TC-11-02 | 機能テスト  | streaming と cancel             | API Key が設定済み、provider / model が選択済み   | 1. メッセージを送信する 2. streaming 中にレスポンスが逐次表示されることを確認する 3. Cancel ボタンを押下する 4. 状態復帰を確認する    | streaming 中はチャンク単位でテキストが追加される。cancel 後は stale content が残らず、再送信可能な状態に復帰する | {{RESULT}} | TC-11-02-streaming-cancel-light.png         | stale content 残存を重点確認   |
| TC-11-03 | 機能テスト  | file context と mention         | ファイルが WorkspaceView で選択済み               | 1. ファイルを選択する 2. context chips が表示されることを確認する 3. @mention を入力する 4. mention picker が表示されることを確認する | chips / mention / selected file の導線が失われない。chips はファイル名を正しく表示する                           | {{RESULT}} | TC-11-03-file-context-light.png             | file read 経路の正常性を確認   |
| TC-11-04 | UI/UXテスト | unsupported capability guidance | API Key 未設定 または capability 制限状態         | 1. capability 制限状態で Chat Panel を開く 2. guidance メッセージを確認する 3. ウィンドウ幅を narrow に変更する                       | unsupported capability guidance が表示される。compact 幅でも guidance テキストが切れずに読める                   | {{RESULT}} | TC-11-04-compact-guidance-light.png         | narrow 幅 380px で確認         |
| TC-11-05 | 機能テスト  | persistent terminal launcher    | WorkspaceView が表示済み                          | 1. panel header を確認する 2. terminal dock ボタンをクリックする 3. terminal dock が開くことを確認する                                | panel header から terminal dock をいつでも開ける。ボタンは常に visible である                                    | {{RESULT}} | TC-11-05-terminal-launcher-light.png        | header の constant visibility  |
| TC-11-06 | 機能テスト  | transcript provenance chip      | terminal で作業を実行済み                         | 1. terminal transcript を手動共有する 2. chat 入力欄に transcript provenance chip が表示されることを確認する                          | terminal 共有内容が file context chips と視覚的に区別されて表示される                                            | {{RESULT}} | TC-11-06-transcript-chip-light.png          | file context との区別を確認    |
| TC-11-07 | 統合テスト  | conversation persistence        | メッセージ送受信済みの conversation が存在する    | 1. conversation を保存する 2. アプリをリロードする 3. conversation が復元されることを確認する                                         | conversation が正しく保存・復元される。メッセージ順序・role が保持される                                         | {{RESULT}} | TC-11-07-conversation-persistence-light.png | reload 前後のデータ整合性      |
| TC-11-08 | 機能テスト  | error state 表示                | ネットワークエラーまたは API エラーが発生する状態 | 1. stream failure を発生させる 2. エラー guidance が表示されることを確認する 3. file read failure を発生させる                        | stream failure / file read failure 時に適切な guidance が表示される。retryable エラーには再試行導線が提示される  | {{RESULT}} | TC-11-08-error-state-light.png              | retryable / non-retryable 両方 |

## スクリーンショット撮影ガイドライン

### 適用判断

本タスクは UI/UX 変更を伴う設計タスクである。実装は含まないが、UI surface の設計検証としてウォークスルー方式を適用する。

| タスク種別 | スクリーンショット | 判断基準                                      |
| ---------- | ------------------ | --------------------------------------------- |
| 本タスク   | **必須**           | Workspace Chat Panel の UI 状態設計を検証する |

### 撮影規定

| 項目           | 規定                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| 命名規則       | `TC-{番号}-{状態ラベル}-{テーマ}.png`（例: `TC-11-01-zero-state-light.png`） |
| 配置先         | `outputs/phase-11/screenshots/`                                              |
| 必須タイミング | (1) 操作後の結果状態 (2) エラー発生時のUI（Phase 11 では after 撮影のみ）    |
| 紐付け規定     | `manual-test-result.md` のテスト結果表で**各TCに最低1枚**の証跡を紐付ける    |

### 仕様照合チェックリスト

- [ ] レイアウトが Phase 2 設計書の画面設計と一致している
- [ ] カラーパレットが Apple HIG 準拠（`.claude/rules/01-architecture.md` 参照）である
- [ ] スペーシングが 8px グリッドに従っている
- [ ] ダークモード / ライトモード両方で確認している（該当時）
- [ ] エラー状態の UI 表示が設計書と一致している
- [ ] context chips の視覚的階層が明確である（file context vs transcript provenance）
- [ ] compact 幅（380px）でも guidance テキストが切れない

### 撮影コマンド

```bash
# 推奨: 撮影計画から一括撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment \
  --plan outputs/phase-11/screenshot-plan.json
```

### 網羅性検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment
```

### 撮影不可時の代替

CI/ビルド環境制約で Electron を起動できない場合:

1. `outputs/phase-11/screenshots/NOTE.txt` に理由を記載する
2. DevTools ログまたはテスト実行結果をエビデンスとして記録する

## 画面カバレッジマトリクス

> ルートベースの撮影だけでは、コンポーネントの個別UI状態が漏れる。
> 以下の 4 ステップで撮影計画を作成してから撮影を開始する。

### Step 1: 変更コンポーネント一覧の洗い出し

Phase 5 で追加・変更した全 React コンポーネントを列挙する:

```bash
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント             | 種別 | 配置ルート | 表示トリガー                   |
| --- | -------------------------- | ---- | ---------- | ------------------------------ |
| 1   | WorkspaceChatPanel         | 変更 | /workspace | WorkspaceView の Chat タブ選択 |
| 2   | useWorkspaceChatController | 変更 | -（hook）  | WorkspaceChatPanel マウント時  |
| 3   | WorkspaceView/index.tsx    | 変更 | /workspace | Workspace ナビゲーション選択   |

### Step 2: UI 状態カバレッジの定義

**表示状態（Visual States）**:

| 状態                   | WorkspaceChatPanel | 説明                                              |
| ---------------------- | ------------------ | ------------------------------------------------- |
| デフォルト表示         | **必須**           | zero state: suggestion bubble + capability 表示   |
| データあり表示         | **必須**           | メッセージ送受信後の conversation 表示            |
| 空状態（Empty State）  | **必須**           | zero state と同一                                 |
| ローディング中         | **必須**           | streaming 受信中のチャンク逐次表示                |
| エラー表示             | **必須**           | stream failure / file read failure の guidance    |
| 成功フィードバック     | N/A                | conversation 保存は暗黙的であり CUD feedback なし |
| 無効化状態（Disabled） | **必須**           | capability 制限時の guidance 表示                 |
| 境界値表示             | 推奨               | 長文メッセージ / 多数ファイル選択時               |

**インタラクション状態（Interaction States）**:

| 状態                    | WorkspaceChatPanel | 説明                                       |
| ----------------------- | ------------------ | ------------------------------------------ |
| ホバー                  | 推奨               | suggestion bubble / action button のホバー |
| フォーカス              | 推奨               | composer input のフォーカス状態            |
| モーダル/ダイアログ表示 | N/A                | 本タスクでモーダルは使用しない             |
| ドロップダウン展開      | **必須**           | mention picker の展開状態                  |
| フォーム入力中          | **必須**           | composer にメッセージ入力中の状態          |
| 確認ダイアログ          | N/A                | cancel は即時実行であり確認ダイアログなし  |

**テーマ状態（Theme States）**:

| 状態         | WorkspaceChatPanel | 説明                 |
| ------------ | ------------------ | -------------------- |
| ライトモード | **必須**           | 全コンポーネント必須 |
| ダークモード | **必須**           | 全コンポーネント必須 |

### Step 3: 撮影計画の作成

撮影計画を `outputs/phase-11/screenshot-plan.json` に作成する:

| テストケース | コンポーネント     | 状態                   | 撮影方法                             | テーマ | ファイル名                                    |
| ------------ | ------------------ | ---------------------- | ------------------------------------ | ------ | --------------------------------------------- |
| TC-11-01     | WorkspaceChatPanel | デフォルト表示（zero） | route: /workspace + Chat タブ        | light  | `TC-11-01-zero-state-light.png`               |
| TC-11-01     | WorkspaceChatPanel | デフォルト表示（zero） | route: /workspace + Chat タブ --dark | dark   | `TC-11-01-zero-state-dark.png`                |
| TC-11-02     | WorkspaceChatPanel | streaming 中           | route: /workspace + メッセージ送信   | light  | `TC-11-02-streaming-light.png`                |
| TC-11-02     | WorkspaceChatPanel | cancel 後復帰          | route: /workspace + cancel 押下      | light  | `TC-11-02-cancel-light.png`                   |
| TC-11-03     | WorkspaceChatPanel | file context + mention | route: /workspace + ファイル選択     | light  | `TC-11-03-file-context-light.png`             |
| TC-11-04     | WorkspaceChatPanel | compact guidance       | route: /workspace + 380px 幅         | light  | `TC-11-04-compact-guidance-light.png`         |
| TC-11-04     | WorkspaceChatPanel | compact guidance       | route: /workspace + 380px 幅 --dark  | dark   | `TC-11-04-compact-guidance-dark.png`          |
| TC-11-05     | WorkspaceChatPanel | terminal launcher      | route: /workspace + header 確認      | light  | `TC-11-05-terminal-launcher-light.png`        |
| TC-11-06     | WorkspaceChatPanel | transcript chip        | route: /workspace + transcript 共有  | light  | `TC-11-06-transcript-chip-light.png`          |
| TC-11-07     | WorkspaceChatPanel | conversation 復元      | route: /workspace + reload 後        | light  | `TC-11-07-conversation-persistence-light.png` |
| TC-11-08     | WorkspaceChatPanel | error guidance         | route: /workspace + エラー発生       | light  | `TC-11-08-error-state-light.png`              |

### Step 4: 画面カバレッジレポート

撮影完了後、`outputs/phase-11/screenshot-coverage.md` に記録する:

| カバレッジ種別                                 | 対象数 | 撮影数 | カバレッジ率 | 基準         |
| ---------------------------------------------- | ------ | ------ | ------------ | ------------ |
| コンポーネントカバレッジ                       | 1      | 1      | 100%         | **100%必須** |
| 表示状態カバレッジ（該当必須項目）             | 6      | 6      | 100%         | **100%必須** |
| インタラクション状態カバレッジ（該当必須項目） | 2      | 2      | 100%         | **100%必須** |
| テーマカバレッジ                               | 2      | 2      | 100%         | **100%必須** |

**N/A理由テーブル**:

| コンポーネント     | スキップした状態    | N/A理由                                              |
| ------------------ | ------------------- | ---------------------------------------------------- |
| WorkspaceChatPanel | 成功フィードバック  | conversation 保存は暗黙的であり CUD feedback UI なし |
| WorkspaceChatPanel | モーダル/ダイアログ | 本タスクスコープでモーダルは使用しない               |
| WorkspaceChatPanel | 確認ダイアログ      | cancel は即時実行であり確認ダイアログなし            |

## テストシナリオ発見事項リアルタイム分類欄

各テストケース実行中に発見した事項を即座に分類する。シナリオ完了後にまとめて分類せず、発見時点でリアルタイムに記録すること。

| #   | シナリオ     | 発見事項         | 分類                  | 対応方針         |
| --- | ------------ | ---------------- | --------------------- | ---------------- |
| 1   | TC-11-01〜08 | （実行時に記録） | Blocker / Note / Info | （実行時に記録） |

**分類基準**:

- **Blocker**: Phase 12 完了前に修正必須。仕様整合性・参照リンク切れ・追跡可能性の断絶
- **Note**: 改善推奨だが Phase 12 完了をブロックしない。未タスク化を検討
- **Info**: 記録のみ。今後の参考情報として残す

## 統合テスト連携

手動統合テスト（IPC / データ永続化）を確認する:

| テスト項目             | 確認内容                                             | 期待結果                                                 | 実行結果   |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ---------- |
| llm:stream-chat 接続   | メッセージ送信時に IPC 経由で streaming が開始される | chunk 受信が開始され、テキストが逐次表示される           | {{RESULT}} |
| llm:cancel-stream 接続 | cancel 押下時に streaming が停止する                 | abort が正常に処理され、stale content が残らない         | {{RESULT}} |
| conversation 永続化    | conversation 保存 → リロード → 表示                  | メッセージ順序・role が保持される                        | {{RESULT}} |
| file context 取得      | electronAPI.file.read 経由でファイル内容を取得する   | ファイル内容が正しく context に含まれる                  | {{RESULT}} |
| error handling         | API 障害時の error guidance 表示                     | retryable / non-retryable に応じた guidance が表示される | {{RESULT}} |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点             | 適用判断                                          | 仕様参照先                                   |
| ---------------- | ------------------------------------------------- | -------------------------------------------- |
| UI/UX            | Workspace Chat Panel の UI 状態設計を検証するため | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ   | IPC 契約と authority 設計の整合性を検証するため   | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ | WCAG 2.1 AA 準拠を確認するため                    | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

📖 詳細: `references/quality-standards.md` セクション8

## 成果物

| 成果物             | パス                                      | 必須 | 説明                                     |
| ------------------ | ----------------------------------------- | ---- | ---------------------------------------- |
| テスト結果         | `outputs/phase-11/manual-test-result.md`  | 必須 | 手動テスト結果と各TC の PASS/FAIL を記録 |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`   | 必須 | 発見した課題（0件でも出力する）          |
| スクリーンショット | `outputs/phase-11/screenshots/`           | 必須 | UI/UX 変更タスクのため必須               |
| 撮影計画           | `outputs/phase-11/screenshot-plan.json`   | 必須 | 画面カバレッジ用の撮影定義               |
| カバレッジレポート | `outputs/phase-11/screenshot-coverage.md` | 必須 | 100% 達成確認用                          |

## 完了条件

- [ ] すべてのテストケース（TC-11-01 ~ TC-11-08）が実行済みである
- [ ] すべてのテストケースが PASS である
- [ ] 統合テスト手動確認が完了している
- [ ] `git diff` で変更コンポーネント一覧を洗い出し済みである
- [ ] 各コンポーネントの全 UI 状態（表示 / インタラクション / テーマ）を列挙済みである（N/A 理由も記録済み）
- [ ] 撮影計画 `screenshot-plan.json` が作成済みである
- [ ] 撮影計画の全項目のスクリーンショットが `outputs/phase-11/screenshots/` に配置済みである
- [ ] 各 TC にスクリーンショット証跡が紐付き、`validate-phase11-screenshot-coverage.js` が PASS である
- [ ] 画面カバレッジレポートの必須項目（優先度[A][B]）が 100% である
- [ ] 仕様照合チェックリスト全項目を確認済みである（Apple HIG カラー / 8px グリッド / compact 幅）
- [ ] 品質評価で発見した UI/UX 問題を全て修正済みである（または `discovered-issues.md` に記録済み）
- [ ] 修正後の再撮影が完了し、品質基準をクリアしていることを確認済みである
- [ ] stream / context / fail-fast / guidance の代表シナリオが含まれている
- [ ] zero / streaming / file-context / compact-guidance / error の 5 状態が screenshot 証跡に残っている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 機能テスト（TC-11-01 ~ TC-11-03, TC-11-05 ~ TC-11-08）の実施
3. UI/UX テスト（TC-11-04）の実施
4. 統合テスト連携の実施
5. スクリーンショット撮影と画面カバレッジレポート作成
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment \
  --phase 11
```

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
