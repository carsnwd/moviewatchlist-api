import { Movie } from '@/models/movie';
import { Watchlists } from '@/models/watchlist';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TmdbService } from '@/tmdb/tmdb.service';
import { firstValueFrom } from 'rxjs';
import { AddMovieDto } from './dto/add-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { watch } from 'fs';

@Injectable()
export class WatchlistService {
    constructor(@InjectModel(Watchlists.name) private watchlistModel: Model<Watchlists>, private readonly tmdbService: TmdbService) { }

    private async getWatchListDocument(userId: string) {
        const watchlist = await this.getWatchlist(userId);
        const watchlistDocument = await this.watchlistModel.findOne({ userId: watchlist.userId });
        if (!watchlistDocument) {
            throw new Error('Watchlist not found');
        }
        return watchlistDocument;
    }

    private async createWatchlist(userId: string) {
        try {
            const watchlist = new this.watchlistModel({ userId });
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.error(error.message);
            throw new Error('Error creating watchlist');
        }
    }

    async getWatchlist(userId: string) {
        try {
            const watchlist = await this.watchlistModel.findOne({ userId });
            if (!watchlist) {
                return this.createWatchlist(userId);
            }
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.error(error.message);
            throw new Error('Error getting watchlist');
        }
    }

    async addMovieToWatchlist(userId: string, movie: AddMovieDto) {
        const { movieId, fileName, fileSize } = movie;
        try {
            const watchlist = await this.getWatchListDocument(userId);
            const movie: Movie = await firstValueFrom(await this.tmdbService.getMovieById(movieId));
            movie.file_name = fileName;
            movie.file_size = fileSize;

            watchlist.movies.push(movie);
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.error(error.message);
            throw new Error("Error adding movie to watchlist");
        }
    }

    async removeMovieFromWatchlist(userId: string, movieId: string) {
        try {
            const watchlist = await this.getWatchListDocument(userId);
            watchlist.movies = watchlist.movies.filter(movie => movie.id !== movieId);
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.error(error.message);
            throw new Error("Error removing movie from watchlist");
        }
    }

    async updateMovieInWatchlist(userId: string, updateMovieDto: UpdateMovieDto) {
        const { movieId, fileName, fileSize } = updateMovieDto;
        try {
            const watchlist = await this.getWatchListDocument(userId);
            const movie = watchlist.movies.find(movie => movie.id === movieId);
            if (!movie) {
                throw new Error('Movie not found in watchlist');
            }
            movie.file_name = fileName;
            movie.file_size = fileSize;
            watchlist.markModified('movies');
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.error(error.message);
            throw new Error("Error updating movie in watchlist");
        }

    }
}
