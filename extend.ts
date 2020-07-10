import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { Field } from "./nodes.ts";

export class Extend extends ParseNode {
  constructor(
    public name: string,
    public body: Field[] = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto(syntax: 2 | 3 = 3) {
    let body = "";
    if (this.body.length) {
      body = `\n  ${
        this.body.map((node) => node.toProto(syntax)).join("\n  ")
      }\n`;
    }
    return `extend ${this.name} {${body}}`;
  }

  toJSON() {
    return {
      type: "Extend",
      start: this.start,
      end: this.end,
      name: this.name,
      body: this.body.map((node) => node.toJSON()),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitExtend?.(this);
    for (const node of this.body) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Extend> {
    if (scanner.contents !== "extend") {
      await nextTokenIs(scanner, Token.keyword, "extend");
    }
    if (syntax === 3) {
      throw new TokenError(
        scanner,
        Token.identifier,
        Token.identifier,
        "Extend blocks are not allowed in Proto3",
      );
    }
    const start = scanner.startPos;
    const name = await nextTokenIs(scanner, Token.identifier);
    const body: Field[] = [];
    await nextTokenIs(scanner, Token.token, "{");
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.token && str === "}") {
        return new Extend(name, body, start, scanner.endPos);
      } else if (token === Token.token && str === ";") {
        // Empty statements are allowed!
      } else if (token === Token.keyword && str === "repeated") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "optional") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "required") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.identifier) {
        body.push(await Field.parse(scanner, syntax));
      } else {
        throw new TokenError(scanner, token);
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}