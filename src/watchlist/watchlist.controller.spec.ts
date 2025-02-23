import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';
import { AddMovieDto } from './dto/add-movie.dto';
import { RemoveMovieDto } from './dto/remove-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('WatchlistController', () => {
  let controller: WatchlistController;
  let service: WatchlistService;

  const mockWatchlistService = {
    getWatchlist: jest.fn(),
    addMovieToWatchlist: jest.fn(),
    removeMovieFromWatchlist: jest.fn(),
    updateMovieInWatchlist: jest.fn(),
    searchMovie: jest.fn(),
    getMovie: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: { uid: 'mockUid' },
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        { provide: WatchlistService, useValue: mockWatchlistService },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<WatchlistController>(WatchlistController);
    service = module.get<WatchlistService>(WatchlistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWatchlist', () => {
    it('should return the user watchlist', async () => {
      const mockWatchlist = { userId: 'mockUid', movies: [] };
      mockWatchlistService.getWatchlist.mockResolvedValue(mockWatchlist);

      const result = await controller.getWatchlist(
        mockExecutionContext.switchToHttp().getRequest(),
      );

      expect(result).toEqual(mockWatchlist);
      expect(service.getWatchlist).toHaveBeenCalledWith('mockUid');
    });
  });

  describe('addToWatchlist', () => {
    it('should add a movie to the watchlist', async () => {
      const mockAddMovieDto: AddMovieDto = { movieId: 'mockMovieId' };
      const mockWatchlist = { userId: 'mockUid', movies: [mockAddMovieDto] };
      mockWatchlistService.addMovieToWatchlist.mockResolvedValue(mockWatchlist);

      const result = await controller.addToWatchlist(
        mockExecutionContext.switchToHttp().getRequest(),
        mockAddMovieDto,
      );

      expect(result).toEqual(mockWatchlist);
      expect(service.addMovieToWatchlist).toHaveBeenCalledWith(
        'mockUid',
        mockAddMovieDto,
      );
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove a movie from the watchlist', async () => {
      const mockRemoveMovieDto: RemoveMovieDto = { movieId: 'mockMovieId' };
      const mockWatchlist = { userId: 'mockUid', movies: [] };
      mockWatchlistService.removeMovieFromWatchlist.mockResolvedValue(
        mockWatchlist,
      );

      const result = await controller.removeFromWatchlist(
        mockExecutionContext.switchToHttp().getRequest(),
        mockRemoveMovieDto,
      );

      expect(result).toEqual(mockWatchlist);
      expect(service.removeMovieFromWatchlist).toHaveBeenCalledWith(
        'mockUid',
        'mockMovieId',
      );
    });
  });

  describe('updateWatchlist', () => {
    it('should update a movie in the watchlist', async () => {
      const mockUpdateMovieDto: UpdateMovieDto = {
        movieId: 'mockMovieId',
        fileName: 'Updated Title',
      };
      const mockWatchlist = { userId: 'mockUid', movies: [mockUpdateMovieDto] };
      mockWatchlistService.updateMovieInWatchlist.mockResolvedValue(
        mockWatchlist,
      );

      const result = await controller.updateWatchlist(
        mockExecutionContext.switchToHttp().getRequest(),
        mockUpdateMovieDto,
      );

      expect(result).toEqual(mockWatchlist);
      expect(service.updateMovieInWatchlist).toHaveBeenCalledWith(
        'mockUid',
        mockUpdateMovieDto,
      );
    });
  });

  describe('searchMovie', () => {
    it('should search for a movie', async () => {
      const query = 'Inception';
      const mockWatchlist = { userId: 'mockUid', movies: [] };
      mockWatchlistService.searchMovie.mockResolvedValue(mockWatchlist);

      const result = await controller.searchMovie(
        mockExecutionContext.switchToHttp().getRequest(),
        query,
      );

      expect(result).toEqual(mockWatchlist);
      expect(service.searchMovie).toHaveBeenCalledWith('mockUid', query);
    });
  });

  describe('getMovie', () => {
    it('should get a movie from the watchlist by ID', async () => {
      const movieId = 'mockMovieId';
      const mockWatchlist = { userId: 'mockUid', movies: [] };
      mockWatchlistService.getMovie.mockResolvedValue(mockWatchlist);

      const result = await controller.getMovie(
        mockExecutionContext.switchToHttp().getRequest(),
        movieId,
      );

      expect(result).toEqual(mockWatchlist);
      expect(service.getMovie).toHaveBeenCalledWith('mockUid', movieId);
    });
  });
});
