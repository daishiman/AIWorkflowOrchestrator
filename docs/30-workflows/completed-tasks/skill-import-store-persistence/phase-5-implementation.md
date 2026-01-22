# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| Phase名    | 実装（TDD: Green）             |
| 前提Phase  | Phase 4                        |
| 後続Phase  | Phase 6                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-22                     |
| 機能名     | skill-import-store-persistence |

---

## 目的

Phase 4で作成したテストが成功するように、electron-storeの永続化問題を修正する（TDDのGreen状態）。

## 背景

Phase 1-4で問題の原因が特定され、テストが作成された。本Phaseでは、テストを通すための最小限の修正を実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillImportManagerの修正

**目的**: Phase 2の設計に基づきSkillImportManagerを修正する

**実行手順**:

1. Phase 2の設計書（`outputs/phase-02/design-document.md`）を確認する
2. `apps/desktop/src/main/services/skill/SkillImportManager.ts`を修正する
3. 修正内容の例：
   - electron-storeの`cwd`設定の修正
   - `name`設定の確認と必要に応じた修正
   - 初期化タイミングの調整
   - データ読み込み/書き込みロジックの修正
4. デバッグログを追加して動作確認する

**修正対象ファイル**:

- `apps/desktop/src/main/services/skill/SkillImportManager.ts`

**期待される成果物**:

- 修正されたSkillImportManager

---

### タスク2: 関連コードの修正（必要に応じて）

**目的**: SkillImportManagerの修正に伴う関連コードを修正する

**実行手順**:

1. SkillServiceでの使用箇所を確認する
2. IPC Handlerでの使用箇所を確認する
3. 必要に応じて関連コードを修正する
4. 影響範囲を記録する

**修正対象ファイル（必要に応じて）**:

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`

---

### タスク3: テスト実行と成功確認

**目的**: 修正後にテストが成功することを確認する

**実行手順**:

1. Phase 4で作成した統合テストを実行する
   ```bash
   pnpm --filter @repo/desktop test -- SkillImportManager.integration
   ```
2. テストが**成功する**ことを確認する（Green状態）
3. 既存のユニットテスト（28件）も成功することを確認する
   ```bash
   pnpm --filter @repo/desktop test -- SkillImportManager
   ```
4. テスト結果を記録する

**期待される成果物**:

- `outputs/phase-05/implementation-result.md`

---

## 参照資料

| 参照資料           | パス                                                         | 内容         |
| ------------------ | ------------------------------------------------------------ | ------------ |
| Phase 2 設計書     | `outputs/phase-02/design-document.md`                        | 修正設計     |
| Phase 4 テスト     | `apps/desktop/src/main/services/skill/__tests__/`            | テストコード |
| SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 修正対象     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容               |
| ------------------------- | --------------------------------------------------------------------------- | ------------------ |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | skill:\* IPC仕様   |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン |

---

## 成果物

| 成果物     | パス                                                         | 内容           |
| ---------- | ------------------------------------------------------------ | -------------- |
| 修正コード | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 修正実装       |
| 実装結果   | `outputs/phase-05/implementation-result.md`                  | 修正内容と結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

このPhaseではフロント/バック接続の実装とテスト支援コード整備を行う：

- IPC経由でのデータ永続化フローの実装
- テスト用のヘルパー関数（必要に応じて）

---

## 完了条件

- [ ] SkillImportManagerが修正されている
- [ ] 関連コードが必要に応じて修正されている
- [ ] Phase 4のテストが**成功する**ことが確認されている（Green状態）
- [ ] 既存のユニットテスト（28件）も成功する
- [ ] 実装結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- SkillImportManager
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-store-persistence/phase-6-test-expansion.md`
