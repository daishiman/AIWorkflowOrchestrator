# スライド出力ディレクトリ設定機能 - タスク指示書

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | task-feat-slide-directory-settings-002 |
| タスク名     | スライド出力ディレクトリ設定機能       |
| 分類         | 要件（新機能）                         |
| 対象機能     | スライド作成システム                   |
| 優先度       | 高                                     |
| 見積もり規模 | 小規模                                 |
| ステータス   | 完了                                   |
| 発見元       | 新規要件（ユーザー要求）               |
| 発見日       | 2026-01-07                             |
| 完了日       | 2026-01-14                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

presentation-slide-generatorスキルは、スライドを以下の構成で出力する：

```
slide-YYYY-MM-DD-{タイトル}/
├── index.html      # プレゼンテーション本体
├── structure.md    # 構造化データ（改善・修正用）
└── deploy-guide.md # GASデプロイ手順
```

現状、出力先はスキル内でハードコードされており（`05_Project/スライド/`）、ユーザーが自由に変更できない。Electronアプリから利用する場合、ユーザーが任意のディレクトリを指定できる必要がある。

### 1.2 問題点・課題

- スライド出力先がユーザーの環境に依存する
- アプリ上で出力先を設定するUIがない
- 設定の永続化機能がない（アプリ再起動で設定が消える）
- スキル呼び出し時に動的にディレクトリパスを渡す仕組みがない

### 1.3 放置した場合の影響

- ユーザーは固定のディレクトリにしか出力できない
- 複数プロジェクトでの利用が困難
- スキル呼び出し時に毎回パスを手入力する必要がある
- UXが著しく低下し、実用性が損なわれる

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーがElectronアプリのUI上でスライド出力ディレクトリを設定・管理できる機能を実装する。

### 2.2 最終ゴール

1. アプリの設定画面でスライド出力先ディレクトリを指定できる
2. 設定がアプリ再起動後も永続化される
3. ディレクトリが存在しない場合は自動作成される
4. スキル呼び出し時に設定されたディレクトリが自動的に使用される

### 2.3 スコープ

#### 含むもの

- 設定画面UIコンポーネント（ディレクトリ選択ダイアログ）
- 設定の永続化（electron-store使用）
- ディレクトリ存在確認・自動作成機能
- スキル呼び出し時のディレクトリパス注入
- 設定変更時のバリデーション

#### 含まないもの

- structure.md ⇔ index.html の依存関係管理（別タスク）
- スキルのフルワークフロー統合（別タスク）
- クラウドストレージ連携（Google Drive等）

### 2.4 成果物

| 成果物                                  | 説明                               |
| --------------------------------------- | ---------------------------------- |
| `apps/desktop/src/renderer/settings/`   | 設定画面コンポーネント             |
| `apps/desktop/src/main/settings/`       | 設定管理サービス（electron-store） |
| `packages/shared/src/types/settings.ts` | 設定型定義                         |
| ユニットテスト                          | 設定機能のテストコード             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Claude Agent SDK統合基盤が実装済み（task-feat-agent-sdk-integration-001）
- Electronアプリの基本構造が存在する

### 3.2 依存タスク

| タスクID                            | 依存内容              |
| ----------------------------------- | --------------------- |
| task-feat-agent-sdk-integration-001 | Agent SDKの基盤が必要 |

### 3.3 必要な知識・スキル

- Electron dialog API（showOpenDialog）
- electron-store（設定永続化）
- React（設定画面UI）
- Electron IPC通信

### 3.4 推奨アプローチ

1. **型定義フェーズ**: 設定の型定義を作成
2. **永続化フェーズ**: electron-storeで設定保存機能を実装
3. **UIフェーズ**: 設定画面コンポーネントを作成
4. **統合フェーズ**: スキル呼び出し時にディレクトリパスを注入

---

## 4. 実行手順

### Phase構成

本タスクはtask-specification-creatorのPhase 1〜13フレームワークに従って実行する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                               | パス                                                             | 選定理由                                        |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| functional-non-functional-requirements | `.claude/skills/functional-non-functional-requirements/SKILL.md` | 機能要件・非機能要件の定義（Trigger: 要件定義） |
| acceptance-criteria-writing            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準の作成（Trigger: 受け入れ基準）     |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

設定機能の詳細要件を定義する。

#### 成果物

- 設定項目の仕様書
- UI設計書
- 受け入れ基準

#### 完了条件

- [ ] 設定項目（ディレクトリパス、デフォルト値等）が定義されている
- [ ] UI/UXの要件が明確化されている
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 2: 設計

#### 使用スキル

| スキル名                       | パス                                                     | 選定理由                                        |
| ------------------------------ | -------------------------------------------------------- | ----------------------------------------------- |
| electron-ui-patterns           | `.claude/skills/electron-ui-patterns/SKILL.md`           | Electron UI設計パターン（Trigger: Electron UI） |
| component-composition-patterns | `.claude/skills/component-composition-patterns/SKILL.md` | コンポーネント設計（Trigger: コンポーネント）   |
| state-lifting                  | `.claude/skills/state-lifting/SKILL.md`                  | 状態管理設計（Trigger: 状態管理）               |
| schema-def                     | `.claude/skills/schema-def/SKILL.md`                     | スキーマ定義（Trigger: スキーマ定義）           |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

設定機能のアーキテクチャ設計を行う。

#### 成果物

- コンポーネント設計書
- データフロー図
- electron-storeスキーマ定義

#### 完了条件

- [ ] 設定画面のコンポーネント設計が完了
- [ ] IPC通信のインターフェースが定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 4: テスト作成

#### 使用スキル

| スキル名         | パス                                       | 選定理由                                      |
| ---------------- | ------------------------------------------ | --------------------------------------------- |
| tdd-principles   | `.claude/skills/tdd-principles/SKILL.md`   | TDD原則（Trigger: TDD, テスト駆動）           |
| frontend-testing | `.claude/skills/frontend-testing/SKILL.md` | フロントエンドテスト（Trigger: Reactテスト）  |
| test-doubles     | `.claude/skills/test-doubles/SKILL.md`     | モック・スタブ設計（Trigger: モック, スタブ） |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

TDD: 失敗するテストを先に作成する。

#### 成果物

- 設定管理サービスのユニットテスト
- 設定画面コンポーネントのテスト

#### 完了条件

- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 5: 実装

#### 使用スキル

| スキル名              | パス                                            | 選定理由                                          |
| --------------------- | ----------------------------------------------- | ------------------------------------------------- |
| clean-code-practices  | `.claude/skills/clean-code-practices/SKILL.md`  | クリーンコード実践（Anchor: Clean Code）          |
| custom-hooks-patterns | `.claude/skills/custom-hooks-patterns/SKILL.md` | Reactカスタムフック（Trigger: カスタムフック）    |
| form-validation       | `.claude/skills/form-validation/SKILL.md`       | フォームバリデーション（Trigger: バリデーション） |
| electron-ipc-patterns | `.claude/skills/electron-ipc-patterns/SKILL.md` | Electron IPC通信（Trigger: IPC通信）              |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

設定機能を実装する。

#### 成果物

```
apps/desktop/src/
├── main/
│   └── settings/
│       └── settings-store.ts      # electron-store設定
├── renderer/
│   └── settings/
│       ├── SlideDirectorySettings.tsx  # UIコンポーネント
│       └── useSlideSettings.ts         # カスタムフック
└── preload/
    └── settings-api.ts            # IPC通信
```

#### 完了条件

- [ ] すべてのテストが成功（Green）
- [ ] ディレクトリ選択ダイアログが動作する
- [ ] 設定が永続化される
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 設定画面でディレクトリを選択できる
- [ ] 選択したディレクトリが永続化される
- [ ] ディレクトリが存在しない場合は自動作成される
- [ ] スキル呼び出し時に設定ディレクトリが使用される
- [ ] デフォルトディレクトリが設定されている

### 品質要件

- [ ] ユニットテストカバレッジ 80%以上
- [ ] 統合テストが成功している
- [ ] ESLint/Prettierエラーがない

### ドキュメント要件

- [ ] 設定機能の使い方ドキュメントが作成されている

---

## 6. 検証方法

### テストケース

1. **ディレクトリ選択テスト**: ダイアログでディレクトリが選択できる
2. **永続化テスト**: アプリ再起動後も設定が維持される
3. **自動作成テスト**: 存在しないディレクトリが自動作成される
4. **バリデーションテスト**: 無効なパスが拒否される

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run

# Electronアプリ起動・手動確認
pnpm --filter @repo/desktop dev

# 設定画面を開く
# ディレクトリを選択
# アプリを再起動
# 設定が維持されていることを確認
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                 |
| -------------------------- | ------ | -------- | ------------------------------------ |
| ディレクトリ権限エラー     | 中     | 中       | 書き込み権限チェック、エラー表示     |
| パス文字化けの問題         | 低     | 低       | UTF-8エンコーディング統一            |
| electron-storeの互換性問題 | 低     | 低       | バージョン固定、マイグレーション対応 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/presentation-slide-generator/SKILL.md`
- `.claude/skills/electron-ui-patterns/SKILL.md`
- `task-feat-agent-sdk-integration-001`

### 参考資料

| リソース            | URL                                               |
| ------------------- | ------------------------------------------------- |
| electron-store      | https://github.com/sindresorhus/electron-store    |
| Electron dialog API | https://www.electronjs.org/docs/latest/api/dialog |

---

## 9. 備考

### 設定スキーマ（例）

```typescript
interface SlideSettings {
  outputDirectory: string; // スライド出力先ディレクトリ
  defaultTheme: "kanagawa"; // デフォルトテーマ（将来拡張用）
  autoCreateDirectory: boolean; // ディレクトリ自動作成フラグ
}

const defaultSettings: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  defaultTheme: "kanagawa",
  autoCreateDirectory: true,
};
```

### IPC通信インターフェース

```typescript
// メインプロセス
ipcMain.handle("settings:getSlideDirectory", () =>
  store.get("slideSettings.outputDirectory"),
);
ipcMain.handle("settings:setSlideDirectory", (_, path) =>
  store.set("slideSettings.outputDirectory", path),
);
ipcMain.handle("settings:selectDirectory", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return result.filePaths[0];
});

// プリロード
contextBridge.exposeInMainWorld("settingsAPI", {
  getSlideDirectory: () => ipcRenderer.invoke("settings:getSlideDirectory"),
  setSlideDirectory: (path) =>
    ipcRenderer.invoke("settings:setSlideDirectory", path),
  selectDirectory: () => ipcRenderer.invoke("settings:selectDirectory"),
});
```

### 補足事項

- 本タスクは「スライド依存関係管理システム」の前提条件となる
- ディレクトリパスはクロスプラットフォーム対応（Windows/macOS/Linux）を考慮
