import { test } from "@playwright/test";
import * as path from "path";
import { Logger } from "../../src/utils/Logger";

test("check current working directory", async () => {
  Logger.info(`Current working directory: ${process.cwd()}`);
  Logger.info(`Absolute path: ${path.resolve(".")}`);
  Logger.info(
    `Path join result: ${path.join(process.cwd(), "test-results", "generated")}`,
  );
});
