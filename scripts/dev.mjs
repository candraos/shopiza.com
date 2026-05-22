import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const projectDir = process.cwd();
const sourceSchemaPath = path.join(projectDir, "prisma", "schema.prisma");
const generatedSchemaPath = path.join(
  projectDir,
  "node_modules",
  ".prisma",
  "client",
  "schema.prisma",
);

function getSpawnSpec(command, args) {
  if (process.platform === "win32") {
    const escapedArgs = args.map((arg) =>
      arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg,
    );

    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", [command, ...escapedArgs].join(" ")],
    };
  }

  return {
    command,
    args,
  };
}

function runCommand(command, args) {
  const spawnSpec = getSpawnSpec(command, args);
  const result = spawnSync(spawnSpec.command, spawnSpec.args, {
    cwd: projectDir,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function normalizeSchemaContents(contents) {
  return contents
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .trim();
}

function isPrismaClientCurrent() {
  if (!existsSync(sourceSchemaPath) || !existsSync(generatedSchemaPath)) {
    return false;
  }

  return (
    normalizeSchemaContents(readFileSync(sourceSchemaPath, "utf8")) ===
    normalizeSchemaContents(readFileSync(generatedSchemaPath, "utf8"))
  );
}

function stopExistingWorkspaceDevServer() {
  if (process.platform !== "win32") {
    return;
  }

  const escapedProjectDir = projectDir.replace(/'/g, "''");
  const script = `
$projectDir = '${escapedProjectDir}'
$targetIds = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq 'node.exe' -and
  $_.CommandLine -and
  $_.CommandLine.Contains($projectDir) -and
  (
    $_.CommandLine.Contains('next\\dist\\bin\\next') -or
    $_.CommandLine.Contains('start-server.js')
  )
} | Select-Object -ExpandProperty ProcessId -Unique

if ($targetIds) {
  Stop-Process -Id $targetIds -Force
}
`;

  const result = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script,
    ],
    {
      cwd: projectDir,
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensurePrismaClient() {
  if (isPrismaClientCurrent()) {
    console.info("Prisma client already matches schema. Skipping generate.");
    return;
  }

  console.info("Prisma schema changed or client is missing. Generating Prisma client.");
  runCommand("npx", ["prisma", "generate"]);
}

function startNextDev() {
  const spawnSpec = getSpawnSpec("npx", ["next", "dev"]);
  const child = spawn(spawnSpec.command, spawnSpec.args, {
    cwd: projectDir,
    env: process.env,
    stdio: "inherit",
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", forwardSignal);
  process.on("SIGTERM", forwardSignal);

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

stopExistingWorkspaceDevServer();
ensurePrismaClient();
startNextDev();
