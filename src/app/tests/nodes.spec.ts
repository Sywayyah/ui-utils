import { describe, it } from 'vitest';
import { UINodesEditor } from '../core/nodes/nodes-editor';
import { AnotherNode, BasicNode, OptionalsNode } from './node-test-configs';

describe('Nodes tests', () => {
  it('should verify scenarios', async () => {
    const editor = new UINodesEditor({ configs: [BasicNode, AnotherNode, OptionalsNode] });

    const basicNodeA = await editor.addNodeByConfig('default', BasicNode);

    basicNodeA[0].getInputContextInstance('')
    // todo: add more cases
  });
});
