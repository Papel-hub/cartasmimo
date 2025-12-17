// src/types/model-viewer.d.ts
import '@google/model-viewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'exposure'?: string | number;
        'shadow-intensity'?: string | number;
        style?: React.CSSProperties;
      };
    }
  }
}
