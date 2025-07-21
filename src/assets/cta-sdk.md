# Unifying Playable Ads: The CTA SDK Bridge

> **Note:** The CTA SDK is used by the [Publish Tool](/#publish), enabling seamless deployment and integration of HTML5 playables across multiple ad networks.

## 1. Game Events and CTA Calls

When the playable is finished, the user should click the Call to Action button (such as Install, Play, Next, etc.). When that button is clicked, you should call the following code:

  ```typescript
  document["CTA"]?.onClick?.(); // Triggers the app store
  ```

This method acts as a proxy for the specific APIs required by different ad platforms. It will only call the necessary API to direct the user to the app store.

### Optional methods

  ```typescript
  document["CTA"]?.gameEnd?.(); // Signals the end of gameplay

  document["CTA"]?.gameReady?.(); // Signals the ad is loaded and interactive
  ```

