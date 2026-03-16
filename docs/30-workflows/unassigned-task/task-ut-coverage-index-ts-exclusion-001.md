# UT-COVERAGE-INDEX-TS-EXCLUSION-001 vitest.config.ts カバレッジ除外パターン精緻化 - タスク指示書

## メタ情報

```yaml
issue_number: 1275
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | UT-COVERAGE-INDEX-TS-EXCLUSION-001                      |
| タスク名     | vitest.config.ts カバレッジ除外パターン精緻化           |
| 分類         | テスト改善                                              |
| 対象機能     | vitest カバレッジ設定                                   |
| 優先度       | 低                                                      |
| 見積もり規模 | 小規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION Phase 12 |
| 発見日       | 2026-03-16                                              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION の Phase 7（カバレッジ確認）で、`apps/desktop/src/main/ipc/index.ts` のカバレッジが低いことが発見された。このファイルはIPCハンドラの再エクスポート（barrel file）であり、テスト対象としては不適切。しかし vitest.config.ts のカバレッジ除外パターンにはこのファイルが含まれていない。

### 1.2 問題点・課題

- `index.ts`（barrel file）がカバレッジ集計対象に含まれており、見かけ上のカバレッジ率を下げている
- 現在の除外パターン（`**/index.ts` を除外していない）では、実質的なビジネスロジックのカバレッジが正確に測定できない
- P41（v8カバレッジプロバイダのインライン関数カウント）と同様の問題パターン

### 1.3 放置した場合の影響

- Phase 7 カバレッジ確認時にbarrel fileの低カバレッジが繰り返し報告される
- 真のカバレッジ不足箇所が見えにくくなる

## 2. 何を達成するか（What）

### 2.1 目的

vitest.config.ts のカバレッジ除外パターンにbarrel file（index.ts）を適切に追加し、カバレッジレポートの精度を向上させる。

### 2.2 最終ゴール

- `apps/desktop/vitest.config.ts` のcoverage.exclude に適切なパターンを追加
- barrel file（再エクスポートのみのindex.ts）がカバレッジ集計から除外される
- ビジネスロジックを含むindex.tsは除外されない（精緻なパターン設計）

### 2.3 スコープ

#### 含むもの

- vitest.config.ts のcoverage設定見直し
- barrel fileの特定と除外パターン設計
- 除外後のカバレッジレポート検証

#### 含まないもの

- テストコードの追加・修正
- ビジネスロジックの変更

## 3. どう実装するか（How）

### 3.1 実装方針

1. `grep -rn "export \*" apps/desktop/src/main/ipc/index.ts` でbarrel file性を確認
2. 他のindex.tsファイルの中身を確認し、除外すべきものとそうでないものを分類
3. coverage.exclude にパスパターンを追加（例: `**/ipc/index.ts` のように限定的に）

### 3.2 対象ファイル

- `apps/desktop/vitest.config.ts`

### 3.3 実装手順

1. 全index.tsファイルのリストを `find apps/desktop/src -name "index.ts"` で取得
2. 各index.tsが純粋なbarrel file（re-exportのみ）かどうかを判定
3. 除外パターンを設計（過剰除外を防ぐ）
4. vitest.config.ts のcoverage.exclude に追加
5. `pnpm --filter @repo/desktop test -- --coverage` でカバレッジレポートを確認

## 4. 苦戦箇所と教訓（今回の開発で得た知見）

### 4.1 会話IPCハンドラ修正での発見

TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATIONで `conversationHandlers.ts` を `ipc/` ディレクトリに移動した際、`index.ts` のFunction Coverageが 0% として報告された。これはindex.tsが `registerConversationHandlers` を re-export しているだけで、テストが直接index.tsを経由しなかったため。

### 4.2 P41との関連

P41（v8カバレッジプロバイダのインライン関数カウント）と同様、vitestのv8カバレッジプロバイダは再エクスポート文を関数としてカウントする場合がある。barrel fileのre-exportがカバレッジに影響するパターンは、プロジェクト全体で一貫した対策が必要。

### 4.3 除外パターン設計の注意点

- `**/index.ts` のような広範な除外は危険（ビジネスロジックを含むindex.tsまで除外される）
- ディレクトリ単位で限定的に除外するか、ファイル内容（行数やexport文の比率）で判断する方が安全

## 5. 受入基準

- [ ] vitest.config.ts のcoverage.exclude にbarrel file除外パターンが追加されている
- [ ] 純粋なbarrel file（re-exportのみ）のindex.tsがカバレッジ集計から除外される
- [ ] ビジネスロジックを含むindex.tsはカバレッジ集計に残っている
- [ ] `pnpm --filter @repo/desktop test -- --coverage` でカバレッジレポートが正常に生成される

## 6. 関連情報

### 6.1 関連タスク

- TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION（発見元）
- GitHub Issue #1275

### 6.2 関連Pitfall（06-known-pitfalls.md）

- P41: v8カバレッジプロバイダのインライン関数カウント

### 6.3 関連仕様書（aiworkflow-requirements）

- quality-requirements-details.md（カバレッジ基準）
