import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';

@Controller('watchlist')
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) { }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getWatchlist(@Req() req) {
        const res = await this.watchlistService.getWatchlist(req.user.uid);
        return res;
    }
}
