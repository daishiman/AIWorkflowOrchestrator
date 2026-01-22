# スキルインポート ストア永続化問題調査 - タスク指示書

## メタ情報

```yaml
issue_number: 418
```

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | SKILL-STORE-001                                      |
| タスク名     | スキルインポート ストア永続化問題調査・修正          |
| 分類         | バグ修正                                             |
| 対象機能     | スキル管理機能（SkillImportManager, electron-store） |
| 優先度       | 高                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | 実環境での動作確認                                   |
| 発見日       | 2026-01-22                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skill-import-persistence-bugfixタスクでスキルインポートの永続化機能を実装し、ユニットテスト（28件）は全てPASSしている。しかし、実環境で`skill:list-imported`を呼び出すと、インポート済みスキルが0件として返される現象が発生している。

### 1.2 問題点・課題

デバッグログから以下の状況が確認された：

```
[skillHandlers][DEBUG] skill:list-imported - START
[skillHandlers][DEBUG] skill:list-imported - validation PASSED
[skillHandlers][DEBUG] Calling skillService.getImportedSkills()...
[SkillService][DEBUG] getImportedSkills - START
[SkillService][DEBUG] importedIds: []
[SkillService][DEBUG] getImportedSkills - DONE, returning 0 skills
[skillHandlers][DEBUG] getImportedSkills result: 0 skills
```

- `importedIds: []` が返されており、ストアからデータが読み込まれていない
- ユニットテストではモックストアを使用しているため、実際のelectron-storeとの連携は検証されていない

### 1.3 放置した場合の影響

- スキル管理機能が正常に動作しない
- ユーザーがインポートしたスキルがアプリ再起動後に消失する
- スキル実行機能が「スキルがインポートされていません」エラーで失敗する

---

## 2. 何を達成するか（What）

### 2.1 目的

electron-storeを使用したスキルインポート永続化の問題を特定し、修正する。

### 2.2 最終ゴール

- `skill:import`でインポートしたスキルが`skill:list-imported`で正しく返される
- アプリ再起動後もインポート済みスキルが保持される
- ストアファイルが正しい場所に正しい形式で保存される

### 2.3 スコープ

#### 含むもの

- electron-storeの設定・保存場所の調査
- SkillImportManagerのコンストラクタでのデータロードの検証
- 実環境でのインポート→リスト取得フローの検証
- 必要に応じた修正実装

#### 含まないもの

- UIコンポーネントの変更
- 新機能の追加
- パフォーマンス最適化

### 2.4 成果物

| 成果物       | パス                                                         |
| ------------ | ------------------------------------------------------------ |
| 調査レポート | `outputs/phase-01/investigation-report.md`                   |
| 修正コード   | `apps/desktop/src/main/services/skill/SkillImportManager.ts` |
| 追加テスト   | `apps/desktop/src/main/services/skill/__tests__/`            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- skill-import-persistence-bugfixタスクが完了していること
- Electronアプリがビルド可能であること
- electron-storeの動作原理を理解していること

### 3.2 依存タスク

| タスク                          | ステータス |
| ------------------------------- | ---------- |
| skill-import-persistence-bugfix | 完了       |

### 3.3 必要な知識

- electron-store API（`get`, `set`, ファイル保存場所）
- Electron Main Process アーキテクチャ
- Node.js ファイルシステム操作

### 3.4 推奨アプローチ

1. **調査フェーズ**: electron-storeの設定と保存ファイルの状態を確認
2. **原因特定フェーズ**: 以下の可能性を検証
   - ストアファイルが作成されていない
   - ストアファイルのパスが異なる
   - インポートIPCが呼び出されていない
   - データ形式の不一致
3. **修正フェーズ**: 特定された問題を修正

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                       |
| ----- | ------------ | -------------------------- |
| 1     | 調査         | 問題の原因を特定           |
| 4     | テスト作成   | 問題を再現するテストを作成 |
| 5     | 実装         | 修正を実装                 |
| 7     | カバレッジ   | テスト実行・検証           |
| 11    | 手動テスト   | 実環境での動作確認         |
| 12    | ドキュメント | 修正内容のドキュメント化   |

### Phase 1: 調査

#### 目的

electron-storeの動作と保存状態を確認し、問題の原因を特定する。

#### 手順

1. **ストアファイルの場所を確認**

   ```bash
   # macOSの場合
   ls -la ~/Library/Application\ Support/aiworkflow-orchestrator/
   # または
   ls -la ~/Library/Application\ Support/Electron/
   ```

2. **ストアファイルの内容を確認**

   ```bash
   cat ~/Library/Application\ Support/<app-name>/skills.json
   ```

3. **インポートIPCの呼び出しを確認**
   - Renderer側で`skill:import`が呼び出されているか確認
   - DevToolsのNetworkタブまたはConsoleでIPC呼び出しを確認

4. **electron-storeの設定を確認**
   - `ipc/index.ts`での`Store`インスタンス設定を確認
   - `name: "skills"`が正しく設定されているか確認

5. **デバッグログの追加**
   ```typescript
   // SkillImportManager.tsのコンストラクタに追加
   console.log("[SkillImportManager] Store path:", this.store.path);
   console.log("[SkillImportManager] Raw store data:", this.store.store);
   ```

#### 成果物

- 調査レポート（原因特定結果）

#### 完了条件

- 問題の原因が特定されている
- 修正方針が明確になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:import`でスキルをインポートできる
- [ ] `skill:list-imported`でインポート済みスキルが正しく返される
- [ ] アプリ再起動後もインポート済みスキルが保持される
- [ ] ストアファイルが正しい場所に保存される

### 品質要件

- [ ] 既存のユニットテスト（28件）がすべてパスする
- [ ] 問題を再現するテストが追加されている
- [ ] ESLint/Prettierでフォーマット済み

### ドキュメント要件

- [ ] 調査レポートが作成されている
- [ ] 修正内容が記録されている

---

## 6. 検証方法

### テストケース

| TC-ID        | テスト内容                     | 期待結果                                       |
| ------------ | ------------------------------ | ---------------------------------------------- |
| TC-STORE-001 | スキルインポート後のリスト取得 | インポートしたスキルが一覧に含まれる           |
| TC-STORE-002 | ストアファイルの存在確認       | `skills.json`が正しい場所に作成される          |
| TC-STORE-003 | アプリ再起動後のリスト取得     | 再起動前にインポートしたスキルが保持されている |

### 検証手順

```bash
# 1. アプリを起動
pnpm --filter @repo/desktop dev

# 2. DevToolsを開き、スキルをインポート
# Renderer側でskill:importを呼び出す

# 3. skill:list-importedを呼び出し、結果を確認

# 4. アプリを再起動し、skill:list-importedを呼び出し

# 5. ストアファイルの内容を確認
cat ~/Library/Application\ Support/<app-name>/skills.json
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                               |
| ------------------------------ | ------ | -------- | ---------------------------------- |
| ストアファイルのパスが環境依存 | 中     | 中       | クロスプラットフォームでのパス確認 |
| 既存データの破損               | 中     | 低       | マイグレーション処理の実装         |
| electron-storeのバージョン問題 | 低     | 低       | バージョン固定・依存関係確認       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| スキルインポート実装ガイド | `docs/30-workflows/skill-import-persistence-bugfix/outputs/phase-12/implementation-guide.md` |
| クラス設計書               | `docs/30-workflows/skill-import-persistence-bugfix/outputs/phase-02/design-document.md`      |
| ユニットテスト             | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`                  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容               |
| ------------------------- | --------------------------------------------------------------------------- | ------------------ |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | skill:\* IPC仕様   |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン |

### 外部参考資料

| 資料                  | URL                                                |
| --------------------- | -------------------------------------------------- |
| electron-store GitHub | https://github.com/sindresorhus/electron-store     |
| electron-store API    | https://github.com/sindresorhus/electron-store#api |

---

## 9. 備考

### 発見経緯

skill-import-persistence-bugfix完了後の実環境確認で、`skill:list-imported`が空の配列を返す現象を発見。デバッグログから`importedIds: []`が確認され、ストアからのデータロードに問題があることが判明。

### 考えられる原因候補

1. **electron-storeのストアファイルパスの不一致**
   - `name: "skills"`で作成されるファイルの場所が予期と異なる

2. **インポートIPCが呼び出されていない**
   - Renderer側のUIがインポートIPCを呼び出していない可能性

3. **ストアのスキーマ不一致**
   - `importedSkillIds`キーとSTORE_KEY定数の不一致

4. **electron-storeの初期化タイミング問題**
   - アプリ起動時の初期化順序に問題がある可能性

### 補足事項

- 優先度「高」のため、早急な対応が必要
- ユニットテストでは検出できない実環境固有の問題の可能性が高い

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
