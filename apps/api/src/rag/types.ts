//# Chunk, Citation, etc.
export type ChunkPayload = {
    text : string;
    source : string; //"terms.pdf" or URL
    title : string;
    chunk_index : number;
    site_id?:string;

}