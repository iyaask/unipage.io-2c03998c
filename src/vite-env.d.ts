/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        style?: string;
        speed?: string;
        autoplay?: boolean;
        loop?: boolean;
      };
    }
  }
}
