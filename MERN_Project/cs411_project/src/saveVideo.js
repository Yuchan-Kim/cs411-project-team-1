// src/saveVideo.js
async function saveVideo(videoUrl) {
    try {
      const response = await fetch("http://localhost:3001/save-video", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });
  
      if (response.status === 200) {
        alert("Video saved successfully");
      } else {
        alert("Error saving video");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving video");
    }
  }
  
  export { saveVideo };
  