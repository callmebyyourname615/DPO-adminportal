export interface LottieAnimation {
  totalFrames: number;
  goToAndStop: (frame: number, isFrame: boolean) => void;
  addEventListener: (event: string, callback: () => void) => void;
  destroy: () => void;
}
interface LottiePlayer {
  loadAnimation: (options: {
    container: HTMLElement;
    renderer: "svg";
    loop: boolean;
    autoplay: boolean;
    path: string;
  }) => LottieAnimation;
}
declare global {
  interface Window {
    lottie?: LottiePlayer;
  }
}
let loading: Promise<LottiePlayer> | undefined;
export function loadLottiePlayer(): Promise<LottiePlayer> {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    const fail = () => {
      window.clearTimeout(timer);
      script.remove();
      loading = undefined;
      reject(new Error("Animation player unavailable"));
    };
    const timer = window.setTimeout(fail, 15000);
    script.onerror = fail;
    script.onload = () => {
      if (!window.lottie) {
        fail();
        return;
      }
      window.clearTimeout(timer);
      resolve(window.lottie);
    };
    document.head.append(script);
  });
  return loading;
}
