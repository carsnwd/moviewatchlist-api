import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WatchlistService } from './watchlist.service';
import { TmdbService } from '@/tmdb/tmdb.service';
import { Watchlists } from '@/models/watchlist';
import { Model } from 'mongoose';
import { of } from 'rxjs';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let tmdbService: TmdbService;
  let watchlistModel: Model<Watchlists>;

  let mockWatchlist;

  let mockWatchlistModel;

  let mockTmdbService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockWatchlist = {
      userId: 'mockUserId',
      movies: [
        { id: 'mockMovieId', title: 'Mock Movie', file_name: '', file_size: 0 },
      ],
      save: jest.fn(),
      markModified: jest.fn(),
    };
    mockWatchlistModel = {
      findOne: jest.fn().mockResolvedValue(mockWatchlist),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue(true),
      })),
    };
    mockTmdbService = {
      getMovieById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: getModelToken(Watchlists.name),
          useValue: mockWatchlistModel,
        },
        { provide: TmdbService, useValue: mockTmdbService },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    tmdbService = module.get<TmdbService>(TmdbService);
    watchlistModel = module.get<Model<Watchlists>>(
      getModelToken(Watchlists.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeMovieFromWatchlist', () => {
    it('should remove a movie from the watchlist', async () => {
      //@ts-ignore
      mockWatchlist.movies = [{ id: 'mockMovieId', title: 'Mock Movie' }];
      mockWatchlist.save.mockResolvedValueOnce(mockWatchlist);

      const result = await service.removeMovieFromWatchlist(
        'mockUserId',
        'mockMovieId',
      );

      expect(result).toEqual({ userId: 'mockUserId', movies: [] });
      expect(mockWatchlist.movies).toHaveLength(0);
      expect(mockWatchlist.save).toHaveBeenCalled();
    });

    it('should handle movie not in watchlist', async () => {
      //@ts-ignore
      mockWatchlist.movies = [{ id: 'anotherMovieId', title: 'Another Movie' }];
      mockWatchlist.save.mockResolvedValueOnce(mockWatchlist);

      const result = await service.removeMovieFromWatchlist(
        'mockUserId',
        'mockMovieId',
      );

      expect(result).toEqual({
        userId: 'mockUserId',
        movies: [{ id: 'anotherMovieId', title: 'Another Movie' }],
      });
      expect(mockWatchlist.movies).toHaveLength(1);
      expect(mockWatchlist.save).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockWatchlistModel.findOne.mockRejectedValueOnce(
        new Error('Error removing movie from watchlist'),
      );

      await expect(
        service.removeMovieFromWatchlist('mockUserId', 'mockMovieId'),
      ).rejects.toThrow('Error removing movie from watchlist');
    });
  });

  describe('getWatchlist', () => {
    it('should return watchlist if it exists', async () => {
      const userId = 'mockUserId';
      const mockWatchlist = {
        userId,
        movies: [{ id: '1', title: 'Inception' }],
      };

      (watchlistModel.findOne as jest.Mock).mockResolvedValueOnce(
        mockWatchlist,
      );

      const result = await service.getWatchlist(userId);
      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movies: mockWatchlist.movies,
      });
      expect(watchlistModel.findOne).toHaveBeenCalledWith({ userId });
    });

    it('should create and return a new watchlist if it does not exist', async () => {
      const userId = 'newUserId';

      // Mock the constructor and save method
      const watchlistInstance = {
        ...mockWatchlist,
        save: jest.fn().mockResolvedValue(true),
      };

      mockWatchlistModel.findOne.mockResolvedValueOnce(null);

      //@ts-ignore
      jest
        .spyOn(watchlistModel, 'create')
        .mockImplementation(() => watchlistInstance);

      await service.getWatchlist(userId);

      expect(watchlistModel.create).toHaveBeenCalledWith({ userId });
      expect(watchlistInstance.save).toHaveBeenCalled();
    });

    it('should throw an error if there is an exception', async () => {
      const userId = 'mockUserId';
      (watchlistModel.findOne as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.getWatchlist(userId)).rejects.toThrow(
        'Error getting watchlist',
      );
      expect(watchlistModel.findOne).toHaveBeenCalledWith({ userId });
    });

    it('should throw an error if when trying to create a watchlist there is an error', async () => {
      const userId = 'newUserId';

      mockWatchlistModel.findOne.mockResolvedValueOnce(null);

      //@ts-ignore
      (watchlistModel.create as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );
      await expect(service.getWatchlist(userId)).rejects.toThrow(
        'Error creating watchlist',
      );
      expect(watchlistModel.create).toHaveBeenCalledWith({ userId });
    });
  });

  describe('addMovieToWatchlist', () => {
    it('when watchlist not found', async () => {
      const userId = 'someid';
      const movieDto = { movieId: '1', fileName: 'Inception.mp4', fileSize: 2 };

      mockWatchlistModel.findOne.mockResolvedValueOnce(null);

      //@ts-ignore
      await expect(
        service.addMovieToWatchlist(userId, movieDto),
      ).rejects.toThrow('Error adding movie to watchlist');
    });
    it('should add a movie to the watchlist', async () => {
      const userId = 'mockUserId';
      const movieDto = { movieId: '1', fileName: 'Inception.mp4', fileSize: 2 };
      const mockMovie = {
        id: '1',
        title: 'Inception',
        file_name: '',
        file_size: '',
      };

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);
      tmdbService.getMovieById = jest.fn().mockReturnValueOnce(of(mockMovie));

      expect(mockWatchlist.movies).toHaveLength(1);
      const result = await service.addMovieToWatchlist(userId, movieDto);
      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movies: [...mockWatchlist.movies],
      });
      expect(mockWatchlist.movies).toHaveLength(2);
      expect(mockWatchlist.save).toHaveBeenCalled();
    });

    it('should throw an error if the movie is already in the watchlist', async () => {
      const userId = 'mockUserId';
      const movieDto = {
        movieId: 'mockMovieId',
        fileName: 'Mock Movie',
        fileSize: 2,
      };

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      (tmdbService.getMovieById as jest.Mock).mockReturnValueOnce(
        of({ id: 'mockMovieId', title: 'Mock Movie' }),
      );

      await expect(
        service.addMovieToWatchlist(userId, movieDto),
      ).rejects.toThrow('Movie already in watchlist');
    });

    it('should handle errors', async () => {
      const userId = 'mockUserId';
      const movieDto = { movieId: '1', fileName: 'Inception.mp4', fileSize: 2 };

      //@ts-ignore
      jest
        .spyOn(service, 'getWatchlist')
        .mockRejectedValueOnce(new Error('Error adding movie to watchlist'));

      await expect(
        service.addMovieToWatchlist(userId, movieDto),
      ).rejects.toThrow('Error adding movie to watchlist');
    });
  });

  describe('updateMovieInWatchlist', () => {
    it('should update a movie in the watchlist', async () => {
      const userId = 'mockUserId';
      const updateMovieDto = {
        movieId: 'mockMovieId',
        fileName: 'Updated Movie.mp4',
        fileSize: 2,
      };

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      const result = await service.updateMovieInWatchlist(
        userId,
        updateMovieDto,
      );

      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movies: [
          {
            id: 'mockMovieId',
            title: 'Mock Movie',
            file_name: 'Updated Movie.mp4',
            file_size: 2,
          },
        ],
      });
      expect(mockWatchlist.movies[0].file_name).toBe('Updated Movie.mp4');
      expect(mockWatchlist.movies[0].file_size).toBe(2);
      expect(mockWatchlist.markModified).toHaveBeenCalledWith('movies');
      expect(mockWatchlist.save).toHaveBeenCalled();
    });

    it('should throw an error if the movie is not found in the watchlist', async () => {
      const userId = 'mockUserId';
      const updateMovieDto = {
        movieId: 'nonExistentMovieId',
        fileName: 'Updated Movie.mp4',
        fileSize: 2,
      };

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      await expect(
        service.updateMovieInWatchlist(userId, updateMovieDto),
      ).rejects.toThrow('Movie not found in watchlist');
    });

    it('should handle errors', async () => {
      const userId = 'mockUserId';
      const updateMovieDto = {
        movieId: 'mockMovieId',
        fileName: 'Updated Movie.mp4',
        fileSize: 2,
      };

      jest
        .spyOn(service, 'getWatchlist')
        .mockRejectedValueOnce(new Error('Error updating movie in watchlist'));

      await expect(
        service.updateMovieInWatchlist(userId, updateMovieDto),
      ).rejects.toThrow('Error updating movie in watchlist');
    });
  });

  describe('searchMovie', () => {
    it('should return movies that match the query', async () => {
      const userId = 'mockUserId';
      const query = 'Mock Movie';

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      const result = await service.searchMovie(userId, query);

      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movies: [
          {
            id: 'mockMovieId',
            title: 'Mock Movie',
            file_name: '',
            file_size: 0,
          },
        ],
      });
    });

    it('should return an empty array if no movies match the query', async () => {
      const userId = 'mockUserId';
      const query = 'NonExistentMovie';

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      const result = await service.searchMovie(userId, query);

      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movies: [],
      });
    });

    it('should handle errors', async () => {
      const userId = 'mockUserId';
      const query = 'Lost Highway';

      jest
        .spyOn(service, 'getWatchlist')
        .mockRejectedValueOnce(new Error('Error searching movie in watchlist'));

      await expect(service.searchMovie(userId, query)).rejects.toThrow(
        'Error searching movie in watchlist',
      );
    });
  });

  describe('getMovie', () => {
    it('should return the movie if it exists in the watchlist', async () => {
      const userId = 'mockUserId';
      const movieId = 'mockMovieId';

      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      const result = await service.getMovie(userId, movieId);

      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movie: {
          id: 'mockMovieId',
          title: 'Mock Movie',
          file_name: '',
          file_size: 0,
        },
      });
    });

    it('should return null if the movie does not exist in the watchlist', async () => {
      const userId = 'mockUserId';
      const movieId = 'nonExistentMovieId';
      //@ts-ignore
      jest.spyOn(service, 'getWatchlist').mockResolvedValueOnce(mockWatchlist);

      const result = await service.getMovie(userId, movieId);

      expect(result).toEqual({
        userId: mockWatchlist.userId,
        movie: null,
      });
    });

    it('should handle errors', async () => {
      const userId = 'mockUserId';
      const movieId = '1';

      jest
        .spyOn(service, 'getWatchlist')
        .mockRejectedValueOnce(new Error('Error getting movie from watchlist'));

      await expect(service.getMovie(userId, movieId)).rejects.toThrow(
        'Error getting movie from watchlist',
      );
    });
  });
});
