import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';
import { Body, Post } from '@nestjs/common';

@Controller('api/watchlist')
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) { }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getWatchlist(@Req() req) {
        const res = await this.watchlistService.getWatchlist(req.user.uid);
        return res;
    }

    @Post('add')
    @UseGuards(FirebaseAuthGuard)
    async addToWatchlist(@Req() req, @Body('movieId') movieId: string) {
        const res = await this.watchlistService.addMovieToWatchlist(req.user.uid, movieId);
        return res;
    }

    @Post('remove')
    @UseGuards(FirebaseAuthGuard)
    async removeFromWatchlist(@Req() req, @Body('movieId') movieId: string) {
        const res = await this.watchlistService.removeMovieFromWatchlist(req.user.uid, movieId);
        return res;
    }
}
