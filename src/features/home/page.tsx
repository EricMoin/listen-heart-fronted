import { MainHeader } from '@/components/main-header';
import './page.scss';
import { createSignal, For, Show } from 'solid-js';
import { WaveIcon } from '@/components/wave-icon';
export function HomeScreen() {
  return (
    <main class="main-screen">
      <MainHeader></MainHeader>
      <MainPanel></MainPanel>
    </main>
  );
}

export function MainPanel() {
  const [isRecording, setIsRecording] = createSignal(false);
  return (
    <div class="main-panel">
      <header class="panel-header">
        <div class="panel-header-text ">
          <span class="header-title-text">How are you feeling today?</span>
          <span class="header-subtitle-text">You’ve been on my mind</span>
        </div>
      </header>
      <div class="panel-body">
        <For each={Array(20).fill(0)}>
          {(item, index) => (
            <Message isRobot={index() % 2 === 0} content={index().toString()} />
          )}
        </For>
      </div>
      <div
        class="panel-footer"
        onMouseDown={() => {
          setIsRecording(true);
        }}
        onMouseUp={() => setIsRecording(false)}
        onMouseLeave={() => setIsRecording(false)}
        onTouchStart={() => setIsRecording(true)}
        onTouchEnd={() => setIsRecording(false)}
      >
        <WaveIcon
          isAnimating={isRecording()}
          animationSpeed={800}
          barCount={8}
        />
        <Show when={!isRecording()}>
          <span>Touch to Speak</span>
        </Show>
      </div>
    </div>
  );
}

type MessageProps = {
  isRobot: boolean;
  content: string;
};
export function Message({ isRobot, content }: MessageProps) {
  return (
    <div class={`message ${isRobot ? 'robot-message' : ''}`}>
      <Show when={!isRobot}>
        <div class="user-content">
          <span>{content}</span>
        </div>
      </Show>
      <Show when={isRobot}>
        <div class="robot-content">
          <span>{content}</span>
        </div>
      </Show>
    </div>
  );
}
