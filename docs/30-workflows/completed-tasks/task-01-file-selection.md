# ファイル選択機能 - タスク指示書

## メタ情報

| 項目             | 内容                 |
| ---------------- | -------------------- |
| タスクID         | CONV-01              |
| タスク名         | ファイル選択機能     |
| 分類             | 要件/新規機能        |
| 対象機能         | ファイル変換システム |
| 優先度           | 高                   |
| 見積もり規模     | 中規模               |
| ステータス       | 未実施               |
| 発見元           | 初期要件定義         |
| 発見日           | 2025-12-15           |
| 発見エージェント | .claude/agents/req-analyst.md         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ユーザーがファイルを選択し、指定のフォーマットに変換してデータベースに保存する機能を実装するにあたり、最初のステップとしてファイル選択機能が必要。

### 1.2 問題点・課題

- ファイルを変換するためには、まずユーザーが対象ファイルを選択できる必要がある
- Electronアプリケーションでのファイル選択UIとネイティブダイアログの統合が必要
- 選択されたファイルの情報を後続の変換処理に渡す仕組みが必要

### 1.3 放置した場合の影響

- ファイル変換機能全体が実装できない
- 後続のタスク（変換エンジン、DB保存）がすべてブロックされる

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーがファイルを選択し、選択されたファイル情報を取得できるUIとロジックを実装する。

### 2.2 最終ゴール

- ファイル選択ダイアログを開くボタンがUIに存在する
- ネイティブのファイル選択ダイアログが開く
- 選択されたファイルのパス、名前、サイズ、拡張子などのメタ情報が取得できる
- 選択されたファイル情報が状態管理に保存される

### 2.3 スコープ

#### 含むもの

- ファイル選択UIコンポーネント
- Electron IPC通信によるネイティブダイアログ呼び出し
- ファイルメタ情報の取得
- ファイル情報の状態管理（Zustand等）
- 対応ファイル形式のフィルタリング

#### 含まないもの

- ファイルの実際の読み込み・変換処理
- データベースへの保存
- 変換結果の表示

### 2.4 成果物

- `apps/desktop/src/renderer/components/FileSelector.tsx` - ファイル選択UIコンポーネント
- `apps/desktop/src/main/handlers/file-dialog.ts` - IPC ハンドラ
- `apps/desktop/src/renderer/store/file-store.ts` - ファイル情報状態管理
- `packages/shared/src/types/file.ts` - ファイル関連の型定義
- ユニットテスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Electron + React の開発環境がセットアップ済み
- IPC通信の基盤が整備済み
- 状態管理（Zustand）が導入済み

### 3.2 依存タスク

- なし（最初のタスク）

### 3.3 必要な知識・スキル

- Electron IPC通信（Main ↔ Renderer）
- React コンポーネント設計
- Zustand 状態管理
- TypeScript 型定義

### 3.4 推奨アプローチ

1. まず型定義を作成（shared パッケージ）
2. Electron Main プロセスでファイルダイアログハンドラを実装
3. Renderer プロセスで状態管理ストアを作成
4. UIコンポーネントを実装
5. TDDでテストを先に作成してから実装

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

ファイル選択機能の詳細要件を明確化する。

#### Claude Code スラッシュコマンド

> 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements file-selection
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/req-analyst.md
- **選定理由**: 要件の抽出・整理・明確化に特化したエージェント
- **代替候補**: .claude/agents/product-manager.md（ビジネス要件が複雑な場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                               | 活用方法                   | 選定理由                 |
| -------------------------------------- | -------------------------- | ------------------------ |
| .claude/skills/functional-non-functional-requirements/SKILL.md | 機能要件と非機能要件の整理 | 要件漏れを防ぐ           |
| .claude/skills/use-case-modeling/SKILL.md                      | ユースケースの特定         | ユーザー視点での要件整理 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 要件定義ドキュメント

#### 完了条件

- [ ] 機能要件が明確に定義されている
- [ ] 対応ファイル形式が決定されている
- [ ] UIの振る舞いが定義されている

---

### Phase 1: 設計

#### 目的

ファイル選択機能のアーキテクチャ・コンポーネント設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:design-architecture file-selection
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/electron-architect.md
- **選定理由**: Electron固有のIPC通信設計に精通
- **代替候補**: .claude/agents/ui-designer.md（UI設計が中心の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                      | 活用方法                   | 選定理由                       |
| ----------------------------- | -------------------------- | ------------------------------ |
| .claude/skills/electron-ui-patterns/SKILL.md          | ElectronでのUI実装パターン | Electronベストプラクティス適用 |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離設計           | 保守性の高い設計               |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- コンポーネント設計図
- IPC通信設計
- 状態管理設計

#### 完了条件

- [ ] IPC通信の設計が完了
- [ ] コンポーネント構成が決定
- [ ] 状態管理の設計が完了

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

ファイル選択機能のテストを実装より先に作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/renderer/components/FileSelector.tsx
/ai:generate-unit-tests apps/desktop/src/main/handlers/file-dialog.ts
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテスト設計・実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法             | 選定理由             |
| ----------------------- | -------------------- | -------------------- |
| .claude/skills/test-doubles/SKILL.md            | モック・スタブの活用 | IPC通信のモック化    |
| .claude/skills/boundary-value-analysis/SKILL.md | 境界値テスト         | エッジケースのカバー |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `apps/desktop/src/renderer/components/__tests__/FileSelector.test.tsx`
- `apps/desktop/src/main/handlers/__tests__/file-dialog.test.ts`

#### 完了条件

- [ ] テストが失敗すること（Red状態）を確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための最小限の実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:create-component FileSelector file-selector
/ai:create-electron-window file-dialog-handler
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/electron-ui-dev.md
- **選定理由**: Electron UIコンポーネントの実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                    | 活用方法         | 選定理由                  |
| --------------------------- | ---------------- | ------------------------- |
| .claude/skills/type-safety-patterns/SKILL.md        | 型安全な実装     | 実行時エラー防止          |
| .claude/skills/electron-security-hardening/SKILL.md | セキュリティ考慮 | IPC通信のセキュリティ確保 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 実装コード一式

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイル選択ボタンがUIに表示される
- [ ] クリックでネイティブダイアログが開く
- [ ] ファイル選択後、ファイル情報が取得できる
- [ ] 選択キャンセル時のハンドリングが正常

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上

### ドキュメント要件

- [ ] コンポーネントのJSDocが記述されている
- [ ] IPC通信のAPI仕様が文書化されている

---

## 6. 検証方法

### テストケース

1. ファイル選択ボタンのレンダリング
2. ダイアログ呼び出しのトリガー
3. ファイル選択成功時のコールバック
4. ファイル選択キャンセル時の処理
5. 不正なファイル形式の拒否

### 検証手順

1. `pnpm --filter @repo/desktop test:run` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` で手動確認
3. 各種ファイル形式での選択テスト

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                        |
| ---------------------------------------- | ------ | -------- | --------------------------- |
| IPC通信のセキュリティ問題                | 高     | 中       | contextBridge使用、入力検証 |
| ファイルパスのクロスプラットフォーム対応 | 中     | 中       | path.normalize使用          |
| 大量ファイル選択時のパフォーマンス       | 中     | 低       | 選択数制限の実装            |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/05-architecture.md`

### 参考資料

- Electron Dialog API: https://www.electronjs.org/docs/latest/api/dialog
- Zustand Documentation: https://docs.pmnd.rs/zustand

---

## 9. 備考

### 補足事項

- このタスクは後続タスク（CONV-02〜CONV-05）の前提条件となる
- ファイル形式のフィルタリングは変換エンジン（CONV-02）の対応形式に依存
