# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase番号  | 1                                                   |
| 機能名     | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE) |
| 作成日     | 2026-03-20                                          |
| 担当       | -                                                   |
| ステータス | 未着手                                              |

## 目的

LLM選択状態（`selectedProviderId`, `selectedModelId`）がZustand storeのpersist対象に含まれていないため、アプリ再起動時にnullリセットされる問題を解決する。ユーザーが毎回Settings画面でProvider/Modelを再選択する手間をなくし、選択状態をアプリ再起動をまたいで保持できるようにする。

## 実行タスク

### P50チェック: 既実装調査

```bash
# persist partialize関数の現状確認
grep -n "partialize" apps/desktop/src/renderer/store/index.ts

# selectedProviderId/selectedModelId の永続化状況確認
grep -n "selectedProviderId\|selectedModelId" apps/desktop/src/renderer/store/index.ts

# syncSelectedConfigToMain の実装状況確認
grep -rn "syncSelectedConfigToMain" apps/desktop/src/renderer/

# llmConfigProvider の currentConfig 実装確認
grep -n "currentConfig" apps/desktop/src/main/ipc/llmConfigProvider.ts
```

### タスク1: 機能要件の明確化

以下の機能要件を確認・定義する:

1. Zustand persist対象に `selectedProviderId` と `selectedModelId` を追加する
2. アプリ起動時、永続化されたLLM選択状態をMain Processに同期する
3. 永続化されたProviderIDが現在利用可能なプロバイダ一覧に存在しない場合、フォールバック動作を定義する

### タスク2: 非機能要件の明確化

- アプリ起動から3秒以内にMain Processへの設定同期を完了する
- persist storageへのAPIキー・認証情報の書き込みを行わない（セキュリティ要件）
- 既存のpersist設定（`currentView`, `userProfile`, `autoSyncEnabled`）との互換性を維持する

### タスク3: 受入基準の定義

以下をすべて満たすことを受入条件とする:

- [ ] アプリ再起動後もProvider/Model選択が保持され、Settings画面に正しく表示される
- [ ] 再起動後、Main ProcessのcurrentConfigに選択されたProvider/Modelが同期される
- [ ] 存在しないProviderIDが永続化されていた場合、null（未選択状態）にフォールバックする
- [ ] persistに新たにAPIキーや認証情報が含まれないこと
- [ ] 既存persistフィールド（`currentView`, `userProfile`, `autoSyncEnabled`）が引き続き正常動作する

### タスク4: 影響範囲の確認

修正対象ファイルを特定する:

| ファイル                                             | 修正内容                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/index.ts`           | persist partialize関数に `selectedProviderId`, `selectedModelId` を追加 |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts` | 起動時同期ロジックの追加                                                |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts`     | 影響確認のみ（変更不要の可能性）                                        |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名              | パス                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Zustand persist設計 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                          |
| persist hardening   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-persist-hardening-test-quality.md` |
| LLM IPC契約         | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                                  |
| セキュリティ考慮    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                          |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                           |

### 既知の落とし穴

| 落とし穴ID | 説明                              | 対策                                             |
| ---------- | --------------------------------- | ------------------------------------------------ |
| P50        | 既実装防御の発見による Phase 転換 | Phase 1 実行時に既実装調査を最初に行う           |
| P62        | DEFAULT_CONFIG への暗黙 fallback  | 無効な永続化値はフォールバックではなくnullクリア |

## 実行手順

1. **P50チェックの実施**: 上記のgrepコマンドを実行し、既に実装済みの箇所がないか確認する
   - 完全実装済みの場合: Phase 1-5を「検証・補完」モードに切り替え
   - 部分実装の場合: 未実装部分のみをタスクとして定義

2. **要件の確定**: 上記「タスク1〜3」の内容をレビューし、プロジェクト固有の制約があれば追記する

3. **影響ファイルの最終確認**: P50チェックの結果をもとに、実際の修正対象ファイルを確定する

4. **受入基準の承認**: チームリードと受入基準を確認し、合意を得る

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                           | 説明               |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-1-requirements.md` | 要件定義・受入基準 |

## 完了条件

- [ ] P50チェック（既実装調査）を実施し、結果を記録した
- [ ] 機能要件・非機能要件が明確に定義されている
- [ ] 受入基準がチェックリスト形式で定義されている
- [ ] 影響ファイルがリストアップされ、修正内容が明確になっている
- [ ] セキュリティ要件（APIキーをpersist対象に含めない）が明示されている

## 次Phase

Phase 2: 設計（`phase-2-design.md`）
