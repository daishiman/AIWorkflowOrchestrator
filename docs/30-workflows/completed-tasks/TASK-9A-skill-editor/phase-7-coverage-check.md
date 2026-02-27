# Phase 7: テストカバレッジ確認

## メタ情報

| 項目      | 値                                                        |
| --------- | --------------------------------------------------------- |
| Phase     | 7                                                         |
| 機能名    | TASK-9A-skill-editor                                      |
| 作成日    | 2026-02-26                                                |
| 前提Phase | Phase 6（テスト拡充）完了                                 |
| 目的      | カバレッジ基準の充足を確認し、未達の場合は Phase 6 へ戻る |

## 目的

Phase 4（テスト作成）と Phase 6（テスト拡充）で作成した累計105テストのカバレッジを計測し、プロジェクト基準（Line 80%、Branch 60%、Function 80%）を全実装ファイルで達成していることを確認する。未達の場合は不足箇所を特定して Phase 6 に戻る。

## 実行タスク

- Task 1: カバレッジ計測の実施
- Task 2: ファイル別カバレッジ分析
- Task 3: カバレッジギャップの特定と対応判断
- Task 4: カバレッジレポート作成

## 参照資料

| 資料名                 | パス                                                                                        | 説明                                   |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 4 テスト成果物   | `outputs/phase-4/`                                                                          | 初期テスト（67テスト）                 |
| Phase 5 実装成果物     | `outputs/phase-5/`                                                                          | 実装コード（カバレッジ対象）           |
| Phase 6 テスト成果物   | `outputs/phase-6/`                                                                          | 追加テスト（38テスト）                 |
| セキュリティAPI仕様    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | セキュリティ関連コードのカバレッジ確認 |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーパスのカバレッジ確認             |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 層別カバレッジ基準の確認               |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターンのカバレッジ確認         |

## 実行手順

### Task 1: カバレッジ計測の実施

#### 1.1 カバレッジ目標

| メトリクス        | 最低基準 | 推奨基準 | 根拠                                   |
| ----------------- | -------- | -------- | -------------------------------------- |
| Line Coverage     | 80%      | 90%      | プロジェクト基準（02-code-quality.md） |
| Branch Coverage   | 60%      | 70%      | プロジェクト基準（02-code-quality.md） |
| Function Coverage | 80%      | 90%      | プロジェクト基準（02-code-quality.md） |

#### 1.2 カバレッジ計測コマンド

```bash
# 全テストのカバレッジ計測（一括）
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/__tests__/ \
  src/main/ipc/__tests__/skillFileHandlers* \
  src/renderer/components/skill/__tests__/ \
  src/renderer/store/slices/__tests__/skillSlice.editor

# HTML レポート生成（ブラウザで確認用）
cd apps/desktop && pnpm vitest run --coverage --reporter=html \
  src/main/services/skill/__tests__/ \
  src/main/ipc/__tests__/skillFileHandlers* \
  src/renderer/components/skill/__tests__/ \
  src/renderer/store/slices/__tests__/skillSlice.editor
```

### Task 2: ファイル別カバレッジ分析

#### 2.1 必須カバレッジ対象メソッド

| ファイル             | メソッド/関数                     | 必須カバレッジ | 理由                                 |
| -------------------- | --------------------------------- | -------------- | ------------------------------------ |
| SkillFileManager.ts  | readFile                          | 90%            | コア機能                             |
| SkillFileManager.ts  | writeFile                         | 90%            | コア機能 + バックアップ              |
| SkillFileManager.ts  | createFile                        | 90%            | コア機能                             |
| SkillFileManager.ts  | deleteFile                        | 90%            | コア機能 + 削除バックアップ          |
| SkillFileManager.ts  | listBackups                       | 80%            | 補助機能                             |
| SkillFileManager.ts  | restoreBackup                     | 80%            | 補助機能                             |
| SkillFileManager.ts  | validatePath                      | 100%           | セキュリティ（パストラバーサル防止） |
| SkillFileManager.ts  | findSkillDir                      | 90%            | コア機能（スキル検索）               |
| skillFileHandlers.ts | 全6ハンドラー                     | 90%            | IPC セキュリティ境界                 |
| skillFileHandlers.ts | registerSkillFileHandlers         | 100%           | ハンドラー登録                       |
| skillFileHandlers.ts | unregisterSkillFileHandlers       | 100%           | ハンドラー解除                       |
| skillFileHandlers.ts | isKnownSkillFileError             | 100%           | エラー判別                           |
| errors.ts            | 全エラークラス                    | 100%           | エラー型定義                         |
| SkillEditor.tsx      | レンダリング + イベントハンドラー | 80%            | UI コンポーネント                    |
| SkillCodeEditor.tsx  | レンダリング + イベントハンドラー | 90%            | UI コンポーネント                    |

#### 2.2 分岐カバレッジ重点箇所

| 箇所                                     | 必要な分岐テスト                                          |
| ---------------------------------------- | --------------------------------------------------------- |
| validatePath: パス正規化後の包含チェック | 正常パス / `../` / 絶対パス / URL エンコード / ヌルバイト |
| findSkillDir: 2ディレクトリ検索          | aiworkflow にある / claude にある / どちらにもない        |
| writeFile: readonly チェック             | readonly=true / readonly=false                            |
| IPC バリデーション: 3段チェック          | 正常値 / undefined / 空文字列 / スペースのみ / 型不一致   |
| isKnownSkillFileError: 5エラー型判別     | 各エラー型 + 未知エラー                                   |
| SkillEditor: readOnly 状態               | readOnly=true（disabled）/ readOnly=false（enabled）      |
| SkillEditor: isDirty 状態                | isDirty=true（警告表示）/ isDirty=false（警告なし）       |

#### 2.3 ファイル別カバレッジ記録テンプレート

| ファイル                    | Line    | Branch  | Function | 判定 |
| --------------------------- | ------- | ------- | -------- | ---- |
| SkillFileManager.ts         | \_\_\_% | \_\_\_% | \_\_\_%  | ⬜   |
| errors.ts                   | \_\_\_% | \_\_\_% | \_\_\_%  | ⬜   |
| skillFileHandlers.ts        | \_\_\_% | \_\_\_% | \_\_\_%  | ⬜   |
| SkillEditor.tsx             | \_\_\_% | \_\_\_% | \_\_\_%  | ⬜   |
| SkillCodeEditor.tsx         | \_\_\_% | \_\_\_% | \_\_\_%  | ⬜   |
| skillSlice.ts（エディター） | \_\_\_% | \_\_\_% | \_\_\_%  | ⬜   |

> 判定: ✅ 最低基準達成 / ⚠️ 推奨基準未達（最低基準は達成）/ ❌ 最低基準未達

### Task 3: カバレッジギャップの特定と対応判断

#### 3.1 未カバー行の特定

```bash
# 未カバー行を特定するコマンド
cd apps/desktop && pnpm vitest run --coverage --reporter=json \
  src/main/services/skill/__tests__/ \
  src/main/ipc/__tests__/skillFileHandlers* \
  src/renderer/components/skill/__tests__/ \
  src/renderer/store/slices/__tests__/skillSlice.editor

# JSON レポートから未カバー行を抽出
# coverage/coverage-final.json を解析
```

#### 3.2 未カバー行リストテンプレート

| ファイル         | 行番号 | 内容 | 理由/対応 |
| ---------------- | ------ | ---- | --------- |
| （計測後に記録） | —      | —    | —         |

#### 3.3 カバレッジ未達時の Phase 6 戻り手順

カバレッジが最低基準に未達の場合、以下の手順で Phase 6 に戻る:

```
Step 1: 未カバー箇所の分析
  - 未カバー行・分岐をリストアップ
  - テスト追加で対応可能か、コード構造の問題かを判断

Step 2: テスト追加計画の策定
  - 不足テストケースをリストアップ
  - 優先順位: セキュリティ関連 > コア機能 > 補助機能 > UI

Step 3: Phase 6 に戻りテストを追加
  - 新テストケースを Phase 6 の成果物に追記
  - テスト追加後に再度 Phase 7 を実施

Step 4: 再計測
  - 全テストを再実行してカバレッジを再計測
  - 基準達成まで Step 1-3 を繰り返す
```

#### 3.4 カバレッジ改善が困難な場合の対応

| 状況                                    | 対応                                       |
| --------------------------------------- | ------------------------------------------ |
| 到達不可能なコード（デッドコード）      | Phase 8 でリファクタリングして削除         |
| 外部ライブラリのエラーハンドリング      | 理由コメント付きで除外許可                 |
| プラットフォーム固有のコード（OS 分岐） | 実行環境で実行される分岐のみテスト対象     |
| v8 カバレッジのインライン関数（P41）    | コールバック戻り値を明示的に検証してカバー |

### Task 4: カバレッジレポート作成

#### 4.1 レポート内容

成果物 `outputs/phase-7/coverage-report.md` に以下を記録:

1. **計測日時**: Phase 7 実施日時
2. **テスト総数**: Phase 4 + Phase 6 の累計テスト数
3. **ファイル別カバレッジ**: Task 2.3 のテンプレートに記入した実測値
4. **未カバー行リスト**: Task 3.2 のテンプレートに記入した未カバー行
5. **カバレッジ改善記録**: Phase 6 → 7 を繰り返した場合の改善履歴
6. **最終判定**: 全ファイルで最低基準を達成しているか

## 統合テスト連携【必須】

| 接続要件カテゴリ   | カバレッジ確認での対応                                              |
| ------------------ | ------------------------------------------------------------------- |
| IPC チャンネル契約 | 統合テスト（T-01〜T-08）が全て PASS し、IPC 層のカバレッジが80%以上 |
| セキュリティ境界   | validateIpcSender + バリデーションのカバレッジが90%以上             |
| コア機能           | SkillFileManager の6メソッドのカバレッジが各80%以上                 |
| UI コンポーネント  | SkillEditor / SkillCodeEditor のカバレッジが最低基準を達成          |

> **注記**: 統合テストの再実行結果を確認し、IPC 契約が維持されていることを検証する。統合テスト PASS が Phase 8 進行の前提条件。

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                                 | 確認箇所             |
| ---------- | -------------------------------------------------------------------- | -------------------- |
| P41        | インライン関数（getAllowedWindows 等）のカバレッジを個別確認         | skillFileHandlers.ts |
| P37        | テスト数はファイルから実測値を取得（Phase 4 の想定値を使い回さない） | カバレッジレポート   |
| P9         | テスト間の状態リークがカバレッジに影響していないか確認               | 全テストファイル     |

## 成果物

| 成果物             | パス                                      | 説明                              |
| ------------------ | ----------------------------------------- | --------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`      | ファイル別カバレッジ + 未カバー行 |
| カバレッジ HTML    | `apps/desktop/coverage/`（gitignore対象） | ブラウザ確認用HTMLレポート        |

## 完了条件

- [ ] 全実装ファイルで Line Coverage ≥ 80% を達成している
- [ ] 全実装ファイルで Branch Coverage ≥ 60% を達成している
- [ ] 全実装ファイルで Function Coverage ≥ 80% を達成している
- [ ] セキュリティ関連コード（validatePath, validateIpcSender）のカバレッジが90%以上
- [ ] 統合テスト（T-01〜T-08）が全て PASS している
- [ ] 未カバー行リストが作成され、各行に理由/対応が記載されている
- [ ] カバレッジレポートが outputs/phase-7/ に作成されている
- [ ] P41 対策: インライン関数のカバレッジが確認されている
- [ ] カバレッジ未達の場合、Phase 6 に戻って改善済み

## Phase 6 への戻りフロー

```
Phase 7 カバレッジ確認
    │
    ├── 全基準達成 → Phase 8（リファクタリング）へ進む
    │
    └── 基準未達 → Phase 6 へ戻る
          │
          ├── 未カバー箇所を分析
          ├── テストケースを追加
          └── Phase 7 を再実施
              │
              ├── 達成 → Phase 8 へ進む
              └── 未達 → 再度 Phase 6 へ
                    （最大3回の繰り返しを推奨。
                     3回でも未達の場合は、
                     除外理由を明記して Phase 8 へ進む）
```

## TDD 検証

```bash
# カバレッジ計測（最終確認）
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/__tests__/ \
  src/main/ipc/__tests__/skillFileHandlers* \
  src/renderer/components/skill/__tests__/ \
  src/renderer/store/slices/__tests__/skillSlice.editor

# テスト数の実測（P37対策）
cd apps/desktop && grep -c "it\(\|test\(" \
  src/main/services/skill/__tests__/SkillFileManager*.test.ts \
  src/main/ipc/__tests__/skillFileHandlers*.test.ts \
  src/renderer/components/skill/__tests__/Skill*.test.tsx \
  src/renderer/store/slices/__tests__/skillSlice.editor.test.ts
```

## 次のPhase

Phase 8: リファクタリング — コード品質改善（テストが Green を維持しながらリファクタリング）
