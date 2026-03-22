import { spawn } from "node:child_process";

const composeArgs = ["compose", "-f", "docker-compose.solid.yml"];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}.`));
    });
  });
}

async function waitForCss(url, attempts = 60) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      await run("curl", ["--ipv4", "-fsS", url]);
      return;
    } catch {
      // Keep polling while the container starts.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error("Community Solid Server did not become ready in time.");
}

async function main() {
  try {
    await run("docker", [...composeArgs, "up", "-d"]);
    await waitForCss("http://localhost:3000/.account/");
    await run("npx", ["playwright", "install", "chromium"]);
    await run("npm", ["run", "build"]);
    await run("npx", ["playwright", "test", "tests/pod-sync.spec.ts"]);
  } finally {
    await run("docker", [...composeArgs, "down", "-v"]).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
