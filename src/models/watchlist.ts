import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";
import { Movie } from "./movie";


export type WatchListDocument = HydratedDocument<Watchlists>;

@Schema()
export class Watchlists {
    @Prop({ required: true })
    userId: string;

    @Prop()
    movies: Movie[];
}

export const WatchListSchema = SchemaFactory.createForClass(Watchlists);