## Unifying Playable Ads: The CTA SDK Bridge

> **Note:** The CTA SDK is used by the [Publish Tool](/#publish), enabling seamless deployment and integration of HTML5 playables across multiple ad networks.  

In the world of HTML5 playable ads, a significant challenge for developers is adapting their creative to run on various ad networks like ironSource, Unity Ads, or Google Ads. Each network has its own specific API (SDK) for handling crucial events like opening the app store, tracking user interaction, or managing sound. Writing separate code for each platform is inefficient and increases development time.

The code snippet you provided demonstrates an elegant solution to this problem: a unified "Call to Action" (CTA) bridge. This approach uses a single, generic `document.CTA` object to interface with the specific SDK of the ad network where the playable ad is currently running. This allows for a **single codebase** that can be deployed across multiple platforms without modification.

### How It Works: A Centralized `CTA` Object

The core of this strategy is to have the ad network's platform initialize a global `CTA` object on the `document`. This object is then populated with functions that the playable ad can call. The ad itself doesn't need to know the specific implementation details of the network's SDK; it only needs to know that it can call standardized methods on `document.CTA`.

Let's break down how your `App.ts` code leverages this pattern.

#### 1. Game Events and CTA Calls

Your code defines several key methods that trigger actions through the `CTA` object. These methods are called at critical points in the game's lifecycle.

* **`callCta()`**: This is the primary "call to action" function. When the user is prompted to install the app, this function is invoked. It first mutes the game's sound, signals that the game has ended, and then calls the `onClick` method on the `CTA` object. This `onClick` function is what the ad network provides to open the app store link.

  ```typescript
  callCta() {
    this.mute();
    this.onGameEnd();
    document["CTA"]?.onClick?.(); // Triggers the app store
    console.log("CTA clicked");
  }
  ```

* **`onGameEnd()` and `onGameReady()`**: These functions are used for tracking and analytics. Ad networks often require the ad to signal when it's ready to be interacted with and when the "gameplay" portion is complete. This is crucial for measuring engagement.

  ```typescript
  onGameEnd() {
    document["CTA"]?.gameEnd?.(); // Signals the end of gameplay
  }
  
  onGameReady() {
    console.log("game ready");
    document["CTA"]?.gameReady?.(); // Signals the ad is loaded and interactive
  }
  ```

The optional chaining (`?.`) is a critical part of this implementation. It ensures that if the `CTA` object or one of its methods doesn't exist (for example, when testing in a local browser environment), the code will not throw an error.

#### 2. Initializing the Bridge

The `startGame` function is responsible for setting up the connection between your game's internal logic and the external `CTA` object provided by the ad network. It assigns your game's `mute` and `unmute` functions to the `CTA` object, allowing the ad network's UI (like a mute button on the ad container) to control the sound within your game.

```typescript
function startGame() {
  //prevent multiple starts
  if (isStarted) return;
  isStarted = true;

  const app = new App();
  if (cta) {
    cta["mute"] = () => app.mute();
    cta["unmute"] = () => app.unmute();
  }
  app.init();
}
```

This two-way communication is powerful. The game can call the network's functions (`onClick`), and the network's chrome can call the game's functions (`mute`/`unmute`).

### The "Single Codebase" Advantage

By abstracting away the platform-specific details behind the `CTA` object, the core game logic remains clean and independent.

* **On ironSource**, the platform's script would define `document.CTA = { onClick: () => dapi.openStoreUrl(), ... }`.
* **On another network**, it might be `document.CTA = { onClick: () => mraid.open(), ... }`.

Your game code doesn't change. It simply calls `document.CTA.onClick()`, and the correct, platform-specific function is executed. This dramatically simplifies the process of developing and deploying playable ads, saving time and reducing the potential for errors. Your code elegantly handles this by creating a flexible and robust bridge to any ad network's API.
