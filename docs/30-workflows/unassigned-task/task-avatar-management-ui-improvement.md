# アバター管理UI改善 - タスク指示書

## メタ情報

| 項目             | 内容                 |
| ---------------- | -------------------- |
| タスクID         | TASK-USER-DATA-03    |
| タスク名         | アバター管理UI改善   |
| 分類             | UI/UX改善            |
| 対象機能         | ユーザーデータ永続化 |
| 優先度           | 低                   |
| 見積もり規模     | 小規模               |
| ステータス       | 未実施               |
| 発見元           | ユーザー要件         |
| 発見日           | 2025-12-10           |
| 発見エージェント | タスク分解プロンプト |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のアバター管理機能は基本的なアップロード・削除機能を提供しているが、UIの操作性やビジュアルフィードバックが十分でない。ユーザーがより直感的にアバターを管理できるようにする必要がある。

### 1.2 問題点・課題

- アバター変更時のプレビュー機能がない
- アップロード進捗表示が不十分
- クロップ/リサイズ機能がない
- 画像フォーマット変換が手動
- ドラッグ&ドロップでのアップロードができない

### 1.3 放置した場合の影響

- ユーザー体験の低下
- 不適切なサイズ/フォーマットの画像アップロード
- アバター変更の手間増加

---

## 2. 何を達成するか（What）

### 2.1 目的

アバター管理のUI/UXを改善し、直感的で使いやすい操作体験を提供する。

### 2.2 最終ゴール

- 画像アップロード前のプレビュー機能
- 画像クロップ（正方形/円形切り抜き）機能
- アップロード進捗のビジュアル表示
- ドラッグ&ドロップ対応
- 削除確認のモーダル改善

### 2.3 スコープ

#### 含むもの

- プレビューモーダルコンポーネント
- 画像クロップコンポーネント（react-image-crop使用）
- 進捗バー表示
- ドラッグ&ドロップエリア
- 削除確認ダイアログ改善

#### 含まないもの

- サーバーサイドの画像処理
- 画像のAI自動補正
- アバターのアニメーション対応

### 2.4 成果物

| 種別   | 成果物                           | 配置先                                                         |
| ------ | -------------------------------- | -------------------------------------------------------------- |
| UI     | アバターエディターコンポーネント | `apps/desktop/src/renderer/components/organisms/AvatarEditor/` |
| UI     | 画像クロッパー                   | `apps/desktop/src/renderer/components/molecules/ImageCropper/` |
| UI     | ドロップゾーン                   | `apps/desktop/src/renderer/components/molecules/DropZone/`     |
| テスト | コンポーネントテスト             | `apps/desktop/src/renderer/components/__tests__/`              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 既存のアバターアップロード機能が動作していること
- Supabase Storage が設定済みであること

### 3.2 依存タスク

- なし（独立して実装可能）

### 3.3 必要な知識・スキル

- React コンポーネント設計
- Canvas API / 画像処理
- ドラッグ&ドロップ API
- react-image-crop または類似ライブラリ

### 3.4 推奨アプローチ

1. **クライアントサイド処理**: 画像加工はブラウザ内で完結
2. **プログレッシブエンハンスメント**: 基本機能を維持しつつ拡張
3. **アクセシビリティ考慮**: キーボード操作対応

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 1.5: 設計レビュー
→ Phase 2: テスト作成 → Phase 3: 実装 → Phase 4: リファクタリング
→ Phase 5: 品質保証 → Phase 5.5: 最終レビュー → Phase 6: ドキュメント更新
```

---

### Phase 0: 要件定義

#### T-00-1: UI/UX要件定義

##### 目的

アバター管理UIの改善要件を定義する。

##### Claude Code スラッシュコマンド

```
/ai:gather-requirements avatar-management-ui
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@req-analyst`
- **選定理由**: ユーザー要件の明確化
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物     | パス                                                     | 内容       |
| ---------- | -------------------------------------------------------- | ---------- |
| 要件定義書 | `docs/30-workflows/avatar-management-ui/requirements.md` | UI要件一覧 |

##### 完了条件

- [ ] 改善項目の確定
- [ ] 操作フローの定義
- [ ] アクセシビリティ要件

---

### Phase 1: 設計

#### T-01-1: コンポーネント設計

##### 目的

アバターエディターのコンポーネント構成を設計する。

##### Claude Code スラッシュコマンド

```
/ai:create-component AvatarEditor organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **選定理由**: UIコンポーネント設計の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                       | 活用方法                |
| ------------------------------ | ----------------------- |
| design-system-architecture     | デザインシステム準拠    |
| component-composition-patterns | Compositionパターン活用 |
| accessibility-wcag             | WCAG準拠設計            |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物 | パス                                                         | 内容               |
| ------ | ------------------------------------------------------------ | ------------------ |
| 設計書 | `docs/30-workflows/avatar-management-ui/component-design.md` | コンポーネント設計 |

##### 完了条件

- [ ] コンポーネント構成図
- [ ] Props定義
- [ ] 状態管理設計

---

### Phase 1.5: 設計レビューゲート

#### T-01R: 設計レビュー

##### レビュー参加エージェント

| エージェント     | レビュー観点       | 選定理由           |
| ---------------- | ------------------ | ------------------ |
| @ui-designer     | UI/UX品質          | ユーザビリティ確認 |
| @arch-police     | コンポーネント設計 | 設計原則遵守       |
| @frontend-tester | テスタビリティ     | テスト可能性確認   |

- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全レビュー観点でPASS

---

### Phase 2: テスト作成 (TDD: Red)

#### T-02-1: コンポーネントテスト作成

##### 目的

アバターエディターコンポーネントのテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:generate-component-tests apps/desktop/src/renderer/components/organisms/AvatarEditor
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@frontend-tester`
- **選定理由**: フロントエンドテスト専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名             | 活用方法               |
| -------------------- | ---------------------- |
| playwright-testing   | インタラクションテスト |
| test-data-management | テストデータ準備       |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                                             | 内容                 |
| -------------- | -------------------------------------------------------------------------------- | -------------------- |
| テストファイル | `apps/desktop/src/renderer/components/organisms/__tests__/AvatarEditor.test.tsx` | コンポーネントテスト |

##### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run AvatarEditor
```

- [ ] テストが失敗することを確認（Red状態）

##### 完了条件

- [ ] 画像選択テスト
- [ ] クロップ操作テスト
- [ ] ドラッグ&ドロップテスト
- [ ] アップロード進捗テスト

---

### Phase 3: 実装 (TDD: Green)

#### T-03-1: DropZoneコンポーネント実装

##### 目的

ドラッグ&ドロップ対応のファイル入力エリアを実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-component DropZone molecule
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                       | 内容           |
| -------------- | ---------------------------------------------------------- | -------------- |
| コンポーネント | `apps/desktop/src/renderer/components/molecules/DropZone/` | ドロップゾーン |

##### 完了条件

- [ ] ドラッグオーバーのビジュアルフィードバック
- [ ] ファイルドロップ検知
- [ ] クリックでファイル選択
- [ ] ファイルタイプフィルタリング

---

#### T-03-2: ImageCropperコンポーネント実装

##### 目的

画像クロップ機能を実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-component ImageCropper molecule
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                           | 内容       |
| -------------- | -------------------------------------------------------------- | ---------- |
| コンポーネント | `apps/desktop/src/renderer/components/molecules/ImageCropper/` | クロッパー |

##### 完了条件

- [ ] 正方形クロップエリア
- [ ] ズーム操作
- [ ] プレビュー表示
- [ ] クロップ結果出力

---

#### T-03-3: AvatarEditorコンポーネント実装

##### 目的

アバターエディター全体を統合実装する。

##### Claude Code スラッシュコマンド

```
/ai:create-component AvatarEditor organism
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@ui-designer`
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物         | パス                                                           | 内容       |
| -------------- | -------------------------------------------------------------- | ---------- |
| コンポーネント | `apps/desktop/src/renderer/components/organisms/AvatarEditor/` | エディター |

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run AvatarEditor
```

- [ ] テストが成功することを確認（Green状態）

##### 完了条件

- [ ] 画像選択→クロップ→アップロードフロー
- [ ] 進捗バー表示
- [ ] エラーハンドリング
- [ ] キャンセル操作

---

### Phase 4: リファクタリング (TDD: Refactor)

#### T-04-1: コード品質改善

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/AvatarEditor
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@code-quality`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] 重複コード排除

---

### Phase 5: 品質保証

#### T-05-1: 統合テスト実行

##### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 完了条件

- [ ] 全テスト成功
- [ ] カバレッジ80%以上

---

#### T-05-2: アクセシビリティ監査

##### Claude Code スラッシュコマンド

```
/ai:run-accessibility-audit --scope component
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@frontend-tester`
- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] WCAG AA準拠
- [ ] キーボード操作可能
- [ ] スクリーンリーダー対応

---

### Phase 5.5: 最終レビューゲート

#### T-05R: 最終レビュー

##### レビュー参加エージェント

| エージェント  | レビュー観点 | 選定理由   |
| ------------- | ------------ | ---------- |
| @ui-designer  | UI/UX品質    | 最終UI確認 |
| @code-quality | コード品質   | 保守性確認 |

- **参照**: `.claude/agents/agent_list.md`

##### 完了条件

- [ ] 全レビュー観点でPASS

---

### Phase 6: ドキュメント更新

#### T-06: ドキュメント更新

##### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 完了条件

- [ ] コンポーネントドキュメント作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ドラッグ&ドロップでアップロード可能
- [ ] 画像クロップが可能
- [ ] アップロード進捗が表示される
- [ ] プレビュー確認後にアップロード可能

### 品質要件

- [ ] 全テスト成功
- [ ] WCAG AA準拠
- [ ] Lintエラーなし

### ドキュメント要件

- [ ] コンポーネントドキュメント作成

---

## 6. 検証方法

### テストケース

1. **正常系**: ドラッグ&ドロップで画像を選択できる
2. **正常系**: 画像をクロップして保存できる
3. **正常系**: アップロード中に進捗が表示される
4. **異常系**: 非対応形式のファイルがエラー表示される

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                         |
| -------------------------- | ------ | -------- | ---------------------------- |
| 大容量画像のパフォーマンス | 中     | 中       | Canvas最適化、Web Worker活用 |
| ブラウザ互換性             | 低     | 低       | Electronなので限定的         |
| メモリリーク               | 中     | 低       | Canvas/Blob適切な解放        |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/ipc/avatarHandlers.ts` - 既存アバターハンドラー
- `apps/desktop/src/renderer/components/organisms/AccountSection/` - 既存UI

### 参考資料

- [react-image-crop](https://github.com/DominicTobias/react-image-crop)
- [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

---

## 9. 備考

### 補足事項

- react-image-cropの導入が必要（`pnpm --filter @repo/desktop add react-image-crop`）
- クロップ後の画像サイズは256x256pxを標準とする
- WebP形式への変換でファイルサイズ削減を検討
