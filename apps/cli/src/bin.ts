#!/usr/bin/env node

import { Command } from "commander";
import { startCommand } from "./commands/start.js";
import { statusCommand } from "./commands/status.js";
import { saveCommand } from "./commands/save.js";
import { resumeCommand } from "./commands/resume.js";
import { messageFromError } from "./lib/errors.js";

const program = new Command();

program
  .name("nmemo")
  .description("Local-first project continuity for coding work")
  .version("0.1.0");

program
  .command("start <task>")
  .description("Start a project task session")
  .action(async (task: string) => {
    await startCommand(task);
  });

program
  .command("status")
  .description("Show the current project task and Git status")
  .action(async () => {
    await statusCommand();
  });

program
  .command("save")
  .description("Save the active task as a resumable episode")
  .requiredOption("--summary <text>", "What work was completed")
  .option("--failure <text>", "What remains broken or blocked")
  .option("--next <text>", "The exact next step")
  .option("--test <text...>", "Tests run and their result")
  .action(async (options) => {
    await saveCommand(options);
  });

program
  .command("resume")
  .description("Print the latest portable project resume packet")
  .option("--print", "Print the packet for another coding agent")
  .action(async () => {
    await resumeCommand();
  });

program.showHelpAfterError();

program.parseAsync().catch((error: unknown) => {
  console.error(`nmemo: ${messageFromError(error)}`);
  process.exitCode = 1;
});