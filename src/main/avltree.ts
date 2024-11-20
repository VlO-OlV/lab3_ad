export class TreeNode {
  private _key: number;
  private _value: string;
  private _height: number;
  private _left: TreeNode;
  private _right: TreeNode;

  public constructor(key: number, value: string) {
    this._key = key;
    this._value = value;
    this._height = 1;
    this._left = null;
    this._right = null;
  }

  public getKey () {
    return this._key;
  }

  public getValue () {
    return this._value;
  }

  public getHeight () {
    return this._height;
  }

  public getLeft () {
    return this._left;
  }
  
  public getRight () {
    return this._right;
  }

  public setKey (key: number) {
    this._key = key;
  }

  public setValue (value: string) {
    this._value = value;
  }

  public setHeight (height: number) {
    this._height = height;
  }

  public setLeft (left: TreeNode) {
    this._left = left;
  }

  public setRight (right: TreeNode) {
    this._right = right;
  }
}

export class AVLTree {
  private _root: TreeNode;
  private _usedKeys: number[];

  public constructor(root: TreeNode = null, usedKeys: number[] = []) {
    this._root = root;
    this._usedKeys = usedKeys;
  }

  public getRoot() {
    return this._root;
  }

  public getUsedKeys() {
    return this._usedKeys;
  }

  private height(node: TreeNode) {
    return node ? node.getHeight() : 0;
  }

  private updateHeight(node: TreeNode) {
    if (node) {
      node.setHeight(1 + Math.max(this.height(node.getLeft()), this.height(node.getRight())));
    }
  }

  private getBalance(node: TreeNode) {
    return node ? this.height(node.getLeft()) - this.height(node.getRight()) : 0;
  }

  private rightRotate(rotateNode: TreeNode) {
    const leftNode = rotateNode.getLeft();
    const tempNode = leftNode.getRight();

    leftNode.setRight(rotateNode);
    rotateNode.setLeft(tempNode);

    this.updateHeight(rotateNode);
    this.updateHeight(leftNode);

    return leftNode;
  }

  private leftRotate(rotateNode: TreeNode) {
    const rightNode = rotateNode.getRight();
    const tempNode = rightNode.getLeft();

    rightNode.setLeft(rotateNode);
    rotateNode.setRight(tempNode);

    this.updateHeight(rotateNode);
    this.updateHeight(rightNode);

    return rightNode;
  }

  private insertNode(currentNode: TreeNode, key: number, value: string) {
    if (!currentNode) return new TreeNode(key, value);

    if (key < currentNode.getKey()) {
      currentNode.setLeft(this.insertNode(currentNode.getLeft(), key, value));
    } else if (key > currentNode.getKey()) {
      currentNode.setRight(this.insertNode(currentNode.getRight(), key, value));
    }

    this.updateHeight(currentNode);
    const balance = this.getBalance(currentNode);

    if (balance > 1 && key < currentNode.getLeft().getKey()) {
      return this.rightRotate(currentNode);
    }

    if (balance < -1 && key > currentNode.getRight().getKey()) {
      return this.leftRotate(currentNode);
    }

    if (balance > 1 && key > currentNode.getLeft().getKey()) {
      currentNode.setLeft(this.leftRotate(currentNode.getLeft()));
      return this.rightRotate(currentNode);
    }

    if (balance < -1 && key < currentNode.getRight().getKey()) {
      currentNode.setRight(this.rightRotate(currentNode.getRight()));
      return this.leftRotate(currentNode);
    }

    return currentNode;
  }

  public insert(key: number, value: string) {
    if (this._usedKeys.includes(key)) {
      throw new Error('This key is already used');
    }
    this._usedKeys.push(key);
    this._root = this.insertNode(this._root, key, value);
  }

  private minValueNode(node: TreeNode) {
    let current = node;
    while (current.getLeft()) {
      current = current.getLeft();
    }
    return current;
  }

  private deleteNode(node: TreeNode, key: number) {
    if (!node) return node;

    if (key < node.getKey()) {
      node.setLeft(this.deleteNode(node.getLeft(), key));
    } else if (key > node.getKey()) {
      node.setRight(this.deleteNode(node.getRight(), key));
    } else {
      if (!node.getLeft() || !node.getRight()) {
        node = node.getLeft() || node.getRight();
      } else {
        const temp = this.minValueNode(node.getRight());
        node.setKey(temp.getKey());
        node.setValue(temp.getValue());
        node.setRight(this.deleteNode(node.getRight(), temp.getKey()));
      }
    }

    if (!node) return node;

    this.updateHeight(node);
    const balance = this.getBalance(node);

    if (balance > 1 && this.getBalance(node.getLeft()) >= 0) {
      return this.rightRotate(node);
    }

    if (balance > 1 && this.getBalance(node.getLeft()) < 0) {
      node.setLeft(this.leftRotate(node.getLeft()));
      return this.rightRotate(node);
    }

    if (balance < -1 && this.getBalance(node.getRight()) <= 0) {
      return this.leftRotate(node);
    }

    if (balance < -1 && this.getBalance(node.getRight()) > 0) {
      node.setRight(this.rightRotate(node.getRight()));
      return this.leftRotate(node);
    }

    return node;
  }

  public delete(key: number) {
    if (!this._usedKeys.includes(key)) {
      throw new Error('Record with such key is not found');
    }
    this._usedKeys = this._usedKeys.filter((usedKey) => usedKey !== key);
    this._root = this.deleteNode(this._root, key);
  }

  private searchNode(node: TreeNode, key: number): {node: TreeNode, comparisons: number} {
    if (!node || node.getKey() === key) {
      return { node: node, comparisons: 1 };
    }
    if (key < node.getKey()) {
      const { node: leftNode, comparisons: leftComparisons } = this.searchNode(node.getLeft(), key);
      return { node: leftNode, comparisons: leftComparisons + 1 };
    }
    const { node: rightNode, comparisons: rightComparisons } = this.searchNode(node.getRight(), key);
    return { node: rightNode, comparisons: rightComparisons + 1 };
  }

  public search(key: number) {
    if (!this._usedKeys.includes(key)) {
      throw new Error('Record with such key is not found');
    }
    const { node: node, comparisons: comparisons } = this.searchNode(this._root, key);
    return { value: node.getValue(), comparisons: comparisons };
  }

  public update(key: number, newValue: string) {
    if (!this._usedKeys.includes(key)) {
      throw new Error('Record with such key is not found');
    }
    const { node: node } = this.searchNode(this._root, key);
    node.setValue(newValue);
  }
}
