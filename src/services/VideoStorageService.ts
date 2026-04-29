import { injectable, ServiceLifetime } from "fw";
import { get, set, keys, del } from "idb-keyval";

export interface StoredVideo {
    id: string;
    blob: Blob;
    timestamp: number;
    durationMs: number;
}

@injectable(ServiceLifetime.Singleton)
export class VideoStorageService {
    private readonly STORE_PREFIX = "playable_video_";

    async saveVideo(blob: Blob, durationMs: number): Promise<string> {
        const id = crypto.randomUUID();
        const key = `${this.STORE_PREFIX}${id}`;
        
        const video: StoredVideo = {
            id,
            blob,
            timestamp: Date.now(),
            durationMs
        };

        await set(key, video);
        return id;
    }

    async getVideos(): Promise<StoredVideo[]> {
        const allKeys = await keys();
        const videoKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(this.STORE_PREFIX)) as string[];
        
        const videos: StoredVideo[] = [];
        for (const key of videoKeys) {
            const data = await get<StoredVideo>(key);
            if (data) {
                videos.push(data);
            }
        }
        
        // Sort by newest first
        return videos.sort((a, b) => b.timestamp - a.timestamp);
    }

    async getVideo(id: string): Promise<StoredVideo | undefined> {
        const key = `${this.STORE_PREFIX}${id}`;
        return await get<StoredVideo>(key);
    }

    async deleteVideo(id: string): Promise<void> {
        const key = `${this.STORE_PREFIX}${id}`;
        await del(key);
    }
}
