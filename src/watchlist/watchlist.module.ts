import { Watchlists, WatchListSchema } from '@/models/watchlist';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { TmdbModule } from '@/tmdb/tmdb.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Watchlists.name, schema: WatchListSchema }]), TmdbModule],
    controllers: [WatchlistController],
    providers: [WatchlistService],
})
export class WatchlistModule { }
