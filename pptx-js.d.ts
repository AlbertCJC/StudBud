
declare module 'pptx-js' {
  export class Slide {
    getText(): Promise<{ text: string[] }>;
  }

  export class PowerPoint {
    slides: Slide[];
    load(file: File): Promise<void>;
    constructor();
  }
}
