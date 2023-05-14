var zsido = {
  player: null,
  startupVideoId: 'dhYz-y2yl1s',
  checkIntervalInSec: 10,

  _checkInterval: null,
  _checks: [],
  _$contractDivs: [],

  init: function() {
    console.log(this);
    this._loadScript().then(function() {
      console.log("Script loaded, starting checks");
      this._onYouTubeIframeAPIReady();
      this._cache();

      // this.setCheck("Chengdu Rongcheng", {maxSell: 1, videoId: '0rAUEkPzgMo', endSeconds: 3});
      // this.setCheck("Draw", {maxSell: 1, videoId: '0rAUEkPzgMo', endSeconds: 3});
      // this.setCheck("Changchun Yatai", {maxSell: 1, videoId: '0rAUEkPzgMo', endSeconds: 3});

      this.startAllChecks();
    }.bind(this));
  },

  startAllChecks: function() {
    this._checkInterval = setInterval(this._checkForChanges.bind(this), this.checkIntervalInSec * 1000);
  },
  stopAllChecks: function() {
    clearInterval(this._checkInterval);
  },

  stopCheck: function(contract) {
    this.setCheck(contract, {shouldRun: false});
  },
  startCheck: function(contract) {
    this.setCheck(contract, {shouldRun: true});
  },

  // Function to add a new check
  setCheck: function(contract, settings) {
    const {maxSell, videoId, shouldRun} = settings;
    contract = contract && contract.toLowerCase();
    if (!contract) {
      console.error("Please enter a contract.");
      return;
    }
    const _$contractDiv = this._findContractHtmlRow(contract);
    if (_$contractDiv === false) {
      console.error(`Invalid contract ${contract}`);
      return;
    }

    const existing = this._getCheckByContract(contract);
    if (existing) {
      console.log("Updating check with new values");
      console.log({existing, settings});
      // Update the existing check
      Object.assign(existing, settings);
    } else {
      console.log("Adding new check");
      if (!maxSell) {
        console.error("Please enter a max sell.");
        return;
      }
      if (!videoId) {
        console.error("Please enter a youtube video id.");
        return;
      }

      // Add a new check
      this._checks.push({
        _$contractDiv,
        contract,
        maxSell,
        videoId,
        shouldRun: true
      });

      console.log(this._checks);
    }
  },
  
  // Function to remove a check by contract
  removeCheck: function(contract) {
    // Find the index of the setting with the given contract
    const index = this._checks.findIndex(s => s.contract === contract);
    if (index === -1) {
      console.error(`Check with contract "${contract}" not found.`);
      return;
    }
    
    // Remove the check
    this._checks.splice(index, 1);
  },

  _loadScript: function() {
    console.log("Adding YT api script");
    // Load the YouTube Player API script dynamically
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    console.log("Returning promise");
    // Return a Promise that resolves when the YT global object is defined
    return new Promise(function(resolve, reject) {
      var checkForYT = setInterval(function() {
        if (typeof YT !== 'undefined') {
          console.log("Found YT global var");
          console.log(YT);
          if (YT.loaded) {
            clearInterval(checkForYT);
            resolve();
            console.log("YT global var loaded");
          } else {
            console.log("But it's not loaded yet");
          }
        }
        console.log("Checking...");
      }, 100);
    });
  },

  _getCheckByContract: function(contract) {
    return this._checks.find(c => c.contract === contract.toLowerCase())
  },

  _findContractHtmlRow: function (contract) {
    for (let i = 0; i < this._$contractDivs.length; i++) {
      const div = this._$contractDivs[i];
      if (div.querySelector(".name").textContent.toLowerCase().includes(contract)) {
        return div;
      }
    }
    return false;
  },

  _cache: function () {
    // cache contract div container
    this._$contractDivs = document.querySelectorAll('.contract');
    console.log(document.querySelectorAll('.contract'));
    if (!this._$contractDivs) {
      console.error("An error happened while caching the contracts");
    }
    console.log("Cached");
    console.log(this._$contractDivs);
  },

  _checkForChanges: function() {
    if (!this._checks) {
      return;
    }

    console.log("Running checks:");
    const runningChecks = this._checks.filter(c => c.shouldRun);
    console.log({all: this._checks, running: runningChecks});
    let videosToPlay = [];

    videosToPlay = runningChecks
    .filter((check) => {
      // filters only the changes
      $price = check._$contractDiv.querySelector(".price.sell");
      return check.maxSell <= $price.textContent
    })
    .map(check => (check.videoId)) // gets the video ids
    .filter((videoId, index, self) => (index === self.indexOf(videoId))); // filters out unique video ids

    console.log("Videos to play:");
    console.log(videosToPlay);
    this.player.loadPlaylist(videosToPlay);
  },

  _onYouTubeIframeAPIReady: function() {
    console.log("Creating main player");

    // create new divv element for the youtube player
    var div = document.createElement('div');
    // set the id of the div element
    div.id = 'zsido-player';
    // append the div element to the document body
    document.body.appendChild(div);

    this.player = new YT.Player(div.id, {
      height: '0',
      width: '0',
      videoId: this.startupVideoId,
      events: {
        'onReady': function(event) {
          // Play the video when the player is ready
          console.log("Main player ready!");
          event.target.playVideo();
        },
      },
      // Other parameters here
    });
  },

  // _log: function (msg, lvl = "info") {
  //   if (lvl === "info") {
  //     console.log(msg);
  //   } elseif (lvl === "warn") {
  //     console.warn(msg);
  //   } elseif (lvl === "error") {
  //     console.error(msg);
  //   }
  // },
};

zsido.init();

// // adds or updates a check
// zsido.setCheck("Draw", {maxSell: 5, videoId: "0rAUEkPzgMo"});

// // stops a check
// zsido.stopCheck("Draw");

// // stops all checks
// zsido.stopAllChecks();

// // starts all checks
// zsido.startAllChecks();
