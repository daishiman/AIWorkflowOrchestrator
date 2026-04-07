# Phase 12 スキルフィードバックレポート

## 改善提案

| ID   | 提案                                                                                | 目的                         | 優先度 |
| ---- | ----------------------------------------------------------------------------------- | ---------------------------- | ------ |
| FB-1 | Phase 9 QA checklist に「stub化 vs git delete」の扱いを明記する                     | CONDITIONAL 項目の曖昧さ解消 | MEDIUM |
| FB-2 | Phase 1 要件定義で「既存テスト全件 SIGKILL 問題」の回避策を事前定義する             | カバレッジ測定の信頼性向上   | MEDIUM |
| FB-3 | `it.todo()` の使い方と「既知未実装」を Phase 4 テスト計画に明示するセクションを追加 | todo と未タスクの混同防止    | LOW    |

---

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスク   | TASK-UI-02 ConversationPanel 孤立解消 |
| 作成日   | 2026-04-06                            |
| フェーズ | Phase 12（ドキュメント更新）          |

---

## 詳細フィードバック

### FB-1: Phase 9 QA checklist — stub化の扱いの明確化

**現状の問題**:
Phase 9 QA レポートは「ファイルが削除されていること」を確認項目としていたが、Phase 5 実装では「`export {}` stub化」が選択された。結果として QA チェックが「FAIL」見た目になり、CONDITIONAL_PASS の根拠説明が必要になった。

**改善提案**:
Phase 9 テンプレートに以下を追加する:

```
削除ファイル確認: 以下のいずれかを PASS とする
[ ] ファイルが git delete されている、OR
[ ] ファイルが export {} stub 化されており live import ゼロであること
```

**影響範囲**: `phase-9-quality-assurance.md` テンプレート

---

### FB-2: 全パッケージテスト SIGKILL 問題の事前定義

**現状の問題**:
Phase 7 カバレッジ測定・Phase 9 テスト実行時に `pnpm vitest run`（全テスト）が SIGKILL で終了した。回避策として対象ファイルを限定して実行したが、計画外の対応コストが発生した。

**改善提案**:
Phase 4 テスト計画または Phase 7 カバレッジ計画に以下を事前記載する:

```
## テスト実行方針
- 全件実行（pnpm test）はメモリ制約により SIGKILL の可能性がある
- カバレッジ測定は対象ファイルを限定した targeted run で実施する
- targeted run のファイルリストを本計画書に事前列挙する
```

**影響範囲**: `phase-4-test-creation.md` / `phase-7-coverage-check.md` テンプレート

---

### FB-3: `it.todo()` と未タスクの区別

**現状の問題**:
Phase 6 で発見した未実装機能（W-MC-06: maxSelect、IPC-ER-03: エラーコード非伝搬）を `it.todo()` で記録したが、これらは未タスクでもある。Phase 12 未タスク検出で再度記録する必要があった。

**改善提案**:
Phase 4 テスト計画に「既知未実装セクション」を追加し、`it.todo()` を使う際は同時に未タスク番号を付与する:

```markdown
## 既知未実装（it.todo()）

| Todo ID | 内容             | 未タスク番号 |
| ------- | ---------------- | ------------ |
| W-MC-06 | maxSelect 未実装 | TASK-UI-XX   |
```

**影響範囲**: `phase-4-test-creation.md` テンプレート

---

## 今回うまくいった点

- **Phase 6 テスト駆動のバグ発見**: W-SI-05 テスト作成中に `SecretInput` のアクセシビリティバグを発見・即修正できた。テストを先に書くことで実装の漏れが検出された典型例。
- **TypeScript エラーを stub 化で解決**: Phase 8 で `skill-creator-session-api.ts` の IPC チャンネル参照エラーを no-op stub 化で解決。型互換性を保ちながら機能を無効化するパターンが有効だった。
- **targeted coverage 測定**: SIGKILL 回避のため Python で `coverage-summary.json` をパースして個別ファイルのメトリクスを抽出する手法が効果的だった。
