# Unifying Playable Ads: The CTA SDK Bridge

> **Note:** The CTA SDK is used by the [Publish Tool](/#publish), enabling seamless deployment and integration of HTML5 playables across multiple ad networks.

## 1. Game Events and CTA Calls

When the playable is finished, the user should click the Call to Action button (such as Install, Play, Next, etc.). When that button is clicked, you should call the following code:

  ```typescript
  document["CTA"]?.onClick?.(); // Triggers the app store
  ```

This method acts as a proxy for the specific APIs required by different ad platforms. It will only call the necessary API to direct the user to the app store.

### Optional methods

Those methods should be used for playable ads publishing to Mintegral ads network. See the [docs](https://www.playturbo.com/review/doc)

  ```typescript
  document["CTA"]?.gameEnd?.(); // Signals the end of gameplay

  document["CTA"]?.gameReady?.(); // Signals the ad is loaded and interactive
  ```

## 2. MRAID Mute/Unmute Handler

For MRAID-compatible ad networks, you can integrate custom mute and unmute handlers. This allows the playable to respond to user audio preferences and synchronize your app's audio state:

  ```typescript
  const cta = (document as any).CTA as any; // Assumes CTA scripts are already injected and document.CTA exists

  let isStarted = false;

  function startGame() {
    // Check if already initialized
    if (isStarted) return;
    isStarted = true;

    const app = new App();
    // Set custom mute and unmute functions
    if (cta) {
      cta["mute"] = () => app.mute();
      cta["unmute"] = () => app.unmute();
    }
    app.init();
  }

  startGame();
  ```

The `mute()` and `unmute()` methods should be implemented in your `App` class to handle audio state changes accordingly.

