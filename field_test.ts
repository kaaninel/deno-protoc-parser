import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Field } from "./field.ts";
import { Type } from "./type.ts";
import { FieldOption } from "./fieldoption.ts";
import { Constant } from "./constant.ts";

Deno.test("Field", async () => {
  const tt: [string, Field, 2 | 3][] = [
    [
      `optional float F_Ninf = 16;`,
      new Field(
        new Type(
          "float",
          [1, 10],
          [1, 14],
        ),
        "F_Ninf",
        16,
        { optional: true },
        [],
        [1, 1],
        [1, 27],
      ),
      2,
    ],
    [
      `.Foo bar = 1;`,
      new Field(
        new Type(
          ".Foo",
          [1, 1],
          [1, 4],
        ),
        "bar",
        1,
        {},
        [],
        [1, 1],
        [1, 13],
      ),
      2,
    ],
    [
      `foo.bar nested_message = 2;`,
      new Field(
        new Type(
          "foo.bar",
          [1, 1],
          [1, 7],
        ),
        "nested_message",
        2,
        {},
        [],
        [1, 1],
        [1, 27],
      ),
      3,
    ],
    [
      `repeated int32 samples = 4 [packed = true];`,
      new Field(
        new Type(
          "int32",
          [1, 10],
          [1, 14],
        ),
        "samples",
        4,
        { repeated: true },
        [
          new FieldOption(
            ["packed"],
            false,
            new Constant("boolean", "true", [1, 38], [1, 41]),
            [1, 29],
            [1, 41],
          ),
        ],
        [1, 1],
        [1, 43],
      ),
      3,
    ],
    [
      `repeated int32 samples = 4 [(some.nested).key = true];`,
      new Field(
        new Type(
          "int32",
          [1, 10],
          [1, 14],
        ),
        "samples",
        4,
        { repeated: true },
        [
          new FieldOption(
            ["some.nested", "key"],
            true,
            new Constant("boolean", "true", [1, 49], [1, 52]),
            [1, 29],
            [1, 52],
          ),
        ],
        [1, 1],
        [1, 54],
      ),
      3,
    ],
  ];
  for (const t of tt) await assertNode(Field, ...t);
});

Deno.test("Field errors", async () => {
  const tt: [string, string, 2 | 3][] = [
    [
      `optional float foo = 1;`,
      `unexpected identifier (optional) on line 1, column 1; expected identifier (optional fields are not allowed in Proto3)`,
      3,
    ],
    [
      `required float foo = 1;`,
      `unexpected identifier (required) on line 1, column 1; expected identifier (required fields are not allowed in Proto3)`,
      3,
    ],
    [
      `float foo.bar = 1;`,
      `unexpected token (.) on line 1, column 10; expected identifier`,
      3,
    ],
  ];
  for (const t of tt) await assertNodeThrows(Field, ...t);
});
