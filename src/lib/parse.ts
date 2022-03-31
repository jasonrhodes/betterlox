import * as fs from "fs";
import * as csv from "fast-csv";

type UnknownRow = Record<string | number, unknown>;

interface ParseOptions<T = UnknownRow> {
  filePath: string;
  onRow?: (row: T) => void;
  onEnd?: (rowCount: number) => void;
  returnAllRows?: boolean;
}

interface ParseResult<T = UnknownRow> {
  rowCount: number;
  rows?: T[];
}

export async function parse<T = UnknownRow>({
  filePath,
  onRow,
  onEnd,
  returnAllRows,
}: ParseOptions<T>): Promise<ParseResult<T>> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("error", reject)
      .on("data", (row: T) => {
        if (onRow) {
          onRow(row);
        }
        if (returnAllRows) {
          rows.push(row);
        }
      })
      .on("end", (rowCount: number) => {
        const result: ParseResult<T> = { rowCount };
        if (onEnd) {
          onEnd(rowCount);
        }
        if (returnAllRows) {
          result.rows = rows;
        }

        resolve(result);
      });
  });
}
