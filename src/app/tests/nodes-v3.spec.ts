import { describe, it } from 'vitest';
import { UINodesEditor } from '../core/nodes/nodes-editor';
import { AnotherNode, BasicNode, OptionalsNode } from './node-test-configs';

describe('Nodes V3 tests', () => {
  it('should verify scenarios', async () => {
    const editor = new UINodesEditor({ configs: [BasicNode, AnotherNode, OptionalsNode] });

    const basicNodeA = await editor.addNodeByConfig('default', BasicNode);
    // todo: add more cases
  });
});
