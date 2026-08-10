import type { H3Event } from "h3";

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();
  if (!config.debug.timings) {
    return;
  }

  const collect = (event: H3Event) => {
    const timings = event.context.timings;
    if (!timings) {
      return undefined;
    }

    return {
      total: performance.now() - timings.start,
      sections: [...timings.sections.entries()],
    };
  };

  const log = (
    event: H3Event,
    { total, sections }: NonNullable<ReturnType<typeof collect>>,
  ) => {
    const breakdown = sections
      .map(([name, ms]) => `${name}=${Math.round(ms)}`)
      .join(" ");
    console.info(
      `[timing] ${event.method} ${event.path} ${Math.round(total)}ms ${breakdown}`,
    );
  };

  nitroApp.hooks.hook("beforeResponse", (event) => {
    const report = collect(event);
    if (!report) {
      return;
    }

    setResponseHeader(
      event,
      "Server-Timing",
      [
        ...report.sections.map(([name, ms]) => `${name};dur=${ms.toFixed(1)}`),
        `total;dur=${report.total.toFixed(1)}`,
      ].join(", "),
    );
    log(event, report);
  });

  nitroApp.hooks.hook("error", (_error, { event }) => {
    if (!event) {
      return;
    }

    const report = collect(event);
    if (!report) {
      return;
    }

    log(event, report);
  });
});
