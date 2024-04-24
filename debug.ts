await Bun.build({
  entrypoints: ["./source/index.ts"],
  outdir: "./docs",
});

Bun.serve({
  development: true,
  port: process.env.PORT,
  hostname: "localhost",
  fetch(request) {
    console.log(request);

    const url = new URL(request.url);
    let path: string | undefined = undefined;

    switch (url.pathname) {
      case "/":
        path = "index.html";
        break;
      default:
        path = url.pathname;
    }

    const file = Bun.file(`./docs/${path}`);
    if (!file.exists) {
      throw new Error("Not found");
    }

    return new Response(file);
  },
});
