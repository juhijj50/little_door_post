/* inline CSS text -> React style object (keeps the markup readable) */
export const css = (text) =>
  Object.fromEntries(
    text
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const i = d.indexOf(":");
        const k = d.slice(0, i).trim();
        const v = d.slice(i + 1).trim();
        return [k.startsWith("--") ? k : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v];
      })
  );
