import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { WorkflowRepository } from './workflow-repository';
import { Workflow } from '../../../core/entities';
import * as schema from '../schema';

describe('WorkflowRepository', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: WorkflowRepository;

  beforeEach(() => {
    // インメモリ DB を作成
    sqlite = new Database(':memory:');
    sqlite.pragma('foreign_keys = ON');

    // テーブルを作成
    sqlite.exec(`
      CREATE TABLE workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'file_watch',
        trigger_path TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db = drizzle(sqlite, { schema });
    repository = new WorkflowRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('save', () => {
    it('ワークフローを保存できる', async () => {
      const workflow = Workflow.create({
        id: 'test-id-1',
        name: 'Test Workflow',
        triggerPath: '/path/to/watch',
      });

      await repository.save(workflow);

      const result = await repository.findById('test-id-1');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test Workflow');
      expect(result?.triggerPath).toBe('/path/to/watch');
      expect(result?.status).toBe('active');
    });
  });

  describe('findById', () => {
    it('存在する ID でワークフローを取得できる', async () => {
      const workflow = Workflow.create({
        id: 'test-id-2',
        name: 'Find Test',
      });
      await repository.save(workflow);

      const result = await repository.findById('test-id-2');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id-2');
      expect(result?.name).toBe('Find Test');
    });

    it('存在しない ID では null を返す', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('すべてのワークフローを取得できる', async () => {
      await repository.save(Workflow.create({ id: 'id-1', name: 'Workflow 1' }));
      await repository.save(Workflow.create({ id: 'id-2', name: 'Workflow 2' }));
      await repository.save(Workflow.create({ id: 'id-3', name: 'Workflow 3' }));

      const result = await repository.findAll();

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(1);
    });

    it('ページネーションが機能する', async () => {
      for (let i = 1; i <= 25; i++) {
        await repository.save(
          Workflow.create({ id: `id-${i}`, name: `Workflow ${i}` })
        );
      }

      const page1 = await repository.findAll({ page: 1, limit: 10 });
      expect(page1.items).toHaveLength(10);
      expect(page1.total).toBe(25);
      expect(page1.totalPages).toBe(3);

      const page2 = await repository.findAll({ page: 2, limit: 10 });
      expect(page2.items).toHaveLength(10);

      const page3 = await repository.findAll({ page: 3, limit: 10 });
      expect(page3.items).toHaveLength(5);
    });
  });

  describe('findActive', () => {
    it('アクティブなワークフローのみ取得できる', async () => {
      const active = Workflow.create({ id: 'active-1', name: 'Active' });
      const inactive = Workflow.create({ id: 'inactive-1', name: 'Inactive' });
      inactive.deactivate();

      await repository.save(active);
      await repository.save(inactive);

      const result = await repository.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('active-1');
    });
  });

  describe('update', () => {
    it('ワークフローを更新できる', async () => {
      const workflow = Workflow.create({ id: 'update-1', name: 'Original' });
      await repository.save(workflow);

      workflow.updateName('Updated Name');
      workflow.deactivate();
      await repository.update(workflow);

      const result = await repository.findById('update-1');
      expect(result?.name).toBe('Updated Name');
      expect(result?.status).toBe('inactive');
    });
  });

  describe('delete', () => {
    it('ワークフローを削除できる', async () => {
      const workflow = Workflow.create({ id: 'delete-1', name: 'To Delete' });
      await repository.save(workflow);

      await repository.delete('delete-1');

      const result = await repository.findById('delete-1');
      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('存在する ID は true を返す', async () => {
      const workflow = Workflow.create({ id: 'exists-1', name: 'Exists' });
      await repository.save(workflow);

      const result = await repository.exists('exists-1');
      expect(result).toBe(true);
    });

    it('存在しない ID は false を返す', async () => {
      const result = await repository.exists('non-existent');
      expect(result).toBe(false);
    });
  });
});
