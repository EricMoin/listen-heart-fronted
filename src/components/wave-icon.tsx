import { createEffect, onCleanup, mergeProps } from 'solid-js';
import './wave-icon.scss';

export type WaveIconProps = {
  color?: string; // 颜色
  barCount?: number; // 条数
  isAnimating?: boolean; // 是否动画
  animationSpeed?: number; // Animation speed in ms for one cycle
  maxScale?: number; // Maximum scale factor for the bar
};

export function WaveIcon(initialProps: WaveIconProps) {
  const props = mergeProps(
    {
      color: '#ffffff',
      barCount: 5,
      isAnimating: true,
      animationSpeed: 1000, // Corresponds to 1s in CSS
      maxScale: 2.5, // Corresponds to scaleY(2.5) in CSS
    },
    initialProps,
  );

  const refs: HTMLDivElement[] = [];
  let animationFrameId: number;

  const getAnimationDelay = (index: number, count: number): number => {
    // Creates a symmetrical delay pattern like 0, 0.1, 0.2, 0.1, 0 for 5 bars
    // And 0, 0.1, 0.2, 0.2, 0.1, 0 for 6 bars
    const midPoint = (count - 1) / 2;
    const distanceFromMid = Math.abs(index - midPoint);
    // Max delay for outermost bars is 0, for center bar(s) is 0.2s (or 200ms)
    // Assuming a base delay step of 100ms for this pattern
    if (count <= 1) return 0;
    const maxDelaySteps = Math.floor(midPoint);
    if (maxDelaySteps === 0) return 0; // handles count = 2
    const delayStep = 200 / maxDelaySteps; // 200ms is the max delay in original CSS for the middle bar
    return Math.round(Math.max(0, maxDelaySteps - distanceFromMid) * delayStep);
  };

  createEffect(() => {
    refs.forEach((bar) => {
      if (bar) {
        bar.style.backgroundColor = props.color;
      }
    });
  });

  createEffect(() => {
    if (props.isAnimating) {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;

        refs.forEach((bar, index) => {
          if (bar) {
            const delay = getAnimationDelay(index, props.barCount);
            const phase = (elapsedTime - delay) / props.animationSpeed;

            if (phase >= 0) {
              // Only start animation after delay
              const cycleProgress = phase % 1; // progress within one animation cycle (0 to 1)
              // Replicate 0% -> 50% -> 100% scaling: 1 -> maxScale -> 1
              let scaleY;
              if (cycleProgress < 0.5) {
                // Scale up from 1 to maxScale
                scaleY = 1 + (props.maxScale - 1) * (cycleProgress * 2);
              } else {
                // Scale down from maxScale to 1
                scaleY =
                  props.maxScale -
                  (props.maxScale - 1) * ((cycleProgress - 0.5) * 2);
              }
              bar.style.transform = `scaleY(${scaleY})`;
            } else {
              // Before delay, keep scale at 1
              bar.style.transform = 'scaleY(1)';
            }
          }
        });
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId);
      refs.forEach((bar) => {
        if (bar) {
          bar.style.transform = 'scaleY(1)'; // Reset scale when not animating
        }
      });
    }
  });

  onCleanup(() => {
    cancelAnimationFrame(animationFrameId);
  });

  return (
    <div class="wave-icon">
      {Array.from({ length: props.barCount }).map((_, index) => (
        <div
          class="bar"
          ref={(el) => (refs[index] = el)}
          style={{ 'background-color': props.color }} // Initial color
        />
      ))}
    </div>
  );
}
