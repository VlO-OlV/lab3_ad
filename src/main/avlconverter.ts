import * as fs from 'fs';
import * as path from 'path';
import { AVLTree, TreeNode } from './avltree';

export class AVLConverter {

  public constructor () {}

  private serialize (node: TreeNode): any {
    if (!node) return null;
    return {
      key: node.getKey(),
      value: node.getValue(),
      height: node.getHeight(),
      left: this.serialize(node.getLeft()),
      right: this.serialize(node.getRight())
    };
  }

  private deserialize (data: any) {
    const usedKeys: number[] = [];
    if (!data) return {node: null, keys: usedKeys};
    const node = new TreeNode(data.key, data.value);
    usedKeys.push(data.key);
    node.setHeight(data.height);
    const {node: leftNode, keys: leftKeys} = this.deserialize(data.left);
    node.setLeft(leftNode);
    const {node: rightNode, keys: rightKeys} = this.deserialize(data.right);
    node.setRight(rightNode);
    usedKeys.push(...leftKeys, ...rightKeys);
    return {node: node, keys: usedKeys};
  }

  public saveData (tree: AVLTree, fileName: string = 'data.txt') {
    const root = tree.getRoot();
    const jsonData = this.serialize(root);
    fs.writeFileSync(path.resolve(__dirname, '../../src/main/static', fileName), JSON.stringify(jsonData));
  }

  public loadData (fileName: string = 'data.txt') {
    const data = fs.readFileSync(path.resolve(__dirname, '../../src/main/static', fileName), { encoding: 'utf-8' });
    if (!data) {
      return new AVLTree();
    }
    const jsonData = JSON.parse(data);
    const {node: root, keys: usedKeys} = this.deserialize(jsonData);
    return new AVLTree(root, usedKeys);
  }
}