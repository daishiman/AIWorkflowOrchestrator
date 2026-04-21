---
name: int-test-skill
description: |
  `@repo/shared`パッケージのVitest統合テスト設計・実装・検証を支援するスキル。
  Mockプロバイダーを使ったサービス層の契約テストが主な用途。
  インターフェース契約の変更時に既存Mockとの互換性を保証し、不変条件を網羅する。

  Anchors:
  • Contract Testing / 適用: インターフェース契約検証 / 目的: Mock→実装の互換性保証
  • Vitest / 適用: テスト実行環境 / 目的: `pnpm --filter @repo/shared test:run`

  Trigger:
  「統合テスト作成」「integration test」「MockClient」「テスト追加」「契約テスト」
  「テストケース追加」「Late Chunking テスト」「IEmbeddingClient テスト」等が発動条件。
tags:
  - integration-test
  - vitest
  - mock
  - contract-testing
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Int Test Skill

## 概要

`@repo/shared`パッケージにおけるVitest統合テストの設計・実装・検証を支援するスキル。
MockClientを使ったサービス層の契約テストを中心に、インターフェース不変条件の検証から実行確認まで一貫して支援する。

## ワークフロー

### Phase 1: テスト対象のインターフェース契約を確認

**目的**: 何をテストするかを明確化し、テストすべき契約・不変条件を洗い出す。

**アクション**:
1. `interfaces.ts` / `types.ts` などのインターフェース定義を `Read` で読み込む
2. オプショナルメソッド（例: `getTokenEmbeddings?()`）の有無と型シグネチャを確認する
3. 既存の統合テスト（`__tests__/*.integration.test.ts`）を読んで現状のカバレッジを把握する
4. 検証すべき契約・不変条件をリストアップする（例: `tokens.length === embeddings.length`）

### Phase 2: MockClientを実装（または既存を活用）

**目的**: 決定論的なテストを可能にするMockを用意する。

**アクション**:
1. 既存Mockファイル（`__tests__/mocks.ts`）を `Read` で確認する
2. テスト対象のインターフェースを満たすMockクラスを設計する
3. 副作用なく結果が一定になるよう、ダミーデータを決定論的に生成する
   - 例: `tokens = text.split(/\s+/)`, `embeddings[i] = [(i+1)*0.1, ...]`
4. オプショナルメソッドを実装したMockと未実装のMockを分けて用意し、分岐をテストできるようにする
5. Mockを `providers/mock-*.ts` など適切な場所に配置する

### Phase 3: サービス層への入力→出力の検証テストを作成

**目的**: MockClient + Serviceの統合テストで実際の処理フローを検証する。

**アクション**:
1. テストファイル（`*.integration.test.ts`）に新しい `describe` ブロックを追加する
2. `beforeEach` でMockとServiceを初期化する
3. Arrange → Act → Assert の3ステップで各テストケースを記述する
4. `vi.fn()` で呼び出し確認が必要なメソッドをスパイする
5. 正常系（機能が動作する）と異常系（エラーが伝播する）の両方を作成する

### Phase 4: 不変条件とエラーケースを追加

**目的**: バグが混入したときに即座に検出できる保護テストを追加する。

**アクション**:
1. 長さ一致などの不変条件をテストする（例: `tokens.length === embeddings.length`）
2. 長さ不一致のときにサービスが `ChunkingError` などの適切なエラーをスローすることを検証する
3. Mockが存在しない場合のフォールバック動作をテストする
4. `vi.fn()` の `toHaveBeenCalledOnce()` / `not.toHaveBeenCalled()` でメソッド呼び出し経路を検証する

### Phase 5: テストを実行して確認

**目的**: 作成したテストが実際にパスすることを確認する。

**アクション**:
1. `pnpm --filter @repo/shared test:run` を `Bash` で実行する
2. 失敗したテストのエラーメッセージを確認し、実装かテストの問題かを特定する
3. 全テストがパスしたら `scripts/log_usage.js` でフィードバックを記録する

## ベストプラクティス

### すべきこと

- `tokens.length === embeddings.length` のような不変条件は必ずテストする
- MockはインターフェースをすべてTypescript型で満たすよう実装する
- オプショナルメソッドの有無で分岐するパスを両方テストする（with/without `getTokenEmbeddings`）
- `vi.fn()` によるスパイで「どのメソッドが呼ばれたか」を検証する
- 決定論的なダミーデータ（インデックスベースのベクトルなど）を使う

### 避けるべきこと

- Mockに状態を持たせて副作用が起きるテストを書く（他のテストに影響する）
- 非同期処理で `await` を忘れてタイムアウトを引き起こす
- Mock実装が実際のインターフェース型と乖離する（TypeScriptの型エラーを黙って無視しない）
- テストのセットアップを `beforeEach` 外で共有してテスト間の干渉を生む
- 実装ファイルを変更せずにテストだけを変更して契約を迂回する

## リソース参照

### references/

- **実行パターン集**: See [references/patterns.md](references/patterns.md)

### scripts/

- `scripts/log_usage.js`: フィードバック記録

## 変更履歴

| Version | Date       | Changes                                                  |
|---------|------------|----------------------------------------------------------|
| 1.1.0   | 2026-04-21 | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001の知見を元に完成 |
| 1.0.0   | 2026-04-16 | 初版作成                                                 |
