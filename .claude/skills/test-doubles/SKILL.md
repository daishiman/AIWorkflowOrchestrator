---
name: test-doubles
description: |
  テストダブル（Mock、Stub、Fake、Spy）の適切な使い分けを専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/test-doubles/resources/fake-patterns.md`: Fake Patternsリソース
  - `.claude/skills/test-doubles/resources/mock-patterns.md`: Mock Patternsリソース
  - `.claude/skills/test-doubles/resources/stub-patterns.md`: Stub Patternsリソース
  - `.claude/skills/test-doubles/resources/types-overview.md`: Types Overviewリソース
  - `.claude/skills/test-doubles/resources/verification-strategies.md`: Verification Strategiesリソース

  - `.claude/skills/test-doubles/templates/test-double-selection.md`: Test Double Selectionテンプレート

  - `.claude/skills/test-doubles/scripts/test-double-analyzer.mjs`: Test Double Analyzerスクリプト

version: 1.0.0
---

# Test Doubles

## 概要

テストダブルは、テスト対象が依存する外部コンポーネントを置き換えるオブジェクトです。
適切なテストダブルの選択は、テストの品質と保守性に大きく影響します。

**核心原則**:

- 目的に応じたテストダブルの選択
- 過度なモッキングの回避
- テストの意図を明確にする

**対象ユーザー**:

- ビジネスロジック実装エージェント（@logic-dev）
- テスト作成者
- 外部依存を持つコードの開発者

## リソース構造

```
test-doubles/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── types-overview.md                 # テストダブルの種類
│   ├── mock-patterns.md                  # Mockパターン
│   ├── stub-patterns.md                  # Stubパターン
│   ├── fake-patterns.md                  # Fakeパターン
│   └── verification-strategies.md        # 検証戦略
├── scripts/
│   └── test-double-analyzer.mjs          # テストダブル分析スクリプト
└── templates/
    └── test-double-selection.md          # 選択ガイドテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# テストダブルの種類
cat .claude/skills/test-doubles/resources/types-overview.md

# Mockパターン
cat .claude/skills/test-doubles/resources/mock-patterns.md

# Stubパターン
cat .claude/skills/test-doubles/resources/stub-patterns.md

# Fakeパターン
cat .claude/skills/test-doubles/resources/fake-patterns.md

# 検証戦略
cat .claude/skills/test-doubles/resources/verification-strategies.md
```

### スクリプト実行

```bash
# テストダブル分析
# テストファイルからMock/Stub/Spy使用状況を分析し、改善提案を出力
node .claude/skills/test-doubles/scripts/test-double-analyzer.mjs <test-file>

# 例
node .claude/skills/test-doubles/scripts/test-double-analyzer.mjs src/__tests__/user-service.test.ts
```

### テンプレート参照

```bash
# テストダブル選択ガイド
cat .claude/skills/test-doubles/templates/test-double-selection.md
```

## テストダブルの種類

### クイックリファレンス

| 種類  | 目的           | 検証方法     | 使用場面         |
| ----- | -------------- | ------------ | ---------------- |
| Dummy | パラメータ埋め | なし         | 使用されない引数 |
| Stub  | 固定値を返す   | 状態検証     | 入力の制御       |
| Spy   | 呼び出しを記録 | 振る舞い検証 | 呼び出し確認     |
| Mock  | 期待を検証     | 振る舞い検証 | 相互作用検証     |
| Fake  | 簡易実装       | 状態検証     | 複雑な依存       |

### 選択フロー

```
依存をテストダブルに置き換える
  ↓
[質問] 依存は使用されるか？
  ├─ No → Dummy
  └─ Yes ↓
[質問] 戻り値の制御が必要か？
  ├─ Yes → Stub
  └─ No ↓
[質問] 呼び出しの検証が必要か？
  ├─ Yes → Mock または Spy
  └─ No ↓
[質問] 本物に近い動作が必要か？
  └─ Yes → Fake
```

**詳細**: `resources/types-overview.md`

## ベストプラクティス

### すべきこと

1. **目的を明確にする**:

   - 何をテストしたいのか
   - どの検証が必要か

2. **最小限のテストダブル**:

   - 必要な依存のみ置き換え
   - 過度なモッキングを避ける

3. **適切な検証方法**:
   - 状態検証: 結果の正しさ
   - 振る舞い検証: 相互作用の正しさ

### 避けるべきこと

1. **過度なモッキング**:

   - ❌ すべての依存をモック化
   - ✅ テストに必要な依存のみ

2. **実装への密結合**:

   - ❌ 内部実装の詳細を検証
   - ✅ 公開インターフェースを検証

3. **不必要な振る舞い検証**:
   - ❌ すべての呼び出しを検証
   - ✅ 重要な相互作用のみ

## Vitest での実装

### 基本パターン

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub
const mockRepository = {
  findById: vi.fn().mockResolvedValue({ id: "1", name: "Test" }),
};

// Spy
const spyLogger = {
  log: vi.fn(),
};

// Mock with expectations
it("should call repository with correct id", async () => {
  await service.getUser("user-1");
  expect(mockRepository.findById).toHaveBeenCalledWith("user-1");
});
```

**詳細**: `resources/mock-patterns.md`

## ワークフロー

### テストダブル実装

```
1. テスト対象の依存を特定
   ↓
2. 各依存のテストダブル種類を選択
   ↓
3. テストダブルを作成
   ↓
4. テストを実装
   ↓
5. 検証方法を確認
   - 状態検証 or 振る舞い検証
```

## 関連スキル

- **tdd-principles** (`.claude/skills/tdd-principles/SKILL.md`): TDD 原則（@unit-tester 向け）
- **tdd-red-green-refactor** (`.claude/skills/tdd-red-green-refactor/SKILL.md`): TDD サイクル実装（@logic-dev 向け）
- **clean-code-practices** (`.claude/skills/clean-code-practices/SKILL.md`): コード品質
- **refactoring-techniques** (`.claude/skills/refactoring-techniques/SKILL.md`): リファクタリング
- **vitest-advanced** (`.claude/skills/vitest-advanced/SKILL.md`): Vitest モッキングパターン

## 参考文献

- **『xUnit Test Patterns』** Gerard Meszaros 著
  - 第 11 章: Using Test Doubles
- **『Growing Object-Oriented Software, Guided by Tests』** Freeman & Pryce 著
  - Mock を使った TDD

---

## 使用上の注意

### このスキルが得意なこと

- テストダブル 5 種類（Mock、Stub、Spy、Fake、Dummy）の使い分け判断
- 適切なテストダブル選択による保守性の高いテスト設計
- 検証戦略（状態検証 vs 振る舞い検証）の選定

### このスキルが行わないこと

- Vitest 固有のモッキング API 詳細（→ vitest-advanced）
- TDD サイクル全体の設計（→ tdd-principles）
- E2E/統合テストでのモック戦略

---

## 変更履歴

| バージョン | 日付       | 変更内容                      |
| ---------- | ---------- | ----------------------------- |
| 1.0.0      | 2025-11-26 | 初版作成 - テストダブルの基礎 |
