interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export const VideoPlayer = ({ videoUrl, title = "Property Video" }: VideoPlayerProps) => {
  // Function to extract video ID and determine platform
  const getEmbedUrl = (url: string): string | null => {
    try {
      // YouTube
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const youtubeMatch = url.match(youtubeRegex);
      if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }

      // Vimeo
      const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
      const vimeoMatch = url.match(vimeoRegex);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      // If it's already an embed URL or direct video, return as is
      if (url.includes('embed') || url.endsWith('.mp4') || url.endsWith('.webm')) {
        return url;
      }

      return null;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return null;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Unable to load video. Please check the URL format.
        </p>
      </div>
    );
  }

  // Check if it's a direct video file
  const isDirectVideo = embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm');

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
      {isDirectVideo ? (
        <video
          className="absolute top-0 left-0 w-full h-full"
          controls
          preload="metadata"
        >
          <source src={embedUrl} type={embedUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
};
