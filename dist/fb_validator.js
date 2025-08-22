console.warn("🤦‍♂️ Facebook validator loaded successfully!");
if (
      !Boolean(navigator.userAgent.match(/android/i)) &&
      Boolean(navigator.userAgent.match(/Chrome/) ||
      navigator.userAgent.match(/Firefox/) ||
      navigator.userAgent.match(/Safari/) ||
      navigator.userAgent.match(/MSIE|Trident|Edge/))) {
      window.FbPlayableAd = {
        onCTAClick() {
          window.parent.postMessage("CTAClick", "*");
        },
        initializeLogging(endpoint_url) {},
        logGameLoad() {},
        logButtonClick(name, x, y) {},
        logLevelComplete(level_name) {},
        logEndCardShowUp() {},
      };
      FbPlayableAd = window.FbPlayableAd;
    };    function getProtocol(val) {
      var parser = document.createElement('a');
      parser.href = val;
      return parser.protocol;
    };

    function hasValidProtocolForPlayable(val) {
      var protocol = getProtocol(val);
      return 'data:' === protocol || 'blob:' === protocol;
    };

    function needsToBeBlacklisted(src) {
      if (src == "https://code.jquery.com/jquery-1.7.1.min.js") {
       return false;
      }
      return true;
    };    // block standard (new Image).src = attack by proxy the real Image
    var NativeImage = window.Image;
    const oldSrcDescriptor = Object.getOwnPropertyDescriptor(window.Image.prototype, 'src');
    createImage = function (arguments) {
      var image = new NativeImage(arguments);
      Object.defineProperty(image, 'src', {
        set: function (srcAttr) {
          // whatever else you want to put in here
          if (hasValidProtocolForPlayable(srcAttr)) {
            oldSrcDescriptor.set.call(image, srcAttr);
          }
        },
        get: function () {
          return oldSrcDescriptor.get.call(image);
        }
      });

      image.setAttribute = function(name, value) {
        image[name] = value;
      };
      return image;
    };

    if (typeof window.Image !== 'object') {
        window.Image = createImage;
    }

    // block XMLHttpRequest approach
    XMLHttpRequest.prototype.send = function() {
      return false;
    };

    // block fetch approach
    var origFetch = window.fetch;
    window.fetch = function(url){
      if (hasValidProtocolForPlayable(url)) {
        return origFetch(url);
      }
    };    // block static remove asset loading by removing them from DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(({addedNodes}) => {
        addedNodes.forEach(node => {
          if (
            node.tagName === 'IMG' ||
            node.tagName === 'VIDEO' ||
            node.tagName === 'AUDIO'
          ) {
            if(node.src && !hasValidProtocolForPlayable(node.src)) {
              // strip out of the DOM tree completely for risk management
              node.parentElement.removeChild(node);
            }
          }
        })
      })
    })

    // Starts the monitoring
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });  // block JSONP approach & remote src setter
  function handleElement(proto, element) {
    const originalDescriptors = {
      src: Object.getOwnPropertyDescriptor(proto, 'src'),
      type: Object.getOwnPropertyDescriptor(proto, 'type')
    };

    Object.defineProperties(element, {
      'src': {
        get() {
          return originalDescriptors.src.get.call(element)
        },
        set(value) {
          if (proto === HTMLImageElement.prototype || proto === HTMLMediaElement.prototype) {
            if (hasValidProtocolForPlayable(value)) {
              return originalDescriptors.src.set.call(element, value)
            }
            else {
              // If it's not a valid protocol then just set an empty
              // string as a src to avoid unnecessary observer calls
              return originalDescriptors.src.set.call(element, '')
            }
          } else if (proto === HTMLScriptElement.prototype) {
            if (needsToBeBlacklisted(value, element.type)) {
              element.type = 'javascript/blocked'
            }
            return originalDescriptors.src.set.call(element, value)
          }
        }
      },
      'type': {
        set(value) {
          if (proto === HTMLScriptElement.prototype) {
            return originalDescriptors.type.set.call(
              element,
              // If a third-party code tries to set the type, but the source is blacklisted then prevent.
              needsToBeBlacklisted(element.src, element.type) ?
                'javascript/blocked' :
                value
            )
          } else {
            return originalDescriptors.src.set.call(element, value)
          }
        }
      }
    });

    element.setAttribute = function(name, value) {
      var attr = document.createAttribute(name);
      attr.value = value;
      element.attributes.setNamedItem(attr);
    };
    return element;
  };

  const createElementBackup = document.createElement;
  document.createElement = function(...args) {
    // If this is not a script tag, bypass
    const tagName = args[0].toLowerCase();
    if (tagName !== 'script' && tagName !== 'img' && tagName !== 'video' && tagName !=='audio') {
      // Binding to document is essential
      return createElementBackup.bind(document)(...args)
    }
    let element = createElementBackup.bind(document)(...args)
    if (tagName === 'img') {
      //HTMLImageElement.prototype
      return handleElement(HTMLImageElement.prototype, element);
    }
    if (tagName === 'video' || tagName === 'audio') {
      //HTMLMediaElement.prototype
      return handleElement(HTMLMediaElement.prototype, element);
    }
    if (tagName === 'script') {
      //HTMLScriptElement.prototype
      return handleElement(HTMLScriptElement.prototype, element);
    }
  };