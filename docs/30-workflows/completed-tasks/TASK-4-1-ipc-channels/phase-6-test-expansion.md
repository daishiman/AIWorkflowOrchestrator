# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| Phase      | 6               |
| Phase名    | テスト拡充      |
| 前提Phase  | Phase 5         |
| 後続Phase  | Phase 7         |
| ステータス | 未実施          |
| 作成日     | 2026-01-25      |
| 機能名     | IPCチャネル定義 |

---

## 目的

Phase 5の実装に対して、テストを拡充しカバレッジ目標達成に向けた追加テストを作成する。

## 背景

本タスクは定数定義のため、ランタイムテストの拡充は限定的。
主に以下の観点でテストを補強:

- エッジケースの検証
- 型安全性の確認
- 既存チャネルとの共存確認

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステストの追加

**目的**: エッジケースをテストで検証する

**実行手順**:

1. チャネル値の一意性テストを追加する
2. チャネル値のフォーマット検証テストを追加する
3. ホワイトリストの重複チェックテストを追加する

**追加テスト**:

```typescript
describe("チャネル値の検証", () => {
  it("全てのSKILL_*チャネル値が一意である", () => {
    const skillChannels = Object.entries(IPC_CHANNELS)
      .filter(([key]) => key.startsWith("SKILL_"))
      .map(([, value]) => value);
    const uniqueChannels = new Set(skillChannels);
    expect(skillChannels.length).toBe(uniqueChannels.size);
  });

  it('全てのSKILL_*チャネル値が"skill:"で始まる', () => {
    const skillChannels = Object.entries(IPC_CHANNELS)
      .filter(([key]) => key.startsWith("SKILL_"))
      .map(([, value]) => value);
    skillChannels.forEach((channel) => {
      expect(channel).toMatch(/^skill:/);
    });
  });
});

describe("ホワイトリストの整合性", () => {
  it("ALLOWED_INVOKE_CHANNELSに重複がない", () => {
    const unique = new Set(ALLOWED_INVOKE_CHANNELS);
    expect(ALLOWED_INVOKE_CHANNELS.length).toBe(unique.size);
  });

  it("ALLOWED_ON_CHANNELSに重複がない", () => {
    const unique = new Set(ALLOWED_ON_CHANNELS);
    expect(ALLOWED_ON_CHANNELS.length).toBe(unique.size);
  });

  it("invokeとonに同じチャネルが重複登録されていない", () => {
    const invokeSet = new Set(ALLOWED_INVOKE_CHANNELS);
    const onSet = new Set(ALLOWED_ON_CHANNELS);
    const intersection = [...invokeSet].filter((x) => onSet.has(x));
    expect(intersection.length).toBe(0);
  });
});
```

**期待される成果物**:

- 追加テストコード

---

### タスク2: 型安全性テストの追加

**目的**: TypeScript型の安全性をテストで確認する

**実行手順**:

1. 型推論テストを追加する
2. const assertionの検証テストを追加する

**追加テスト**:

```typescript
describe("型安全性", () => {
  it("IPC_CHANNELSはreadonlyである", () => {
    // TypeScript コンパイル時の検証
    // @ts-expect-error - readonlyなので代入不可
    // IPC_CHANNELS.SKILL_SCAN = 'modified';
    expect(true).toBe(true); // 型エラーがないことを確認
  });

  it("チャネル値はリテラル型である", () => {
    const channel = IPC_CHANNELS.SKILL_SCAN;
    // 型が 'skill:scan' リテラルであることを確認
    const _typeCheck: "skill:scan" = channel;
    expect(_typeCheck).toBe("skill:scan");
  });
});
```

**期待される成果物**:

- 型安全性テストコード

---

### タスク3: テストの実行と確認

**目的**: 追加したテストが全てパスすることを確認する

**実行手順**:

1. テストを実行する
2. カバレッジを確認する
3. 失敗がないことを確認する

**検証コマンド**:

```bash
# テスト実行（カバレッジ付き）
pnpm --filter @repo/desktop test -- --coverage
```

**期待される成果物**:

- テスト実行結果
- カバレッジレポート

---

## 参照資料

| 参照資料      | パス                                                        | 内容       |
| ------------- | ----------------------------------------------------------- | ---------- |
| Phase 4テスト | `apps/desktop/src/preload/__tests__/channels.skill.test.ts` | 既存テスト |
| 実装          | `apps/desktop/src/preload/channels.ts`                      | テスト対象 |

---

## 成果物

| 成果物             | パス                                                        | 内容             |
| ------------------ | ----------------------------------------------------------- | ---------------- |
| 拡充されたテスト   | `apps/desktop/src/preload/__tests__/channels.skill.test.ts` | 追加テストケース |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                        | カバレッジ結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

本タスクは定数定義のため、統合テストは不要。
ユニットテストのカバレッジで十分な検証が可能。

---

## 完了条件

- [ ] エッジケーステストを追加した
- [ ] 型安全性テストを追加した
- [ ] 全テストがパスした
- [ ] カバレッジを確認した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels/phase-7-coverage-check.md`
