import { ProjectDefintion } from "@/types/Map.types";
import { Texture } from "@/types/Texture.types";

export const getUsedTextures = (project: ProjectDefintion): Texture[] => {
    return project.textures.filter((texture) => {
        return project.maps.some((map) => {
            return Object.values(map.tiles).some((tile) => [tile.north, tile.east, tile.south, tile.west, tile.floor].includes(texture.name));
        });
    });
};

interface ImageAndBlob {
    url: string;
    filename: string;
    blob: Blob;
}

export const getTextureBlobsAndFiles  = async (css: string): Promise<ImageAndBlob[]> => {
    const lines = css.split(/[;{}]/);
    const imageUrls = lines.map((line) => {
        let remainder = line.split('url(')[1]?.trim();
        if (!remainder) return '';

        remainder = remainder.split(')')[0].trim();
        remainder = remainder.replace(/['"]/g, '');
        return remainder;

    }).filter(Boolean);

    const promises = imageUrls.map(async (url): Promise<ImageAndBlob> => {
        const image = await fetch(url).then((r) => r.blob());
        return {
            blob: image,
            filename: url.split('/').pop() as string,
            url: url,
        };
    });

    const settledPromises: PromiseSettledResult<ImageAndBlob>[] = await Promise.allSettled(promises);

    return settledPromises
        .filter((p) => p.status === 'fulfilled')
        .map((p) => (p as PromiseFulfilledResult<ImageAndBlob>).value);
};
