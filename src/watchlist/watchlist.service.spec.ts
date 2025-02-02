import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WatchlistService } from './watchlist.service';
import { TmdbService } from '@/tmdb/tmdb.service';
import { Model } from 'mongoose';
import { Watchlists } from '@/models/watchlist';
import { Movie } from '@/models/movie';
import { of } from 'rxjs';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let watchlistModel: Model<Watchlists>;
  let tmdbService: TmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: getModelToken(Watchlists.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            new: jest.fn(),
          },
        },
        {
          provide: TmdbService,
          useValue: {
            getMovieById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    watchlistModel = module.get<Model<Watchlists>>(getModelToken(Watchlists.name));
    tmdbService = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWatchlist', () => {
    it('should return an existing watchlist', async () => {
      const userId = 'user123';
      const watchlist = { userId, movies: [] };
      (watchlistModel.findOne as jest.Mock).mockResolvedValue(watchlist);

      const result = await service.getWatchlist(userId);

      expect(watchlistModel.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(watchlist);
    });

    // it('should create a new watchlist if not found', async () => {
    //   const userId = 'user123';
    //   const newWatchlist = { userId, movies: [] };
    //   (watchlistModel.findOne as jest.Mock).mockResolvedValue(null);
    //   (watchlistModel.create as jest.Mock).mockImplementation(() => ({
    //     save: jest.fn().mockResolvedValue(newWatchlist),
    //   }));

    //   const result = await service.getWatchlist(userId);

    //   expect(watchlistModel.findOne).toHaveBeenCalledWith({ userId });
    //   expect(watchlistModel.create).toHaveBeenCalledWith({ userId });
    //   expect(result).toEqual(newWatchlist);
    // });
  });

  describe('addMovieToWatchlist', () => {
    it('should add a movie to the watchlist', async () => {
      const userId = 'user123';
      const movieId = 'movie123';
      const watchlist = { userId, movies: [], save: jest.fn().mockResolvedValue({ userId, movies: [] }) };
      const movie: Movie = { id: movieId, title: 'Inception', language: 'en', release_date: '2010-07-16', overview: 'A mind-bending thriller' };

      (watchlistModel.findOne as jest.Mock).mockResolvedValue(watchlist);
      (tmdbService.getMovieById as jest.Mock).mockReturnValue(of(movie));

      const result = await service.addMovieToWatchlist(userId, movieId);

      expect(watchlistModel.findOne).toHaveBeenCalledWith({ userId });
      expect(tmdbService.getMovieById).toHaveBeenCalledWith(movieId);
      expect(watchlist.movies).toContain(movie);
      expect(watchlist.save).toHaveBeenCalled();
      expect(result).toEqual({ userId, movies: [movie] });
    });

    it('should throw an error if watchlist not found', async () => {
      const userId = 'user123';
      const movieId = 'movie123';

      (watchlistModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.addMovieToWatchlist(userId, movieId)).rejects.toThrow('Error adding movie to watchlist');
    });
  });
});