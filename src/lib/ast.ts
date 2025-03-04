
export type ASTNode =
  | ProgramNode
  | VarDeclarationNode
  | FunctionDeclarationNode
  | ExpressionStatementNode
  | ReturnStatementNode
  | BinaryExpressionNode
  | LiteralNode
  | IdentifierNode
  | FunctionCallNode
  | GroupingNode
  | IfStatementNode;

export interface ProgramNode {
  type: "Program";
  body: ASTNode[];
}

export interface VarDeclarationNode {
  type: "VarDeclaration";
  varType: string;
  identifier: string;
  initializer: ASTNode | null;
}

export interface FunctionDeclarationNode {
  type: "FunctionDeclaration";
  name: string;
  params: string[];
  body: ASTNode[]; // Cuerpo de la función (lista de sentencias)
}

export interface ExpressionStatementNode {
  type: "ExpressionStatement";
  expression: ASTNode;
}

export interface ReturnStatementNode {
  type: "ReturnStatement";
  expression: ASTNode;
}

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface LiteralNode {
  type: "Literal";
  value: any;
}

export interface IdentifierNode {
  type: "Identifier";
  name: string;
}

export interface FunctionCallNode {
  type: "FunctionCall";
  callee: string;
  arguments: ASTNode[];
}

export interface GroupingNode {
  type: "Grouping";
  expression: ASTNode;
}

export interface IfStatementNode {
  type: "IfStatement";
  condition: ASTNode;
  thenBranch: ASTNode[];
  elseBranch?: ASTNode[];
}
