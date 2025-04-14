// background.js (Modified collectYouTubeTabs function)

function collectYouTubeTabs() {
    chrome.tabs.query({ url: "*://*.youtube.com/watch?v=*" }, (tabs) => {
      console.log(`Found ${tabs.length} YouTube video tabs.`);
  
      if (tabs.length === 0) {
        console.log("No YouTube video tabs found.");
        return;
      }
  
      const videoIds = [];
      const tabIdsToRemove = []; // Keep track if you want to close originals
  
      tabs.forEach(tab => {
        try {
          const url = new URL(tab.url);
          const videoId = url.searchParams.get("v");
          if (videoId) {
            videoIds.push(videoId);
            tabIdsToRemove.push(tab.id); // Add tab ID for potential removal
            console.log(`Found video ID: ${videoId} from tab ${tab.id}`);
          }
        } catch (e) {
          console.error(`Error parsing URL ${tab.url}:`, e);
        }
      });
  
      if (videoIds.length > 0) {
        const CHUNK_SIZE = 50; // YouTube's limit
        for (let i = 0; i < videoIds.length; i += CHUNK_SIZE) {
            const chunk = videoIds.slice(i, i + CHUNK_SIZE);
            const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${chunk.join(',')}`;
            console.log(`Creating playlist URL for chunk ${i / CHUNK_SIZE + 1}:`, playlistUrl);
            chrome.tabs.create({ url: playlistUrl });
        }
  
        // --- Optional: Close original tabs ---
        // Uncomment if you want to close originals after creating *all* playlist tabs

        chrome.tabs.remove(tabIdsToRemove, () => {
          if (chrome.runtime.lastError) {
            console.error("Error removing tabs:", chrome.runtime.lastError);
          } else {
            console.log("Successfully removed original YouTube tabs.");
          }
        });
        // --- End Optional ---
  
      } else {
        console.log("Could not extract any video IDs from the found tabs.");
      }
    });
  }
  
  // Make sure the rest of background.js (listeners) remains the same
  chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked!");
    collectYouTubeTabs();
  });
  
  chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube Tab Queuer extension installed.");
  });