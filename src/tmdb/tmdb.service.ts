import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { Movie } from '@/models/movie';
import { TmdbMovieDto } from '@/models/tmdb-movie-dto';

@Injectable()
export class TmdbService {
    private readonly apiToken: string;
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {
        this.apiToken = this.configService.get('TMDB_API_TOKEN') ?? '';
        this.baseUrl = this.configService.get('TMDB_BASE_URL') ?? '';
    }

    private mapTmdbMovieDtoToMovie(tmdbMovieDto: TmdbMovieDto): Movie {
        return {
            title: tmdbMovieDto.title,
            id: tmdbMovieDto.id + '',
            language: tmdbMovieDto.original_language,
            release_date: tmdbMovieDto.release_date,
            overview: tmdbMovieDto.overview
        }
    }

    private createTmdbHeaders() {
        return {
            accept: 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
        }
    }

    async searchMovies(query: string): Promise<Observable<Movie[]>> {
        const encodedQuery = encodeURIComponent(query);
        const url = `${this.baseUrl}/search/movie?include_adult=false&language=en-US&page=1&query=${encodedQuery}`;
        const headers = this.createTmdbHeaders();
        return this.httpService.get(url, { headers })
            .pipe(
                map(response => response.data.results
                    .map(this.mapTmdbMovieDtoToMovie)));
    }

    async getMovieById(id: string): Promise<Observable<Movie>> {
        const url = `${this.baseUrl}/movie/${id}`;
        const headers = this.createTmdbHeaders();
        return this.httpService.get(url, { headers })
            .pipe(
                map(response => (this.mapTmdbMovieDtoToMovie(response.data))));
    }
}
