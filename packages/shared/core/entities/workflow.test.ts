import { describe, it, expect, beforeEach } from 'vitest';
import { Workflow } from './workflow';

describe('Workflow Entity', () => {
  describe('create', () => {
    it('デフォルト値で新規ワークフローを作成できる', () => {
      const workflow = Workflow.create({
        id: 'wf-001',
        name: 'Test Workflow',
      });

      expect(workflow.id).toBe('wf-001');
      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.type).toBe('file_watch');
      expect(workflow.status).toBe('active');
      expect(workflow.triggerPath).toBeNull();
      expect(workflow.createdAt).toBeInstanceOf(Date);
      expect(workflow.updatedAt).toBeInstanceOf(Date);
    });

    it('カスタム値でワークフローを作成できる', () => {
      const workflow = Workflow.create({
        id: 'wf-002',
        name: 'Custom Workflow',
        type: 'manual',
        triggerPath: '/path/to/watch',
      });

      expect(workflow.type).toBe('manual');
      expect(workflow.triggerPath).toBe('/path/to/watch');
    });
  });

  describe('activate', () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = Workflow.create({ id: 'wf-001', name: 'Test' });
      workflow.deactivate();
    });

    it('非アクティブなワークフローをアクティブ化できる', () => {
      const beforeUpdate = workflow.updatedAt;

      // 少し待ってから実行（updatedAtの変化を確認するため）
      workflow.activate();

      expect(workflow.status).toBe('active');
      expect(workflow.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime()
      );
    });

    it('既にアクティブな場合は何もしない', () => {
      workflow.activate();
      const afterFirstActivate = workflow.updatedAt;

      workflow.activate();

      expect(workflow.status).toBe('active');
      expect(workflow.updatedAt).toBe(afterFirstActivate);
    });
  });

  describe('deactivate', () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = Workflow.create({ id: 'wf-001', name: 'Test' });
    });

    it('アクティブなワークフローを非アクティブ化できる', () => {
      workflow.deactivate();

      expect(workflow.status).toBe('inactive');
    });

    it('既に非アクティブな場合は何もしない', () => {
      workflow.deactivate();
      const afterFirstDeactivate = workflow.updatedAt;

      workflow.deactivate();

      expect(workflow.status).toBe('inactive');
      expect(workflow.updatedAt).toBe(afterFirstDeactivate);
    });
  });

  describe('updateTriggerPath', () => {
    it('監視パスを更新できる', () => {
      const workflow = Workflow.create({ id: 'wf-001', name: 'Test' });

      workflow.updateTriggerPath('/new/path');

      expect(workflow.triggerPath).toBe('/new/path');
    });

    it('監視パスをnullに設定できる', () => {
      const workflow = Workflow.create({
        id: 'wf-001',
        name: 'Test',
        triggerPath: '/old/path',
      });

      workflow.updateTriggerPath(null);

      expect(workflow.triggerPath).toBeNull();
    });
  });

  describe('updateName', () => {
    it('名前を更新できる', () => {
      const workflow = Workflow.create({ id: 'wf-001', name: 'Old Name' });

      workflow.updateName('New Name');

      expect(workflow.name).toBe('New Name');
    });

    it('前後の空白をトリムする', () => {
      const workflow = Workflow.create({ id: 'wf-001', name: 'Test' });

      workflow.updateName('  Trimmed Name  ');

      expect(workflow.name).toBe('Trimmed Name');
    });

    it('空の名前を設定しようとするとエラー', () => {
      const workflow = Workflow.create({ id: 'wf-001', name: 'Test' });

      expect(() => workflow.updateName('')).toThrow(
        'Workflow name cannot be empty'
      );
    });

    it('空白のみの名前を設定しようとするとエラー', () => {
      const workflow = Workflow.create({ id: 'wf-001', name: 'Test' });

      expect(() => workflow.updateName('   ')).toThrow(
        'Workflow name cannot be empty'
      );
    });
  });
});
