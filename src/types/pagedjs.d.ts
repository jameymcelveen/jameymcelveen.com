declare module 'pagedjs' {
  export class Previewer {
    preview(
      content?: string | Node,
      stylesheets?: Array<string | Record<string, string>>,
      renderTo?: HTMLElement
    ): Promise<{ total: number }>;
  }
}
