import { VideoPublicClient } from "@/components/VideoPublicClient";

export default function VideoPublicPage() {
  return (
    <main className="dark-bg-1">
      <div className="container top-bottom-padding-120">
        <h2 className="large-title-bold text-color-4">
          <span className="overlay-loading2 overlay-light-bg-1">Video</span>
        </h2>
        <p className="p-style-bold-up text-height-20 top-margin-20 text-color-4">
          YouTube sadržaji koje dodaje administrator.
        </p>
        <div className="top-margin-40">
          <VideoPublicClient />
        </div>
      </div>
    </main>
  );
}

