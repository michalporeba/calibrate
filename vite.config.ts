import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getTemplateSyncPaths, syncTemplateCatalogue } from "./scripts/template-catalogue.mjs";

function templateSyncPlugin() {
  const watchPaths = getTemplateSyncPaths();
  let syncing = false;

  const sync = async () => {
    if (syncing) {
      return;
    }

    syncing = true;

    try {
      syncTemplateCatalogue();
    } finally {
      syncing = false;
    }
  };

  return {
    name: "template-sync",
    async buildStart() {
      await sync();
    },
    configureServer(server: import("vite").ViteDevServer) {
      server.watcher.add(watchPaths);

      const relevant = (path: string) =>
        watchPaths.some((watchPath) => path === watchPath || path.startsWith(`${watchPath}/`));

      const resync = async (path: string) => {
        if (!relevant(path)) {
          return;
        }

        await sync();
        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("add", resync);
      server.watcher.on("change", resync);
      server.watcher.on("unlink", resync);
      server.watcher.on("unlinkDir", resync);
    },
  };
}

syncTemplateCatalogue();

export default defineConfig(({ mode }) => ({
  base:
    mode === "pages-me"
      ? "/calibrate/me/"
      : mode === "pages-gds"
        ? "/calibrate/gds/"
        : "/",
  define: {
    __APP_THEME__: JSON.stringify(mode.indexOf("gds") >= 0 ? "gds" : "me"),
  },
  plugins: [react(), templateSyncPlugin()],
}));
